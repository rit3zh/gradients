//
//  NoiseGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 noiseField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 p = f.point / max(min(f.size.x, f.size.y), 1.0) * layer.a.x + layer.b.xy;
  float z = layer.time * 0.25;
  if (layer.a.z > 0.0) {
    float2 q = float2(fbm(float3(p, z), 2.0), fbm(float3(p + float2(5.2, 1.3), z), 2.0));
    p += q * layer.a.z;
  }
  float n = fbm(float3(p, z), layer.a.y);
  float t = saturate(0.5 + 0.5 * n * layer.a.w);
  return sampleRamp(layer, data, t);
}
