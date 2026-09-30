package expo.modules.gradients.views.nativemesh

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.os.Build
import android.view.Choreographer
import expo.modules.gradients.enums.NativeMeshColorSpace
import expo.modules.gradients.render.mesh.MeshSurface
import expo.modules.gradients.render.mesh.MeshTessellator
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.roundToInt

@SuppressLint("ViewConstructor")
class NativeMeshGradientView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    var columns = 2
    var rows = 2
    var points: List<List<Double>> = emptyList()
    var colors: List<Int> = emptyList()
    var smoothsColors = true
    var background: Int? = null
    var colorSpace = NativeMeshColorSpace.DEVICE
    var animationDuration = 0.0
    var drift = 0.0
    var speed = 1.0
    var paused = false

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private var target: NativeMeshFrame? = null
    private var origin: NativeMeshFrame? = null
    private var elapsed = 0.0
    private var clock = 0.0

    private val frameCallback = Choreographer.FrameCallback { onFrame(it) }
    private var isTicking = false
    private var lastFrameNanos = 0L

    private var surface: MeshSurface? = null
    private var vertices = FloatArray(0)
    private var vertexColors = IntArray(0)
    private var indices = ShortArray(0)
    private var bufferWidth = 0
    private var bufferHeight = 0

    init {
        setWillNotDraw(false)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            setLayerType(LAYER_TYPE_SOFTWARE, null)
        }
    }

    fun commitProps() {
        val next = NativeMeshFrame.of(columns, rows, points, colors, smoothsColors, colorSpace)
        if (next != target) {
            val current = presented()
            origin = if (current != null && animationDuration > 0 && current.hasSameShape(next)) current else null
            elapsed = 0.0
            target = next
        }
        updateTicker()
        invalidate()
    }

    private val isDrifting: Boolean
        get() = drift > 0 && speed != 0.0

    private val needsFrames: Boolean
        get() = !paused && (origin != null || isDrifting)

    private fun progress(): Double {
        if (origin == null || animationDuration <= 0) return 1.0
        return (elapsed / (animationDuration / 1000.0)).coerceIn(0.0, 1.0)
    }

    private fun presented(): NativeMeshFrame? {
        val target = target ?: return null
        val origin = origin ?: return target
        return origin.lerp(target, NativeMeshFrame.eased(progress()).toFloat())
    }

    private fun onFrame(frameTimeNanos: Long) {
        isTicking = false
        val delta = if (lastFrameNanos == 0L) 0.0 else ((frameTimeNanos - lastFrameNanos) / 1_000_000_000.0).coerceIn(0.0, 0.1)
        lastFrameNanos = frameTimeNanos
        if (!paused) {
            if (origin != null) {
                elapsed += delta
                if (progress() >= 1.0) origin = null
            }
            if (isDrifting) clock += delta * speed
        }
        invalidate()
        updateTicker()
    }

    private fun updateTicker() {
        if (isAttachedToWindow && needsFrames) startTicker() else stopTicker()
    }

    private fun startTicker() {
        if (isTicking) return
        isTicking = true
        Choreographer.getInstance().postFrameCallback(frameCallback)
    }

    private fun stopTicker() {
        if (isTicking) {
            Choreographer.getInstance().removeFrameCallback(frameCallback)
            isTicking = false
        }
        lastFrameNanos = 0L
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        updateTicker()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopTicker()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        background?.let(canvas::drawColor)
        val frame = presented()?.drifted(drift, clock) ?: return
        if (width <= 0 || height <= 0) return

        val key = frame.key
        val current = surface
        val tessellated = if (current != null && current.key == key) current else MeshTessellator.surface(key)
        if (tessellated !== current || bufferWidth != width || bufferHeight != height) {
            prepareBuffers(tessellated)
        }

        canvas.drawVertices(
            Canvas.VertexMode.TRIANGLES,
            vertices.size,
            vertices,
            0,
            null,
            0,
            vertexColors,
            0,
            indices,
            0,
            indices.size,
            paint
        )
    }

    private fun prepareBuffers(tessellated: MeshSurface) {
        val count = tessellated.columns * tessellated.rows
        if (vertices.size != count * 2) {
            vertices = FloatArray(count * 2)
            vertexColors = IntArray(count * 2)
        }
        val stride = MeshSurface.FLOATS_PER_VERTEX
        for (index in 0 until count) {
            val offset = index * stride
            vertices[index * 2] = tessellated.vertices[offset] * width
            vertices[index * 2 + 1] = tessellated.vertices[offset + 1] * height
            vertexColors[index] = argb(
                tessellated.vertices[offset + 2],
                tessellated.vertices[offset + 3],
                tessellated.vertices[offset + 4],
                tessellated.vertices[offset + 5]
            )
        }
        if (surface == null || surface?.columns != tessellated.columns || surface?.rows != tessellated.rows) {
            indices = gridIndices(tessellated.columns, tessellated.rows)
        }
        surface = tessellated
        bufferWidth = width
        bufferHeight = height
    }

    private fun argb(red: Float, green: Float, blue: Float, alpha: Float): Int {
        val a = alpha.coerceIn(0f, 1f)
        if (a <= 0.0001f) return 0
        val r = (red / a).coerceIn(0f, 1f)
        val g = (green / a).coerceIn(0f, 1f)
        val b = (blue / a).coerceIn(0f, 1f)
        return ((a * 255f).roundToInt() shl 24) or
            ((r * 255f).roundToInt() shl 16) or
            ((g * 255f).roundToInt() shl 8) or
            (b * 255f).roundToInt()
    }

    private fun gridIndices(columns: Int, rows: Int): ShortArray {
        val result = ShortArray((columns - 1) * (rows - 1) * 6)
        var cursor = 0
        for (row in 0 until rows - 1) {
            for (column in 0 until columns - 1) {
                val topLeft = row * columns + column
                val bottomLeft = topLeft + columns
                result[cursor++] = topLeft.toShort()
                result[cursor++] = bottomLeft.toShort()
                result[cursor++] = (topLeft + 1).toShort()
                result[cursor++] = (topLeft + 1).toShort()
                result[cursor++] = bottomLeft.toShort()
                result[cursor++] = (bottomLeft + 1).toShort()
            }
        }
        return result
    }
}
