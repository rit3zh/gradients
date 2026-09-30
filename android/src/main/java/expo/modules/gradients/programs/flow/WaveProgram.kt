package expo.modules.gradients.programs.flow

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.frame.set

object WaveProgram : GradientProgram {
    override val kind = GradientKind.WAVE
    override val shader = "programs/flow/wave.glsl"
    override val function = "waveField"
    override val resolution = 1.5

    override fun isAnimated(state: GradientLayerState) = state.parameters.speed != 0.0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val parameters = state.parameters
        uniforms.a.set(
            parameters.scale.toFloat(),
            (parameters.intensity * 0.24).toFloat(),
            parameters.smoothness.coerceIn(0.0, 1.0).toFloat()
        )
        uniforms.b.set(spinAngle(state, parameters.angle))
    }
}
