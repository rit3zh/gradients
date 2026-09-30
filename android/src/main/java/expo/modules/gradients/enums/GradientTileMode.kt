package expo.modules.gradients.enums

import expo.modules.kotlin.types.Enumerable

enum class GradientTileMode(val value: String) : Enumerable {
    CLAMP("clamp"),
    REPEAT("repeat"),
    MIRROR("mirror"),
    DECAL("decal")
}
