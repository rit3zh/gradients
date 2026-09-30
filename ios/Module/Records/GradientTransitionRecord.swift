//
//  GradientTransitionRecord.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

struct GradientTransitionRecord: Record {
  @Field var type: TransitionType = .timing
  @Field var duration: Double = 400
  @Field var delay: Double = 0
  @Field var easing: [Double] = [0.42, 0, 0.58, 1]
  @Field var damping: Double = 18
  @Field var stiffness: Double = 160
  @Field var mass: Double = 1
}
