//
//  FluxGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 fluxField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float aspect = f.size.x / max(f.size.y, 1.0);
  float2 q = f.uv - 0.5;
  q.x *= aspect;
  float time = layer.time;
  float swirl = simplex(float3(q * 0.8 + layer.b.xy, time * 0.08));
  q = rotate(q, swirl * Pi * layer.a.x + time * 0.05);
  float2 frequency = float2(6.0, 9.0) * layer.a.z;
  q += float2(sin(q.y * frequency.x + time * 1.6), sin(q.x * frequency.y + time * 1.6)) * float2(0.033, 0.066) * layer.a.y;
  float across = smoothstep(-0.3, 0.25, q.x + q.y * 0.1);
  float down = smoothstep(0.1, -0.25, q.y);
  return sampleRamp(layer, data, 0.5 * across + 0.5 * down);
}
