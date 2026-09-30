//
//  GradientView.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore
import UIKit

final class GradientView: ExpoView {
  private let canvas = GradientCanvas()
  private let contentView = UIView()
  private let animator = GradientAnimator()
  private lazy var driver = DisplayLinkDriver { [weak self] delta in
    self?.tick(delta)
  }

  private var needsSceneUpdate = false
  private var needsRedraw = false
  private var isSubscribedToMotion = false
  private var lastTilt = SIMD2<Float>(0, 0)
  private var sincePresent: TimeInterval = 0

  var layerRecords: [GradientLayerRecord] = [] {
    didSet { needsSceneUpdate = true }
  }

  var keyframeRecords: [[GradientLayerRecord]] = [] {
    didSet { needsSceneUpdate = true }
  }

  var transition: GradientTransitionRecord?
  var loop = true
  var paused = false
  var dither = true
  var grain: Double = 0
  var deviceMotion = false

  var blendMode: GradientBlendMode = .normal {
    didSet { layer.compositingFilter = blendMode.compositingFilter }
  }

  var maskMode: MaskMode = .none {
    didSet { updateMask() }
  }

  var border: GradientBorderRecord? {
    didSet { updateMask() }
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .clear
    contentView.backgroundColor = .clear
    addSubview(canvas)
    addSubview(contentView)
    MetalContext.shared.prepare { [weak self] in
      self?.render()
    }
  }

  deinit {
    driver.stop()
    if isSubscribedToMotion {
      MotionSource.shared.unsubscribe()
    }
  }

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    contentView.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    canvas.frame = bounds
    contentView.frame = bounds
    updateBorderPath()
    render()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    updateRenderScale()
    updateMotionSubscription()
    updateDriver()
    render()
  }

  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)
    guard traitCollection.hasDifferentColorAppearance(comparedTo: previousTraitCollection) else { return }
    animator.refresh(layers: makeStates(layerRecords), keyframes: keyframeRecords.map(makeStates))
    render()
  }

  func commitProps() {
    if needsSceneUpdate {
      needsSceneUpdate = false
      animator.update(
        layers: makeStates(layerRecords),
        keyframes: keyframeRecords.map(makeStates),
        timing: GradientTiming(record: transition),
        loop: loop
      )
    }
    updateRenderScale()
    updateMotionSubscription()
    updateDriver()
    render()
  }

  private func makeStates(_ records: [GradientLayerRecord]) -> [GradientLayerState] {
    records.map { GradientLayerState(record: $0, traits: traitCollection) }
  }

  private func tick(_ delta: TimeInterval) {
    if !paused {
      animator.step(delta)
    }
    sincePresent += delta
    if render() == .presented {
      if GradientProfiler.shared.isEnabled {
        GradientProfiler.shared.recordRender(of: ObjectIdentifier(self), interval: sincePresent)
      }
      sincePresent = 0
    }
    updateDriver()
  }

  private var needsContinuousRendering: Bool {
    if animator.isAnimating || deviceMotion {
      return true
    }
    return animator.presentation.contains { GradientRegistry.program(for: $0.kind).isAnimated($0) }
  }

  private func updateDriver() {
    canvas.isAnimating = !paused && needsContinuousRendering
    if window != nil && (needsRedraw || (!paused && needsContinuousRendering)) {
      driver.start()
    } else {
      driver.stop()
      sincePresent = 0
    }
  }

  private func updateMotionSubscription() {
    let shouldSubscribe = deviceMotion && window != nil
    guard shouldSubscribe != isSubscribedToMotion else { return }
    isSubscribedToMotion = shouldSubscribe
    if shouldSubscribe {
      MotionSource.shared.subscribe()
    } else {
      MotionSource.shared.unsubscribe()
    }
  }

  private func updateRenderScale() {
    let screenScale = window?.screen.scale ?? traitCollection.displayScale
    let layers = animator.presentation
    let resolutions = layers.map { GradientRegistry.program(for: $0.kind).resolution }
    let scale: CGFloat
    if !layers.isEmpty, resolutions.allSatisfy({ $0 != nil }) {
      scale = CGFloat(resolutions.compactMap { $0 }.max() ?? 1)
    } else {
      scale = screenScale
    }
    canvas.renderScale = min(max(scale, 1), max(screenScale, 1))
  }

  @discardableResult
  private func render() -> RenderResult {
    let tilt = deviceMotion ? MotionSource.shared.tilt : SIMD2<Float>(0, 0)
    let result = canvas.render(
      animator.presentation,
      options: RenderOptions(tilt: tilt, dither: dither, grain: Float(max(grain, 0)))
    )
    needsRedraw = result == .deferred
    if needsRedraw {
      driver.start()
    }
    return result
  }

  private func updateMask() {
    if maskMode == .content {
      guard canvas.mask !== contentView else { return }
      contentView.removeFromSuperview()
      canvas.layer.mask = nil
      contentView.frame = bounds
      canvas.mask = contentView
      return
    }

    if canvas.mask === contentView {
      canvas.mask = nil
    }
    if contentView.superview !== self {
      addSubview(contentView)
      contentView.frame = bounds
    }
    if border != nil {
      if !(canvas.layer.mask is CAShapeLayer) {
        let shape = CAShapeLayer()
        shape.fillRule = .evenOdd
        canvas.layer.mask = shape
      }
      updateBorderPath()
    } else {
      canvas.layer.mask = nil
    }
  }

  private func updateBorderPath() {
    guard maskMode == .none, let border, let shape = canvas.layer.mask as? CAShapeLayer else { return }
    let width = max(CGFloat(border.width), 0)
    let radius = max(CGFloat(border.radius), 0)
    let outer = bounds
    let inner = outer.insetBy(dx: width, dy: width)
    let path = UIBezierPath(roundedRect: outer, cornerRadius: min(radius, min(outer.width, outer.height) / 2))
    if inner.width > 0 && inner.height > 0 {
      let innerRadius = min(max(radius - width, 0), min(inner.width, inner.height) / 2)
      path.append(UIBezierPath(roundedRect: inner, cornerRadius: innerRadius))
    }
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    shape.frame = canvas.bounds
    shape.path = path.cgPath
    CATransaction.commit()
  }
}
