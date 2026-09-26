import ExpoModulesCore

public class ExpoGradientsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoGradients")

    View(ExpoGradientsView.self) {
    }
  }
}
