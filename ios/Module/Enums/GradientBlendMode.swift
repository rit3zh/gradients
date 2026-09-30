//
//  GradientBlendMode.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

enum GradientBlendMode: String, Enumerable {
  case normal
  case multiply
  case screen
  case overlay
  case darken
  case lighten
  case colorDodge
  case colorBurn
  case hardLight
  case softLight
  case difference
  case exclusion
  case hue
  case saturation
  case color
  case luminosity
  case plusLighter
  case plusDarker

  var index: Int32 {
    Int32(Self.allCases.firstIndex(of: self) ?? 0)
  }

  var compositingFilter: String? {
    switch self {
    case .normal: return nil
    case .plusLighter: return "plusL"
    case .plusDarker: return "plusD"
    default: return "\(rawValue)BlendMode"
    }
  }
}
