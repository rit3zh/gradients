//
//  RadialGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum RadialGradientProgram: GradientProgram {
  static let kind = GradientKind.radial
  static let resolution: Double? = 2

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    let center = context.point(parameters.center)
    let reach = simd_max(center, context.size - center)
    let circle = SIMD2<Float>(repeating: simd_length(reach))
    let ellipse = reach * Float(2.0.squareRoot())
    let radii = simd_mix(circle, ellipse, SIMD2(repeating: Float(parameters.ellipse))) * Float(parameters.radius)
    uniforms.a = SIMD4(lowHalf: center, highHalf: radii)
  }
}
