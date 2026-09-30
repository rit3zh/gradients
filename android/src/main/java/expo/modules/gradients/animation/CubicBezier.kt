package expo.modules.gradients.animation

import kotlin.math.abs

class CubicBezier(x1: Double, private val y1: Double, x2: Double, private val y2: Double) {
    private val x1 = x1.coerceIn(0.0, 1.0)
    private val x2 = x2.coerceIn(0.0, 1.0)
    private val cx = 3 * this.x1
    private val bx = 3 * (this.x2 - this.x1) - cx
    private val ax = 1 - cx - bx
    private val cy = 3 * y1
    private val by = 3 * (y2 - y1) - cy
    private val ay = 1 - cy - by

    private val isLinear: Boolean
        get() = x1 == y1 && x2 == y2

    fun value(progress: Double): Double {
        val x = progress.coerceIn(0.0, 1.0)
        if (isLinear) return x
        return sampleY(solve(x))
    }

    private fun sampleX(t: Double) = ((ax * t + bx) * t + cx) * t

    private fun sampleY(t: Double) = ((ay * t + by) * t + cy) * t

    private fun slopeX(t: Double) = (3 * ax * t + 2 * bx) * t + cx

    private fun solve(x: Double): Double {
        var t = x
        for (iteration in 0 until 8) {
            val error = sampleX(t) - x
            if (abs(error) < 1e-6) return t
            val slope = slopeX(t)
            if (abs(slope) < 1e-6) break
            t -= error / slope
        }
        var lower = 0.0
        var upper = 1.0
        t = x
        while (lower < upper) {
            val value = sampleX(t)
            if (abs(value - x) < 1e-6) return t
            if (x > value) lower = t else upper = t
            t = (upper - lower) * 0.5 + lower
            if (upper - lower < 1e-7) break
        }
        return t
    }

    companion object {
        val LINEAR = CubicBezier(0.0, 0.0, 1.0, 1.0)
        val EASE_IN_OUT = CubicBezier(0.42, 0.0, 0.58, 1.0)

        fun of(values: List<Double>): CubicBezier =
            if (values.size == 4) CubicBezier(values[0], values[1], values[2], values[3]) else LINEAR
    }
}
