package expo.modules.gradients.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent

@SuppressLint("ViewConstructor")
class ContentLayout(
    context: Context,
    private val onContentChanged: () -> Unit
) : ViewGroup(context) {
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(
            MeasureSpec.getSize(widthMeasureSpec),
            MeasureSpec.getSize(heightMeasureSpec)
        )
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) = Unit

    override fun onViewAdded(child: View) {
        super.onViewAdded(child)
        onContentChanged()
    }

    override fun onViewRemoved(child: View) {
        super.onViewRemoved(child)
        onContentChanged()
    }

    override fun onDescendantInvalidated(child: View, target: View) {
        super.onDescendantInvalidated(child, target)
        onContentChanged()
    }

    @Deprecated("Deprecated in Java")
    @Suppress("DEPRECATION")
    override fun invalidateChildInParent(location: IntArray, dirty: Rect): ViewParent? {
        onContentChanged()
        return super.invalidateChildInParent(location, dirty)
    }
}
