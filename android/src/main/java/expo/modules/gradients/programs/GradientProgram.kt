package expo.modules.gradients.programs

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.render.frame.LayerUniforms
import kotlin.math.PI

interface GradientProgram {
    val kind: GradientKind
    val shader: String
    val function: String

    val resolution: Double?
        get() = null

    val usesNoise: Boolean
        get() = false

    val usesSurfaces: Boolean
        get() = false

    fun isAnimated(state: GradientLayerState): Boolean =
        state.parameters.speed != 0.0 && (state.parameters.spin != 0.0 || state.parameters.flow != 0.0)

    fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext)

    fun spinAngle(state: GradientLayerState, degrees: Double): Float =
        ((degrees + state.parameters.spin * state.clock) * PI / 180).toFloat()
}
