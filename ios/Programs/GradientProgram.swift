//
//  GradientProgram.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Foundation

protocol GradientProgram {
  static var kind: GradientKind { get }
  static var resolution: Double? { get }

  static func isAnimated(_ state: GradientLayerState) -> Bool
  static func encode(_ state: GradientLayerState, into uniforms: inout LayerUniforms, context: inout LayerContext)
}

extension GradientProgram {
  static var resolution: Double? { nil }

  static func isAnimated(_ state: GradientLayerState) -> Bool {
    state.parameters.speed != 0 && (state.parameters.spin != 0 || state.parameters.flow != 0)
  }

  static func spinAngle(_ state: GradientLayerState, degrees: Double) -> Float {
    Float((degrees + state.parameters.spin * state.clock) * .pi / 180)
  }
}
