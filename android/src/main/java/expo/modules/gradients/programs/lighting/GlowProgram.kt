package expo.modules.gradients.programs.lighting

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object GlowProgram : GradientProgram {
    override val kind = GradientKind.GLOW
    override val shader = "programs/lighting/glow.glsl"
    override val function = "glowField"
    override val resolution = 1.0

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            context.pointX(parameters.center),
            context.pointY(parameters.center),
            parameters.radius.toFloat() * context.minSide * 0.5f,
            maxOf(parameters.falloff, 0.05).toFloat()
        )
        uniforms.b.set(parameters.intensity.toFloat(), 0.08f)
    }
}
