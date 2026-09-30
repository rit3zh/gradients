//
//  ColorInterpolation.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

enum ColorInterpolation: String, Enumerable {
  case srgb
  case linear
  case oklab

  var index: Int32 {
    Int32(Self.allCases.firstIndex(of: self) ?? 0)
  }
}
