vec4 conicField(Fragment f, Layer layer) {
    vec2 offset = f.point - layer.a.xy;
    float theta = atan(offset.x, -offset.y);
    float t = fract((theta - layer.a.z) / Tau);
    return sampleRamp(layer, t);
}

