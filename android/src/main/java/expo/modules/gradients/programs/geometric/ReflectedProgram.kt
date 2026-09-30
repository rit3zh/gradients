package expo.modules.gradients.programs.geometric

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object ReflectedProgram : GradientProgram {
    override val kind = GradientKind.REFLECTED
    override val shader = "programs/geometric/reflected.glsl"
    override val function = "reflectedField"
    override val resolution = 2.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val axis = LinearProgram.axis(state, context.width, context.height)
        val weight = parameters.usesPoints.toFloat()
        val middleX = (axis[0] + axis[2]) * 0.5f
        val middleY = (axis[1] + axis[3]) * 0.5f
        uniforms.a.set(
            middleX + (axis[0] - middleX) * weight,
            middleY + (axis[1] - middleY) * weight,
            axis[2],
            axis[3]
        )
        uniforms.b.set(
            (parameters.softness.coerceIn(0.0, 1.0) * 0.35).toFloat(),
            parameters.radius.coerceIn(-1.0, 1.0).toFloat()
        )
    }
}
