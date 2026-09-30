//
//  HolographicGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

static float3 prism(float phase) {
  return 0.5 + 0.5 * cos(Tau * (phase + float3(0.0, 0.33, 0.67)));
}

float4 holographicField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float minSide = max(min(f.size.x, f.size.y), 1.0);
  float2 uv = (f.point - f.size * 0.5) / minSide;
  float2 direction = float2(sin(layer.a.x), -cos(layer.a.x));
  float2 across = float2(-direction.y, direction.x);
  float time = layer.time;
  float2 tilt = f.tilt + float2(sin(time * 0.41), cos(time * 0.33)) * 0.22;

  float warp = simplex(float3(uv * 0.9 + layer.b.xy, time * 0.08)) * layer.a.w;
  float grating = dot(uv, direction) * layer.a.y + dot(tilt, float2(1.3, 0.9)) + warp * 0.35 + time * 0.03;
  float lattice = dot(uv, across) * layer.a.y * 0.6 - dot(tilt, float2(0.9, -1.2)) + warp * 0.2;

  float3 primary = prism(grating);
  float3 secondary = prism(lattice + 0.5);
  float3 spectrum = mix(primary, secondary, 0.3);

  float brushed = simplex(float3(dot(uv, across) * 3.0 + 7.31, dot(uv, direction) * 90.0 + 1.93, 1.7));
  float3 silver = float3(0.82, 0.84, 0.88) + 0.035 * brushed;

  float intensity = pow(saturate(0.5 + 0.5 * cos(Tau * (grating * 0.5 + 0.25))), 1.5);
  float3 foil = mix(silver, spectrum * 0.9 + 0.12, 0.35 + 0.4 * intensity);

  float band = dot(uv - tilt * 0.5, normalize(across + direction * 0.3));
  foil += (1.0 - foil) * exp(-band * band * 8.0) * layer.b.w;

  float2 grid = f.point / 5.0;
  float2 cell = floor(grid);
  float seed = cellHash(cell);
  float2 center = float2(cellHash(cell + 17.3), cellHash(cell.yx + 41.9)) * 0.6 + 0.2;
  float spot = saturate(1.0 - length(fract(grid) - center) * 4.0);
  float glint = pow(saturate(sin(seed * 113.0 + dot(tilt, float2(8.0, 6.0)) * 3.0 + time * 1.2)), 24.0);
  float sparkle = spot * spot * glint * step(0.86, seed) * layer.a.z;
  foil += sparkle * mix(float3(1.0), primary, 0.35);

  if (layer.b.z > 0.0) {
    float3 tint = unpremultiply(sampleRamp(layer, data, grating));
    tint = mix(silver, tint, 0.45 + 0.45 * intensity);
    foil = mix(foil, tint + sparkle, layer.b.z);
  }
  return float4(saturate(foil), 1.0);
}
