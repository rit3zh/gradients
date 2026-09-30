//
//  ReflectedGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 reflectedField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 origin = layer.a.xy;
  float2 axis = layer.a.zw - origin;
  float offset = dot(f.point - origin, axis) / max(dot(axis, axis), 1e-5) - layer.b.y;
  float knee = max(layer.b.x, 1e-4);
  float fold = sqrt(offset * offset + knee * knee) - knee;
  float reach = sqrt(1.0 + knee * knee) - knee;
  return sampleRamp(layer, data, fold / reach);
}
