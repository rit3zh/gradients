//
//  GradientParameters.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

struct GradientParameters: Equatable {
  var angle: Double = 180
  var start = SIMD2<Double>(0.5, 0)
  var end = SIMD2<Double>(0.5, 1)
  var usesPoints: Double = 0
  var center = SIMD2<Double>(0.5, 0.5)
  var radius: Double = 1
  var ellipse: Double = 0
  var startAngle: Double = 0
  var endAngle: Double = 360
  var scale: Double = 1
  var octaves: Double = 4
  var warp: Double = 0
  var smoothness: Double = 0.5
  var intensity: Double = 1
  var softness: Double = 0.5
  var roundness: Double = 1
  var width: Double = 0.2
  var spread: Double = 30
  var falloff: Double = 1
  var power: Double = 2
  var cornerRadius: Double = 0
  var highlight: Double = 0
  var bands: Double = 3
  var period: Double = 2
  var delay: Double = 0
  var speed: Double = 0
  var spin: Double = 0
  var flow: Double = 0
  var drift: Double = 0
  var opacity: Double = 1
  var extinction = SIMD3<Double>(0.1, 0.3, 0.6)
  var horizon: Double = 0.8
  var fisheye: Double = 0.5

  init() {}

  init(record: GradientLayerRecord) {
    angle = record.angle
    if let start = record.start, let end = record.end {
      self.start = SIMD2(Double(start.x), Double(start.y))
      self.end = SIMD2(Double(end.x), Double(end.y))
      usesPoints = 1
    }
    center = SIMD2(Double(record.center.x), Double(record.center.y))
    radius = record.radius
    ellipse = record.shape == .ellipse ? 1 : 0
    startAngle = record.startAngle
    endAngle = record.endAngle
    scale = record.scale
    octaves = min(max(record.octaves, 1), 6)
    warp = record.warp
    smoothness = record.smoothness
    intensity = record.intensity
    softness = record.softness
    roundness = record.roundness
    width = record.width
    spread = record.spread
    falloff = record.falloff
    power = record.power
    cornerRadius = record.cornerRadius
    highlight = record.highlight
    bands = min(max(record.bands, 0.5), 24)
    period = max(record.period, 0.05)
    delay = max(record.delay, 0)
    speed = record.speed
    spin = record.spin
    flow = record.flow
    drift = record.drift
    opacity = min(max(record.opacity, 0), 1)
    if record.extinction.count == 3 {
      extinction = SIMD3(record.extinction[0], record.extinction[1], record.extinction[2])
    }
    horizon = record.horizon
    fisheye = record.fisheye
  }

  static func mix(_ a: GradientParameters, _ b: GradientParameters, _ t: Double) -> GradientParameters {
    func lerp(_ x: Double, _ y: Double) -> Double { x + (y - x) * t }
    func lerp(_ x: SIMD2<Double>, _ y: SIMD2<Double>) -> SIMD2<Double> { x + (y - x) * t }

    var result = GradientParameters()
    result.angle = lerp(a.angle, b.angle)
    result.start = lerp(a.usesPoints > 0 ? a.start : b.start, b.usesPoints > 0 ? b.start : a.start)
    result.end = lerp(a.usesPoints > 0 ? a.end : b.end, b.usesPoints > 0 ? b.end : a.end)
    result.usesPoints = lerp(a.usesPoints, b.usesPoints)
    result.center = lerp(a.center, b.center)
    result.radius = lerp(a.radius, b.radius)
    result.ellipse = lerp(a.ellipse, b.ellipse)
    result.startAngle = lerp(a.startAngle, b.startAngle)
    result.endAngle = lerp(a.endAngle, b.endAngle)
    result.scale = lerp(a.scale, b.scale)
    result.octaves = lerp(a.octaves, b.octaves)
    result.warp = lerp(a.warp, b.warp)
    result.smoothness = lerp(a.smoothness, b.smoothness)
    result.intensity = lerp(a.intensity, b.intensity)
    result.softness = lerp(a.softness, b.softness)
    result.roundness = lerp(a.roundness, b.roundness)
    result.width = lerp(a.width, b.width)
    result.spread = lerp(a.spread, b.spread)
    result.falloff = lerp(a.falloff, b.falloff)
    result.power = lerp(a.power, b.power)
    result.cornerRadius = lerp(a.cornerRadius, b.cornerRadius)
    result.highlight = lerp(a.highlight, b.highlight)
    result.bands = lerp(a.bands, b.bands)
    result.period = lerp(a.period, b.period)
    result.delay = lerp(a.delay, b.delay)
    result.speed = lerp(a.speed, b.speed)
    result.spin = lerp(a.spin, b.spin)
    result.flow = lerp(a.flow, b.flow)
    result.drift = lerp(a.drift, b.drift)
    result.opacity = lerp(a.opacity, b.opacity)
    result.extinction = a.extinction + (b.extinction - a.extinction) * t
    result.horizon = lerp(a.horizon, b.horizon)
    result.fisheye = lerp(a.fisheye, b.fisheye)
    return result
  }
}
