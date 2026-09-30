//
//  SpotlightGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum SpotlightGradientProgram: GradientProgram {
  static let kind = GradientKind.spotlight
  static let resolution: Double? = 1

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    let origin = context.point(parameters.center)
    let sway = Float(sin(state.clock * 0.9) * 0.12)
    let reach = simd_length(context.size) * Float(parameters.radius)
    uniforms.a = SIMD4(
      origin.x,
      origin.y,
      spinAngle(state, degrees: parameters.angle) + sway,
      Float(parameters.spread * .pi / 360)
    )
    uniforms.b = SIMD4(reach, Float(parameters.softness), Float(parameters.intensity), 0)
  }
}
