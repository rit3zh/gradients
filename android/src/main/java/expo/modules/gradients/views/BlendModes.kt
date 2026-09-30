package expo.modules.gradients.views

import android.graphics.BlendMode
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.os.Build
import expo.modules.gradients.enums.GradientBlendMode

object BlendModes {
    fun paint(mode: GradientBlendMode): Paint? {
        if (mode == GradientBlendMode.NORMAL) return null
        return Paint().apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                blendMode = platform(mode)
            } else {
                legacy(mode)?.let { xfermode = PorterDuffXfermode(it) }
            }
        }
    }

    private fun platform(mode: GradientBlendMode): BlendMode? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        when (mode) {
            GradientBlendMode.NORMAL -> BlendMode.SRC_OVER
            GradientBlendMode.MULTIPLY -> BlendMode.MULTIPLY
            GradientBlendMode.SCREEN -> BlendMode.SCREEN
            GradientBlendMode.OVERLAY -> BlendMode.OVERLAY
            GradientBlendMode.DARKEN -> BlendMode.DARKEN
            GradientBlendMode.LIGHTEN -> BlendMode.LIGHTEN
            GradientBlendMode.COLOR_DODGE -> BlendMode.COLOR_DODGE
            GradientBlendMode.COLOR_BURN -> BlendMode.COLOR_BURN
            GradientBlendMode.HARD_LIGHT -> BlendMode.HARD_LIGHT
            GradientBlendMode.SOFT_LIGHT -> BlendMode.SOFT_LIGHT
            GradientBlendMode.DIFFERENCE -> BlendMode.DIFFERENCE
            GradientBlendMode.EXCLUSION -> BlendMode.EXCLUSION
            GradientBlendMode.HUE -> BlendMode.HUE
            GradientBlendMode.SATURATION -> BlendMode.SATURATION
            GradientBlendMode.COLOR -> BlendMode.COLOR
            GradientBlendMode.LUMINOSITY -> BlendMode.LUMINOSITY
            GradientBlendMode.PLUS_LIGHTER -> BlendMode.PLUS
            GradientBlendMode.PLUS_DARKER -> BlendMode.MULTIPLY
        }
    } else {
        null
    }

    private fun legacy(mode: GradientBlendMode): PorterDuff.Mode? = when (mode) {
        GradientBlendMode.MULTIPLY, GradientBlendMode.PLUS_DARKER -> PorterDuff.Mode.MULTIPLY
        GradientBlendMode.SCREEN -> PorterDuff.Mode.SCREEN
        GradientBlendMode.OVERLAY -> PorterDuff.Mode.OVERLAY
        GradientBlendMode.DARKEN -> PorterDuff.Mode.DARKEN
        GradientBlendMode.LIGHTEN -> PorterDuff.Mode.LIGHTEN
        GradientBlendMode.PLUS_LIGHTER -> PorterDuff.Mode.ADD
        else -> null
    }
}
