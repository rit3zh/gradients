//
//  GlowGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 glowField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float pulse = 1.0 + layer.b.y * sin(layer.time * Pi);
  float d = length(f.point - layer.a.xy) / max(layer.a.z * pulse, 1e-3);
  float glow = exp(-3.0 * pow(d, 2.0 * layer.a.w));
  return sampleRamp(layer, data, d) * saturate(glow * layer.b.x);
}
