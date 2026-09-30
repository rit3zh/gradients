//
//  DiamondGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum DiamondGradientProgram: GradientProgram {
  static let kind = GradientKind.diamond
  static let resolution: Double? = 2

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    let center = context.point(parameters.center)
    let square = SIMD2<Float>(repeating: max(context.size.x, context.size.y))
    let radii = simd_mix(square, context.size, SIMD2(repeating: Float(parameters.ellipse))) * Float(parameters.radius)
    uniforms.a = SIMD4(lowHalf: center, highHalf: radii)
    uniforms.b.x = spinAngle(state, degrees: parameters.angle)
  }
}
