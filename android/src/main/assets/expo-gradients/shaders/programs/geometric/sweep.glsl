vec4 sweepField(Fragment f, Layer layer) {
    vec2 offset = f.point - layer.a.xy;
    float theta = atan(offset.x, -offset.y);
    float sweep = layer.a.w - layer.a.z;
    float span = max(abs(sweep), 1e-4);
    float relative = (sweep < 0.0 ? -1.0 : 1.0) * (theta - layer.a.z);
    relative -= Tau * floor(relative / Tau);
    float t = relative / span;
    if (t > 1.0) {
        float gap = Tau / span;
        if (t > (1.0 + gap) * 0.5) {
            t -= gap;
        }
    }
    return sampleRamp(layer, t);
}

