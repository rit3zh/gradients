//
//  LiquidGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum LiquidGradientProgram: GradientProgram {
  static let kind = GradientKind.liquid
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(Float(parameters.scale * 0.55), Float(parameters.warp), Float(parameters.highlight), 0)
    uniforms.b = SIMD4(lowHalf: NoiseGradientProgram.seedOffset(state.seed), highHalf: .zero)
  }
}
