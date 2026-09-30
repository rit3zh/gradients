//
//  ConicGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum ConicGradientProgram: GradientProgram {
  static let kind = GradientKind.conic
  static let resolution: Double? = 2

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let center = context.point(state.parameters.center)
    uniforms.a = SIMD4(center.x, center.y, spinAngle(state, degrees: state.parameters.angle), 0)
  }
}
