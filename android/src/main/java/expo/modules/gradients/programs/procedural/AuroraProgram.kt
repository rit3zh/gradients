package expo.modules.gradients.programs.procedural

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import expo.modules.gradients.model.SeededRandom

object AuroraProgram : GradientProgram {
    override val kind = GradientKind.AURORA
    override val shader = "programs/procedural/aurora.glsl"
    override val function = "auroraField"
    override val resolution = 1.5
    override val usesNoise = true

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            parameters.scale.toFloat(),
            parameters.bands.toFloat(),
            parameters.intensity.toFloat(),
            maxOf(1 - parameters.softness, 0.05).toFloat()
        )
        uniforms.b.set((SeededRandom(state.seed).unit() * 50).toFloat())
    }
}
