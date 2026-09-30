package expo.modules.gradients.model

data class Vec3(val x: Double, val y: Double, val z: Double) {
    fun lerp(to: Vec3, t: Double) = Vec3(
        x + (to.x - x) * t,
        y + (to.y - y) * t,
        z + (to.z - z) * t
    )

    companion object {
        fun of(values: List<Double>, fallback: Vec3): Vec3 =
            if (values.size == 3) Vec3(values[0], values[1], values[2]) else fallback
    }
}
