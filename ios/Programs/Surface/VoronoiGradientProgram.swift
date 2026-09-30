//
//  VoronoiGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum VoronoiGradientProgram: GradientProgram {
  static let kind = GradientKind.voronoi

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0 && state.parameters.drift > 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let points = PointDrift.apply(
      to: state.points,
      amount: state.parameters.drift,
      clock: state.clock,
      seed: state.seed,
      reach: SIMD2(repeating: 0.18)
    )
    let sites = points.map { point -> SIMD4<Float> in
      let position = context.point(point)
      return SIMD4(position.x, position.y, 0, 0)
    }
    let colors = state.colors.map { ColorSpace.encode($0, in: state.interpolation) }
    uniforms.data = context.append(sites + colors)
    uniforms.count = Int32(sites.count)
    let smoothness = min(max(state.parameters.smoothness, 0), 1)
    uniforms.a.x = Float(1 / max(smoothness * smoothness * 0.3, 0.004))
  }
}
