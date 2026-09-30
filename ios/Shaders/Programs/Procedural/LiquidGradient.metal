//
//  LiquidGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 liquidField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 p = f.point / max(min(f.size.x, f.size.y), 1.0) * layer.a.x + layer.b.xy;
  float t = layer.time * 0.12;
  float warp = layer.a.y;
  float2 q = float2(fbm(float3(p, t), 3.0), fbm(float3(p + float2(5.2, 1.3), t), 3.0));
  float2 r = float2(
    fbm(float3(p + warp * q + float2(1.7, 9.2), t * 1.3), 3.0),
    fbm(float3(p + warp * q + float2(8.3, 2.8), t * 1.3), 3.0)
  );
  float n = fbm(float3(p + warp * r, t * 0.7), 3.0);
  float value = saturate(0.5 + 0.5 * (n * 1.5 + 0.4 * length(q) - 0.25));
  float4 color = sampleRamp(layer, data, value);
  float sheen = pow(saturate(0.5 + 0.5 * (r.x - r.y) * 1.8), 8.0) * layer.a.z;
  color.rgb += (color.a - color.rgb) * sheen;
  return color;
}
