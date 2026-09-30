//
//  SweepGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum SweepGradientProgram: GradientProgram {
  static let kind = GradientKind.sweep
  static let resolution: Double? = 2

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    let center = context.point(parameters.center)
    uniforms.a = SIMD4(
      center.x,
      center.y,
      spinAngle(state, degrees: parameters.startAngle),
      spinAngle(state, degrees: parameters.endAngle)
    )
  }
}
