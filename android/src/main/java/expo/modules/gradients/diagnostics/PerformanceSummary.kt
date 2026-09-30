package expo.modules.gradients.diagnostics

class PerformanceSummary(values: List<Double>) {
    val mean: Double
    val p50: Double
    val p95: Double
    val max: Double
    val samples: Int = values.size

    init {
        val sorted = values.sorted()
        if (sorted.isEmpty()) {
            mean = 0.0
            p50 = 0.0
            p95 = 0.0
            max = 0.0
        } else {
            mean = sorted.sum() / sorted.size
            p50 = percentile(sorted, 0.5)
            p95 = percentile(sorted, 0.95)
            max = sorted.last()
        }
    }

    fun toMap(): Map<String, Any> = mapOf(
        "mean" to mean,
        "p50" to p50,
        "p95" to p95,
        "max" to max,
        "samples" to samples
    )

    private fun percentile(sorted: List<Double>, fraction: Double): Double {
        val position = fraction * (sorted.size - 1)
        val lower = position.toInt()
        val upper = minOf(lower + 1, sorted.size - 1)
        return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
    }
}
