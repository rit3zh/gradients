package expo.modules.gradients.color

import expo.modules.gradients.animation.CubicBezier
import expo.modules.gradients.enums.ColorInterpolation

class ColorRamp(val samples: FloatArray, val rangeStart: Float, val rangeEnd: Float) {
    override fun equals(other: Any?): Boolean =
        other is ColorRamp &&
            rangeStart == other.rangeStart &&
            rangeEnd == other.rangeEnd &&
            samples.contentEquals(other.samples)

    override fun hashCode(): Int = samples.contentHashCode() * 31 + rangeStart.hashCode()

    companion object {
        const val RESOLUTION = 256

        val CLEAR = ColorRamp(FloatArray(RESOLUTION * 4), 0f, 1f)

        fun build(
            colors: List<Rgba>,
            stops: List<Double>,
            space: ColorInterpolation,
            easing: CubicBezier
        ): ColorRamp {
            if (colors.isEmpty()) return CLEAR
            if (colors.size == 1) {
                val color = ColorSpace.output(colors[0])
                val samples = FloatArray(RESOLUTION * 4)
                for (index in 0 until RESOLUTION) {
                    samples.put(index, color)
                }
                return ColorRamp(samples, 0f, 1f)
            }

            val positions = normalize(stops, colors.size)
            val encoded = colors.map { ColorSpace.encode(it, space) }
            val lower = positions.first().toFloat()
            val upper = maxOf(positions.last().toFloat(), lower + 0.0001f)
            val samples = FloatArray(RESOLUTION * 4)
            var segment = 0

            for (index in 0 until RESOLUTION) {
                val progress = index.toDouble() / (RESOLUTION - 1)
                val position = lower + progress * (upper - lower)
                while (segment < positions.size - 2 && position > positions[segment + 1]) {
                    segment += 1
                }
                val from = positions[segment]
                val to = positions[segment + 1]
                val local = if (to - from > 0.000001) {
                    ((position - from) / (to - from)).coerceIn(0.0, 1.0)
                } else if (position >= to) {
                    1.0
                } else {
                    0.0
                }
                val eased = easing.value(local).toFloat()
                val mixed = encoded[segment].lerp(encoded[segment + 1], eased)
                samples.put(index, ColorSpace.output(ColorSpace.decode(mixed, space)))
            }

            return ColorRamp(samples, lower, upper)
        }

        fun normalize(stops: List<Double>, count: Int): DoubleArray {
            val positions = if (stops.size == count) {
                stops.toDoubleArray()
            } else {
                DoubleArray(count) { it.toDouble() / maxOf(count - 1, 1) }
            }
            var floor = Double.NEGATIVE_INFINITY
            for (index in positions.indices) {
                positions[index] = maxOf(positions[index], floor)
                floor = positions[index]
            }
            return positions
        }

        fun mix(from: ColorRamp, to: ColorRamp, progress: Float): ColorRamp {
            if (from == to) return to
            val samples = FloatArray(RESOLUTION * 4)
            for (index in samples.indices) {
                samples[index] = from.samples[index] + (to.samples[index] - from.samples[index]) * progress
            }
            return ColorRamp(
                samples,
                from.rangeStart + (to.rangeStart - from.rangeStart) * progress,
                from.rangeEnd + (to.rangeEnd - from.rangeEnd) * progress
            )
        }

        private fun FloatArray.put(index: Int, color: Rgba) {
            val offset = index * 4
            this[offset] = color.r
            this[offset + 1] = color.g
            this[offset + 2] = color.b
            this[offset + 3] = color.a
        }
    }
}
