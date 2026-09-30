Pod::Spec.new do |s|
  s.name           = 'ExpoGradients'
  s.version        = '0.1.0'
  s.summary        = 'One package. Every gradient. Static or animated.'
  s.description    = 'Linear, radial, conic, mesh, procedural and lighting gradients for Expo, rendered with Metal.'
  s.author         = 'rit3zh'
  s.homepage       = 'https://github.com/rit3zh/expo-gradients'
  s.license        = 'MIT'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: 'https://github.com/rit3zh/expo-gradients.git' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.frameworks = 'Metal', 'QuartzCore', 'CoreMotion', 'UIKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.exclude_files = "Shaders/**/*.h"
  s.preserve_paths = "Shaders/**/*"
  s.resource_bundles = {
    'ExpoGradientsShaders' => ['Shaders/**/*.metal']
  }
end
