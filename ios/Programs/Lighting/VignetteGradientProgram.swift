//
//  VignetteGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum VignetteGradientProgram: GradientProgram {
  static let kind = GradientKind.vignette
  static let resolution: Double? = 1

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    false
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      Float(parameters.center.x),
      Float(parameters.center.y),
      Float(parameters.radius),
      Float(parameters.softness)
    )
    uniforms.b = SIMD4(Float(parameters.roundness), Float(parameters.intensity), 0, 0)
  }
}
