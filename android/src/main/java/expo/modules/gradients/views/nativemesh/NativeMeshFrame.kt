package expo.modules.gradients.views.nativemesh

import expo.modules.gradients.color.ColorSpace
import expo.modules.gradients.color.Rgba
import expo.modules.gradients.enums.ColorInterpolation
import expo.modules.gradients.enums.NativeMeshColorSpace
import expo.modules.gradients.model.Vec2
import expo.modules.gradients.programs.support.PointDrift
import expo.modules.gradients.render.mesh.MeshSurface
import kotlin.math.pow

data class NativeMeshFrame(
    val columns: Int,
    val rows: Int,
    val points: List<Vec2>,
    val colors: List<Rgba>,
    val smoothsColors: Boolean,
    val colorSpace: NativeMeshColorSpace
) {
    val key: MeshSurface.Key
        get() = MeshSurface.Key(
            points = points,
            colors = colors,
            rows = rows,
            columns = columns,
            space = if (colorSpace == NativeMeshColorSpace.PERCEPTUAL) ColorInterpolation.OKLAB else ColorInterpolation.SRGB,
            smoothness = if (smoothsColors) 1.0 else 0.0
        )

    fun hasSameShape(other: NativeMeshFrame): Boolean = columns == other.columns && rows == other.rows

    fun lerp(to: NativeMeshFrame, t: Float): NativeMeshFrame = to.copy(
        points = points.zip(to.points) { from, target -> from.lerp(target, t.toDouble()) },
        colors = colors.zip(to.colors) { from, target -> from.lerp(target, t) }
    )

    fun drifted(amount: Double, clock: Double): NativeMeshFrame {
        if (amount <= 0) return this
        val reach = Vec2(0.35 / (columns - 1), 0.35 / (rows - 1))
        return copy(points = PointDrift.apply(points, amount, clock, 0.0, reach, rows, columns))
    }

    companion object {
        const val MAXIMUM_SIDE = 16

        fun eased(progress: Double): Double {
            val t = progress.coerceIn(0.0, 1.0)
            return if (t < 0.5) 4 * t * t * t else 1 - (-2 * t + 2).pow(3) / 2
        }

        fun of(
            columns: Int,
            rows: Int,
            points: List<List<Double>>,
            colors: List<Int>,
            smoothsColors: Boolean,
            colorSpace: NativeMeshColorSpace
        ): NativeMeshFrame {
            val width = columns.coerceIn(2, MAXIMUM_SIDE)
            val height = rows.coerceIn(2, MAXIMUM_SIDE)
            val count = width * height
            val parsed = points.filter { it.size >= 2 }.map { Vec2(it[0], it[1]) }
            val resolvedPoints = if (parsed.size == count) parsed else grid(width, height)
            val linear = colors.map(ColorSpace::fromArgb)
            val resolvedColors = if (linear.isEmpty()) List(count) { Rgba.CLEAR } else List(count) { linear[it % linear.size] }
            return NativeMeshFrame(width, height, resolvedPoints, resolvedColors, smoothsColors, colorSpace)
        }

        private fun grid(columns: Int, rows: Int): List<Vec2> =
            (0 until rows).flatMap { row ->
                (0 until columns).map { column ->
                    Vec2(column.toDouble() / (columns - 1), row.toDouble() / (rows - 1))
                }
            }
    }
}
