//
//  PerformanceSummary.swift
//  Pods
//
//  Created by rit3zh CX on 9/27/26.
//

import Foundation

struct PerformanceSummary {
  let mean: Double
  let p50: Double
  let p95: Double
  let max: Double
  let samples: Int

  init(_ values: [Double]) {
    samples = values.count
    guard !values.isEmpty else {
      mean = 0
      p50 = 0
      p95 = 0
      max = 0
      return
    }
    let sorted = values.sorted()
    mean = sorted.reduce(0, +) / Double(sorted.count)
    p50 = Self.percentile(sorted, 0.5)
    p95 = Self.percentile(sorted, 0.95)
    max = sorted[sorted.count - 1]
  }

  var dictionary: [String: Any] {
    ["mean": mean, "p50": p50, "p95": p95, "max": max, "samples": samples]
  }

  private static func percentile(_ sorted: [Double], _ fraction: Double) -> Double {
    let position = fraction * Double(sorted.count - 1)
    let lower = Int(position.rounded(.down))
    let upper = min(lower + 1, sorted.count - 1)
    let weight = position - Double(lower)
    return sorted[lower] + (sorted[upper] - sorted[lower]) * weight
  }
}
