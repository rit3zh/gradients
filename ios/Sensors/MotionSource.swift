//
//  MotionSource.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import CoreMotion
import simd

final class MotionSource {
  static let shared = MotionSource()

  private let manager = CMMotionManager()
  private var subscribers = 0
  private var reference: SIMD2<Double>?
  private var smoothed = SIMD2<Double>(0, 0)

  private(set) var tilt = SIMD2<Float>(0, 0)

  private init() {}

  func subscribe() {
    subscribers += 1
    guard subscribers == 1, manager.isDeviceMotionAvailable else { return }
    manager.deviceMotionUpdateInterval = 1 / 60
    manager.startDeviceMotionUpdates(to: .main) { [weak self] motion, _ in
      guard let self, let motion else { return }
      self.update(with: motion.attitude)
    }
  }

  func unsubscribe() {
    subscribers = max(subscribers - 1, 0)
    guard subscribers == 0 else { return }
    manager.stopDeviceMotionUpdates()
    reference = nil
    smoothed = .zero
    tilt = .zero
  }

  private func update(with attitude: CMAttitude) {
    let current = SIMD2(attitude.roll, attitude.pitch)
    let origin = reference ?? current
    reference = simd_mix(origin, current, SIMD2(repeating: 0.004))
    let offset = simd_clamp(current - origin, SIMD2(repeating: -0.7), SIMD2(repeating: 0.7)) / 0.7
    smoothed = simd_mix(smoothed, offset, SIMD2(repeating: 0.18))
    tilt = SIMD2(Float(smoothed.x), Float(smoothed.y))
  }
}
