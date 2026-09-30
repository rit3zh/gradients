vec4 diamondField(Fragment f, Layer layer) {
    vec2 q = rotate(f.point - layer.a.xy, -layer.b.x);
    vec2 radii = max(layer.a.zw, vec2(1e-3));
    float t = abs(q.x) / radii.x + abs(q.y) / radii.y;
    return sampleRamp(layer, t);
}

