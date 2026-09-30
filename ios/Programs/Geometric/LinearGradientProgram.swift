//
//  LinearGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum LinearGradientProgram: GradientProgram {
  static let kind = GradientKind.linear
  static let resolution: Double? = 2

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let line = axis(for: state, size: context.size)
    uniforms.a = SIMD4(lowHalf: line.start, highHalf: line.end)
  }

  static func axis(for state: GradientLayerState, size: SIMD2<Float>) -> (start: SIMD2<Float>, end: SIMD2<Float>) {
    let parameters = state.parameters
    let angle = spinAngle(state, degrees: parameters.angle)
    let direction = SIMD2(sin(angle), -cos(angle))
    let length = abs(size.x * direction.x) + abs(size.y * direction.y)
    let center = size * 0.5
    let angleStart = center - direction * length * 0.5
    let angleEnd = center + direction * length * 0.5

    let rotation = Float(parameters.spin * state.clock * .pi / 180)
    let pointStart = rotate(SIMD2(Float(parameters.start.x), Float(parameters.start.y)) * size, around: center, by: rotation)
    let pointEnd = rotate(SIMD2(Float(parameters.end.x), Float(parameters.end.y)) * size, around: center, by: rotation)

    let weight = SIMD2<Float>(repeating: Float(parameters.usesPoints))
    return (simd_mix(angleStart, pointStart, weight), simd_mix(angleEnd, pointEnd, weight))
  }

  private static func rotate(_ point: SIMD2<Float>, around center: SIMD2<Float>, by angle: Float) -> SIMD2<Float> {
    guard angle != 0 else { return point }
    let offset = point - center
    let c = cos(angle)
    let s = sin(angle)
    return center + SIMD2(offset.x * c - offset.y * s, offset.x * s + offset.y * c)
  }
}
