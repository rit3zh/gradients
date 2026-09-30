//
//  NativeMeshGradientView.swift
//  Pods
//
//  Created by rit3zh CX on 9/28/26.
//

import ExpoModulesCore
import SwiftUI
import UIKit

final class NativeMeshGradientView: ExpoView {
  private let model = NativeMeshModel()
  private var host: UIViewController?
  private var fallback: GradientCanvas?
  private var fallbackLayers: [GradientLayerState] = []
  private lazy var driver = DisplayLinkDriver { [weak self] delta in
    self?.tick(delta)
  }

  private var target: NativeMeshConfiguration?
  private var origin: NativeMeshConfiguration?
  private var elapsed: TimeInterval = 0
  private var clock: Double = 0

  var columns = 2
  var rows = 2
  var points: [[Double]] = []
  var colors: [UIColor] = []
  var smoothsColors = true
  var background: UIColor?
  var colorSpace: NativeMeshColorSpace = .device
  var animationDuration: Double = 0
  var drift: Double = 0
  var speed: Double = 1
  var paused = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .clear
    clipsToBounds = true

    if #available(iOS 18.0, *) {
      let controller = UIHostingController(rootView: NativeMeshContent(model: model))
      controller.safeAreaRegions = []
      controller.view.backgroundColor = .clear
      controller.view.isUserInteractionEnabled = false
      addSubview(controller.view)
      host = controller
    } else {
      let canvas = GradientCanvas()
      canvas.renderScale = 1
      addSubview(canvas)
      fallback = canvas
      MetalContext.shared.prepare { [weak self] in
        self?.renderFallback()
      }
    }
  }

  deinit {
    driver.stop()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    host?.view.frame = bounds
    fallback?.frame = bounds
    renderFallback()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    updateDriver()
    renderFallback()
  }

  func commitProps() {
    let next = NativeMeshConfiguration(
      columns: columns,
      rows: rows,
      points: points,
      colors: colors,
      smoothsColors: smoothsColors,
      background: background,
      colorSpace: colorSpace
    )

    if next != target {
      if let current = presented, animationDuration > 0, next.hasSameShape(as: current) {
        origin = current
      } else {
        origin = nil
      }
      elapsed = 0
      target = next
    }

    present()
    updateDriver()
  }

  private var isDrifting: Bool {
    drift > 0 && speed != 0
  }

  private var needsFrames: Bool {
    !paused && (origin != nil || isDrifting)
  }

  private var progress: Double {
    guard origin != nil, animationDuration > 0 else { return 1 }
    return min(elapsed / (animationDuration / 1000), 1)
  }

  private var presented: NativeMeshConfiguration? {
    guard let target else { return nil }
    guard let origin else { return target }
    return origin.interpolated(to: target, progress: NativeMeshConfiguration.eased(progress))
  }

  private func tick(_ delta: TimeInterval) {
    if !paused {
      if origin != nil {
        elapsed += delta
        if progress >= 1 {
          origin = nil
        }
      }
      if isDrifting {
        clock += delta * speed
      }
    }
    present()
    updateDriver()
  }

  private func updateDriver() {
    if window != nil && needsFrames {
      driver.start()
    } else {
      driver.stop()
    }
  }

  private func present() {
    guard let configuration = presented?.drifted(amount: drift, clock: clock) else { return }

    guard host != nil else {
      backgroundColor = configuration.background
      fallbackLayers = [Self.fallbackLayer(for: configuration, traits: traitCollection)]
      renderFallback()
      return
    }

    if configuration != model.configuration {
      model.configuration = configuration
    }
  }

  private func renderFallback() {
    guard let fallback, !fallbackLayers.isEmpty else { return }
    if case .deferred = fallback.render(fallbackLayers, options: RenderOptions()) {
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0 / 60.0) { [weak self] in
        self?.renderFallback()
      }
    }
  }

  private static func fallbackLayer(
    for configuration: NativeMeshConfiguration,
    traits: UITraitCollection
  ) -> GradientLayerState {
    var record = GradientLayerRecord()
    record.type = .mesh
    record.columns = configuration.columns
    record.rows = configuration.rows
    record.points = configuration.points.map { CGPoint(x: CGFloat($0.x), y: CGFloat($0.y)) }
    record.colors = configuration.colors
    record.smoothness = configuration.smoothsColors ? 1 : 0
    record.interpolation = configuration.colorSpace == .perceptual ? .oklab : .srgb
    return GradientLayerState(record: record, traits: traits)
  }
}
