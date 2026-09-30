package expo.modules.gradients.programs.geometric

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object SweepProgram : GradientProgram {
    override val kind = GradientKind.SWEEP
    override val shader = "programs/geometric/sweep.glsl"
    override val function = "sweepField"
    override val resolution = 2.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            context.pointX(parameters.center),
            context.pointY(parameters.center),
            spinAngle(state, parameters.startAngle),
            spinAngle(state, parameters.endAngle)
        )
    }
}
