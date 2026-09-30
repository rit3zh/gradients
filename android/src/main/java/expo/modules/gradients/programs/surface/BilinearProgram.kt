package expo.modules.gradients.programs.surface

import expo.modules.gradients.color.ColorSpace
import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object BilinearProgram : GradientProgram {
    override val kind = GradientKind.BILINEAR
    override val shader = "programs/surface/bilinear.glsl"
    override val function = "bilinearField"
    override val resolution = 1.0

    override fun isAnimated(state: GradientLayerState) = false

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        uniforms.data = context.cursor
        state.colors.forEach {
            val encoded = ColorSpace.encode(it, state.interpolation)
            context.put(encoded.r, encoded.g, encoded.b, encoded.a)
        }
        uniforms.count = 4
        uniforms.a.set(state.parameters.smoothness.coerceIn(0.0, 1.0).toFloat())
    }
}
