//
//  FreeformGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 freeformField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float minSide = max(min(f.size.x, f.size.y), 1.0);
  float4 sum = float4(0.0);
  float total = 0.0;
  for (int i = 0; i < layer.count; i++) {
    float2 site = data[layer.data + i].xy;
    float d = length_squared((f.point - site) / minSide) + layer.a.y;
    float weight = pow(d, -layer.a.x * 0.5);
    sum += weight * data[layer.data + layer.count + i];
    total += weight;
  }
  return resolveColor(sum / max(total, 1e-6), layer.space);
}
