//
//  InterlaceGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 interlaceField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float aspect = f.size.x / max(f.size.y, 1.0);
  float2 p = float2((f.uv.x * 2.0 - 1.0) * aspect, 1.0 - f.uv.y * 2.0);
  p = rotate(p, -layer.a.x);

  float sheet = (p.y * p.y * p.x - p.x) * layer.a.y;
  float4 base = sampleRamp(layer, data, sheet / Tau - layer.time * 0.04);
  float3 bright = unpremultiply(base);
  float3 dim = bright * bright * 0.84;

  float spacing = 1.0 / max(layer.a.z, 1.0);
  float row = floor(p.y / spacing + 0.5);
  float offset = p.y - row * spacing;
  float pixel = 3.0 / max(f.size.y, 1.0);
  float edge = smoothstep(0.0, -pixel, offset);
  if (fmod(abs(row), 2.0) < 0.5) {
    edge = 1.0 - edge;
  }

  float3 color = mix(bright, dim, edge * layer.a.w);
  return float4(color * base.a, base.a);
}
