//
//  UIColor+LinearComponents.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import UIKit
import simd

extension UIColor {
  func linearComponents(for traits: UITraitCollection) -> SIMD4<Float> {
    let resolved = resolvedColor(with: traits)
    var red: CGFloat = 0
    var green: CGFloat = 0
    var blue: CGFloat = 0
    var alpha: CGFloat = 0
    guard resolved.getRed(&red, green: &green, blue: &blue, alpha: &alpha) else {
      var white: CGFloat = 0
      resolved.getWhite(&white, alpha: &alpha)
      let value = ColorSpace.linearize(Float(min(max(white, 0), 1)))
      return SIMD4(value, value, value, Float(alpha))
    }
    let rgb = simd_clamp(
      SIMD3(Float(red), Float(green), Float(blue)),
      SIMD3(repeating: 0),
      SIMD3(repeating: 1)
    )
    return SIMD4(ColorSpace.linearize(rgb), Float(min(max(alpha, 0), 1)))
  }
}
