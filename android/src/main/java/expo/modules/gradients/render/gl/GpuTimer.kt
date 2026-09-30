package expo.modules.gradients.render.gl

import android.opengl.GLES30

class GpuTimer {
    val isSupported: Boolean =
        GLES30.glGetString(GLES30.GL_EXTENSIONS)?.contains(EXTENSION) == true

    private val queries = IntArray(SLOTS)
    private val pending = BooleanArray(SLOTS)
    private val scratch = IntArray(1)
    private var cursor = 0
    private var active = -1

    fun begin() {
        if (!isSupported || pending[cursor]) return
        if (queries[0] == 0) {
            GLES30.glGenQueries(SLOTS, queries, 0)
        }
        GLES30.glBeginQuery(TIME_ELAPSED, queries[cursor])
        active = cursor
    }

    fun end() {
        if (active < 0) return
        GLES30.glEndQuery(TIME_ELAPSED)
        pending[active] = true
        active = -1
        cursor = (cursor + 1) % SLOTS
    }

    fun collect(record: (Double) -> Unit) {
        if (!isSupported) return
        GLES30.glGetIntegerv(GPU_DISJOINT, scratch, 0)
        val disjoint = scratch[0] != 0
        for (slot in 0 until SLOTS) {
            if (!pending[slot]) continue
            GLES30.glGetQueryObjectuiv(queries[slot], GLES30.GL_QUERY_RESULT_AVAILABLE, scratch, 0)
            if (scratch[0] == 0) continue
            GLES30.glGetQueryObjectuiv(queries[slot], GLES30.GL_QUERY_RESULT, scratch, 0)
            pending[slot] = false
            if (!disjoint) {
                record((scratch[0].toLong() and 0xFFFFFFFFL) / 1e6)
            }
        }
    }

    fun release() {
        if (queries[0] != 0) {
            GLES30.glDeleteQueries(SLOTS, queries, 0)
            queries.fill(0)
        }
        pending.fill(false)
        active = -1
    }

    private companion object {
        const val EXTENSION = "GL_EXT_disjoint_timer_query"
        const val TIME_ELAPSED = 0x88BF
        const val GPU_DISJOINT = 0x8FBB
        const val SLOTS = 6
    }
}
