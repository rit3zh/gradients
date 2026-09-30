//
//  DiamondGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 diamondField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 q = rotate(f.point - layer.a.xy, -layer.b.x);
  float2 radii = max(layer.a.zw, float2(1e-3));
  float t = abs(q.x) / radii.x + abs(q.y) / radii.y;
  return sampleRamp(layer, data, t);
}
