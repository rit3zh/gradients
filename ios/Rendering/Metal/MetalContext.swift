//
//  MetalContext.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Metal

final class MetalContext {
  static let shared = MetalContext()

  static let drawablePixelFormat = MTLPixelFormat.bgra8Unorm
  static let surfacePixelFormat = MTLPixelFormat.rgba16Float

  let device: MTLDevice?
  let queue: MTLCommandQueue?
  let placeholder: MTLTexture?

  private(set) var meshPipeline: MTLRenderPipelineState?

  private var library: MTLLibrary?
  private var compositePipelines: [CompositeVariant: MTLRenderPipelineState] = [:]
  private var pendingVariants: Set<CompositeVariant> = []
  private let compileQueue = DispatchQueue(label: "expo.gradients.pipelines", qos: .userInitiated)

  private var waiters: [() -> Void] = []
  private var isPreparing = false

  var isReady: Bool {
    compositePipelines[.generic] != nil && meshPipeline != nil
  }

  private init() {
    device = MTLCreateSystemDefaultDevice()
    queue = device?.makeCommandQueue()

    let descriptor = MTLTextureDescriptor.texture2DDescriptor(
      pixelFormat: Self.surfacePixelFormat,
      width: 1,
      height: 1,
      mipmapped: false
    )
    descriptor.usage = [.shaderRead]
    descriptor.storageMode = .shared
    placeholder = device?.makeTexture(descriptor: descriptor)
  }

  func prepare(_ completion: (() -> Void)? = nil) {
    if isReady {
      completion?()
      return
    }
    if let completion {
      waiters.append(completion)
    }
    guard !isPreparing, let device else { return }
    isPreparing = true

    compileQueue.async {
      let library = Self.makeLibrary(device: device)
      let composite = library.flatMap { Self.makeCompositePipeline(.generic, library: $0, device: device) }
      let mesh = library.flatMap { Self.makeMeshPipeline(library: $0, device: device) }
      DispatchQueue.main.async {
        self.library = library
        self.compositePipelines[.generic] = composite
        self.meshPipeline = mesh
        self.isPreparing = false
        let waiters = self.waiters
        self.waiters.removeAll()
        waiters.forEach { $0() }
      }
    }
  }

  func compositePipeline(for variant: CompositeVariant) -> MTLRenderPipelineState? {
    if let pipeline = compositePipelines[variant] {
      return pipeline
    }
    if variant != .generic, let library, let device, pendingVariants.insert(variant).inserted {
      compileQueue.async {
        let pipeline = Self.makeCompositePipeline(variant, library: library, device: device)
        DispatchQueue.main.async {
          self.compositePipelines[variant] = pipeline
          if pipeline != nil {
            self.pendingVariants.remove(variant)
          }
        }
      }
    }
    return compositePipelines[.generic]
  }

  private static func makeLibrary(device: MTLDevice) -> MTLLibrary? {
    let candidates = [Bundle(for: MetalContext.self), Bundle.main]
    for bundle in candidates {
      guard
        let url = bundle.url(forResource: "ExpoGradientsShaders", withExtension: "bundle"),
        let shaders = Bundle(url: url),
        let library = try? device.makeDefaultLibrary(bundle: shaders)
      else {
        continue
      }
      return library
    }
    return nil
  }

  private static func makeCompositePipeline(
    _ variant: CompositeVariant,
    library: MTLLibrary,
    device: MTLDevice
  ) -> MTLRenderPipelineState? {
    guard
      let vertex = library.makeFunction(name: "compositeVertex"),
      let fragment = try? library.makeFunction(name: "compositeFragment", constantValues: variant.constantValues)
    else {
      return nil
    }
    let descriptor = MTLRenderPipelineDescriptor()
    descriptor.vertexFunction = vertex
    descriptor.fragmentFunction = fragment
    descriptor.colorAttachments[0].pixelFormat = drawablePixelFormat
    return try? device.makeRenderPipelineState(descriptor: descriptor)
  }

  private static func makeMeshPipeline(library: MTLLibrary, device: MTLDevice) -> MTLRenderPipelineState? {
    guard
      let vertex = library.makeFunction(name: "meshVertex"),
      let fragment = library.makeFunction(name: "meshFragment")
    else {
      return nil
    }
    let descriptor = MTLRenderPipelineDescriptor()
    descriptor.vertexFunction = vertex
    descriptor.fragmentFunction = fragment
    descriptor.colorAttachments[0].pixelFormat = surfacePixelFormat
    return try? device.makeRenderPipelineState(descriptor: descriptor)
  }
}
