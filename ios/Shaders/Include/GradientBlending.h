//
//  GradientBlending.h
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#ifndef GradientBlending_h
#define GradientBlending_h

#include "GradientShaders.h"

inline float luminance(float3 c) {
  return dot(c, float3(0.3, 0.59, 0.11));
}

inline float3 clipColor(float3 c) {
  float l = luminance(c);
  float lowest = min(c.r, min(c.g, c.b));
  float highest = max(c.r, max(c.g, c.b));
  if (lowest < 0.0) {
    c = l + (c - l) * l / max(l - lowest, 1e-5);
  }
  if (highest > 1.0) {
    c = l + (c - l) * (1.0 - l) / max(highest - l, 1e-5);
  }
  return c;
}

inline float3 setLuminance(float3 c, float l) {
  return clipColor(c + (l - luminance(c)));
}

inline float saturation(float3 c) {
  return max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
}

inline float3 setSaturation(float3 c, float s) {
  float lowest = min(c.r, min(c.g, c.b));
  float range = max(c.r, max(c.g, c.b)) - lowest;
  return range > 1e-5 ? (c - lowest) * s / range : float3(0.0);
}

inline float3 softLightChannel(float3 b, float3 s) {
  float3 d = select(sqrt(b), ((16.0 * b - 12.0) * b + 4.0) * b, b <= 0.25);
  return select(b + (2.0 * s - 1.0) * (d - b), b - (1.0 - 2.0 * s) * b * (1.0 - b), s <= 0.5);
}

inline float3 hardLightChannel(float3 b, float3 s) {
  float3 screen = b + (2.0 * s - 1.0) - b * (2.0 * s - 1.0);
  return select(screen, b * 2.0 * s, s <= 0.5);
}

inline float3 blendChannels(float3 b, float3 s, int mode) {
  switch (mode) {
    case 1: return b * s;
    case 2: return b + s - b * s;
    case 3: return hardLightChannel(s, b);
    case 4: return min(b, s);
    case 5: return max(b, s);
    case 6: return select(select(min(1.0, b / max(1.0 - s, 1e-5)), float3(1.0), s >= 1.0), float3(0.0), b <= 0.0);
    case 7: return select(select(1.0 - min(1.0, (1.0 - b) / max(s, 1e-5)), float3(0.0), s <= 0.0), float3(1.0), b >= 1.0);
    case 8: return hardLightChannel(b, s);
    case 9: return softLightChannel(b, s);
    case 10: return abs(b - s);
    case 11: return b + s - 2.0 * b * s;
    case 12: return setLuminance(setSaturation(s, saturation(b)), luminance(b));
    case 13: return setLuminance(setSaturation(b, saturation(s)), luminance(b));
    case 14: return setLuminance(s, luminance(b));
    case 15: return setLuminance(b, luminance(s));
    case 17: return max(b + s - 1.0, 0.0);
    default: return s;
  }
}

inline float4 composite(float4 backdrop, float4 source, int mode) {
  if (source.a <= 0.0) {
    return backdrop;
  }
  if (mode == 16) {
    return min(backdrop + source, float4(1.0));
  }
  if (mode == 0 || backdrop.a <= 0.0) {
    return source + backdrop * (1.0 - source.a);
  }
  float3 cb = backdrop.rgb / backdrop.a;
  float3 cs = source.rgb / source.a;
  float3 mixed = saturate(blendChannels(cb, cs, mode));
  float3 rgb = source.rgb * (1.0 - backdrop.a) + backdrop.rgb * (1.0 - source.a) + source.a * backdrop.a * mixed;
  return float4(rgb, source.a + backdrop.a * (1.0 - source.a));
}

#endif
