package expo.modules.gradients.programs

import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.programs.flow.FluxProgram
import expo.modules.gradients.programs.flow.InterlaceProgram
import expo.modules.gradients.programs.flow.RibbonProgram
import expo.modules.gradients.programs.flow.SilkProgram
import expo.modules.gradients.programs.flow.SmokeProgram
import expo.modules.gradients.programs.flow.StrataProgram
import expo.modules.gradients.programs.flow.WaveProgram
import expo.modules.gradients.programs.geometric.ConicProgram
import expo.modules.gradients.programs.geometric.DiamondProgram
import expo.modules.gradients.programs.geometric.LinearProgram
import expo.modules.gradients.programs.geometric.RadialProgram
import expo.modules.gradients.programs.geometric.ReflectedProgram
import expo.modules.gradients.programs.geometric.SweepProgram
import expo.modules.gradients.programs.lighting.GlowProgram
import expo.modules.gradients.programs.lighting.SkyProgram
import expo.modules.gradients.programs.lighting.SpotlightProgram
import expo.modules.gradients.programs.lighting.VignetteProgram
import expo.modules.gradients.programs.procedural.AuroraProgram
import expo.modules.gradients.programs.procedural.HolographicProgram
import expo.modules.gradients.programs.procedural.IridescentProgram
import expo.modules.gradients.programs.procedural.LiquidProgram
import expo.modules.gradients.programs.procedural.NoiseProgram
import expo.modules.gradients.programs.surface.BilinearProgram
import expo.modules.gradients.programs.surface.FreeformProgram
import expo.modules.gradients.programs.surface.MeshProgram
import expo.modules.gradients.programs.surface.VoronoiProgram

object GradientRegistry {
    val programs: List<GradientProgram> = listOf(
        LinearProgram,
        RadialProgram,
        ConicProgram,
        SweepProgram,
        DiamondProgram,
        ReflectedProgram,
        MeshProgram,
        FreeformProgram,
        BilinearProgram,
        NoiseProgram,
        VoronoiProgram,
        GlowProgram,
        SpotlightProgram,
        VignetteProgram,
        AuroraProgram,
        LiquidProgram,
        IridescentProgram,
        WaveProgram,
        SilkProgram,
        SmokeProgram,
        RibbonProgram,
        FluxProgram,
        HolographicProgram,
        InterlaceProgram,
        SkyProgram,
        StrataProgram
    )

    private val lookup: Map<GradientKind, GradientProgram> = programs.associateBy { it.kind }

    fun program(kind: GradientKind): GradientProgram = lookup[kind] ?: LinearProgram
}
