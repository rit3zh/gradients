//
//  WaveGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum WaveGradientProgram: GradientProgram {
  static let kind = GradientKind.wave
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      Float(parameters.scale),
      Float(parameters.intensity * 0.24),
      Float(min(max(parameters.smoothness, 0), 1)),
      0
    )
    uniforms.b.x = spinAngle(state, degrees: parameters.angle)
  }
}
