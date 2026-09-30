package expo.modules.gradients.programs.support

import expo.modules.gradients.color.ColorRamp
import expo.modules.gradients.model.Vec2
import expo.modules.gradients.render.frame.FrameData
import expo.modules.gradients.render.mesh.MeshSurface

class LayerContext(
    val width: Float,
    val height: Float,
    val tiltX: Float,
    val tiltY: Float,
    private val data: FrameData,
    private val previousSurfaces: Array<MeshSurface?>
) {
    val surfaces = ArrayList<MeshSurface>(MAX_SURFACES)

    val minSide: Float
        get() = maxOf(minOf(width, height), 1f)

    val cursor: Int
        get() = data.texelCount

    fun pointX(unit: Vec2): Float = unit.x.toFloat() * width

    fun pointY(unit: Vec2): Float = unit.y.toFloat() * height

    fun appendRamp(ramp: ColorRamp): Int = data.putAll(ramp.samples)

    fun put(x: Float, y: Float = 0f, z: Float = 0f, w: Float = 0f) {
        data.put(x, y, z, w)
    }

    fun reusableSurface(key: MeshSurface.Key): MeshSurface? {
        val previous = previousSurfaces.getOrNull(surfaces.size) ?: return null
        return if (previous.key == key) previous else null
    }

    fun appendSurface(surface: MeshSurface): Int? {
        if (surfaces.size >= MAX_SURFACES) return null
        surfaces.add(surface)
        return surfaces.size - 1
    }

    companion object {
        const val MAX_SURFACES = 4
    }
}
