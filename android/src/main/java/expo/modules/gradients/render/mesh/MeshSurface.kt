package expo.modules.gradients.render.mesh

import expo.modules.gradients.color.Rgba
import expo.modules.gradients.enums.ColorInterpolation
import expo.modules.gradients.model.Vec2

class MeshSurface(
    val key: Key,
    val vertices: FloatArray,
    val columns: Int,
    val rows: Int
) {
    data class Key(
        val points: List<Vec2>,
        val colors: List<Rgba>,
        val rows: Int,
        val columns: Int,
        val space: ColorInterpolation,
        val smoothness: Double
    )

    companion object {
        const val FLOATS_PER_VERTEX = 6
    }
}
