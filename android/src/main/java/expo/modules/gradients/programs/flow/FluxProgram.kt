package expo.modules.gradients.programs.flow

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import expo.modules.gradients.programs.support.SeedOffset

object FluxProgram : GradientProgram {
    override val kind = GradientKind.FLUX
    override val shader = "programs/flow/flux.glsl"
    override val function = "fluxField"
    override val resolution = 1.5
    override val usesNoise = true

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val seed = SeedOffset.of(state.seed, 0.05f)
        uniforms.a.set(
            parameters.warp.toFloat(),
            parameters.intensity.toFloat(),
            maxOf(parameters.scale, 0.05).toFloat()
        )
        uniforms.b.set(seed[0], seed[1])
    }
}
