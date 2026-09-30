package expo.modules.gradients.programs.lighting

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object SkyProgram : GradientProgram {
    override val kind = GradientKind.SKY
    override val shader = "programs/lighting/sky.glsl"
    override val function = "skyField"
    override val resolution = 1.0

    override fun isAnimated(state: GradientLayerState) = false

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(0.7f, parameters.fisheye.toFloat(), parameters.horizon.toFloat())
        uniforms.b.set(
            parameters.extinction.x.toFloat(),
            parameters.extinction.y.toFloat(),
            parameters.extinction.z.toFloat()
        )
    }
}
