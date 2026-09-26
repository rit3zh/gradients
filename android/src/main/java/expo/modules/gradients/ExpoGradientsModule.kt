package expo.modules.gradients

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoGradientsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoGradients")

    View(ExpoGradientsView::class) {
    }
  }
}
