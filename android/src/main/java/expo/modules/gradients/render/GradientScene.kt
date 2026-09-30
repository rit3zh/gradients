package expo.modules.gradients.render

import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.opengl.EGLSurface
import expo.modules.gradients.animation.GradientAnimator
import expo.modules.gradients.animation.GradientTiming
import expo.modules.gradients.diagnostics.GradientProfiler
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientRegistry
import expo.modules.gradients.render.gl.EglCore
import expo.modules.gradients.render.gl.ShaderLibrary
import expo.modules.gradients.sensors.MotionSource

class GradientScene(
    private val id: Int,
    private val library: ShaderLibrary,
    private val framePeriodNanos: Long
) {
    private val animator = GradientAnimator()
    private var renderer: GradientRenderer? = null
    private var surface: EGLSurface? = null
    private var texture: SurfaceTexture? = null
    private var target = RenderTarget(0f, 0f, 0, 0)
    private var options = RenderOptions()
    private var visible = false
    private var paused = false
    private var deviceMotion = false
    private var needsRender = true
    private var lastFrameNanos = 0L
    private var lastPresentedNanos = 0L
    private var pendingMask: Bitmap? = null
    private var maskChanged = false

    val wantsFrame: Boolean
        get() = surface != null && visible && target.isRenderable && (needsRender || (!paused && isContinuous))

    private val isContinuous: Boolean
        get() = animator.isAnimating || deviceMotion ||
            animator.presentation.any { GradientRegistry.program(it.kind).isAnimated(it) }

    fun updateLayers(
        layers: List<GradientLayerState>,
        keyframes: List<List<GradientLayerState>>,
        timing: GradientTiming?,
        loop: Boolean
    ) {
        animator.update(layers, keyframes, timing, loop)
        needsRender = true
    }

    fun updateOptions(options: RenderOptions, paused: Boolean, deviceMotion: Boolean) {
        this.options = options
        this.paused = paused
        this.deviceMotion = deviceMotion
        needsRender = true
    }

    fun updateVisibility(visible: Boolean) {
        this.visible = visible
        needsRender = true
    }

    fun updateTarget(target: RenderTarget) {
        if (this.target == target) return
        this.target = target
        needsRender = true
    }

    fun updateMask(bitmap: Bitmap?) {
        pendingMask?.takeIf { it !== bitmap }?.recycle()
        pendingMask = bitmap
        maskChanged = true
        needsRender = true
    }

    fun attach(texture: SurfaceTexture, egl: EglCore) {
        detach(egl)
        this.texture = texture
        surface = egl.createSurface(texture)
        needsRender = true
    }

    fun detach(egl: EglCore) {
        surface?.let(egl::releaseSurface)
        surface = null
        texture?.release()
        texture = null
    }

    fun idle() {
        lastFrameNanos = 0L
        lastPresentedNanos = 0L
    }

    fun frame(frameTimeNanos: Long, egl: EglCore) {
        val delta = if (lastFrameNanos == 0L) 0.0 else ((frameTimeNanos - lastFrameNanos) / 1e9).coerceIn(0.0, 0.1)
        lastFrameNanos = frameTimeNanos
        if (!paused) animator.step(delta)

        val surface = surface ?: return
        if (!egl.makeCurrent(surface)) return
        val renderer = renderer ?: GradientRenderer(library).also { renderer = it }

        if (maskChanged) {
            renderer.uploadMask(pendingMask)
            pendingMask?.recycle()
            pendingMask = null
            maskChanged = false
        }

        val frameOptions = if (deviceMotion) {
            options.copy(tiltX = MotionSource.tiltX, tiltY = MotionSource.tiltY)
        } else {
            options
        }
        if (renderer.render(animator.presentation, target, frameOptions)) {
            egl.swap(surface)
            needsRender = false
            if (GradientProfiler.isEnabled) {
                val interval = if (lastPresentedNanos == 0L) 0L else frameTimeNanos - lastPresentedNanos
                GradientProfiler.recordRender(id, interval, framePeriodNanos)
            }
            lastPresentedNanos = frameTimeNanos
        }
    }

    fun release(egl: EglCore) {
        egl.makeIdle()
        renderer?.release()
        renderer = null
        pendingMask?.recycle()
        pendingMask = null
        detach(egl)
    }
}
