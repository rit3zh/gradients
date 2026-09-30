package expo.modules.gradients.render.gl

import android.content.res.AssetManager
import android.util.Log
import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.programs.GradientProgram
import expo.modules.gradients.programs.GradientRegistry

class ShaderLibrary(private val assets: AssetManager) {
    private val sources = HashMap<String, String>()
    private val variants = HashMap<CompositeVariant, GlProgram?>()
    private var meshBuilt = false
    private var mesh: GlProgram? = null

    fun composite(variant: CompositeVariant): GlProgram? =
        variants.getOrPut(variant) {
            runCatching { GlProgram(load("core/composite.vert"), fragment(variant)) }
                .onFailure { Log.e(TAG, "Unable to build gradient variant $variant", it) }
                .getOrNull()
        }

    fun mesh(): GlProgram? {
        if (!meshBuilt) {
            meshBuilt = true
            mesh = runCatching { GlProgram(load("core/mesh.vert"), load("core/mesh.frag")) }
                .onFailure { Log.e(TAG, "Unable to build mesh program", it) }
                .getOrNull()
        }
        return mesh
    }

    fun release() {
        variants.values.forEach { it?.release() }
        variants.clear()
        mesh?.release()
        mesh = null
        meshBuilt = false
    }

    private fun fragment(variant: CompositeVariant): String {
        val programs = variant.kind?.let { listOf(GradientRegistry.program(GradientKind.entries[it])) }
            ?: GradientRegistry.programs

        return buildString {
            append(VERSION)
            if (variant.sourceOver) append("#define SOURCE_OVER\n")
            append(load("core/common.glsl"))
            if (programs.any { it.usesNoise }) append(load("core/noise.glsl"))
            if (programs.any { it.usesSurfaces }) append(load("core/surfaces.glsl"))
            if (!variant.sourceOver) append(load("core/blend.glsl"))
            programs.forEach { append(load(it.shader)) }
            append(dispatch(programs, variant.kind != null))
            append(load("core/composite.glsl"))
        }
    }

    private fun dispatch(programs: List<GradientProgram>, specialized: Boolean): String = buildString {
        append("vec4 evaluateLayer(Fragment f, Layer layer) {\n")
        if (specialized) {
            append("    return ${programs.first().function}(f, layer);\n")
        } else {
            append("    switch (layer.kind) {\n")
            programs.forEach { append("        case ${it.kind.ordinal}: return ${it.function}(f, layer);\n") }
            append("        default: return vec4(0.0);\n")
            append("    }\n")
        }
        append("}\n\n")
    }

    private fun load(path: String): String =
        sources.getOrPut(path) {
            assets.open("$ROOT/$path").bufferedReader().use { it.readText() } + "\n"
        }

    private companion object {
        const val TAG = "ExpoGradients"
        const val ROOT = "expo-gradients/shaders"
        const val VERSION = "#version 300 es\n"
    }
}
