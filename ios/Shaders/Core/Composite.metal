//
//  Composite.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../Include/GradientShaders.h"
#include "../Include/GradientBlending.h"

constant int KindConstant [[function_constant(0)]];
constant bool HasKindConstant = is_function_constant_defined(KindConstant);
constant bool SourceOverConstant [[function_constant(1)]];
constant bool HasSourceOverConstant = is_function_constant_defined(SourceOverConstant);

struct CompositeVertex {
  float4 position [[position]];
  float2 uv;
};

vertex CompositeVertex compositeVertex(uint vid [[vertex_id]]) {
  float2 positions[3] = { float2(-1.0, -1.0), float2(3.0, -1.0), float2(-1.0, 3.0) };
  float2 position = positions[vid];
  CompositeVertex out;
  out.position = float4(position, 0.0, 1.0);
  out.uv = float2((position.x + 1.0) * 0.5, 1.0 - (position.y + 1.0) * 0.5);
  return out;
}

float4 evaluateLayer(Fragment f, constant GradientLayer &layer, constant float4 *data, texture2d<float> surface) {
  int kind = HasKindConstant ? KindConstant : layer.kind;
  switch (kind) {
    case GradientKindLinear: return linearField(f, layer, data, surface);
    case GradientKindRadial: return radialField(f, layer, data, surface);
    case GradientKindConic: return conicField(f, layer, data, surface);
    case GradientKindSweep: return sweepField(f, layer, data, surface);
    case GradientKindDiamond: return diamondField(f, layer, data, surface);
    case GradientKindReflected: return reflectedField(f, layer, data, surface);
    case GradientKindMesh: return meshField(f, layer, data, surface);
    case GradientKindFreeform: return freeformField(f, layer, data, surface);
    case GradientKindBilinear: return bilinearField(f, layer, data, surface);
    case GradientKindNoise: return noiseField(f, layer, data, surface);
    case GradientKindVoronoi: return voronoiField(f, layer, data, surface);
    case GradientKindGlow: return glowField(f, layer, data, surface);
    case GradientKindSpotlight: return spotlightField(f, layer, data, surface);
    case GradientKindVignette: return vignetteField(f, layer, data, surface);
    case GradientKindAurora: return auroraField(f, layer, data, surface);
    case GradientKindLiquid: return liquidField(f, layer, data, surface);
    case GradientKindIridescent: return iridescentField(f, layer, data, surface);
    case GradientKindWave: return waveField(f, layer, data, surface);
    case GradientKindSilk: return silkField(f, layer, data, surface);
    case GradientKindSmoke: return smokeField(f, layer, data, surface);
    case GradientKindRibbon: return ribbonField(f, layer, data, surface);
    case GradientKindFlux: return fluxField(f, layer, data, surface);
    case GradientKindHolographic: return holographicField(f, layer, data, surface);
    case GradientKindInterlace: return interlaceField(f, layer, data, surface);
    case GradientKindSky: return skyField(f, layer, data, surface);
    case GradientKindStrata: return strataField(f, layer, data, surface);
    default: return float4(0.0);
  }
}

fragment float4 compositeFragment(
  CompositeVertex in [[stage_in]],
  constant FrameUniforms &frame [[buffer(0)]],
  constant GradientLayer *layers [[buffer(1)]],
  constant float4 *data [[buffer(2)]],
  array<texture2d<float>, 4> surfaces [[texture(0)]]
) {
  Fragment f;
  f.uv = in.uv;
  f.size = frame.size;
  f.point = in.uv * frame.size;
  f.tilt = frame.tilt;

  float4 result = float4(0.0);
  for (int i = 0; i < frame.layerCount; i++) {
    constant GradientLayer &layer = layers[i];
    float4 color = evaluateLayer(f, layer, data, surfaces[clamp(layer.surface, 0, 3)]);
    color = clamp(color, 0.0, 1.0);
    color.rgb = min(color.rgb, float3(color.a));
    color *= layer.opacity;
    if (HasSourceOverConstant && SourceOverConstant) {
      result = color + result * (1.0 - color.a);
    } else {
      result = composite(result, color, layer.blend);
    }
  }

  float3 rgb = result.rgb;
  if (frame.grain > 0.0) {
    rgb += (hash(floor(in.position.xy / frame.scale)) - 0.5) * frame.grain * 0.2 * result.a;
  }
  rgb += (interleavedNoise(in.position.xy) - 0.5) * (frame.dither / 255.0) * result.a;
  return float4(clamp(rgb, 0.0, result.a), result.a);
}
