//
//  GradientRegistry.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Foundation

enum GradientRegistry {
  static let programs: [GradientProgram.Type] = [
    LinearGradientProgram.self,
    RadialGradientProgram.self,
    ConicGradientProgram.self,
    SweepGradientProgram.self,
    DiamondGradientProgram.self,
    ReflectedGradientProgram.self,
    MeshGradientProgram.self,
    FreeformGradientProgram.self,
    BilinearGradientProgram.self,
    NoiseGradientProgram.self,
    VoronoiGradientProgram.self,
    GlowGradientProgram.self,
    SpotlightGradientProgram.self,
    VignetteGradientProgram.self,
    AuroraGradientProgram.self,
    LiquidGradientProgram.self,
    IridescentGradientProgram.self,
    WaveGradientProgram.self,
    SilkGradientProgram.self,
    SmokeGradientProgram.self,
    RibbonGradientProgram.self,
    FluxGradientProgram.self,
    HolographicGradientProgram.self,
    InterlaceGradientProgram.self,
    SkyGradientProgram.self,
    StrataGradientProgram.self,
  ]

  private static let lookup: [GradientKind: GradientProgram.Type] = Dictionary(
    uniqueKeysWithValues: programs.map { ($0.kind, $0) }
  )

  static func program(for kind: GradientKind) -> GradientProgram.Type {
    lookup[kind] ?? LinearGradientProgram.self
  }
}
