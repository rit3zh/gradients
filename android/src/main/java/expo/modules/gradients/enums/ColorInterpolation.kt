package expo.modules.gradients.enums

import expo.modules.kotlin.types.Enumerable

enum class ColorInterpolation(val value: String) : Enumerable {
    SRGB("srgb"),
    LINEAR("linear"),
    OKLAB("oklab")
}
