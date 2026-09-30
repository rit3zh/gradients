package expo.modules.gradients.views

import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Log
import android.view.View
import kotlin.math.max
import kotlin.math.roundToInt

object MaskCapture {
    private const val TAG = "ExpoGradients"
    private const val MAX_EDGE = 2048f

    fun capture(content: View, width: Int, height: Int): Bitmap? {
        if (width <= 0 || height <= 0) return null
        val scale = minOf(1f, MAX_EDGE / max(width, height))
        val bitmapWidth = max((width * scale).roundToInt(), 1)
        val bitmapHeight = max((height * scale).roundToInt(), 1)
        val bitmap = runCatching {
            Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ALPHA_8)
        }.getOrNull() ?: return null

        return runCatching {
            val canvas = Canvas(bitmap)
            canvas.scale(scale, scale)
            content.draw(canvas)
            bitmap
        }.getOrElse {
            Log.w(TAG, "Unable to capture gradient mask content", it)
            bitmap.recycle()
            null
        }
    }
}
