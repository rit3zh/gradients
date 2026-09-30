//
//  ColorSpace.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum ColorSpace {
  static func linearize(_ value: Float) -> Float {
    value <= 0.04045 ? value / 12.92 : powf((value + 0.055) / 1.055, 2.4)
  }

  static func gamma(_ value: Float) -> Float {
    value <= 0.0031308 ? value * 12.92 : 1.055 * powf(value, 1 / 2.4) - 0.055
  }

  static func linearize(_ rgb: SIMD3<Float>) -> SIMD3<Float> {
    SIMD3(linearize(rgb.x), linearize(rgb.y), linearize(rgb.z))
  }

  static func gamma(_ rgb: SIMD3<Float>) -> SIMD3<Float> {
    let clamped = simd_clamp(rgb, SIMD3(repeating: 0), SIMD3(repeating: 1))
    return SIMD3(gamma(clamped.x), gamma(clamped.y), gamma(clamped.z))
  }

  static func oklab(fromLinear rgb: SIMD3<Float>) -> SIMD3<Float> {
    let l = 0.4122214708 * rgb.x + 0.5363325363 * rgb.y + 0.0514459929 * rgb.z
    let m = 0.2119034982 * rgb.x + 0.6806995451 * rgb.y + 0.1073969566 * rgb.z
    let s = 0.0883024619 * rgb.x + 0.2817188376 * rgb.y + 0.6299787005 * rgb.z
    let l_ = cbrtf(l)
    let m_ = cbrtf(m)
    let s_ = cbrtf(s)
    return SIMD3(
      0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    )
  }

  static func linear(fromOklab lab: SIMD3<Float>) -> SIMD3<Float> {
    let l_ = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z
    let m_ = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z
    let s_ = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z
    let l = l_ * l_ * l_
    let m = m_ * m_ * m_
    let s = s_ * s_ * s_
    return SIMD3(
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    )
  }

  static func encode(_ color: SIMD4<Float>, in space: ColorInterpolation) -> SIMD4<Float> {
    let rgb = SIMD3(color.x, color.y, color.z)
    let encoded: SIMD3<Float>
    switch space {
    case .srgb: encoded = gamma(rgb)
    case .linear: encoded = rgb
    case .oklab: encoded = oklab(fromLinear: rgb)
    }
    return SIMD4(encoded * color.w, color.w)
  }

  static func decode(_ premultiplied: SIMD4<Float>, from space: ColorInterpolation) -> SIMD4<Float> {
    let alpha = premultiplied.w
    guard alpha > 0.00001 else { return .zero }
    let value = SIMD3(premultiplied.x, premultiplied.y, premultiplied.z) / alpha
    let rgb: SIMD3<Float>
    switch space {
    case .srgb: rgb = linearize(simd_clamp(value, SIMD3(repeating: 0), SIMD3(repeating: 1)))
    case .linear: rgb = value
    case .oklab: rgb = linear(fromOklab: value)
    }
    return SIMD4(rgb, alpha)
  }

  static func output(_ linear: SIMD4<Float>) -> SIMD4<Float> {
    let alpha = min(max(linear.w, 0), 1)
    return SIMD4(gamma(SIMD3(linear.x, linear.y, linear.z)) * alpha, alpha)
  }
}
