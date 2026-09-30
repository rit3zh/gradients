//
//  LinearGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 linearField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 start = layer.a.xy;
  float2 axis = layer.a.zw - start;
  float t = dot(f.point - start, axis) / max(dot(axis, axis), 1e-5);
  return sampleRamp(layer, data, t);
}
