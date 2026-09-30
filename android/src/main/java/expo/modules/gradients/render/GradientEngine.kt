package expo.modules.gradients.render

import android.content.Context
import android.hardware.display.DisplayManager
import android.view.Display
import expo.modules.gradients.render.gl.EglCore
import java.util.concurrent.atomic.AtomicInteger

class GradientEngine private constructor(context: Context) {
    private val identifiers = AtomicInteger(0)
    private val workers: List<RenderWorker>

    init {
        val application = context.applicationContext
        val display = (application.getSystemService(Context.DISPLAY_SERVICE) as? DisplayManager)
            ?.getDisplay(Display.DEFAULT_DISPLAY)
        val framePeriodNanos = (1e9 / (display?.refreshRate ?: 60f).coerceAtLeast(1f)).toLong()
        workers = List(WORKER_COUNT) { RenderWorker(it, application.assets, framePeriodNanos) }
    }

    fun createScene(): Int {
        val id = identifiers.getAndIncrement()
        worker(id).createScene(id)
        return id
    }

    fun update(id: Int, block: GradientScene.(EglCore) -> Unit) {
        worker(id).update(id, block)
    }

    fun releaseScene(id: Int) {
        worker(id).releaseScene(id)
    }

    private fun worker(id: Int): RenderWorker = workers[id % workers.size]

    companion object {
        private const val WORKER_COUNT = 1

        @Volatile
        private var instance: GradientEngine? = null

        fun obtain(context: Context): GradientEngine =
            instance ?: synchronized(this) {
                instance ?: GradientEngine(context).also { instance = it }
            }
    }
}
