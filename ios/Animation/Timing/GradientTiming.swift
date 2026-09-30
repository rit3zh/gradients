//
//  GradientTiming.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Foundation

enum GradientTiming {
  case curve(duration: TimeInterval, delay: TimeInterval, easing: CubicBezier)
  case spring(damping: Double, stiffness: Double, mass: Double, delay: TimeInterval)

  init?(record: GradientTransitionRecord?) {
    guard let record else { return nil }
    let delay = max(record.delay, 0) / 1000
    switch record.type {
    case .timing:
      guard record.duration > 0 else { return nil }
      self = .curve(duration: record.duration / 1000, delay: delay, easing: CubicBezier(record.easing))
    case .spring:
      self = .spring(
        damping: max(record.damping, 0.01),
        stiffness: max(record.stiffness, 0.01),
        mass: max(record.mass, 0.01),
        delay: delay
      )
    }
  }

  var delay: TimeInterval {
    switch self {
    case let .curve(_, delay, _): return delay
    case let .spring(_, _, _, delay): return delay
    }
  }

  var settleTime: TimeInterval {
    switch self {
    case let .curve(duration, _, _):
      return duration
    case let .spring(damping, stiffness, mass, _):
      let omega = sqrt(stiffness / mass)
      let zeta = damping / (2 * sqrt(stiffness * mass))
      let decay = zeta < 1 ? zeta * omega : omega * (zeta - sqrt(zeta * zeta - 1))
      return min(log(1000) / max(decay, 0.0001), 10)
    }
  }

  func progress(at elapsed: TimeInterval) -> Double {
    let time = elapsed - delay
    guard time > 0 else { return 0 }
    switch self {
    case let .curve(duration, _, easing):
      return easing.value(at: time / duration)
    case let .spring(damping, stiffness, mass, _):
      return Self.spring(time: time, damping: damping, stiffness: stiffness, mass: mass)
    }
  }

  func isFinished(at elapsed: TimeInterval) -> Bool {
    elapsed - delay >= settleTime
  }

  private static func spring(time: Double, damping: Double, stiffness: Double, mass: Double) -> Double {
    let omega = sqrt(stiffness / mass)
    let zeta = damping / (2 * sqrt(stiffness * mass))
    if zeta < 1 {
      let damped = omega * sqrt(1 - zeta * zeta)
      let envelope = exp(-zeta * omega * time)
      return 1 - envelope * (cos(damped * time) + (zeta * omega / damped) * sin(damped * time))
    }
    if zeta == 1 {
      return 1 - exp(-omega * time) * (1 + omega * time)
    }
    let root = sqrt(zeta * zeta - 1)
    let r1 = -omega * (zeta - root)
    let r2 = -omega * (zeta + root)
    let a = r2 / (r1 - r2)
    let b = -r1 / (r1 - r2)
    return 1 + a * exp(r1 * time) + b * exp(r2 * time)
  }
}
