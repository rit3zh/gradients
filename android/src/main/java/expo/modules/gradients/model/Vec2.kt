package expo.modules.gradients.model

data class Vec2(val x: Double, val y: Double) {
    operator fun plus(other: Vec2) = Vec2(x + other.x, y + other.y)
    operator fun minus(other: Vec2) = Vec2(x - other.x, y - other.y)
    operator fun times(scalar: Double) = Vec2(x * scalar, y * scalar)

    operator fun times(other: Vec2) = Vec2(x * other.x, y * other.y)
    fun lerp(to: Vec2, t: Double) = Vec2(x + (to.x - x) * t, y + (to.y - y) * t)
    fun clamp(lower: Double, upper: Double) = Vec2(x.coerceIn(lower, upper), y.coerceIn(lower, upper))

    companion object {
        val ZERO = Vec2(0.0, 0.0)
        fun of(values: List<Double>?, fallback: Vec2): Vec2 =
            if (values != null && values.size >= 2) Vec2(values[0], values[1]) else fallback
    }
}
