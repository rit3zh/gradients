//
//  SpotlightGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 spotlightField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 offset = f.point - layer.a.xy;
  float reach = length(offset);
  float2 direction = float2(sin(layer.a.z), -cos(layer.a.z));
  float angle = acos(clamp(dot(offset, direction) / max(reach, 1e-3), -1.0, 1.0));
  float edge = layer.a.w;
  float soft = max(layer.b.y * edge, 1e-3);
  float cone = 1.0 - smoothstep(edge - soft, edge + soft, angle);
  float t = reach / max(layer.b.x, 1.0);
  float attenuation = pow(saturate(1.0 - t), 1.6);
  float core = exp(-t * t * 60.0) * 0.6;
  return sampleRamp(layer, data, t) * saturate((cone * attenuation + core) * layer.b.z);
}
