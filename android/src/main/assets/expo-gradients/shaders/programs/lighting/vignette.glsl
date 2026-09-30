vec4 vignetteField(Fragment f, Layer layer) {
    vec2 q = abs(f.uv - layer.a.xy) * 2.0;
    float n = mix(10.0, 2.0, saturate(layer.b.x));
    float d = pow(pow(q.x, n) + pow(q.y, n), 1.0 / n);
    float t = smoothstep(layer.a.z, layer.a.z + max(layer.a.w, 1e-3), d);
    return sampleRamp(layer, t) * saturate(layer.b.y);
}

