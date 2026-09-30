//
//  StrataGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum StrataGradientProgram: GradientProgram {
  static let kind = GradientKind.strata
  static let resolution: Double? = 2

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      spinAngle(state, degrees: parameters.angle),
      Float(parameters.bands),
      Float(max(parameters.scale, 0.05)),
      Float(min(max(parameters.intensity, 0), 1))
    )
  }
}
