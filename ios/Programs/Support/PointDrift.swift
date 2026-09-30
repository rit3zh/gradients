//
//  PointDrift.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum PointDrift {
  static func apply(
    to points: [SIMD2<Double>],
    amount: Double,
    clock: Double,
    seed: Double,
    reach: SIMD2<Double>,
    grid: (rows: Int, columns: Int)? = nil
  ) -> [SIMD2<Double>] {
    guard amount > 0 else { return points }
    var random = SeededRandom(seed: seed + 17)
    return points.enumerated().map { index, point in
      let frequency = SIMD2(0.35 + random.unit() * 0.5, 0.35 + random.unit() * 0.5)
      let phase = SIMD2(random.unit(), random.unit()) * (2 * .pi)
      var offset = SIMD2(
        sin(clock * frequency.x + phase.x),
        cos(clock * frequency.y + phase.y)
      ) * reach * amount

      if let grid {
        let row = index / grid.columns
        let column = index % grid.columns
        if column == 0 || column == grid.columns - 1 { offset.x = 0 }
        if row == 0 || row == grid.rows - 1 { offset.y = 0 }
      }
      return point + offset
    }
  }
}
