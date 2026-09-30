//
//  SmokeGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 smokeField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float minSide = max(min(f.size.x, f.size.y), 1.0);
  float2 p = (2.0 * f.point - f.size) / minSide * layer.a.x;
  float time = layer.time;
  float strength = layer.a.y;
  for (int i = 1; i < 9; i++) {
    float octave = float(i);
    float2 swirl = float2(
      sin(octave * p.y + time + 0.4 * octave),
      cos(octave * p.x + time * 0.9 + 0.3 * (octave + 7.0))
    );
    p += swirl * (strength / octave) + float2(0.8, -1.1);
  }
  float plume = 0.5 + 0.5 * sin(p.x + p.y);
  float density = saturate(1.0 - sin(p.y));
  float t = mix(plume, density, 0.45);
  return sampleRamp(layer, data, t);
}
