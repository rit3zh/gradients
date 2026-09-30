package expo.modules.gradients.programs.support

import expo.modules.gradients.model.SeededRandom

object SeedOffset {
    fun of(seed: Double, scale: Float = 1f): FloatArray {
        val random = SeededRandom(seed)
        return floatArrayOf(
            (random.unit() * 97).toFloat() * scale,
            (random.unit() * 97).toFloat() * scale
        )
    }
}
