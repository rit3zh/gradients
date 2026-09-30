//
//  GradientUniforms.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

struct FrameUniforms {
  var size = SIMD2<Float>(1, 1)
  var tilt = SIMD2<Float>(0, 0)
  var time: Float = 0
  var scale: Float = 1
  var dither: Float = 1
  var grain: Float = 0
  var layerCount: Int32 = 0
  var padding0: Int32 = 0
  var padding1: Int32 = 0
  var padding2: Int32 = 0
}

struct LayerUniforms {
  var a = SIMD4<Float>(repeating: 0)
  var b = SIMD4<Float>(repeating: 0)
  var c = SIMD4<Float>(repeating: 0)
  var d = SIMD4<Float>(repeating: 0)
  var range = SIMD2<Float>(0, 1)
  var opacity: Float = 1
  var time: Float = 0
  var phase: Float = 0
  var kind: Int32 = 0
  var blend: Int32 = 0
  var tile: Int32 = 0
  var space: Int32 = 0
  var ramp: Int32 = 0
  var data: Int32 = 0
  var count: Int32 = 0
  var surface: Int32 = 0
  var flags: Int32 = 0
  var reserved: Int32 = 0
}

struct MeshVertex {
  var position: SIMD2<Float>
  var color: SIMD4<Float>
}
