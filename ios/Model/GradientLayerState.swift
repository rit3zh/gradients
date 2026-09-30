//
//  GradientLayerState.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import UIKit
import simd

struct GradientLayerState {
  var kind: GradientKind
  var blendMode: GradientBlendMode
  var tileMode: GradientTileMode
  var interpolation: ColorInterpolation
  var parameters: GradientParameters
  var ramp: ColorRamp
  var colors: [SIMD4<Float>]
  var points: [SIMD2<Double>]
  var rows: Int
  var columns: Int
  var seed: Double
  var clock: Double = 0

  init(record: GradientLayerRecord, traits: UITraitCollection) {
    kind = record.type
    blendMode = record.blendMode
    tileMode = record.tileMode
    interpolation = record.interpolation
    parameters = GradientParameters(record: record)
    seed = record.seed

    let resolved = record.colors.map { $0.linearComponents(for: traits) }
    ramp = ColorRamp(
      colors: resolved,
      stops: record.stops,
      space: record.interpolation,
      easing: CubicBezier(record.easing)
    )

    let sites = record.points.map { SIMD2(Double($0.x), Double($0.y)) }

    switch record.type {
    case .mesh:
      rows = max(record.rows, 2)
      columns = max(record.columns, 2)
      let count = rows * columns
      points = sites.count == count ? sites : Self.grid(rows: rows, columns: columns)
      colors = Self.cycle(resolved, count: count)
    case .bilinear:
      rows = 2
      columns = 2
      points = []
      colors = Self.cycle(resolved, count: 4)
    case .freeform:
      rows = 0
      columns = 0
      let count = min(max(sites.isEmpty ? resolved.count : sites.count, 1), 32)
      points = sites.isEmpty ? Self.scatter(count: count, seed: record.seed) : Array(sites.prefix(count))
      colors = Self.cycle(resolved, count: count)
    case .voronoi:
      rows = 0
      columns = 0
      let count = min(max(sites.isEmpty ? (record.cells > 0 ? record.cells : 8) : sites.count, 1), 32)
      points = sites.isEmpty ? Self.scatter(count: count, seed: record.seed) : Array(sites.prefix(count))
      colors = Self.cycle(resolved, count: count)
    default:
      rows = 0
      columns = 0
      points = []
      colors = []
    }
  }

  var opacity: Double {
    get { parameters.opacity }
    set { parameters.opacity = newValue }
  }

  func isCompatible(with other: GradientLayerState) -> Bool {
    kind == other.kind
      && blendMode == other.blendMode
      && tileMode == other.tileMode
      && interpolation == other.interpolation
      && rows == other.rows
      && columns == other.columns
      && points.count == other.points.count
      && colors.count == other.colors.count
  }

  func faded(by factor: Double) -> GradientLayerState {
    var copy = self
    copy.parameters.opacity *= factor
    return copy
  }

  static func mix(_ a: GradientLayerState, _ b: GradientLayerState, _ t: Double) -> GradientLayerState {
    var result = b
    let weight = Float(t)
    result.parameters = GradientParameters.mix(a.parameters, b.parameters, t)
    result.ramp = ColorRamp.mix(a.ramp, b.ramp, weight)
    result.colors = zip(a.colors, b.colors).map { simd_mix($0, $1, SIMD4(repeating: weight)) }
    result.points = zip(a.points, b.points).map { $0 + ($1 - $0) * t }
    result.seed = a.seed + (b.seed - a.seed) * t
    result.clock = a.clock + (b.clock - a.clock) * t
    return result
  }

  private static func grid(rows: Int, columns: Int) -> [SIMD2<Double>] {
    (0..<rows).flatMap { row in
      (0..<columns).map { column in
        SIMD2(Double(column) / Double(columns - 1), Double(row) / Double(rows - 1))
      }
    }
  }

  private static func cycle(_ colors: [SIMD4<Float>], count: Int) -> [SIMD4<Float>] {
    guard !colors.isEmpty else { return Array(repeating: .zero, count: count) }
    return (0..<count).map { colors[$0 % colors.count] }
  }

  private static func scatter(count: Int, seed: Double) -> [SIMD2<Double>] {
    var random = SeededRandom(seed: seed)
    let golden = 0.618_033_988_75
    let offset = random.unit()
    return (0..<count).map { index in
      let jitter = SIMD2(random.unit(), random.unit()) - 0.5
      let base = SIMD2(
        (offset + Double(index) * golden).truncatingRemainder(dividingBy: 1),
        (Double(index) + 0.5) / Double(count)
      )
      return simd_clamp(base + jitter * (0.6 / Double(count).squareRoot()), SIMD2(repeating: 0.02), SIMD2(repeating: 0.98))
    }
  }
}
