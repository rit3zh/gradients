package expo.modules.gradients.model

class SeededRandom(seed: Double) {
    private var state: Long = (seed * 1_000_003).toLong() + GOLDEN

    fun next(): Long {
        state += GOLDEN
        var value = state
        value = (value xor (value ushr 30)) * MIX_A
        value = (value xor (value ushr 27)) * MIX_B
        return value xor (value ushr 31)
    }

    fun unit(): Double = (next() ushr 11).toDouble() / UNIT_SCALE

    private companion object {
        const val GOLDEN = -7046029254386353131L
        const val MIX_A = -4658895280553007687L
        const val MIX_B = -7723592293110705685L
        const val UNIT_SCALE = 9007199254740992.0
    }
}
