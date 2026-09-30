package expo.modules.gradients.programs.geometric

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object DiamondProgram : GradientProgram {
    override val kind = GradientKind.DIAMOND
    override val shader = "programs/geometric/diamond.glsl"
    override val function = "diamondField"
    override val resolution = 2.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val square = maxOf(context.width, context.height)
        val ellipse = parameters.ellipse.toFloat()
        val scale = parameters.radius.toFloat()
        uniforms.a.set(
            context.pointX(parameters.center),
            context.pointY(parameters.center),
            (square + (context.width - square) * ellipse) * scale,
            (square + (context.height - square) * ellipse) * scale
        )
        uniforms.b.set(spinAngle(state, parameters.angle))
    }
}
