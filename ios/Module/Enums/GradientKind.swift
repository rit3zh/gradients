//
//  GradientKind.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

enum GradientKind: String, Enumerable {
  case linear
  case radial
  case conic
  case sweep
  case diamond
  case reflected
  case mesh
  case freeform
  case bilinear
  case noise
  case voronoi
  case glow
  case spotlight
  case vignette
  case aurora
  case liquid
  case iridescent
  case wave
  case silk
  case smoke
  case ribbon
  case flux
  case holographic
  case interlace
  case sky
  case strata

  var index: Int32 {
    Int32(Self.allCases.firstIndex(of: self) ?? 0)
  }
}
