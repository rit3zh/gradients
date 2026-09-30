package expo.modules.gradients

import android.view.View
import expo.modules.gradients.diagnostics.GradientProfiler
import expo.modules.gradients.enums.GradientBlendMode
import expo.modules.gradients.enums.MaskMode
import expo.modules.gradients.enums.NativeMeshColorSpace
import expo.modules.gradients.records.GradientBorderRecord
import expo.modules.gradients.records.GradientLayerRecord
import expo.modules.gradients.records.GradientTransitionRecord
import expo.modules.gradients.render.GradientEngine
import expo.modules.gradients.views.GradientView
import expo.modules.gradients.views.nativemesh.NativeMeshGradientView
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoGradientsModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoGradients")

        OnCreate {
            appContext.reactContext?.let { GradientEngine.obtain(it) }
        }

        Function("startProfiling") {
            GradientProfiler.start()
        }

        Function("stopProfiling") {
            GradientProfiler.stop()
        }

        View(GradientView::class) {
            Prop("layers") { view: GradientView, layers: List<GradientLayerRecord> ->
                view.setLayers(layers)
            }

            Prop("keyframes") { view: GradientView, keyframes: List<List<GradientLayerRecord>>? ->
                view.setKeyframes(keyframes ?: emptyList())
            }

            Prop("transition") { view: GradientView, transition: GradientTransitionRecord? ->
                view.transition = transition
            }

            Prop("loop", true) { view: GradientView, loop: Boolean ->
                view.loop = loop
            }

            Prop("paused", false) { view: GradientView, paused: Boolean ->
                view.paused = paused
            }

            Prop("dither", true) { view: GradientView, dither: Boolean ->
                view.dither = dither
            }

            Prop("grain", 0.0) { view: GradientView, grain: Double ->
                view.grain = grain
            }

            Prop("deviceMotion", false) { view: GradientView, deviceMotion: Boolean ->
                view.deviceMotion = deviceMotion
            }

            Prop("blendMode", GradientBlendMode.NORMAL) { view: GradientView, blendMode: GradientBlendMode ->
                view.blendMode = blendMode
            }

            Prop("maskMode", MaskMode.NONE) { view: GradientView, maskMode: MaskMode ->
                view.maskMode = maskMode
            }

            Prop("border") { view: GradientView, border: GradientBorderRecord? ->
                view.border = border
            }

            OnViewDidUpdateProps { view: GradientView ->
                view.commitProps()
            }

            OnViewDestroys { view: GradientView ->
                view.destroy()
            }

            GroupView<GradientView> {
                AddChildView { parent, child: View, index ->
                    parent.content.addView(child, index)
                }

                GetChildCount { parent ->
                    parent.content.childCount
                }

                GetChildViewAt { parent, index ->
                    parent.content.getChildAt(index)
                }

                RemoveChildView { parent, child: View ->
                    parent.content.removeView(child)
                }

                RemoveChildViewAt { parent, index ->
                    parent.content.removeViewAt(index)
                }
            }
        }

        View(NativeMeshGradientView::class) {
            Prop("columns", 2) { view: NativeMeshGradientView, columns: Int ->
                view.columns = columns
            }

            Prop("rows", 2) { view: NativeMeshGradientView, rows: Int ->
                view.rows = rows
            }

            Prop("points") { view: NativeMeshGradientView, points: List<List<Double>>? ->
                view.points = points ?: emptyList()
            }

            Prop("colors") { view: NativeMeshGradientView, colors: List<Int> ->
                view.colors = colors
            }

            Prop("smoothsColors", true) { view: NativeMeshGradientView, smoothsColors: Boolean ->
                view.smoothsColors = smoothsColors
            }

            Prop("background") { view: NativeMeshGradientView, background: Int? ->
                view.background = background
            }

            Prop("colorSpace", NativeMeshColorSpace.DEVICE) { view: NativeMeshGradientView, colorSpace: NativeMeshColorSpace ->
                view.colorSpace = colorSpace
            }

            Prop("animationDuration", 0.0) { view: NativeMeshGradientView, animationDuration: Double ->
                view.animationDuration = animationDuration
            }

            Prop("drift", 0.0) { view: NativeMeshGradientView, drift: Double ->
                view.drift = drift
            }

            Prop("speed", 1.0) { view: NativeMeshGradientView, speed: Double ->
                view.speed = speed
            }

            Prop("paused", false) { view: NativeMeshGradientView, paused: Boolean ->
                view.paused = paused
            }

            OnViewDidUpdateProps { view: NativeMeshGradientView ->
                view.commitProps()
            }
        }
    }
}
