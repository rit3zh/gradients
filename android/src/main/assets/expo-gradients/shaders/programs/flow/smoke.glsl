vec4 smokeField(Fragment f, Layer layer) {
    float minSide = max(min(f.size.x, f.size.y), 1.0);
    vec2 p = (2.0 * f.point - f.size) / minSide * layer.a.x;
    float time = layer.time;
    float strength = layer.a.y;
    for (int i = 1; i < 9; i++) {
        float octave = float(i);
        vec2 swirl = vec2(
            sin(octave * p.y + time + 0.4 * octave),
            cos(octave * p.x + time * 0.9 + 0.3 * (octave + 7.0))
        );
        p += swirl * (strength / octave) + vec2(0.8, -1.1);
    }
    float plume = 0.5 + 0.5 * sin(p.x + p.y);
    float density = saturate(1.0 - sin(p.y));
    float t = mix(plume, density, 0.45);
    return sampleRamp(layer, t);
}

