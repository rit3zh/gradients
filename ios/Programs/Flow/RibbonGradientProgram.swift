//
//  RibbonGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum RibbonGradientProgram: GradientProgram {
  static let kind = GradientKind.ribbon
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0 || state.parameters.spin != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      spinAngle(state, degrees: parameters.angle),
      Float(max(parameters.bands, 0.1) * 1.5),
      Float(max(parameters.bands, 1)),
      Float(parameters.highlight)
    )
    uniforms.b.x = Float(max(parameters.scale, 0.05))
  }
}
