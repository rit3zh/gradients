//
//  CompositeVariant.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Metal

struct CompositeVariant: Hashable {
  static let generic = CompositeVariant(kind: nil, sourceOver: false)

  let kind: Int32?
  let sourceOver: Bool

  init(kind: Int32?, sourceOver: Bool) {
    self.kind = kind
    self.sourceOver = sourceOver
  }

  init(layers: [LayerUniforms]) {
    guard let first = layers.first else {
      self = .generic
      return
    }
    kind = layers.allSatisfy { $0.kind == first.kind } ? first.kind : nil
    sourceOver = layers.allSatisfy { $0.blend == GradientBlendMode.normal.index }
  }

  var constantValues: MTLFunctionConstantValues {
    let values = MTLFunctionConstantValues()
    if var kind {
      values.setConstantValue(&kind, type: .int, index: 0)
    }
    if sourceOver {
      var enabled = true
      values.setConstantValue(&enabled, type: .bool, index: 1)
    }
    return values
  }
}
