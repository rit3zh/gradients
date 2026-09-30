//
//  GradientLayerRecord.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import ExpoModulesCore

struct GradientLayerRecord: Record {
  @Field var type: GradientKind = .linear
  @Field var colors: [UIColor] = []
  @Field var stops: [Double] = []
  @Field var interpolation: ColorInterpolation = .oklab
  @Field var easing: [Double] = [0, 0, 1, 1]
  @Field var tileMode: GradientTileMode = .clamp
  @Field var blendMode: GradientBlendMode = .normal
  @Field var opacity: Double = 1

  @Field var angle: Double = 180
  @Field var start: CGPoint?
  @Field var end: CGPoint?
  @Field var center: CGPoint = CGPoint(x: 0.5, y: 0.5)
  @Field var radius: Double = 1
  @Field var shape: RadialShape = .circle
  @Field var startAngle: Double = 0
  @Field var endAngle: Double = 360

  @Field var rows: Int = 0
  @Field var columns: Int = 0
  @Field var points: [CGPoint] = []
  @Field var cells: Int = 0

  @Field var scale: Double = 1
  @Field var octaves: Double = 4
  @Field var warp: Double = 0
  @Field var smoothness: Double = 0.5
  @Field var intensity: Double = 1
  @Field var softness: Double = 0.5
  @Field var roundness: Double = 1
  @Field var width: Double = 0.2
  @Field var spread: Double = 30
  @Field var falloff: Double = 1
  @Field var power: Double = 2
  @Field var cornerRadius: Double = 0
  @Field var highlight: Double = 0
  @Field var bands: Double = 3
  @Field var period: Double = 2
  @Field var delay: Double = 0
  @Field var seed: Double = 0
  @Field var extinction: [Double] = [0.1, 0.3, 0.6]
  @Field var horizon: Double = 0.8
  @Field var fisheye: Double = 0.5

  @Field var speed: Double = 0
  @Field var spin: Double = 0
  @Field var flow: Double = 0
  @Field var drift: Double = 0
}
