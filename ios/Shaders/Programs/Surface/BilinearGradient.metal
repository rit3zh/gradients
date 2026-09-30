//
//  BilinearGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 bilinearField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 uv = saturate(f.uv);
  float2 eased = uv * uv * (3.0 - 2.0 * uv);
  float2 w = mix(uv, eased, layer.a.x);
  float4 top = mix(data[layer.data], data[layer.data + 1], w.x);
  float4 bottom = mix(data[layer.data + 2], data[layer.data + 3], w.x);
  return resolveColor(mix(top, bottom, w.y), layer.space);
}
