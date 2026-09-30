package expo.modules.gradients.programs.surface

import expo.modules.gradients.color.ColorSpace
import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.model.Vec2
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.programs.support.PointDrift
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object FreeformProgram : GradientProgram {
    override val kind = GradientKind.FREEFORM
    override val shader = "programs/surface/freeform.glsl"
    override val function = "freeformField"
    override val resolution = 1.0

    override fun isAnimated(state: GradientLayerState) =
        state.parameters.speed != 0.0 && state.parameters.drift > 0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val points = PointDrift.apply(
            state.points,
            state.parameters.drift,
            state.clock,
            state.seed,
            Vec2(0.25, 0.25)
        )
        uniforms.data = context.cursor
        points.forEach { context.put(context.pointX(it), context.pointY(it)) }
        state.colors.forEach {
            val encoded = ColorSpace.encode(it, state.interpolation)
            context.put(encoded.r, encoded.g, encoded.b, encoded.a)
        }
        uniforms.count = points.size
        val smoothness = state.parameters.smoothness.coerceIn(0.0, 1.0)
        uniforms.a.set((1.5 + (1 - smoothness) * 3).toFloat(), 0.0004f)
    }
}
