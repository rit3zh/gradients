package expo.modules.gradients.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.SurfaceTexture
import android.view.TextureView
import android.view.View
import expo.modules.gradients.animation.GradientTiming
import expo.modules.gradients.enums.GradientBlendMode
import expo.modules.gradients.enums.MaskMode
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientRegistry
import expo.modules.gradients.records.GradientBorderRecord
import expo.modules.gradients.records.GradientLayerRecord
import expo.modules.gradients.records.GradientTransitionRecord
import expo.modules.gradients.render.GradientEngine
import expo.modules.gradients.render.RenderOptions
import expo.modules.gradients.render.RenderTarget
import expo.modules.gradients.sensors.MotionSource
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.max
import kotlin.math.roundToInt

@SuppressLint("ViewConstructor")
class GradientView(context: Context, appContext: AppContext) :
    ExpoView(context, appContext),
    TextureView.SurfaceTextureListener {

    private val engine = GradientEngine.obtain(context)
    private val sceneId = engine.createScene()
    private val density = resources.displayMetrics.density
    private val canvasView = TextureView(context)
    val content = ContentLayout(context, ::onContentChanged)

    private var layerRecords: List<GradientLayerRecord> = emptyList()
    private var keyframeRecords: List<List<GradientLayerRecord>> = emptyList()
    private var needsLayersUpdate = false
    private var maskDirty = true
    private var isVisibleToUser = false
    private var isSubscribedToMotion = false
    private var lastTarget: RenderTarget? = null

    var transition: GradientTransitionRecord? = null
    var loop = true
    var paused = false
    var dither = true
    var grain = 0.0
    var deviceMotion = false
    var blendMode = GradientBlendMode.NORMAL
    var maskMode = MaskMode.NONE
    var border: GradientBorderRecord? = null

    init {
        canvasView.isOpaque = false
        canvasView.surfaceTextureListener = this
        addView(canvasView)
        addView(content)
    }

    fun setLayers(layers: List<GradientLayerRecord>) {
        layerRecords = layers
        needsLayersUpdate = true
    }

    fun setKeyframes(keyframes: List<List<GradientLayerRecord>>) {
        keyframeRecords = keyframes
        needsLayersUpdate = true
    }

    fun commitProps() {
        if (needsLayersUpdate) {
            needsLayersUpdate = false
            val layers = layerRecords
            val keyframes = keyframeRecords
            val timing = GradientTiming.from(transition)
            val loop = loop
            engine.update(sceneId) {
                updateLayers(
                    layers.map(GradientLayerState::from),
                    keyframes.map { frame -> frame.map(GradientLayerState::from) },
                    timing,
                    loop
                )
            }
        }

        val options = RenderOptions(
            dither = dither,
            grain = max(grain, 0.0).toFloat(),
            maskMode = when {
                maskMode == MaskMode.CONTENT -> RenderOptions.MASK_CONTENT
                border != null -> RenderOptions.MASK_BORDER
                else -> RenderOptions.MASK_NONE
            },
            borderWidth = border?.width?.toFloat() ?: 0f,
            borderRadius = border?.radius?.toFloat() ?: 0f
        )
        val paused = paused
        val deviceMotion = deviceMotion
        engine.update(sceneId) { updateOptions(options, paused, deviceMotion) }

        if (maskMode != MaskMode.CONTENT) {
            engine.update(sceneId) { updateMask(null) }
        } else {
            maskDirty = true
        }

        canvasView.setLayerPaint(BlendModes.paint(blendMode))
        updateMotionSubscription()
        updateTarget()
        invalidate()
    }

    fun destroy() {
        engine.releaseScene(sceneId)
        if (isSubscribedToMotion) {
            isSubscribedToMotion = false
            MotionSource.unsubscribe()
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        val exactWidth = MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY)
        val exactHeight = MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        canvasView.measure(exactWidth, exactHeight)
        content.measure(exactWidth, exactHeight)
        setMeasuredDimension(width, height)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        val width = right - left
        val height = bottom - top
        canvasView.layout(0, 0, width, height)
        content.layout(0, 0, width, height)
        if (changed) {
            maskDirty = true
            updateTarget()
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        updateVisibility()
        updateMotionSubscription()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        updateVisibility()
        updateMotionSubscription()
    }

    override fun onWindowVisibilityChanged(visibility: Int) {
        super.onWindowVisibilityChanged(visibility)
        updateVisibility()
    }

    override fun onVisibilityChanged(changedView: View, visibility: Int) {
        super.onVisibilityChanged(changedView, visibility)
        updateVisibility()
    }

    override fun drawChild(canvas: Canvas, child: View, drawingTime: Long): Boolean {
        if (child === content && maskMode == MaskMode.CONTENT) return false
        return super.drawChild(canvas, child, drawingTime)
    }

    override fun dispatchDraw(canvas: Canvas) {
        if (maskMode == MaskMode.CONTENT && maskDirty) {
            maskDirty = false
            val bitmap = MaskCapture.capture(content, width, height)
            if (bitmap != null) {
                engine.update(sceneId) { updateMask(bitmap) }
            }
        }
        super.dispatchDraw(canvas)
    }

    override fun onSurfaceTextureAvailable(texture: SurfaceTexture, width: Int, height: Int) {
        lastTarget = null
        updateTarget()
        engine.update(sceneId) { egl -> attach(texture, egl) }
    }

    override fun onSurfaceTextureSizeChanged(texture: SurfaceTexture, width: Int, height: Int) {
        lastTarget = null
        updateTarget()
    }

    override fun onSurfaceTextureDestroyed(texture: SurfaceTexture): Boolean {
        engine.update(sceneId) { egl -> detach(egl) }
        return false
    }

    override fun onSurfaceTextureUpdated(texture: SurfaceTexture) = Unit

    private fun onContentChanged() {
        if (maskMode != MaskMode.CONTENT) return
        maskDirty = true
        invalidate()
    }

    private fun updateTarget() {
        val texture = canvasView.surfaceTexture ?: return
        if (width <= 0 || height <= 0) return
        val widthPoints = width / density
        val heightPoints = height / density
        val scale = renderScale()
        val target = RenderTarget(
            widthPoints,
            heightPoints,
            max((widthPoints * scale).roundToInt(), 1),
            max((heightPoints * scale).roundToInt(), 1)
        )
        if (target == lastTarget) return
        lastTarget = target
        texture.setDefaultBufferSize(target.bufferWidth, target.bufferHeight)
        engine.update(sceneId) { updateTarget(target) }
    }

    private fun renderScale(): Float {
        val resolutions = layerRecords.map { GradientRegistry.program(it.type).resolution }
        val preferred = if (resolutions.isNotEmpty() && resolutions.all { it != null }) {
            resolutions.maxOf { it ?: 1.0 }.toFloat()
        } else {
            density
        }
        return preferred.coerceIn(1f, max(density, 1f))
    }

    private fun updateVisibility() {
        val visible = isAttachedToWindow && windowVisibility == View.VISIBLE && isShown
        if (visible == isVisibleToUser) return
        isVisibleToUser = visible
        engine.update(sceneId) { updateVisibility(visible) }
    }

    private fun updateMotionSubscription() {
        val shouldSubscribe = deviceMotion && isAttachedToWindow
        if (shouldSubscribe == isSubscribedToMotion) return
        isSubscribedToMotion = shouldSubscribe
        if (shouldSubscribe) {
            MotionSource.subscribe(context)
        } else {
            MotionSource.unsubscribe()
        }
    }
}
