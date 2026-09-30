package expo.modules.gradients.programs.geometric

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object ConicProgram : GradientProgram {
    override val kind = GradientKind.CONIC
    override val shader = "programs/geometric/conic.glsl"
    override val function = "conicField"
    override val resolution = 2.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val center = state.parameters.center
        uniforms.a.set(context.pointX(center), context.pointY(center), spinAngle(state, state.parameters.angle))
    }
}
