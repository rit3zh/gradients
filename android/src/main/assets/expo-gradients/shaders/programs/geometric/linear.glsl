vec4 linearField(Fragment f, Layer layer) {
    vec2 start = layer.a.xy;
    vec2 axis = layer.a.zw - start;
    float t = dot(f.point - start, axis) / max(dot(axis, axis), 1e-5);
    return sampleRamp(layer, t);
}

