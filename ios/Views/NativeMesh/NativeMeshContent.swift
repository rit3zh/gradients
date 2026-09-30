//
//  NativeMeshContent.swift
//  Pods
//
//  Created by rit3zh CX on 9/28/26.
//

import SwiftUI

final class NativeMeshModel: ObservableObject {
  @Published var configuration = NativeMeshConfiguration()
}

@available(iOS 18.0, *)
struct NativeMeshContent: View {
  @ObservedObject var model: NativeMeshModel

  var body: some View {
    let configuration = model.configuration
    MeshGradient(
      width: configuration.columns,
      height: configuration.rows,
      points: configuration.points,
      colors: configuration.colors.map { Color(uiColor: $0) },
      background: Color(uiColor: configuration.background),
      smoothsColors: configuration.smoothsColors,
      colorSpace: configuration.colorSpace == .perceptual ? .perceptual : .device
    )
    .ignoresSafeArea()
  }
}
