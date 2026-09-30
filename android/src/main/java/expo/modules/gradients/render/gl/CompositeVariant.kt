package expo.modules.gradients.render.gl

import expo.modules.gradients.enums.GradientBlendMode
import expo.modules.gradients.render.frame.LayerUniforms

data class CompositeVariant(val kind: Int?, val sourceOver: Boolean) {
    companion object {
        val GENERIC = CompositeVariant(null, false)

        fun of(layers: Array<LayerUniforms>, count: Int): CompositeVariant {
            if (count == 0) return GENERIC
            val first = layers[0].kind
            var uniform = true
            var sourceOver = true
            for (index in 0 until count) {
                if (layers[index].kind != first) uniform = false
                if (layers[index].blend != GradientBlendMode.NORMAL.ordinal) sourceOver = false
            }
            return CompositeVariant(if (uniform) first else null, sourceOver)
        }
    }
}
