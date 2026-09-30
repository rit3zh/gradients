package expo.modules.gradients.render

data class RenderTarget(
    val width: Float,
    val height: Float,
    val bufferWidth: Int,
    val bufferHeight: Int
) {
    val isRenderable: Boolean
        get() = width >= 1f && height >= 1f && bufferWidth > 0 && bufferHeight > 0
}
