package expo.modules.gradients.programs.geometric

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import kotlin.math.hypot
import kotlin.math.sqrt

object RadialProgram : GradientProgram {
    override val kind = GradientKind.RADIAL
    override val shader = "programs/geometric/radial.glsl"
    override val function = "radialField"
    override val resolution = 2.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        val centerX = context.pointX(parameters.center)
        val centerY = context.pointY(parameters.center)
        val reachX = maxOf(centerX, context.width - centerX)
        val reachY = maxOf(centerY, context.height - centerY)
        val circle = hypot(reachX, reachY)
        val ellipse = parameters.ellipse.toFloat()
        val scale = parameters.radius.toFloat()
        val radiusX = (circle + (reachX * SQRT_TWO - circle) * ellipse) * scale
        val radiusY = (circle + (reachY * SQRT_TWO - circle) * ellipse) * scale
        uniforms.a.set(centerX, centerY, radiusX, radiusY)
    }

    private val SQRT_TWO = sqrt(2f)
}
