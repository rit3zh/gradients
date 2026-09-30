//
//  ConicGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 conicField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 offset = f.point - layer.a.xy;
  float theta = atan2(offset.x, -offset.y);
  float t = fract((theta - layer.a.z) / Tau);
  return sampleRamp(layer, data, t);
}
