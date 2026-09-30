//
//  CubicBezier.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Foundation

struct CubicBezier: Equatable {
  static let linear = CubicBezier(0, 0, 1, 1)
  static let easeInOut = CubicBezier(0.42, 0, 0.58, 1)
  private let x1: Double
  private let y1: Double
  private let x2: Double
  private let y2: Double
  private let ax: Double
  private let bx: Double
  private let cx: Double
  private let ay: Double
  private let by: Double
  private let cy: Double
  init(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double) {
    self.x1 = min(max(x1, 0), 1)
    self.y1 = y1
    self.x2 = min(max(x2, 0), 1)
    self.y2 = y2
    cx = 3 * self.x1
    bx = 3 * (self.x2 - self.x1) - cx
    ax = 1 - cx - bx
    cy = 3 * y1
    by = 3 * (y2 - y1) - cy
    ay = 1 - cy - by
  }

  init(_ values: [Double]) {
    if values.count == 4 {
      self.init(values[0], values[1], values[2], values[3])
    } else {
      self.init(0, 0, 1, 1)
    }
  }

  var isLinear: Bool {
    x1 == y1 && x2 == y2
  }

  func value(at progress: Double) -> Double {
    let x = min(max(progress, 0), 1)
    guard !isLinear else { return x }
    return sampleY(solve(x))
  }

  private func sampleX(_ t: Double) -> Double {
    ((ax * t + bx) * t + cx) * t
  }

  private func sampleY(_ t: Double) -> Double {
    ((ay * t + by) * t + cy) * t
  }

  private func slopeX(_ t: Double) -> Double {
    (3 * ax * t + 2 * bx) * t + cx
  }

  private func solve(_ x: Double) -> Double {
    var t = x
    for _ in 0..<8 {
      let error = sampleX(t) - x
      if abs(error) < 1e-6 { return t }
      let slope = slopeX(t)
      if abs(slope) < 1e-6 { break }
      t -= error / slope
    }
    var lower = 0.0
    var upper = 1.0
    t = x
    while lower < upper {
      let value = sampleX(t)
      if abs(value - x) < 1e-6 { return t }
      if x > value { lower = t } else { upper = t }
      t = (upper - lower) * 0.5 + lower
      if upper - lower < 1e-7 { break }
    }
    return t
  }
}
