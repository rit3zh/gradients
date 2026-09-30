//
//  NoiseGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum NoiseGradientProgram: GradientProgram {
  static let kind = GradientKind.noise
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      Float(parameters.scale),
      Float(parameters.octaves),
      Float(parameters.warp),
      Float(1.2 + parameters.intensity * 0.6)
    )
    uniforms.b = SIMD4(lowHalf: seedOffset(state.seed), highHalf: .zero)
  }

  static func seedOffset(_ seed: Double) -> SIMD2<Float> {
    var random = SeededRandom(seed: seed)
    return SIMD2(Float(random.unit() * 97), Float(random.unit() * 97))
  }
}
