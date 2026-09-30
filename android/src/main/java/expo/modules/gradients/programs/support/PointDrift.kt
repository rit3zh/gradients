package expo.modules.gradients.programs.support

import expo.modules.gradients.model.SeededRandom
import expo.modules.gradients.model.Vec2
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

object PointDrift {
    fun apply(
        points: List<Vec2>,
        amount: Double,
        clock: Double,
        seed: Double,
        reach: Vec2,
        rows: Int = 0,
        columns: Int = 0
    ): List<Vec2> {
        if (amount <= 0) return points
        val random = SeededRandom(seed + 17)
        return points.mapIndexed { index, point ->
            val frequencyX = 0.35 + random.unit() * 0.5
            val frequencyY = 0.35 + random.unit() * 0.5
            val phaseX = random.unit() * 2 * PI
            val phaseY = random.unit() * 2 * PI
            var offsetX = sin(clock * frequencyX + phaseX) * reach.x * amount
            var offsetY = cos(clock * frequencyY + phaseY) * reach.y * amount
            if (columns > 0 && rows > 0) {
                val row = index / columns
                val column = index % columns
                if (column == 0 || column == columns - 1) offsetX = 0.0
                if (row == 0 || row == rows - 1) offsetY = 0.0
            }
            Vec2(point.x + offsetX, point.y + offsetY)
        }
    }
}
