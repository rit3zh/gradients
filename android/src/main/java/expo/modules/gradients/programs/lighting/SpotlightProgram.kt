package expo.modules.gradients.programs.lighting

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import kotlin.math.PI
import kotlin.math.hypot
import kotlin.math.sin

object SpotlightProgram : GradientProgram {
    override val kind = GradientKind.SPOTLIGHT
    override val shader = "programs/lighting/spotlight.glsl"
    override val function = "spotlightField"
    override val resolution = 1.0

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val sway = (sin(state.clock * 0.9) * 0.12).toFloat()
        uniforms.a.set(
            context.pointX(parameters.center),
            context.pointY(parameters.center),
            spinAngle(state, parameters.angle) + sway,
            (parameters.spread * PI / 360).toFloat()
        )
        uniforms.b.set(
            hypot(context.width, context.height) * parameters.radius.toFloat(),
            parameters.softness.toFloat(),
            parameters.intensity.toFloat()
        )
    }
}
