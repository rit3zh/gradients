vec4 reflectedField(Fragment f, Layer layer) {
    vec2 origin = layer.a.xy;
    vec2 axis = layer.a.zw - origin;
    float offset = dot(f.point - origin, axis) / max(dot(axis, axis), 1e-5) - layer.b.y;
    float knee = max(layer.b.x, 1e-4);
    float fold = sqrt(offset * offset + knee * knee) - knee;
    float reach = sqrt(1.0 + knee * knee) - knee;
    return sampleRamp(layer, fold / reach);
}

