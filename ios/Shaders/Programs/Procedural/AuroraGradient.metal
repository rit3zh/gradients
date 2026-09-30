//
//  AuroraGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 auroraField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float aspect = f.size.x / max(f.size.y, 1.0);
  float time = layer.time;
  float bands = layer.a.y;
  float3 light = float3(0.0);
  for (int i = 0; i < 6; i++) {
    float weight = saturate(bands - float(i));
    if (weight <= 0.0) {
      break;
    }
    float index = float(i) + layer.b.x;
    float x = f.uv.x * aspect * layer.a.x;
    float base = 0.28 + 0.44 * (float(i) + 0.5) / max(bands, 1.0);
    float wave = 0.11 * simplex(float3(x * 0.7 + index * 3.1, index * 1.7, time * 0.12))
               + 0.035 * sin(x * 2.3 + time * 0.35 + index * 1.3);
    float dy = (base + wave) - f.uv.y;
    float height = 0.16 + 0.08 * simplex(float3(x * 1.1, index, time * 0.08));
    float body = dy > 0.0 ? exp(-dy / max(height, 0.02)) : exp(-dy * dy * 700.0 * layer.a.w);
    float rays = 0.55 + 0.45 * simplex(float3(x * 13.0 + index * 11.0, time * 0.3, index));
    float glow = body * mix(1.0, rays, 0.75) * weight;
    float hue = (float(i) + 0.5) / max(bands, 1.0) + 0.18 * simplex(float3(x * 0.5, time * 0.1, index * 2.0));
    float4 color = sampleRamp(layer, data, hue);
    light += color.rgb * glow;
  }
  light = 1.0 - exp(-light * layer.a.z * 1.6);
  float alpha = saturate(max(light.r, max(light.g, light.b)));
  return float4(min(light, float3(alpha)), alpha);
}
