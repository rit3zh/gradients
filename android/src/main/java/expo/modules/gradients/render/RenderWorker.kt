package expo.modules.gradients.render

import android.content.res.AssetManager
import android.opengl.GLES30
import android.os.Handler
import android.os.HandlerThread
import android.os.Process
import android.util.Log
import android.view.Choreographer
import expo.modules.gradients.diagnostics.GradientProfiler
import expo.modules.gradients.render.gl.EglCore
import expo.modules.gradients.render.gl.ShaderLibrary

class RenderWorker(
    index: Int,
    assets: AssetManager,
    private val framePeriodNanos: Long
) : Choreographer.FrameCallback {
    private val thread = HandlerThread("$THREAD_NAME-$index", Process.THREAD_PRIORITY_DISPLAY).apply { start() }
    private val handler = Handler(thread.looper)
    private val scenes = ArrayList<GradientScene>()
    private val lookup = HashMap<Int, GradientScene>()
    private val budgetNanos = framePeriodNanos * 3 / 4

    private var egl: EglCore? = null
    private var library: ShaderLibrary? = null
    private var choreographer: Choreographer? = null
    private var frameScheduled = false
    private var cursor = 0

    init {
        handler.post {
            runCatching {
                egl = EglCore()
                library = ShaderLibrary(assets)
                choreographer = Choreographer.getInstance()
                GradientProfiler.gpuName = GLES30.glGetString(GLES30.GL_RENDERER) ?: "unknown"
            }.onFailure { Log.e(TAG, "Unable to start gradient render worker $index", it) }
        }
    }

    fun createScene(id: Int) {
        handler.post {
            val library = library ?: return@post
            val scene = GradientScene(id, library, framePeriodNanos)
            scenes.add(scene)
            lookup[id] = scene
        }
    }

    fun update(id: Int, block: GradientScene.(EglCore) -> Unit) {
        handler.post {
            val egl = egl ?: return@post
            lookup[id]?.block(egl)
            requestFrame()
        }
    }

    fun releaseScene(id: Int) {
        handler.post {
            val egl = egl ?: return@post
            val scene = lookup.remove(id) ?: return@post
            scenes.remove(scene)
            scene.release(egl)
        }
    }

    override fun doFrame(frameTimeNanos: Long) {
        frameScheduled = false
        val egl = egl ?: return
        val begin = System.nanoTime()
        val count = scenes.size
        var rendered = 0
        var visited = 0

        while (visited < count) {
            val index = (cursor + visited) % count
            val scene = scenes[index]
            visited += 1
            if (!scene.wantsFrame) {
                scene.idle()
                continue
            }
            if (rendered > 0 && System.nanoTime() - begin > budgetNanos) {
                cursor = index
                visited = -1
                break
            }
            scene.frame(frameTimeNanos, egl)
            rendered += 1
        }
        if (visited >= 0 && count > 0) {
            cursor = (cursor + 1) % count
        }

        if (rendered > 0 && GradientProfiler.isEnabled) {
            GradientProfiler.recordTick(frameTimeNanos, System.nanoTime() - begin)
        }
        requestFrame()
    }

    private fun requestFrame() {
        if (frameScheduled) return
        val choreographer = choreographer ?: return
        if (scenes.none { it.wantsFrame }) return
        frameScheduled = true
        choreographer.postFrameCallback(this)
    }

    private companion object {
        const val TAG = "ExpoGradients"
        const val THREAD_NAME = "ExpoGradientsRenderer"
    }
}
