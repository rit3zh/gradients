//
//  NativeMeshConfiguration.swift
//  Pods
//
//  Created by rit3zh CX on 9/28/26.
//

import UIKit
import simd

struct NativeMeshConfiguration: Equatable {
  static let maximumSide = 16

  var columns = 2
  var rows = 2
  var points: [SIMD2<Float>] = NativeMeshConfiguration.grid(columns: 2, rows: 2)
  var colors: [UIColor] = Array(repeating: .clear, count: 4)
  var smoothsColors = true
  var background: UIColor = .clear
  var colorSpace: NativeMeshColorSpace = .device

  init() {}

  init(
    columns: Int,
    rows: Int,
    points: [[Double]],
    colors: [UIColor],
    smoothsColors: Bool,
    background: UIColor?,
    colorSpace: NativeMeshColorSpace
  ) {
    self.columns = min(max(columns, 2), Self.maximumSide)
    self.rows = min(max(rows, 2), Self.maximumSide)
    let count = self.columns * self.rows

    let parsed = points.compactMap { point -> SIMD2<Float>? in
      guard point.count >= 2 else { return nil }
      return SIMD2(Float(point[0]), Float(point[1]))
    }
    self.points = parsed.count == count ? parsed : Self.grid(columns: self.columns, rows: self.rows)
    self.colors = colors.isEmpty
      ? Array(repeating: .clear, count: count)
      : (0..<count).map { colors[$0 % colors.count] }
    self.smoothsColors = smoothsColors
    self.background = background ?? .clear
    self.colorSpace = colorSpace
  }

  func hasSameShape(as other: NativeMeshConfiguration) -> Bool {
    columns == other.columns && rows == other.rows
  }

  func interpolated(to other: NativeMeshConfiguration, progress: Double) -> NativeMeshConfiguration {
    let weight = CGFloat(progress)
    var result = other
    result.points = zip(points, other.points).map { $0 + ($1 - $0) * Float(progress) }
    result.colors = zip(colors, other.colors).map { $0.meshBlend(to: $1, weight: weight) }
    result.background = background.meshBlend(to: other.background, weight: weight)
    return result
  }

  func drifted(amount: Double, clock: Double) -> NativeMeshConfiguration {
    guard amount > 0 else { return self }
    let reach = SIMD2(0.35 / Double(columns - 1), 0.35 / Double(rows - 1))
    var result = self
    result.points = PointDrift.apply(
      to: points.map { SIMD2(Double($0.x), Double($0.y)) },
      amount: amount,
      clock: clock,
      seed: 0,
      reach: reach,
      grid: (rows, columns)
    ).map { SIMD2(Float($0.x), Float($0.y)) }
    return result
  }

  static func eased(_ progress: Double) -> Double {
    let t = min(max(progress, 0), 1)
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2
  }

  static func grid(columns: Int, rows: Int) -> [SIMD2<Float>] {
    (0..<rows).flatMap { row in
      (0..<columns).map { column in
        SIMD2(Float(column) / Float(columns - 1), Float(row) / Float(rows - 1))
      }
    }
  }
}

private extension UIColor {
  func meshBlend(to other: UIColor, weight: CGFloat) -> UIColor {
    var from = (red: CGFloat(0), green: CGFloat(0), blue: CGFloat(0), alpha: CGFloat(0))
    var to = (red: CGFloat(0), green: CGFloat(0), blue: CGFloat(0), alpha: CGFloat(0))
    getRed(&from.red, green: &from.green, blue: &from.blue, alpha: &from.alpha)
    other.getRed(&to.red, green: &to.green, blue: &to.blue, alpha: &to.alpha)
    return UIColor(
      red: from.red + (to.red - from.red) * weight,
      green: from.green + (to.green - from.green) * weight,
      blue: from.blue + (to.blue - from.blue) * weight,
      alpha: from.alpha + (to.alpha - from.alpha) * weight
    )
  }
}
