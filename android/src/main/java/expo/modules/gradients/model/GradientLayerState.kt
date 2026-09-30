package expo.modules.gradients.model

import expo.modules.gradients.animation.CubicBezier
import expo.modules.gradients.color.ColorRamp
import expo.modules.gradients.color.ColorSpace
import expo.modules.gradients.color.Rgba
import expo.modules.gradients.enums.ColorInterpolation
import expo.modules.gradients.enums.GradientBlendMode
import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.enums.GradientTileMode
import expo.modules.gradients.records.GradientLayerRecord
import kotlin.math.sqrt

data class GradientLayerState(
    val kind: GradientKind,
    val blendMode: GradientBlendMode,
    val tileMode: GradientTileMode,
    val interpolation: ColorInterpolation,
    val parameters: GradientParameters,
    val ramp: ColorRamp,
    val colors: List<Rgba>,
    val points: List<Vec2>,
    val rows: Int,
    val columns: Int,
    val seed: Double,
    val clock: Double = 0.0
) {
    val opacity: Double
        get() = parameters.opacity

    fun isCompatible(other: GradientLayerState): Boolean =
        kind == other.kind &&
            blendMode == other.blendMode &&
            tileMode == other.tileMode &&
            interpolation == other.interpolation &&
            rows == other.rows &&
            columns == other.columns &&
            points.size == other.points.size &&
            colors.size == other.colors.size

    fun faded(factor: Double): GradientLayerState =
        copy(parameters = parameters.copy(opacity = parameters.opacity * factor))

    companion object {
        private const val GOLDEN_RATIO = 0.61803398875
        private const val MAX_SITES = 32

        fun from(record: GradientLayerRecord): GradientLayerState {
            val resolved = record.colors.map(ColorSpace::fromArgb)
            val ramp = ColorRamp.build(
                resolved,
                record.stops,
                record.interpolation,
                CubicBezier.of(record.easing)
            )
            val sites = record.points.filter { it.size >= 2 }.map { Vec2(it[0], it[1]) }

            var rows = 0
            var columns = 0
            var points = emptyList<Vec2>()
            var colors = emptyList<Rgba>()

            when (record.type) {
                GradientKind.MESH -> {
                    rows = maxOf(record.rows, 2)
                    columns = maxOf(record.columns, 2)
                    val count = rows * columns
                    points = if (sites.size == count) sites else grid(rows, columns)
                    colors = cycle(resolved, count)
                }
                GradientKind.BILINEAR -> {
                    rows = 2
                    columns = 2
                    colors = cycle(resolved, 4)
                }
                GradientKind.FREEFORM -> {
                    val count = (if (sites.isEmpty()) resolved.size else sites.size).coerceIn(1, MAX_SITES)
                    points = if (sites.isEmpty()) scatter(count, record.seed) else sites.take(count)
                    colors = cycle(resolved, count)
                }
                GradientKind.VORONOI -> {
                    val requested = if (record.cells > 0) record.cells else 8
                    val count = (if (sites.isEmpty()) requested else sites.size).coerceIn(1, MAX_SITES)
                    points = if (sites.isEmpty()) scatter(count, record.seed) else sites.take(count)
                    colors = cycle(resolved, count)
                }
                else -> Unit
            }

            return GradientLayerState(
                kind = record.type,
                blendMode = record.blendMode,
                tileMode = record.tileMode,
                interpolation = record.interpolation,
                parameters = GradientParameters.from(record),
                ramp = ramp,
                colors = colors,
                points = points,
                rows = rows,
                columns = columns,
                seed = record.seed
            )
        }

        fun mix(a: GradientLayerState, b: GradientLayerState, t: Double): GradientLayerState {
            val weight = t.toFloat()
            return b.copy(
                parameters = GradientParameters.mix(a.parameters, b.parameters, t),
                ramp = ColorRamp.mix(a.ramp, b.ramp, weight),
                colors = a.colors.zip(b.colors) { from, to -> from.lerp(to, weight) },
                points = a.points.zip(b.points) { from, to -> from.lerp(to, t) },
                seed = a.seed + (b.seed - a.seed) * t,
                clock = a.clock + (b.clock - a.clock) * t
            )
        }

        private fun grid(rows: Int, columns: Int): List<Vec2> =
            (0 until rows).flatMap { row ->
                (0 until columns).map { column ->
                    Vec2(column.toDouble() / (columns - 1), row.toDouble() / (rows - 1))
                }
            }

        private fun cycle(colors: List<Rgba>, count: Int): List<Rgba> =
            if (colors.isEmpty()) List(count) { Rgba.CLEAR } else List(count) { colors[it % colors.size] }

        private fun scatter(count: Int, seed: Double): List<Vec2> {
            val random = SeededRandom(seed)
            val offset = random.unit()
            val spread = 0.6 / sqrt(count.toDouble())
            return List(count) { index ->
                val jitter = Vec2(random.unit() - 0.5, random.unit() - 0.5)
                val base = Vec2(
                    (offset + index * GOLDEN_RATIO) % 1.0,
                    (index + 0.5) / count
                )
                (base + jitter * spread).clamp(0.02, 0.98)
            }
        }
    }
}
