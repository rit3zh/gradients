package expo.modules.gradients.programs.flow

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object StrataProgram : GradientProgram {
    override val kind = GradientKind.STRATA
    override val shader = "programs/flow/strata.glsl"
    override val function = "strataField"
    override val resolution = 2.0

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            spinAngle(state, parameters.angle),
            parameters.bands.toFloat(),
            maxOf(parameters.scale, 0.05).toFloat(),
            parameters.intensity.coerceIn(0.0, 1.0).toFloat()
        )
    }
}
