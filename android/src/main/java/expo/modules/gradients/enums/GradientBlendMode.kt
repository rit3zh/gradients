package expo.modules.gradients.enums

import expo.modules.kotlin.types.Enumerable

enum class GradientBlendMode(val value: String) : Enumerable {
    NORMAL("normal"),
    MULTIPLY("multiply"),
    SCREEN("screen"),
    OVERLAY("overlay"),
    DARKEN("darken"),
    LIGHTEN("lighten"),
    COLOR_DODGE("colorDodge"),
    COLOR_BURN("colorBurn"),
    HARD_LIGHT("hardLight"),
    SOFT_LIGHT("softLight"),
    DIFFERENCE("difference"),
    EXCLUSION("exclusion"),
    HUE("hue"),
    SATURATION("saturation"),
    COLOR("color"),
    LUMINOSITY("luminosity"),
    PLUS_LIGHTER("plusLighter"),
    PLUS_DARKER("plusDarker")
}
