//
//  FluxGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum FluxGradientProgram: GradientProgram {
  static let kind = GradientKind.flux
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(Float(parameters.warp), Float(parameters.intensity), Float(max(parameters.scale, 0.05)), 0)
    uniforms.b = SIMD4(lowHalf: NoiseGradientProgram.seedOffset(state.seed) * 0.05, highHalf: .zero)
  }
}
