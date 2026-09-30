package expo.modules.gradients.render

data class RenderOptions(
    val tiltX: Float = 0f,
    val tiltY: Float = 0f,
    val dither: Boolean = true,
    val grain: Float = 0f,
    val maskMode: Int = MASK_NONE,
    val borderWidth: Float = 0f,
    val borderRadius: Float = 0f
) {
    companion object {
        const val MASK_NONE = 0
        const val MASK_CONTENT = 1
        const val MASK_BORDER = 2
    }
}
