//
//  ExpoGradientsModule.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

public class ExpoGradientsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoGradients")

    OnCreate {
      DispatchQueue.main.async {
        MetalContext.shared.prepare()
      }
    }

    Function("startProfiling") {
      GradientProfiler.shared.start()
    }

    Function("stopProfiling") { () -> [String: Any] in
      GradientProfiler.shared.stop()
    }

    View(GradientView.self) {
      Prop("layers") { (view: GradientView, layers: [GradientLayerRecord]) in
        view.layerRecords = layers
      }

      Prop("keyframes") { (view: GradientView, keyframes: [[GradientLayerRecord]]?) in
        view.keyframeRecords = keyframes ?? []
      }

      Prop("transition") { (view: GradientView, transition: GradientTransitionRecord?) in
        view.transition = transition
      }

      Prop("loop", true) { (view: GradientView, loop: Bool) in
        view.loop = loop
      }

      Prop("paused", false) { (view: GradientView, paused: Bool) in
        view.paused = paused
      }

      Prop("dither", true) { (view: GradientView, dither: Bool) in
        view.dither = dither
      }

      Prop("grain", 0.0) { (view: GradientView, grain: Double) in
        view.grain = grain
      }

      Prop("deviceMotion", false) { (view: GradientView, deviceMotion: Bool) in
        view.deviceMotion = deviceMotion
      }

      Prop("blendMode", GradientBlendMode.normal) { (view: GradientView, blendMode: GradientBlendMode) in
        view.blendMode = blendMode
      }

      Prop("maskMode", MaskMode.none) { (view: GradientView, maskMode: MaskMode) in
        view.maskMode = maskMode
      }

      Prop("border") { (view: GradientView, border: GradientBorderRecord?) in
        view.border = border
      }

      OnViewDidUpdateProps { (view: GradientView) in
        view.commitProps()
      }
    }

    View(NativeMeshGradientView.self) {
      Prop("columns", 2) { (view: NativeMeshGradientView, columns: Int) in
        view.columns = columns
      }

      Prop("rows", 2) { (view: NativeMeshGradientView, rows: Int) in
        view.rows = rows
      }

      Prop("points") { (view: NativeMeshGradientView, points: [[Double]]?) in
        view.points = points ?? []
      }

      Prop("colors") { (view: NativeMeshGradientView, colors: [UIColor]) in
        view.colors = colors
      }

      Prop("smoothsColors", true) { (view: NativeMeshGradientView, smoothsColors: Bool) in
        view.smoothsColors = smoothsColors
      }

      Prop("background") { (view: NativeMeshGradientView, background: UIColor?) in
        view.background = background
      }

      Prop("colorSpace", NativeMeshColorSpace.device) { (view: NativeMeshGradientView, colorSpace: NativeMeshColorSpace) in
        view.colorSpace = colorSpace
      }

      Prop("animationDuration", 0.0) { (view: NativeMeshGradientView, animationDuration: Double) in
        view.animationDuration = animationDuration
      }

      Prop("drift", 0.0) { (view: NativeMeshGradientView, drift: Double) in
        view.drift = drift
      }

      Prop("speed", 1.0) { (view: NativeMeshGradientView, speed: Double) in
        view.speed = speed
      }

      Prop("paused", false) { (view: NativeMeshGradientView, paused: Bool) in
        view.paused = paused
      }

      OnViewDidUpdateProps { (view: NativeMeshGradientView) in
        view.commitProps()
      }
    }
  }
}
