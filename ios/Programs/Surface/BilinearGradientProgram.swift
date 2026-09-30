//
//  BilinearGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum BilinearGradientProgram: GradientProgram {
  static let kind = GradientKind.bilinear
  static let resolution: Double? = 1

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    false
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let colors = state.colors.map { ColorSpace.encode($0, in: state.interpolation) }
    uniforms.data = context.append(colors)
    uniforms.count = 4
    uniforms.a.x = Float(min(max(state.parameters.smoothness, 0), 1))
  }
}
