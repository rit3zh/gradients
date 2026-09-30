package expo.modules.gradients.programs.procedural

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import expo.modules.gradients.programs.support.SeedOffset

object LiquidProgram : GradientProgram {
    override val kind = GradientKind.LIQUID
    override val shader = "programs/procedural/liquid.glsl"
    override val function = "liquidField"
    override val resolution = 1.5
    override val usesNoise = true

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val seed = SeedOffset.of(state.seed)
        uniforms.a.set(
            (parameters.scale * 0.55).toFloat(),
            parameters.warp.toFloat(),
            parameters.highlight.toFloat()
        )
        uniforms.b.set(seed[0], seed[1])
    }
}
