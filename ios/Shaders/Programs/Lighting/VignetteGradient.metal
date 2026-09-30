//
//  VignetteGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 vignetteField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 q = abs(f.uv - layer.a.xy) * 2.0;
  float n = mix(10.0, 2.0, saturate(layer.b.x));
  float d = pow(pow(q.x, n) + pow(q.y, n), 1.0 / n);
  float t = smoothstep(layer.a.z, layer.a.z + max(layer.a.w, 1e-3), d);
  return sampleRamp(layer, data, t) * saturate(layer.b.y);
}
