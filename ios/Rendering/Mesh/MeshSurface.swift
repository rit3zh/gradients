//
//  MeshSurface.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

struct MeshSurface {
  struct Key: Equatable {
    var points: [SIMD2<Double>]
    var colors: [SIMD4<Float>]
    var rows: Int
    var columns: Int
    var space: ColorInterpolation
    var smoothness: Double
  }

  var key: Key
  var vertices: [MeshVertex]
  var columns: Int
  var rows: Int
}
