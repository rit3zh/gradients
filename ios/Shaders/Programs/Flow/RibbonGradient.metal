//
//  RibbonGradient.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../../Include/GradientShaders.h"

float4 ribbonField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  float2 p = (f.point * 2.0 - f.size) / max(f.size.x + f.size.y, 1.0) * 2.0 * layer.b.x;
  float2 q = rotate(p, -layer.a.x);
  float time = layer.time * 0.7;
  float twist = sin(q.x * 1.3 + time) * 1.2 + sin(q.x * 0.7 - time * 0.6) * 0.8;
  float band = q.y * layer.a.y + twist;
  float t = band / max(layer.a.z, 1.0);
  float4 color = sampleRamp(layer, data, t);
  float crease = sin(fract(band) * Pi);
  float shade = mix(1.0 - layer.a.w * 0.35, 1.0 + layer.a.w * 0.12, crease);
  color.rgb = clamp(color.rgb * shade, 0.0, color.a);
  return color;
}
