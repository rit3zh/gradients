package expo.modules.gradients.color

import expo.modules.gradients.enums.ColorInterpolation
import kotlin.math.cbrt
import kotlin.math.pow

object ColorSpace {
    fun linearize(value: Float): Float =
        if (value <= 0.04045f) value / 12.92f else ((value + 0.055f) / 1.055f).pow(2.4f)

    fun gamma(value: Float): Float {
        val clamped = value.coerceIn(0f, 1f)
        return if (clamped <= 0.0031308f) clamped * 12.92f else 1.055f * clamped.pow(1f / 2.4f) - 0.055f
    }

    fun fromArgb(argb: Int): Rgba {
        val alpha = ((argb ushr 24) and 0xFF) / 255f
        val red = ((argb ushr 16) and 0xFF) / 255f
        val green = ((argb ushr 8) and 0xFF) / 255f
        val blue = (argb and 0xFF) / 255f
        return Rgba(linearize(red), linearize(green), linearize(blue), alpha)
    }

    fun encode(color: Rgba, space: ColorInterpolation): Rgba {
        val encoded = when (space) {
            ColorInterpolation.SRGB -> Triple(gamma(color.r), gamma(color.g), gamma(color.b))
            ColorInterpolation.LINEAR -> Triple(color.r, color.g, color.b)
            ColorInterpolation.OKLAB -> oklab(color.r, color.g, color.b)
        }
        return Rgba(encoded.first * color.a, encoded.second * color.a, encoded.third * color.a, color.a)
    }

    fun decode(premultiplied: Rgba, space: ColorInterpolation): Rgba {
        val alpha = premultiplied.a
        if (alpha <= 0.00001f) return Rgba.CLEAR
        val x = premultiplied.r / alpha
        val y = premultiplied.g / alpha
        val z = premultiplied.b / alpha
        val linear = when (space) {
            ColorInterpolation.SRGB -> Triple(
                linearize(x.coerceIn(0f, 1f)),
                linearize(y.coerceIn(0f, 1f)),
                linearize(z.coerceIn(0f, 1f))
            )
            ColorInterpolation.LINEAR -> Triple(x, y, z)
            ColorInterpolation.OKLAB -> linearFromOklab(x, y, z)
        }
        return Rgba(linear.first, linear.second, linear.third, alpha)
    }

    fun output(linear: Rgba): Rgba {
        val alpha = linear.a.coerceIn(0f, 1f)
        return Rgba(gamma(linear.r) * alpha, gamma(linear.g) * alpha, gamma(linear.b) * alpha, alpha)
    }

    private fun oklab(r: Float, g: Float, b: Float): Triple<Float, Float, Float> {
        val l = cbrt(0.4122214708f * r + 0.5363325363f * g + 0.0514459929f * b)
        val m = cbrt(0.2119034982f * r + 0.6806995451f * g + 0.1073969566f * b)
        val s = cbrt(0.0883024619f * r + 0.2817188376f * g + 0.6299787005f * b)
        return Triple(
            0.2104542553f * l + 0.7936177850f * m - 0.0040720468f * s,
            1.9779984951f * l - 2.4285922050f * m + 0.4505937099f * s,
            0.0259040371f * l + 0.7827717662f * m - 0.8086757660f * s
        )
    }

    private fun linearFromOklab(lightness: Float, a: Float, b: Float): Triple<Float, Float, Float> {
        val l = lightness + 0.3963377774f * a + 0.2158037573f * b
        val m = lightness - 0.1055613458f * a - 0.0638541728f * b
        val s = lightness - 0.0894841775f * a - 1.2914855480f * b
        val l3 = l * l * l
        val m3 = m * m * m
        val s3 = s * s * s
        return Triple(
            4.0767416621f * l3 - 3.3077115913f * m3 + 0.2309699292f * s3,
            -1.2684380046f * l3 + 2.6097574011f * m3 - 0.3413193965f * s3,
            -0.0041960863f * l3 - 0.7034186147f * m3 + 1.7076147010f * s3
        )
    }
}
