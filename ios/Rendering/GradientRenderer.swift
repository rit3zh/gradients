//
//  GradientRenderer.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Metal
import QuartzCore
import simd

struct RenderOptions {
  var tilt = SIMD2<Float>(0, 0)
  var dither = true
  var grain: Float = 0
}

enum RenderResult {
  case presented
  case deferred
  case skipped
}

final class GradientRenderer {
  static let maxSurfaces = 4
  static let maxLayers = 16

  private struct GridSize: Hashable {
    let columns: Int
    let rows: Int
  }

  private let metal = MetalContext.shared
  private let arena = FrameArena()
  private var surfaces: [MTLTexture?] = Array(repeating: nil, count: maxSurfaces)
  private var renderedSurfaces: [MeshSurface?] = Array(repeating: nil, count: maxSurfaces)
  private var indexBuffers: [GridSize: (buffer: MTLBuffer, count: Int)] = [:]
  private var drawableBytes = 0

  init() {
    GradientProfiler.shared.register(self)
  }

  var estimatedMemory: Int {
    let surfaceBytes = surfaces.reduce(0) { total, texture in
      total + (texture.map { $0.width * $0.height * 8 } ?? 0)
    }
    let indexBytes = indexBuffers.values.reduce(0) { $0 + $1.buffer.length }
    return drawableBytes + surfaceBytes + indexBytes + arena.allocatedBytes
  }

  @discardableResult
  func draw(_ layers: [GradientLayerState], in target: CAMetalLayer, size: CGSize, options: RenderOptions) -> RenderResult {
    guard
      let device = metal.device,
      let queue = metal.queue,
      let meshPipeline = metal.meshPipeline,
      size.width >= 1,
      size.height >= 1
    else {
      return .skipped
    }

    let pointSize = SIMD2(Float(size.width), Float(size.height))
    var context = LayerContext(size: pointSize, tilt: options.tilt, previousSurfaces: renderedSurfaces)
    var uniforms = [LayerUniforms]()
    uniforms.reserveCapacity(min(layers.count, Self.maxLayers))
    for layer in layers where layer.opacity > 0.001 {
      guard uniforms.count < Self.maxLayers else { break }
      uniforms.append(Self.uniforms(for: layer, context: &context))
    }

    guard let compositePipeline = metal.compositePipeline(for: CompositeVariant(layers: uniforms)) else {
      return .skipped
    }

    let surfaceWidth = min(max(Int(size.width.rounded(.up)), 1), 2048)
    let surfaceHeight = min(max(Int(size.height.rounded(.up)), 1), 2048)

    let frame = FrameUniforms(
      size: pointSize,
      tilt: options.tilt,
      time: 0,
      scale: Float(target.contentsScale),
      dither: options.dither ? 1 : 0,
      grain: options.grain,
      layerCount: Int32(uniforms.count)
    )

    let data = context.data.isEmpty ? [SIMD4<Float>(repeating: 0)] : context.data
    let layersOffset = FrameArena.align(MemoryLayout<FrameUniforms>.stride)
    let dataOffset = FrameArena.align(layersOffset + max(uniforms.count, 1) * MemoryLayout<LayerUniforms>.stride)
    var cursor = FrameArena.align(dataOffset + data.count * MemoryLayout<SIMD4<Float>>.stride)

    var meshOffsets = [Int?]()
    for (index, surface) in context.surfaces.enumerated() {
      let texture = surfaces[index]
      let isCurrent = renderedSurfaces[index]?.key == surface.key
        && texture?.width == surfaceWidth
        && texture?.height == surfaceHeight
      if isCurrent {
        meshOffsets.append(nil)
      } else {
        meshOffsets.append(cursor)
        cursor = FrameArena.align(cursor + surface.vertices.count * MemoryLayout<MeshVertex>.stride)
      }
    }

    guard arena.reserve() else {
      return .deferred
    }
    guard let buffer = arena.buffer(device: device, length: cursor) else {
      arena.cancel()
      return .skipped
    }
    guard let commandBuffer = queue.makeCommandBuffer() else {
      arena.cancel()
      return .skipped
    }
    guard let drawable = target.nextDrawable() else {
      arena.cancel()
      return .deferred
    }

    write([frame], to: buffer, at: 0)
    write(uniforms, to: buffer, at: layersOffset)
    write(data, to: buffer, at: dataOffset)
    for (surface, offset) in zip(context.surfaces, meshOffsets) {
      if let offset {
        write(surface.vertices, to: buffer, at: offset)
      }
    }

    for (index, surface) in context.surfaces.enumerated() {
      guard let offset = meshOffsets[index] else { continue }
      renderedSurfaces[index] = nil
      guard
        let texture = surfaceTexture(at: index, width: surfaceWidth, height: surfaceHeight, device: device),
        let indices = indexBuffer(columns: surface.columns, rows: surface.rows, device: device)
      else {
        continue
      }
      let pass = MTLRenderPassDescriptor()
      pass.colorAttachments[0].texture = texture
      pass.colorAttachments[0].loadAction = .clear
      pass.colorAttachments[0].storeAction = .store
      pass.colorAttachments[0].clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)

      guard let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { continue }
      encoder.setRenderPipelineState(meshPipeline)
      encoder.setVertexBuffer(buffer, offset: offset, index: 0)
      encoder.drawIndexedPrimitives(
        type: .triangle,
        indexCount: indices.count,
        indexType: .uint32,
        indexBuffer: indices.buffer,
        indexBufferOffset: 0
      )
      encoder.endEncoding()
      renderedSurfaces[index] = surface
    }

    let pass = MTLRenderPassDescriptor()
    pass.colorAttachments[0].texture = drawable.texture
    pass.colorAttachments[0].loadAction = .clear
    pass.colorAttachments[0].storeAction = .store
    pass.colorAttachments[0].clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)

    if let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) {
      let textures: [MTLTexture?] = (0..<Self.maxSurfaces).map { index in
        index < context.surfaces.count ? (surfaces[index] ?? metal.placeholder) : metal.placeholder
      }
      encoder.setRenderPipelineState(compositePipeline)
      encoder.setFragmentBuffer(buffer, offset: 0, index: 0)
      encoder.setFragmentBuffer(buffer, offset: layersOffset, index: 1)
      encoder.setFragmentBuffer(buffer, offset: dataOffset, index: 2)
      encoder.setFragmentTextures(textures, range: 0..<Self.maxSurfaces)
      encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
      encoder.endEncoding()
    }

    let profiler = GradientProfiler.shared
    if profiler.isEnabled {
      commandBuffer.addCompletedHandler { buffer in
        profiler.recordGPU(seconds: buffer.gpuEndTime - buffer.gpuStartTime)
      }
    }
    drawableBytes = Int(target.drawableSize.width * target.drawableSize.height) * 4 * target.maximumDrawableCount

    arena.commit(with: commandBuffer)
    commandBuffer.present(drawable)
    commandBuffer.commit()
    return .presented
  }

  private static func uniforms(for state: GradientLayerState, context: inout LayerContext) -> LayerUniforms {
    let parameters = state.parameters
    let tile = parameters.flow != 0 && state.tileMode == .clamp ? GradientTileMode.mirror : state.tileMode

    var uniforms = LayerUniforms()
    uniforms.kind = state.kind.index
    uniforms.blend = state.blendMode.index
    uniforms.tile = tile.index
    uniforms.space = state.interpolation.index
    uniforms.opacity = Float(min(max(parameters.opacity, 0), 1))
    uniforms.time = Float(state.clock.truncatingRemainder(dividingBy: 3600))
    uniforms.range = state.ramp.range
    uniforms.ramp = context.append(state.ramp.samples)

    if parameters.flow != 0 {
      let span = Double(state.ramp.range.y - state.ramp.range.x)
      let period = max(span * (tile == .mirror ? 2 : 1), 0.0001)
      uniforms.phase = Float((-parameters.flow * state.clock * span).truncatingRemainder(dividingBy: period))
    }

    GradientRegistry.program(for: state.kind).encode(state, into: &uniforms, context: &context)
    return uniforms
  }

  private func surfaceTexture(at index: Int, width: Int, height: Int, device: MTLDevice) -> MTLTexture? {
    if let texture = surfaces[index], texture.width == width, texture.height == height {
      return texture
    }
    let descriptor = MTLTextureDescriptor.texture2DDescriptor(
      pixelFormat: MetalContext.surfacePixelFormat,
      width: width,
      height: height,
      mipmapped: false
    )
    descriptor.usage = [.renderTarget, .shaderRead]
    descriptor.storageMode = .private
    let texture = device.makeTexture(descriptor: descriptor)
    surfaces[index] = texture
    return texture
  }

  private func indexBuffer(columns: Int, rows: Int, device: MTLDevice) -> (buffer: MTLBuffer, count: Int)? {
    let key = GridSize(columns: columns, rows: rows)
    if let cached = indexBuffers[key] {
      return cached
    }
    guard columns > 1, rows > 1 else { return nil }
    var indices = [UInt32]()
    indices.reserveCapacity((columns - 1) * (rows - 1) * 6)
    for row in 0..<(rows - 1) {
      for column in 0..<(columns - 1) {
        let topLeft = UInt32(row * columns + column)
        let topRight = topLeft + 1
        let bottomLeft = topLeft + UInt32(columns)
        let bottomRight = bottomLeft + 1
        indices.append(contentsOf: [topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight])
      }
    }
    guard let buffer = indices.withUnsafeBytes({ bytes in
      device.makeBuffer(bytes: bytes.baseAddress!, length: bytes.count, options: .storageModeShared)
    }) else {
      return nil
    }
    let entry = (buffer: buffer, count: indices.count)
    indexBuffers[key] = entry
    return entry
  }

  private func write<T>(_ values: [T], to buffer: MTLBuffer, at offset: Int) {
    values.withUnsafeBytes { bytes in
      guard let base = bytes.baseAddress else { return }
      buffer.contents().advanced(by: offset).copyMemory(from: base, byteCount: bytes.count)
    }
  }
}
