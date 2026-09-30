package expo.modules.gradients.programs.lighting

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object VignetteProgram : GradientProgram {
    override val kind = GradientKind.VIGNETTE
    override val shader = "programs/lighting/vignette.glsl"
    override val function = "vignetteField"
    override val resolution = 1.0

    override fun isAnimated(state: GradientLayerState) = false

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            parameters.center.x.toFloat(),
            parameters.center.y.toFloat(),
            parameters.radius.toFloat(),
            parameters.softness.toFloat()
        )
        uniforms.b.set(parameters.roundness.toFloat(), parameters.intensity.toFloat())
    }
}
