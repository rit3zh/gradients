vec4 radialField(Fragment f, Layer layer) {
    vec2 radii = max(layer.a.zw, vec2(1e-3));
    float t = length((f.point - layer.a.xy) / radii);
    return sampleRamp(layer, t);
}

