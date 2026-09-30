package expo.modules.gradients.programs.flow

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object InterlaceProgram : GradientProgram {
    override val kind = GradientKind.INTERLACE
    override val shader = "programs/flow/interlace.glsl"
    override val function = "interlaceField"

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            spinAngle(state, parameters.angle),
            maxOf(parameters.scale, 0.05).toFloat(),
            maxOf(parameters.width, 1.0).toFloat(),
            parameters.intensity.coerceIn(0.0, 1.0).toFloat()
        )
    }
}
