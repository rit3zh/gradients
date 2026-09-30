package expo.modules.gradients.enums

import expo.modules.kotlin.types.Enumerable

enum class GradientKind(val value: String) : Enumerable {
    LINEAR("linear"),
    RADIAL("radial"),
    CONIC("conic"),
    SWEEP("sweep"),
    DIAMOND("diamond"),
    REFLECTED("reflected"),
    MESH("mesh"),
    FREEFORM("freeform"),
    BILINEAR("bilinear"),
    NOISE("noise"),
    VORONOI("voronoi"),
    GLOW("glow"),
    SPOTLIGHT("spotlight"),
    VIGNETTE("vignette"),
    AURORA("aurora"),
    LIQUID("liquid"),
    IRIDESCENT("iridescent"),
    WAVE("wave"),
    SILK("silk"),
    SMOKE("smoke"),
    RIBBON("ribbon"),
    FLUX("flux"),
    HOLOGRAPHIC("holographic"),
    INTERLACE("interlace"),
    SKY("sky"),
    STRATA("strata")
}
