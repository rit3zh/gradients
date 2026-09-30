//
//  VoronoiGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 voronoiField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float minSide = max(min(f.size.x, f.size.y), 1.0);
  float nearest = 1e9;
  for (int i = 0; i < layer.count; i++) {
    nearest = min(nearest, length((f.point - data[layer.data + i].xy) / minSide));
  }
  float4 sum = float4(0.0);
  float total = 0.0;
  for (int i = 0; i < layer.count; i++) {
    float d = length((f.point - data[layer.data + i].xy) / minSide);
    float weight = exp(-(d - nearest) * layer.a.x);
    sum += weight * data[layer.data + layer.count + i];
    total += weight;
  }
  return resolveColor(sum / max(total, 1e-6), layer.space);
}
