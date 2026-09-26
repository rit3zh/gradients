package expo.modules.gradients

import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class ExpoGradientsView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  init {
    val container = LinearLayout(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(Color.parseColor("#aabbcc"))
    }
    val label = TextView(context).apply {
      text = "ExpoGradients - native view"
      gravity = Gravity.CENTER
    }
    container.addView(label)
    addView(container)
  }
}
