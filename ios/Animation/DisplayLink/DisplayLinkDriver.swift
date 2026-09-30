//
//  DisplayLinkDriver.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import QuartzCore

final class DisplayLinkDriver {
  private(set) var isRunning = false
  private var lastTimestamp: CFTimeInterval?
  private let tick: (TimeInterval) -> Void

  init(tick: @escaping (TimeInterval) -> Void) {
    self.tick = tick
  }

  func start() {
    guard !isRunning else { return }
    isRunning = true
    lastTimestamp = nil
    DisplayLinkHub.shared.add(self)
  }

  func stop() {
    guard isRunning else { return }
    isRunning = false
    lastTimestamp = nil
    DisplayLinkHub.shared.remove(self)
  }

  func step(timestamp: CFTimeInterval) {
    guard isRunning else { return }
    let delta = lastTimestamp.map { min(max(timestamp - $0, 0), 0.1) } ?? 0
    lastTimestamp = timestamp
    tick(delta)
  }
}
