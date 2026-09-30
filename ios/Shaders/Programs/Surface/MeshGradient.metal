//
//  MeshGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 meshField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  constexpr sampler linearSampler(filter::linear, address::clamp_to_edge);
  return surface.sample(linearSampler, f.uv);
}
