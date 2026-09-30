//
//  GradientShaders.h
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#ifndef GradientShaders_h
#define GradientShaders_h

#include <metal_stdlib>
using namespace metal;

enum GradientKind : int {
  GradientKindLinear = 0,
  GradientKindRadial = 1,
  GradientKindConic = 2,
  GradientKindSweep = 3,
  GradientKindDiamond = 4,
  GradientKindReflected = 5,
  GradientKindMesh = 6,
  GradientKindFreeform = 7,
  GradientKindBilinear = 8,
  GradientKindNoise = 9,
  GradientKindVoronoi = 10,
  GradientKindGlow = 11,
  GradientKindSpotlight = 12,
  GradientKindVignette = 13,
  GradientKindAurora = 14,
  GradientKindLiquid = 15,
  GradientKindIridescent = 16,
  GradientKindWave = 17,
  GradientKindSilk = 18,
  GradientKindSmoke = 19,
  GradientKindRibbon = 20,
  GradientKindFlux = 21,
  GradientKindHolographic = 22,
  GradientKindInterlace = 23,
  GradientKindSky = 24,
  GradientKindStrata = 25,
};

constant int RampResolution = 256;
constant float Tau = 6.28318530718;
constant float Pi = 3.14159265359;

struct FrameUniforms {
  float2 size;
  float2 tilt;
  float time;
  float scale;
  float dither;
  float grain;
  int layerCount;
  int padding0;
  int padding1;
  int padding2;
};

struct GradientLayer {
  float4 a;
  float4 b;
  float4 c;
  float4 d;
  float2 range;
  float opacity;
  float time;
  float phase;
  int kind;
  int blend;
  int tile;
  int space;
  int ramp;
  int data;
  int count;
  int surface;
  int flags;
  int reserved;
};

struct Fragment {
  float2 uv;
  float2 point;
  float2 size;
  float2 tilt;
};

inline float2 rotate(float2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return float2(c * p.x - s * p.y, s * p.x + c * p.y);
}

inline float tileValue(float t, int tile) {
  switch (tile) {
    case 1:
      return fract(t);
    case 2:
      return 1.0 - abs(fract(t * 0.5) * 2.0 - 1.0);
    default:
      return t;
  }
}

inline float4 sampleRamp(constant GradientLayer &layer, constant float4 *data, float t) {
  float span = max(layer.range.y - layer.range.x, 1e-5);
  float x = (t + layer.phase - layer.range.x) / span;
  if (layer.tile == 3 && (x < 0.0 || x > 1.0)) {
    return float4(0.0);
  }
  x = saturate(tileValue(x, layer.tile));
  float position = x * float(RampResolution - 1);
  int index = min(int(position), RampResolution - 2);
  return mix(data[layer.ramp + index], data[layer.ramp + index + 1], position - float(index));
}

inline float3 srgbEncode(float3 c) {
  c = saturate(c);
  return select(1.055 * pow(c, float3(1.0 / 2.4)) - 0.055, c * 12.92, c <= 0.0031308);
}

inline float3 oklabToLinear(float3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return float3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

inline float4 resolveColor(float4 premultiplied, int space) {
  float alpha = saturate(premultiplied.a);
  if (alpha <= 1e-5) {
    return float4(0.0);
  }
  float3 value = premultiplied.rgb / premultiplied.a;
  float3 encoded = space == 0 ? saturate(value) : srgbEncode(space == 1 ? value : oklabToLinear(value));
  return float4(encoded * alpha, alpha);
}

inline float hash(float2 p) {
  float3 q = fract(float3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

inline float cellHash(float2 cell) {
  float2 q = fract(cell * float2(0.1031, 0.1030) + float2(0.217, 0.613));
  q += dot(q, q.yx + 19.19);
  return fract((q.x + q.y) * q.y * 3.7 + sin(dot(cell, float2(12.9898, 78.233))) * 0.5);
}

inline float interleavedNoise(float2 p) {
  return fract(52.9829189 * fract(dot(p, float2(0.06711056, 0.00583715))));
}

inline float3 thinFilm(float phase) {
  return 0.5 - 0.5 * cos(Tau * phase * float3(1.0, 1.226, 1.413));
}

inline float3 unpremultiply(float4 color) {
  return color.rgb / max(color.a, 1e-4);
}

float simplex(float3 v);
float fbm(float3 p, float octaves);

float4 conicField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 diamondField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 linearField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 radialField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 reflectedField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 sweepField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 glowField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 spotlightField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 vignetteField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 bilinearField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 freeformField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 meshField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 voronoiField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 auroraField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 iridescentField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 liquidField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 noiseField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 waveField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 silkField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 smokeField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 ribbonField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 fluxField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 holographicField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 interlaceField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 skyField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);
float4 strataField(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface);

#endif
