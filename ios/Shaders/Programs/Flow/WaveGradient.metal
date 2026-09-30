//
//  WaveGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 waveField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 q = rotate(f.uv - 0.5, -layer.b.x) + 0.5;
  float time = layer.time;
  float crest = q.x * Pi * layer.a.x;
  float swell = 0.0;
  for (int i = 1; i <= 4; i++) {
    float octave = float(i);
    float frequency = 0.45 + 0.3 * octave;
    float drift = 0.22 + 0.17 * octave;
    swell += sin(crest * frequency + time * drift + octave * 1.9) * (layer.a.y / octave);
  }
  float height = saturate(q.y + swell);
  float t = mix(height, height * height * (3.0 - 2.0 * height), layer.a.z);
  float4 color = sampleRamp(layer, data, t);
  float ripple = sin(q.x * Tau + time * 0.9) * cos(q.y * 4.3 + time * 0.6) * 0.025;
  color.rgb = clamp(color.rgb + ripple * color.a, 0.0, color.a);
  return color;
}
