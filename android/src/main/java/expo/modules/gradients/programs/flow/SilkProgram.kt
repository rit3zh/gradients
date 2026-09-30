package expo.modules.gradients.programs.flow

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object SilkProgram : GradientProgram {
    override val kind = GradientKind.SILK
    override val shader = "programs/flow/silk.glsl"
    override val function = "silkField"
    override val resolution = 1.5

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(maxOf(parameters.scale, 0.05).toFloat(), parameters.highlight.toFloat())
    }
}
