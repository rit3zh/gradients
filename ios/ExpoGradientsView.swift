import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class ExpoGradientsView: ExpoView {
  let label = UILabel()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    backgroundColor = UIColor(red: 0.67, green: 0.73, blue: 0.80, alpha: 1.0)
    label.text = "ExpoGradients - native view"
    label.textAlignment = .center
    label.numberOfLines = 0
    label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(label)
  }
}
