//
//  GradientAnimator.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Foundation

final class GradientAnimator {
  private(set) var presentation: [GradientLayerState] = []

  private var origin: [GradientLayerState] = []
  private var target: [GradientLayerState] = []
  private var timing: GradientTiming?
  private var elapsed: TimeInterval = 0

  private var frames: [[GradientLayerState]] = []
  private var frameIndex = 0
  private var loops = true
  private var sequenceTiming: GradientTiming = .curve(duration: 1.2, delay: 0, easing: .easeInOut)

  var isAnimating: Bool {
    timing != nil || isSequencing
  }

  private var isSequencing: Bool {
    frames.count > 1 && (loops || frameIndex < frames.count - 1)
  }

  func update(
    layers: [GradientLayerState],
    keyframes: [[GradientLayerState]],
    timing: GradientTiming?,
    loop: Bool
  ) {
    frames = keyframes.isEmpty ? [] : [layers] + keyframes
    frameIndex = 0
    loops = loop
    if let timing {
      sequenceTiming = timing
    }
    transition(to: layers, timing: timing)
  }

  func refresh(layers: [GradientLayerState], keyframes: [[GradientLayerState]]) {
    if !frames.isEmpty {
      frames = [layers] + keyframes
    }
    let current = frames.isEmpty ? layers : frames[min(frameIndex, frames.count - 1)]
    let inherited = inheritClocks(current)
    if timing == nil {
      target = inherited
      presentation = inherited
    } else {
      target = inherited
    }
  }

  func step(_ delta: TimeInterval) {
    advanceClocks(&origin, by: delta)
    advanceClocks(&target, by: delta)

    guard let timing else {
      presentation = target
      if isSequencing {
        advanceSequence()
      }
      return
    }

    elapsed += delta
    let progress = timing.progress(at: elapsed)

    if timing.isFinished(at: elapsed) {
      self.timing = nil
      presentation = target
      if isSequencing {
        advanceSequence()
      }
    } else {
      presentation = Self.blend(origin, target, progress)
    }
  }

  private func transition(to layers: [GradientLayerState], timing: GradientTiming?) {
    let inherited = inheritClocks(layers)
    guard let timing, !presentation.isEmpty else {
      origin = []
      target = inherited
      presentation = inherited
      self.timing = nil
      return
    }
    origin = presentation
    target = inherited
    elapsed = 0
    self.timing = timing
  }

  private func advanceSequence() {
    guard frames.count > 1 else { return }
    let next = frameIndex + 1
    if next >= frames.count {
      guard loops else { return }
      frameIndex = 0
    } else {
      frameIndex = next
    }
    transition(to: frames[frameIndex], timing: sequenceTiming)
  }

  private func inheritClocks(_ layers: [GradientLayerState]) -> [GradientLayerState] {
    layers.enumerated().map { index, layer in
      var copy = layer
      if index < presentation.count, presentation[index].kind == layer.kind {
        copy.clock = presentation[index].clock
      }
      return copy
    }
  }

  private func advanceClocks(_ layers: inout [GradientLayerState], by delta: TimeInterval) {
    guard delta > 0 else { return }
    for index in layers.indices {
      layers[index].clock += delta * layers[index].parameters.speed
    }
  }

  private static func blend(
    _ origin: [GradientLayerState],
    _ target: [GradientLayerState],
    _ progress: Double
  ) -> [GradientLayerState] {
    let fade = min(max(progress, 0), 1)
    guard origin.count == target.count else {
      return origin.map { $0.faded(by: 1 - fade) } + target.map { $0.faded(by: fade) }
    }
    return zip(origin, target).flatMap { from, to -> [GradientLayerState] in
      if from.isCompatible(with: to) {
        return [GradientLayerState.mix(from, to, progress)]
      }
      return [from.faded(by: 1 - fade), to.faded(by: fade)]
    }
  }
}
