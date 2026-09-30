package expo.modules.gradients.render

import android.graphics.Bitmap
import android.opengl.GLES30
import android.opengl.GLUtils
import expo.modules.gradients.diagnostics.GradientProfiler
import expo.modules.gradients.diagnostics.MemoryFootprint
import expo.modules.gradients.enums.GradientTileMode
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientRegistry
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.FrameData
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.gl.CompositeVariant
import expo.modules.gradients.render.gl.GlProgram
import expo.modules.gradients.render.gl.GpuTimer
import expo.modules.gradients.render.gl.ShaderLibrary
import expo.modules.gradients.render.mesh.MeshSurface
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import kotlin.math.ceil

class GradientRenderer(private val library: ShaderLibrary) : MemoryFootprint {
    private val frame = FrameData()
    private val layers = Array(MAX_LAYERS) { LayerUniforms() }
    private var upload: FloatBuffer = floatBuffer(DATA_WIDTH * 4 * 16)

    private var dataTexture = 0
    private var dataRows = 0

    private val surfaceTextures = IntArray(LayerContext.MAX_SURFACES)
    private val surfaceFramebuffers = IntArray(LayerContext.MAX_SURFACES)
    private val surfaceWidths = IntArray(LayerContext.MAX_SURFACES)
    private val surfaceHeights = IntArray(LayerContext.MAX_SURFACES)
    private val renderedSurfaces = arrayOfNulls<MeshSurface>(LayerContext.MAX_SURFACES)
    private val indexBuffers = HashMap<Long, IntArray>()
    private var meshVao = 0
    private var meshVbo = 0
    private var meshUpload: FloatBuffer = floatBuffer(1024)

    private var compositeVao = 0
    private var maskTexture = 0
    private var hasMask = false
    private var maskBytes = 0L
    private var windowBytes = 0L
    private var gpuTimer: GpuTimer? = null

    init {
        GradientProfiler.register(this)
    }

    override val estimatedMemory: Long
        get() {
            var total = DATA_WIDTH.toLong() * dataRows * 16 + maskBytes + windowBytes
            for (index in surfaceTextures.indices) {
                if (surfaceTextures[index] != 0) {
                    total += surfaceWidths[index].toLong() * surfaceHeights[index] * 4
                }
            }
            return total
        }

    fun render(states: List<GradientLayerState>, target: RenderTarget, options: RenderOptions): Boolean {
        frame.reset(MAX_LAYERS * LayerUniforms.TEXELS)
        val context = LayerContext(
            target.width,
            target.height,
            options.tiltX,
            options.tiltY,
            frame,
            renderedSurfaces
        )

        var count = 0
        for (state in states) {
            if (state.opacity <= 0.001) continue
            if (count >= MAX_LAYERS) break
            val uniforms = layers[count]
            uniforms.reset()
            encode(state, uniforms, context)
            count += 1
        }
        for (index in 0 until count) {
            layers[index].writeTo(frame.floats, index * LayerUniforms.TEXELS * 4)
        }

        val program = library.composite(CompositeVariant.of(layers, count)) ?: return false
        val timer = if (GradientProfiler.isEnabled) timer() else null
        timer?.collect(GradientProfiler::recordGpu)
        timer?.begin()
        drawSurfaces(context, target)
        uploadData()
        composite(program, count, target, options)
        timer?.end()
        windowBytes = target.bufferWidth.toLong() * target.bufferHeight * 4 * WINDOW_BUFFERS
        return true
    }

    fun uploadMask(bitmap: Bitmap?) {
        if (bitmap == null) {
            hasMask = false
            maskBytes = 0
            return
        }
        if (maskTexture == 0) {
            maskTexture = createTexture(GLES30.GL_LINEAR)
        }
        GLES30.glActiveTexture(GLES30.GL_TEXTURE0 + MASK_UNIT)
        GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, maskTexture)
        GLES30.glPixelStorei(GLES30.GL_UNPACK_ALIGNMENT, 1)
        GLUtils.texImage2D(GLES30.GL_TEXTURE_2D, 0, bitmap, 0)
        maskBytes = bitmap.width.toLong() * bitmap.height
        GLES30.glPixelStorei(GLES30.GL_UNPACK_ALIGNMENT, 4)
        hasMask = true
    }

    fun release() {
        if (dataTexture != 0) GLES30.glDeleteTextures(1, intArrayOf(dataTexture), 0)
        if (maskTexture != 0) GLES30.glDeleteTextures(1, intArrayOf(maskTexture), 0)
        GLES30.glDeleteTextures(surfaceTextures.size, surfaceTextures, 0)
        GLES30.glDeleteFramebuffers(surfaceFramebuffers.size, surfaceFramebuffers, 0)
        indexBuffers.values.forEach { GLES30.glDeleteBuffers(1, it, 0) }
        if (meshVbo != 0) GLES30.glDeleteBuffers(1, intArrayOf(meshVbo), 0)
        if (meshVao != 0) GLES30.glDeleteVertexArrays(1, intArrayOf(meshVao), 0)
        if (compositeVao != 0) GLES30.glDeleteVertexArrays(1, intArrayOf(compositeVao), 0)
        gpuTimer?.release()
        gpuTimer = null
        indexBuffers.clear()
        renderedSurfaces.fill(null)
        surfaceTextures.fill(0)
        surfaceFramebuffers.fill(0)
        dataTexture = 0
        maskTexture = 0
        meshVbo = 0
        meshVao = 0
        compositeVao = 0
        hasMask = false
        maskBytes = 0
        windowBytes = 0
        dataRows = 0
    }

    private fun timer(): GpuTimer? {
        val timer = gpuTimer ?: GpuTimer().also { gpuTimer = it }
        GradientProfiler.gpuTimingSupported = timer.isSupported
        return timer.takeIf { it.isSupported }
    }

    private fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val tile = if (parameters.flow != 0.0 && state.tileMode == GradientTileMode.CLAMP) {
            GradientTileMode.MIRROR
        } else {
            state.tileMode
        }

        uniforms.kind = state.kind.ordinal
        uniforms.blend = state.blendMode.ordinal
        uniforms.tile = tile.ordinal
        uniforms.space = state.interpolation.ordinal
        uniforms.opacity = parameters.opacity.coerceIn(0.0, 1.0).toFloat()
        uniforms.time = (state.clock % 3600).toFloat()
        uniforms.rangeStart = state.ramp.rangeStart
        uniforms.rangeEnd = state.ramp.rangeEnd
        uniforms.ramp = context.appendRamp(state.ramp)

        if (parameters.flow != 0.0) {
            val span = (state.ramp.rangeEnd - state.ramp.rangeStart).toDouble()
            val period = maxOf(span * (if (tile == GradientTileMode.MIRROR) 2 else 1), 0.0001)
            uniforms.phase = ((-parameters.flow * state.clock * span) % period).toFloat()
        }

        GradientRegistry.program(state.kind).encode(state, uniforms, context)
    }

    private fun drawSurfaces(context: LayerContext, target: RenderTarget) {
        if (context.surfaces.isEmpty()) return
        val program = library.mesh() ?: return
        val width = ceil(target.width).toInt().coerceIn(1, MAX_SURFACE_SIZE)
        val height = ceil(target.height).toInt().coerceIn(1, MAX_SURFACE_SIZE)

        for ((index, surface) in context.surfaces.withIndex()) {
            val isCurrent = renderedSurfaces[index]?.key == surface.key &&
                surfaceWidths[index] == width &&
                surfaceHeights[index] == height
            if (isCurrent) continue

            renderedSurfaces[index] = null
            val indices = indexBuffer(surface.columns, surface.rows) ?: continue
            prepareSurface(index, width, height)

            GLES30.glBindFramebuffer(GLES30.GL_FRAMEBUFFER, surfaceFramebuffers[index])
            GLES30.glViewport(0, 0, width, height)
            GLES30.glClearColor(0f, 0f, 0f, 0f)
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            program.use()
            bindMeshVertices(surface.vertices)
            GLES30.glBindBuffer(GLES30.GL_ELEMENT_ARRAY_BUFFER, indices[0])
            GLES30.glDrawElements(GLES30.GL_TRIANGLES, indices[1], GLES30.GL_UNSIGNED_INT, 0)
            GLES30.glBindVertexArray(0)
            renderedSurfaces[index] = surface
        }
        GLES30.glBindFramebuffer(GLES30.GL_FRAMEBUFFER, 0)
    }

    private fun prepareSurface(index: Int, width: Int, height: Int) {
        if (surfaceTextures[index] != 0 && surfaceWidths[index] == width && surfaceHeights[index] == height) return
        if (surfaceTextures[index] == 0) {
            surfaceTextures[index] = createTexture(GLES30.GL_LINEAR)
            val framebuffer = IntArray(1)
            GLES30.glGenFramebuffers(1, framebuffer, 0)
            surfaceFramebuffers[index] = framebuffer[0]
        }
        GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, surfaceTextures[index])
        GLES30.glTexImage2D(
            GLES30.GL_TEXTURE_2D, 0, GLES30.GL_RGBA8, width, height, 0,
            GLES30.GL_RGBA, GLES30.GL_UNSIGNED_BYTE, null
        )
        GLES30.glBindFramebuffer(GLES30.GL_FRAMEBUFFER, surfaceFramebuffers[index])
        GLES30.glFramebufferTexture2D(
            GLES30.GL_FRAMEBUFFER, GLES30.GL_COLOR_ATTACHMENT0,
            GLES30.GL_TEXTURE_2D, surfaceTextures[index], 0
        )
        surfaceWidths[index] = width
        surfaceHeights[index] = height
    }

    private fun bindMeshVertices(vertices: FloatArray) {
        if (meshVao == 0) {
            val handles = IntArray(1)
            GLES30.glGenVertexArrays(1, handles, 0)
            meshVao = handles[0]
            GLES30.glGenBuffers(1, handles, 0)
            meshVbo = handles[0]
            GLES30.glBindVertexArray(meshVao)
            GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, meshVbo)
            val stride = MeshSurface.FLOATS_PER_VERTEX * 4
            GLES30.glEnableVertexAttribArray(0)
            GLES30.glVertexAttribPointer(0, 2, GLES30.GL_FLOAT, false, stride, 0)
            GLES30.glEnableVertexAttribArray(1)
            GLES30.glVertexAttribPointer(1, 4, GLES30.GL_FLOAT, false, stride, 8)
        }
        if (meshUpload.capacity() < vertices.size) {
            meshUpload = floatBuffer(vertices.size)
        }
        meshUpload.clear()
        meshUpload.put(vertices)
        meshUpload.flip()
        GLES30.glBindVertexArray(meshVao)
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, meshVbo)
        GLES30.glBufferData(GLES30.GL_ARRAY_BUFFER, vertices.size * 4, meshUpload, GLES30.GL_DYNAMIC_DRAW)
    }

    private fun indexBuffer(columns: Int, rows: Int): IntArray? {
        if (columns < 2 || rows < 2) return null
        val key = (columns.toLong() shl 32) or rows.toLong()
        indexBuffers[key]?.let { return it }

        val indices = IntArray((columns - 1) * (rows - 1) * 6)
        var cursor = 0
        for (row in 0 until rows - 1) {
            for (column in 0 until columns - 1) {
                val topLeft = row * columns + column
                val bottomLeft = topLeft + columns
                indices[cursor++] = topLeft
                indices[cursor++] = bottomLeft
                indices[cursor++] = topLeft + 1
                indices[cursor++] = topLeft + 1
                indices[cursor++] = bottomLeft
                indices[cursor++] = bottomLeft + 1
            }
        }

        val buffer = ByteBuffer.allocateDirect(indices.size * 4).order(ByteOrder.nativeOrder()).asIntBuffer()
        buffer.put(indices).flip()
        val handle = IntArray(1)
        GLES30.glGenBuffers(1, handle, 0)
        GLES30.glBindBuffer(GLES30.GL_ELEMENT_ARRAY_BUFFER, handle[0])
        GLES30.glBufferData(GLES30.GL_ELEMENT_ARRAY_BUFFER, indices.size * 4, buffer, GLES30.GL_STATIC_DRAW)
        val entry = intArrayOf(handle[0], indices.size)
        indexBuffers[key] = entry
        return entry
    }

    private fun uploadData() {
        val rows = (frame.texelCount + DATA_WIDTH - 1) / DATA_WIDTH
        val floats = rows * DATA_WIDTH * 4
        frame.ensureCapacity(rows * DATA_WIDTH)
        if (upload.capacity() < floats) {
            upload = floatBuffer(floats * 2)
        }
        upload.clear()
        upload.put(frame.floats, 0, floats)
        upload.flip()

        if (dataTexture == 0) {
            dataTexture = createTexture(GLES30.GL_NEAREST)
        }
        GLES30.glActiveTexture(GLES30.GL_TEXTURE0 + DATA_UNIT)
        GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, dataTexture)
        if (rows > dataRows) {
            dataRows = maxOf(rows, dataRows * 2)
            GLES30.glTexImage2D(
                GLES30.GL_TEXTURE_2D, 0, GLES30.GL_RGBA32F, DATA_WIDTH, dataRows, 0,
                GLES30.GL_RGBA, GLES30.GL_FLOAT, null
            )
        }
        GLES30.glTexSubImage2D(
            GLES30.GL_TEXTURE_2D, 0, 0, 0, DATA_WIDTH, rows,
            GLES30.GL_RGBA, GLES30.GL_FLOAT, upload
        )
    }

    private fun composite(program: GlProgram, count: Int, target: RenderTarget, options: RenderOptions) {
        if (compositeVao == 0) {
            val handle = IntArray(1)
            GLES30.glGenVertexArrays(1, handle, 0)
            compositeVao = handle[0]
        }

        GLES30.glBindFramebuffer(GLES30.GL_FRAMEBUFFER, 0)
        GLES30.glViewport(0, 0, target.bufferWidth, target.bufferHeight)
        GLES30.glDisable(GLES30.GL_BLEND)
        GLES30.glClearColor(0f, 0f, 0f, 0f)
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)

        program.use()
        GLES30.glUniform2f(program.uniform("uSize"), target.width, target.height)
        GLES30.glUniform2f(program.uniform("uTilt"), options.tiltX, options.tiltY)
        GLES30.glUniform1f(program.uniform("uScale"), target.bufferWidth / target.width)
        GLES30.glUniform1f(program.uniform("uDither"), if (options.dither) 1f else 0f)
        GLES30.glUniform1f(program.uniform("uGrain"), options.grain)
        GLES30.glUniform1i(program.uniform("uLayerCount"), count)
        val maskMode = if (options.maskMode == RenderOptions.MASK_CONTENT && !hasMask) {
            RenderOptions.MASK_NONE
        } else {
            options.maskMode
        }
        GLES30.glUniform1i(program.uniform("uMaskMode"), maskMode)
        GLES30.glUniform2f(program.uniform("uBorder"), options.borderWidth, options.borderRadius)

        bindSampler(program, "uData", DATA_UNIT, dataTexture)
        for (index in 0 until LayerContext.MAX_SURFACES) {
            bindSampler(program, "uSurface$index", SURFACE_UNIT + index, surfaceTextures[index])
        }
        bindSampler(program, "uMask", MASK_UNIT, if (hasMask) maskTexture else 0)

        GLES30.glBindVertexArray(compositeVao)
        GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, 3)
        GLES30.glBindVertexArray(0)
    }

    private fun bindSampler(program: GlProgram, name: String, unit: Int, texture: Int) {
        val location = program.uniform(name)
        if (location < 0) return
        GLES30.glActiveTexture(GLES30.GL_TEXTURE0 + unit)
        GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, texture)
        GLES30.glUniform1i(location, unit)
    }

    private fun createTexture(filter: Int): Int {
        val handle = IntArray(1)
        GLES30.glGenTextures(1, handle, 0)
        GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, handle[0])
        GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_MIN_FILTER, filter)
        GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_MAG_FILTER, filter)
        GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_WRAP_S, GLES30.GL_CLAMP_TO_EDGE)
        GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_WRAP_T, GLES30.GL_CLAMP_TO_EDGE)
        return handle[0]
    }

    private fun floatBuffer(capacity: Int): FloatBuffer =
        ByteBuffer.allocateDirect(capacity * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()

    companion object {
        const val MAX_LAYERS = 16
        const val DATA_WIDTH = 256
        private const val MAX_SURFACE_SIZE = 2048
        private const val DATA_UNIT = 0
        private const val SURFACE_UNIT = 1
        private const val MASK_UNIT = 5
        private const val WINDOW_BUFFERS = 3
    }
}
