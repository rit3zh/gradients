//
//  Mesh.metal
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

#include "../Include/GradientShaders.h"

struct MeshVertex {
  float2 position;
  float4 color;
};

struct MeshFragment {
  float4 position [[position]];
  float4 color;
};

vertex MeshFragment meshVertex(uint vid [[vertex_id]], constant MeshVertex *vertices [[buffer(0)]]) {
  MeshVertex source = vertices[vid];
  MeshFragment out;
  out.position = float4(source.position.x * 2.0 - 1.0, 1.0 - source.position.y * 2.0, 0.0, 1.0);
  out.color = source.color;
  return out;
}

fragment float4 meshFragment(MeshFragment in [[stage_in]]) {
  return in.color;
}
