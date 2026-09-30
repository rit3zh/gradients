//
//  GlowGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum GlowGradientProgram: GradientProgram {
  static let kind = GradientKind.glow
  static let resolution: Double? = 1

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    let center = context.point(parameters.center)
    let radius = Float(parameters.radius) * context.minSide * 0.5
    uniforms.a = SIMD4(center.x, center.y, radius, Float(max(parameters.falloff, 0.05)))
    uniforms.b = SIMD4(Float(parameters.intensity), 0.08, 0, 0)
  }
}
