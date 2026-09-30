//
//  MeshGradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum MeshGradientProgram: GradientProgram {
  static let kind = GradientKind.mesh
  static let resolution: Double? = 1

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0 && state.parameters.drift > 0
  }

  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext) {
    let reach = SIMD2(
      0.35 / Double(max(state.columns - 1, 1)),
      0.35 / Double(max(state.rows - 1, 1))
    )
    let points = PointDrift.apply(
      to: state.points,
      amount: state.parameters.drift,
      clock: state.clock,
      seed: state.seed,
      reach: reach,
      grid: (state.rows, state.columns)
    )
    let key = MeshSurface.Key(
      points: points,
      colors: state.colors,
      rows: state.rows,
      columns: state.columns,
      space: state.interpolation,
      smoothness: state.parameters.smoothness
    )
    let surface = context.reusableSurface(for: key) ?? MeshTessellator.surface(for: key)
    uniforms.surface = context.append(surface: surface) ?? 0
  }
}
