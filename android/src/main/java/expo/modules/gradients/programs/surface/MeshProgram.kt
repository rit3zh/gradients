package expo.modules.gradients.programs.surface

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.model.GradientLayerState
import expo.modules.gradients.model.Vec2
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.support.LayerContext
import expo.modules.gradients.programs.support.PointDrift
import expo.modules.gradients.render.frame.LayerUniforms
import expo.modules.gradients.render.mesh.MeshSurface
import expo.modules.gradients.render.mesh.MeshTessellator

object MeshProgram : GradientProgram {
    override val kind = GradientKind.MESH
    override val shader = "programs/surface/mesh.glsl"
    override val function = "meshField"
    override val resolution = 1.0
    override val usesSurfaces = true

    override fun isAnimated(state: GradientLayerState) =
        state.parameters.speed != 0.0 && state.parameters.drift > 0

    override fun encode(state: GradientLayerState, uniforms: LayerUniforms, context: LayerContext) {
        val reach = Vec2(
            0.35 / maxOf(state.columns - 1, 1),
            0.35 / maxOf(state.rows - 1, 1)
        )
        val points = PointDrift.apply(
            state.points,
            state.parameters.drift,
            state.clock,
            state.seed,
            reach,
            state.rows,
            state.columns
        )
        val key = MeshSurface.Key(
            points,
            state.colors,
            state.rows,
            state.columns,
            state.interpolation,
            state.parameters.smoothness
        )
        val surface = context.reusableSurface(key) ?: MeshTessellator.surface(key)
        uniforms.surface = context.appendSurface(surface) ?: 0
    }
}
