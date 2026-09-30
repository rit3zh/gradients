//
//  ReflectedGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum ReflectedGradientProgram: GradientProgram {
  static let kind = GradientKind.reflected
  static let resolution: Double? = 2

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let parameters = state.parameters
    let line = LinearGradientProgram.axis(for: state, size: context.size)
    let weight = Float(parameters.usesPoints)
    let middle = (line.start + line.end) * 0.5
    let origin = simd_mix(middle, line.start, SIMD2(repeating: weight))
    uniforms.a = SIMD4(lowHalf: origin, highHalf: line.end)
    uniforms.b = SIMD4(
      Float(min(max(parameters.softness, 0), 1) * 0.35),
      Float(min(max(parameters.radius, -1), 1)),
      0,
      0
    )
  }
}
