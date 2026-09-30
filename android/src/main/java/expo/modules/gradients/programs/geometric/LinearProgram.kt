package expo.modules.gradients.programs.geometric

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin

object LinearProgram : GradientProgram {
    override val kind = GradientKind.LINEAR
    override val shader = "programs/geometric/linear.glsl"
    override val function = "linearField"
    override val resolution = 2.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val axis = axis(state, context.width, context.height)
        uniforms.a.set(axis[0], axis[1], axis[2], axis[3])
    }

    fun axis(state: GradientLayerState, width: Float, height: Float): FloatArray {
        val parameters = state.parameters
        val angle = spinAngle(state, parameters.angle)
        val directionX = sin(angle)
        val directionY = -cos(angle)
        val length = abs(width * directionX) + abs(height * directionY)
        val centerX = width * 0.5f
        val centerY = height * 0.5f

        val rotation = (parameters.spin * state.clock * PI / 180).toFloat()
        val startX = parameters.start.x.toFloat() * width
        val startY = parameters.start.y.toFloat() * height
        val endX = parameters.end.x.toFloat() * width
        val endY = parameters.end.y.toFloat() * height
        val cosine = cos(rotation)
        val sine = sin(rotation)

        val pointStartX = centerX + (startX - centerX) * cosine - (startY - centerY) * sine
        val pointStartY = centerY + (startX - centerX) * sine + (startY - centerY) * cosine
        val pointEndX = centerX + (endX - centerX) * cosine - (endY - centerY) * sine
        val pointEndY = centerY + (endX - centerX) * sine + (endY - centerY) * cosine

        val weight = parameters.usesPoints.toFloat()
        val angleStartX = centerX - directionX * length * 0.5f
        val angleStartY = centerY - directionY * length * 0.5f
        val angleEndX = centerX + directionX * length * 0.5f
        val angleEndY = centerY + directionY * length * 0.5f

        return floatArrayOf(
            angleStartX + (pointStartX - angleStartX) * weight,
            angleStartY + (pointStartY - angleStartY) * weight,
            angleEndX + (pointEndX - angleEndX) * weight,
            angleEndY + (pointEndY - angleEndY) * weight
        )
    }
}
