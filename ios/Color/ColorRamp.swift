//
//  ColorRamp.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

struct ColorRamp: Equatable {
  static let resolution = 256

  var samples: [SIMD4<Float>]
  var range: SIMD2<Float>

  static let clear = ColorRamp(
    samples: Array(repeating: .zero, count: resolution),
    range: SIMD2(0, 1)
  )

  init(samples: [SIMD4<Float>], range: SIMD2<Float>) {
    self.samples = samples
    self.range = range
  }

  init(
    colors: [SIMD4<Float>],
    stops: [Double],
    space: ColorInterpolation,
    easing: CubicBezier
  ) {
    guard !colors.isEmpty else {
      self = .clear
      return
    }
    guard colors.count > 1 else {
      let color = ColorSpace.output(colors[0])
      self.init(samples: Array(repeating: color, count: Self.resolution), range: SIMD2(0, 1))
      return
    }

    let positions = Self.normalize(stops: stops, count: colors.count)
    let encoded = colors.map { ColorSpace.encode($0, in: space) }
    let lower = Float(positions.first ?? 0)
    let upper = max(Float(positions.last ?? 1), lower + 0.0001)

    var samples = [SIMD4<Float>]()
    samples.reserveCapacity(Self.resolution)
    var segment = 0

    for index in 0..<Self.resolution {
      let progress = Double(index) / Double(Self.resolution - 1)
      let position = Double(lower) + progress * Double(upper - lower)
      while segment < positions.count - 2 && position > positions[segment + 1] {
        segment += 1
      }
      let from = positions[segment]
      let to = positions[segment + 1]
      let local = to - from > 0.000001 ? min(max((position - from) / (to - from), 0), 1) : (position >= to ? 1 : 0)
      let eased = Float(easing.value(at: local))
      let mixed = simd_mix(encoded[segment], encoded[segment + 1], SIMD4(repeating: eased))
      samples.append(ColorSpace.output(ColorSpace.decode(mixed, from: space)))
    }

    self.init(samples: samples, range: SIMD2(lower, upper))
  }

  static func normalize(stops: [Double], count: Int) -> [Double] {
    var positions: [Double]
    if stops.count == count {
      positions = stops
    } else {
      positions = (0..<count).map { Double($0) / Double(max(count - 1, 1)) }
    }
    var floor = -Double.infinity
    for index in positions.indices {
      positions[index] = max(positions[index], floor)
      floor = positions[index]
    }
    return positions
  }

  static func mix(_ from: ColorRamp, _ to: ColorRamp, _ progress: Float) -> ColorRamp {
    guard from != to else { return to }
    let weight = SIMD4<Float>(repeating: progress)
    let samples = zip(from.samples, to.samples).map { simd_mix($0, $1, weight) }
    let range = simd_mix(from.range, to.range, SIMD2(repeating: progress))
    return ColorRamp(samples: samples, range: range)
  }
}
