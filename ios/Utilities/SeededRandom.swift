//
//  SeededRandom.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Foundation

struct SeededRandom: RandomNumberGenerator {
  private var state: UInt64

  init(seed: Double) {
    state = UInt64(bitPattern: Int64(seed * 1_000_003)) &+ 0x9E37_79B9_7F4A_7C15
  }

  mutating func next() -> UInt64 {
    state &+= 0x9E37_79B9_7F4A_7C15
    var value = state
    value = (value ^ (value >> 30)) &* 0xBF58_476D_1CE4_E5B9
    value = (value ^ (value >> 27)) &* 0x94D0_49BB_1331_11EB
    return value ^ (value >> 31)
  }

  mutating func unit() -> Double {
    Double(next() >> 11) / Double(1 << 53)
  }
}
