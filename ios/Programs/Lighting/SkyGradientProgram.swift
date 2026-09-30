//
//  SkyGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum SkyGradientProgram: GradientProgram {
  static let kind = GradientKind.sky
  static let resolution: Double? = 1

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    false
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(0.7, Float(parameters.fisheye), Float(parameters.horizon), 0)
    let extinction = SIMD3<Float>(
      Float(parameters.extinction.x),
      Float(parameters.extinction.y),
      Float(parameters.extinction.z)
    )
    uniforms.b = SIMD4(extinction, 0)
  }
}
