package expo.modules.gradients.animation

import expo.modules.gradients.enums.TransitionType
import expo.modules.gradients.records.GradientTransitionRecord
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.sin
import kotlin.math.sqrt

sealed class GradientTiming {
    abstract val delay: Double
    abstract val settleTime: Double

    abstract fun progress(elapsed: Double): Double

    fun isFinished(elapsed: Double): Boolean = elapsed - delay >= settleTime

    data class Curve(
        val duration: Double,
        override val delay: Double,
        val easing: CubicBezier
    ) : GradientTiming() {
        override val settleTime: Double get() = duration

        override fun progress(elapsed: Double): Double {
            val time = elapsed - delay
            if (time <= 0) return 0.0
            return easing.value(time / duration)
        }
    }

    data class Spring(
        val damping: Double,
        val stiffness: Double,
        val mass: Double,
        override val delay: Double
    ) : GradientTiming() {
        private val omega = sqrt(stiffness / mass)
        private val zeta = damping / (2 * sqrt(stiffness * mass))

        override val settleTime: Double
            get() {
                val decay = if (zeta < 1) zeta * omega else omega * (zeta - sqrt(zeta * zeta - 1))
                return minOf(ln(1000.0) / maxOf(decay, 0.0001), 10.0)
            }

        override fun progress(elapsed: Double): Double {
            val time = elapsed - delay
            if (time <= 0) return 0.0
            if (zeta < 1) {
                val damped = omega * sqrt(1 - zeta * zeta)
                val envelope = exp(-zeta * omega * time)
                return 1 - envelope * (cos(damped * time) + (zeta * omega / damped) * sin(damped * time))
            }
            if (zeta == 1.0) {
                return 1 - exp(-omega * time) * (1 + omega * time)
            }
            val root = sqrt(zeta * zeta - 1)
            val r1 = -omega * (zeta - root)
            val r2 = -omega * (zeta + root)
            val a = r2 / (r1 - r2)
            val b = -r1 / (r1 - r2)
            return 1 + a * exp(r1 * time) + b * exp(r2 * time)
        }
    }

    companion object {
        val SEQUENCE_DEFAULT: GradientTiming = Curve(1.2, 0.0, CubicBezier.EASE_IN_OUT)

        fun from(record: GradientTransitionRecord?): GradientTiming? {
            if (record == null) return null
            val delay = maxOf(record.delay, 0.0) / 1000
            return when (record.type) {
                TransitionType.TIMING ->
                    if (record.duration > 0) Curve(record.duration / 1000, delay, CubicBezier.of(record.easing)) else null
                TransitionType.SPRING -> Spring(
                    maxOf(record.damping, 0.01),
                    maxOf(record.stiffness, 0.01),
                    maxOf(record.mass, 0.01),
                    delay
                )
            }
        }
    }
}
