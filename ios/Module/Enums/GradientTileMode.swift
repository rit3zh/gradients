//
//  GradientTileMode.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

enum GradientTileMode: String, Enumerable {
  case clamp
  case `repeat`
  case mirror
  case decal

  var index: Int32 {
    Int32(Self.allCases.firstIndex(of: self) ?? 0)
  }
}
