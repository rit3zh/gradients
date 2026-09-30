//
//  DisplayLinkHub.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import QuartzCore

final class DisplayLinkHub {
  static let shared = DisplayLinkHub()

  private var link: CADisplayLink?
  private let drivers = NSHashTable<DisplayLinkDriver>.weakObjects()

  private init() {}

  func add(_ driver: DisplayLinkDriver) {
    drivers.add(driver)
    guard link == nil else { return }
    let link = CADisplayLink(target: self, selector: #selector(step(_:)))
    link.preferredFrameRateRange = CAFrameRateRange(minimum: 30, maximum: 120, preferred: 120)
    link.add(to: .main, forMode: .common)
    self.link = link
  }

  func remove(_ driver: DisplayLinkDriver) {
    drivers.remove(driver)
    if drivers.allObjects.isEmpty {
      link?.invalidate()
      link = nil
    }
  }

  @objc private func step(_ link: CADisplayLink) {
    let active = drivers.allObjects
    guard !active.isEmpty else {
      link.invalidate()
      self.link = nil
      return
    }
    guard GradientProfiler.shared.isEnabled else {
      for driver in active {
        driver.step(timestamp: link.targetTimestamp)
      }
      return
    }
    let begin = CACurrentMediaTime()
    for driver in active {
      driver.step(timestamp: link.targetTimestamp)
    }
    GradientProfiler.shared.recordTick(
      cost: CACurrentMediaTime() - begin,
      expected: link.targetTimestamp - link.timestamp
    )
  }
}
