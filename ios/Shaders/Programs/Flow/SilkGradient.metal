//
//  SilkGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 silkField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 p = (f.point * 2.0 - f.size) / max(f.size, float2(1.0)) * layer.a.x;
  float damping = 0.92 / (1.0 + layer.a.x * 0.12);
  float phase = -layer.time * 0.45;
  float fold = 0.0;
  for (int i = 0; i < 7; i++) {
    float lane = float(i) * 1.1;
    fold += cos(lane - phase - fold * p.x) * damping;
    phase += sin(p.y * lane * 0.9 + fold) * damping;
  }
  phase += layer.time * 0.45;
  float3 weave = 0.5 + 0.5 * float3(
    cos(p.x * phase + fold),
    cos(p.y * fold + phase),
    cos((p.x - p.y) * (phase + fold) * 0.5)
  );
  float t = dot(weave, float3(0.45, 0.35, 0.2));
  float4 color = sampleRamp(layer, data, t);
  float sheen = pow(saturate(weave.z), 3.0) * layer.a.y;
  color.rgb += (color.a - color.rgb) * saturate(sheen);
  return color;
}
