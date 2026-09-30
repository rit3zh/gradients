//
//  SilkGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum SilkGradientProgram: GradientProgram {
  static let kind = GradientKind.silk
  static let resolution: Double? = 1.5

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    uniforms.a = SIMD4(Float(max(parameters.scale, 0.05)), Float(parameters.highlight), 0, 0)
  }
}
