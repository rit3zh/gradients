package expo.modules.gradients.animation

import expo.modules.gradients.model.GradientLayerState

class GradientAnimator {
    var presentation: List<GradientLayerState> = emptyList()
        private set

    private var origin: List<GradientLayerState> = emptyList()
    private var target: List<GradientLayerState> = emptyList()
    private var timing: GradientTiming? = null
    private var elapsed = 0.0

    private var frames: List<List<GradientLayerState>> = emptyList()
    private var frameIndex = 0
    private var loops = true
    private var sequenceTiming: GradientTiming = GradientTiming.SEQUENCE_DEFAULT

    val isAnimating: Boolean
        get() = timing != null || isSequencing

    private val isSequencing: Boolean
        get() = frames.size > 1 && (loops || frameIndex < frames.size - 1)

    fun update(
        layers: List<GradientLayerState>,
        keyframes: List<List<GradientLayerState>>,
        timing: GradientTiming?,
        loop: Boolean
    ) {
        frames = if (keyframes.isEmpty()) emptyList() else listOf(layers) + keyframes
        frameIndex = 0
        loops = loop
        if (timing != null) {
            sequenceTiming = timing
        }
        transition(layers, timing)
    }

    fun step(delta: Double) {
        origin = advanceClocks(origin, delta)
        target = advanceClocks(target, delta)

        val current = timing
        if (current == null) {
            presentation = target
            if (isSequencing) advanceSequence()
            return
        }

        elapsed += delta
        if (current.isFinished(elapsed)) {
            timing = null
            presentation = target
            if (isSequencing) advanceSequence()
        } else {
            presentation = blend(origin, target, current.progress(elapsed))
        }
    }

    private fun transition(layers: List<GradientLayerState>, timing: GradientTiming?) {
        val inherited = inheritClocks(layers)
        if (timing == null || presentation.isEmpty()) {
            origin = emptyList()
            target = inherited
            presentation = inherited
            this.timing = null
            return
        }
        origin = presentation
        target = inherited
        elapsed = 0.0
        this.timing = timing
    }

    private fun advanceSequence() {
        if (frames.size <= 1) return
        val next = frameIndex + 1
        if (next >= frames.size) {
            if (!loops) return
            frameIndex = 0
        } else {
            frameIndex = next
        }
        transition(frames[frameIndex], sequenceTiming)
    }

    private fun inheritClocks(layers: List<GradientLayerState>): List<GradientLayerState> =
        layers.mapIndexed { index, layer ->
            val previous = presentation.getOrNull(index)
            if (previous != null && previous.kind == layer.kind) layer.copy(clock = previous.clock) else layer
        }

    private fun advanceClocks(layers: List<GradientLayerState>, delta: Double): List<GradientLayerState> {
        if (delta <= 0 || layers.isEmpty()) return layers
        return layers.map { it.copy(clock = it.clock + delta * it.parameters.speed) }
    }

    private fun blend(
        origin: List<GradientLayerState>,
        target: List<GradientLayerState>,
        progress: Double
    ): List<GradientLayerState> {
        val fade = progress.coerceIn(0.0, 1.0)
        if (origin.size != target.size) {
            return origin.map { it.faded(1 - fade) } + target.map { it.faded(fade) }
        }
        return origin.zip(target).flatMap { (from, to) ->
            if (from.isCompatible(to)) {
                listOf(GradientLayerState.mix(from, to, progress))
            } else {
                listOf(from.faded(1 - fade), to.faded(fade))
            }
        }
    }
}
