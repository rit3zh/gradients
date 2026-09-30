//
//  RadialGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 radialField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 radii = max(layer.a.zw, float2(1e-3));
  float t = length((f.point - layer.a.xy) / radii);
  return sampleRamp(layer, data, t);
}
