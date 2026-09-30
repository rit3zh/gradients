package expo.modules.gradients.render.mesh

import expo.modules.gradients.color.ColorSpace
import expo.modules.gradients.color.Rgba
import expo.modules.gradients.model.Vec2

object MeshTessellator {
    fun surface(key: MeshSurface.Key): MeshSurface {
        val rows = key.rows
        val columns = key.columns
        val subdivisions = (64 / maxOf(rows - 1, columns - 1)).coerceIn(6, 16)
        val gridColumns = (columns - 1) * subdivisions + 1
        val gridRows = (rows - 1) * subdivisions + 1
        val tension = key.smoothness.coerceIn(0.0, 1.0)

        val stride = columns + 2
        val lattice = paddedPositions(key.points, rows, columns)
        val tints = paddedColors(key.colors.map { ColorSpace.encode(it, key.space) }, rows, columns)
        val steps = Array(subdivisions + 1) { weights(it.toDouble() / subdivisions, tension) }
        val vertices = FloatArray(gridColumns * gridRows * MeshSurface.FLOATS_PER_VERTEX)
        var cursor = 0

        for (gridRow in 0 until gridRows) {
            val row = minOf(gridRow / subdivisions, rows - 2)
            val wy = steps[gridRow - row * subdivisions]
            for (gridColumn in 0 until gridColumns) {
                val column = minOf(gridColumn / subdivisions, columns - 2)
                val wx = steps[gridColumn - column * subdivisions]

                var x = 0.0
                var y = 0.0
                var r = 0f
                var g = 0f
                var b = 0f
                var a = 0f
                for (i in 0 until 4) {
                    val base = (row + i) * stride + column
                    for (j in 0 until 4) {
                        val weight = wy[i] * wx[j]
                        if (weight == 0.0) continue
                        val position = lattice[base + j]
                        val tint = tints[base + j]
                        val factor = weight.toFloat()
                        x += position.x * weight
                        y += position.y * weight
                        r += tint.r * factor
                        g += tint.g * factor
                        b += tint.b * factor
                        a += tint.a * factor
                    }
                }

                val output = ColorSpace.output(ColorSpace.decode(Rgba(r, g, b, a), key.space))
                vertices[cursor] = x.toFloat()
                vertices[cursor + 1] = y.toFloat()
                vertices[cursor + 2] = output.r
                vertices[cursor + 3] = output.g
                vertices[cursor + 4] = output.b
                vertices[cursor + 5] = output.a
                cursor += MeshSurface.FLOATS_PER_VERTEX
            }
        }

        return MeshSurface(key, vertices, gridColumns, gridRows)
    }

    private fun paddedPositions(points: List<Vec2>, rows: Int, columns: Int): Array<Vec2> {
        val stride = columns + 2
        val padded = Array((rows + 2) * stride) { Vec2.ZERO }
        for (row in 0 until rows) {
            val offset = (row + 1) * stride
            for (column in 0 until columns) {
                padded[offset + column + 1] = points[row * columns + column]
            }
            padded[offset] = padded[offset + 1] * 2.0 - padded[offset + 2]
            padded[offset + columns + 1] = padded[offset + columns] * 2.0 - padded[offset + columns - 1]
        }
        for (column in 0 until stride) {
            padded[column] = padded[stride + column] * 2.0 - padded[2 * stride + column]
            val last = (rows + 1) * stride + column
            padded[last] = padded[last - stride] * 2.0 - padded[last - 2 * stride]
        }
        return padded
    }

    private fun paddedColors(colors: List<Rgba>, rows: Int, columns: Int): Array<Rgba> {
        val stride = columns + 2
        return Array((rows + 2) * stride) { index ->
            val row = index / stride
            val column = index % stride
            val sourceRow = (row - 1).coerceIn(0, rows - 1)
            val sourceColumn = (column - 1).coerceIn(0, columns - 1)
            colors[sourceRow * columns + sourceColumn]
        }
    }

    private fun weights(t: Double, tension: Double): DoubleArray {
        val t2 = t * t
        val t3 = t2 * t
        val spline = doubleArrayOf(
            (-t3 + 2 * t2 - t) * 0.5,
            (3 * t3 - 5 * t2 + 2) * 0.5,
            (-3 * t3 + 4 * t2 + t) * 0.5,
            (t3 - t2) * 0.5
        )
        val eased = t2 * (3 - 2 * t)
        val linear = doubleArrayOf(0.0, 1 - eased, eased, 0.0)
        return DoubleArray(4) { linear[it] + (spline[it] - linear[it]) * tension }
    }
}
