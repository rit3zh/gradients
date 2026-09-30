//
//  IridescentGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 iridescentField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float minSide = max(min(f.size.x, f.size.y), 1.0);
  float2 uv = (f.point - f.size * 0.5) / minSide;
  float2 direction = float2(sin(layer.a.x), -cos(layer.a.x));
  float2 across = float2(-direction.y, direction.x);
  float time = layer.time;
  float2 tilt = f.tilt + float2(sin(time * 0.37), cos(time * 0.29)) * 0.16;

  float2 drift = uv * 0.65 + layer.b.xy;
  float flow = simplex(float3(drift, time * 0.1)) * 0.7 + simplex(float3(drift * 2.1 + 4.3, time * 0.14)) * 0.3;
  float2 lens = uv - tilt * 0.35;
  float facing = saturate(1.0 - 0.5 * dot(lens, lens));

  float sweep = dot(uv, direction) * layer.a.y * 0.6;
  float thickness = 1.2 + sweep + flow * layer.a.w * 0.35 + dot(tilt, float2(0.5, 0.35));
  float phase = thickness * (0.72 + 0.28 * facing);

  float3 film = thinFilm(phase);
  float3 pearl = mix(float3(0.95, 0.94, 0.98), film, 0.55);
  pearl = mix(pearl, film * film + 0.35, 0.18);

  float band = dot(uv - tilt * 0.45, across);
  float sheen = exp(-band * band * 4.0) * layer.a.z;
  float rim = pow(saturate(1.0 - facing), 2.0) * 0.25;
  float3 color = pearl + (1.0 - pearl) * (sheen * 0.6 + rim);

  if (layer.b.z > 0.0) {
    float3 tint = unpremultiply(sampleRamp(layer, data, phase * 0.5));
    tint *= 0.8 + 0.3 * dot(film, float3(0.3333));
    color = mix(color, tint + (1.0 - tint) * sheen * 0.5, layer.b.z);
  }
  return float4(saturate(color), 1.0);
}
