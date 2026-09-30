package expo.modules.gradients.programs.procedural

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import expo.modules.gradients.programs.support.SeedOffset

object HolographicProgram : GradientProgram {
    override val kind = GradientKind.HOLOGRAPHIC
    override val shader = "programs/procedural/holographic.glsl"
    override val function = "holographicField"
    override val usesNoise = true

    override fun isAnimated(state: GradientLayerState) =
        state.parameters.speed != 0.0 || state.parameters.spin != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val seed = SeedOffset.of(state.seed, 0.01f)
        uniforms.a.set(
            spinAngle(state, parameters.angle),
            parameters.bands.toFloat(),
            parameters.intensity.toFloat(),
            parameters.warp.toFloat()
        )
        uniforms.b.set(
            seed[0],
            seed[1],
            parameters.softness.coerceIn(0.0, 1.0).toFloat(),
            parameters.highlight.toFloat()
        )
    }
}
