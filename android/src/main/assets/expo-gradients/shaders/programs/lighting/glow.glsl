vec4 glowField(Fragment f, Layer layer) {
    float pulse = 1.0 + layer.b.y * sin(layer.time * Pi);
    float d = length(f.point - layer.a.xy) / max(layer.a.z * pulse, 1e-3);
    float glow = exp(-3.0 * pow(d, 2.0 * layer.a.w));
    return sampleRamp(layer, d) * saturate(glow * layer.b.x);
}

