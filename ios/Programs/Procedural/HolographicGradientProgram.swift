//
//  HolographicGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum HolographicGradientProgram: GradientProgram {
  static let kind = GradientKind.holographic

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0 || state.parameters.spin != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      spinAngle(state, degrees: parameters.angle),
      Float(parameters.bands),
      Float(parameters.intensity),
      Float(parameters.warp)
    )
    uniforms.b = SIMD4(
      lowHalf: NoiseGradientProgram.seedOffset(state.seed) * 0.01,
      highHalf: SIMD2(Float(min(max(parameters.softness, 0), 1)), Float(parameters.highlight))
    )
  }
}
