//
//  AuroraGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum AuroraGradientProgram: GradientProgram {
  static let kind = GradientKind.aurora
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(
      Float(parameters.scale),
      Float(parameters.bands),
      Float(parameters.intensity),
      Float(max(1 - parameters.softness, 0.05))
    )
    var random = SeededRandom(seed: state.seed)
    uniforms.b.x = Float(random.unit() * 50)
  }
}
