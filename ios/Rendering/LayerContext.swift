//
//  LayerContext.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

struct LayerContext {
  let size: SIMD2<Float>
  let tilt: SIMD2<Float>
  private(set) var data: [SIMD4<Float>] = []
  private(set) var surfaces: [MeshSurface] = []
  private let previousSurfaces: [MeshSurface?]

  init(size: SIMD2<Float>, tilt: SIMD2<Float>, previousSurfaces: [MeshSurface?] = []) {
    self.size = size
    self.tilt = tilt
    self.previousSurfaces = previousSurfaces
    data.reserveCapacity(ColorRamp.resolution * 2)
  }

  var minSide: Float {
    max(min(size.x, size.y), 1)
  }

  func point(_ unit: SIMD2<Double>) -> SIMD2<Float> {
    SIMD2(Float(unit.x), Float(unit.y)) * size
  }

  mutating func append(_ values: [SIMD4<Float>]) -> Int32 {
    let offset = Int32(data.count)
    data.append(contentsOf: values)
    return offset
  }

  func reusableSurface(for key: MeshSurface.Key) -> MeshSurface? {
    let slot = surfaces.count
    guard slot < previousSurfaces.count, let previous = previousSurfaces[slot], previous.key == key else {
      return nil
    }
    return previous
  }

  mutating func append(surface: MeshSurface) -> Int32? {
    guard surfaces.count < GradientRenderer.maxSurfaces else { return nil }
    surfaces.append(surface)
    return Int32(surfaces.count - 1)
  }
}
