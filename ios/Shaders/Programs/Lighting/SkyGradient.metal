//
//  SkyGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 skyField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 lens = (f.point - f.size * 0.5) / max(f.size.y, 1.0);
  lens.y = -lens.y;
  float3 ray = normalize(float3(lens, layer.a.x - dot(lens, lens) * layer.a.y));

  float3 forward = normalize(float3(0.0, layer.a.z, 1.0));
  float3 right = normalize(cross(float3(0.0, 1.0, 0.0), forward));
  float3 up = cross(forward, right);
  ray = ray.x * right + ray.y * up + ray.z * forward;

  float4 tint = sampleRamp(layer, data, 0.0);
  float3 tintLight = pow(unpremultiply(tint), float3(2.2));
  float3 light = exp2(-ray.y / max(layer.b.xyz, float3(1e-3))) * tintLight;
  float3 color = pow(saturate(light), float3(1.0 / 2.2));
  return float4(color * tint.a, tint.a);
}
