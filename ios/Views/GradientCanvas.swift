//
//  GradientCanvas.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import UIKit
import QuartzCore

final class GradientCanvas: UIView {
  override class var layerClass: AnyClass {
    CAMetalLayer.self
  }

  private let renderer = GradientRenderer()

  private var metalLayer: CAMetalLayer {
    layer as! CAMetalLayer
  }

  var isAnimating = false {
    didSet {
      guard isAnimating != oldValue else { return }
      metalLayer.maximumDrawableCount = isAnimating ? 3 : 2
    }
  }

  var renderScale: CGFloat = 2 {
    didSet {
      guard renderScale != oldValue else { return }
      metalLayer.contentsScale = renderScale
      updateDrawableSize()
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    isOpaque = false
    backgroundColor = .clear
    isUserInteractionEnabled = false
    metalLayer.device = MetalContext.shared.device
    metalLayer.pixelFormat = MetalContext.drawablePixelFormat
    metalLayer.framebufferOnly = true
    metalLayer.isOpaque = false
    metalLayer.colorspace = CGColorSpace(name: CGColorSpace.sRGB)
    metalLayer.contentsScale = renderScale
    metalLayer.maximumDrawableCount = 2
  }

  required init?(coder: NSCoder) {
    nil
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    updateDrawableSize()
  }

  @discardableResult
  func render(_ layers: [GradientLayerState], options: RenderOptions) -> RenderResult {
    guard window != nil, UIApplication.shared.applicationState != .background else { return .skipped }
    updateDrawableSize()
    return renderer.draw(layers, in: metalLayer, size: bounds.size, options: options)
  }

  private func updateDrawableSize() {
    let size = CGSize(
      width: max((bounds.width * renderScale).rounded(), 1),
      height: max((bounds.height * renderScale).rounded(), 1)
    )
    if metalLayer.drawableSize != size {
      metalLayer.drawableSize = size
    }
  }
}
