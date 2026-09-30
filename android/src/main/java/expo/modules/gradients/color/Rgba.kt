package expo.modules.gradients.color

data class Rgba(val r: Float, val g: Float, val b: Float, val a: Float) {
    operator fun plus(other: Rgba) = Rgba(r + other.r, g + other.g, b + other.b, a + other.a)

    operator fun times(scalar: Float) = Rgba(r * scalar, g * scalar, b * scalar, a * scalar)

    fun lerp(to: Rgba, t: Float) = Rgba(
        r + (to.r - r) * t,
        g + (to.g - g) * t,
        b + (to.b - b) * t,
        a + (to.a - a) * t
    )

    companion object {
        val CLEAR = Rgba(0f, 0f, 0f, 0f)
    }
}
