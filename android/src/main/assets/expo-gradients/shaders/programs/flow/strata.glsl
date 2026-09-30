float strataRidge(vec2 q, float offset, float time, float frequency) {
    float swell = sin((q.x + offset - time * 0.06) * 5.5 * frequency);
    float drift = q.x * 7.0 * frequency;
    float weight = 1.0;
    for (int octave = 0; octave < 5; octave++) {
        drift = drift * 0.57 + 5.3;
        swell += sin(drift) * weight;
        weight *= 0.55;
    }
    return offset + swell * 0.075 - q.y;
}

vec4 strataField(Fragment f, Layer layer) {
    float aspect = f.size.x / max(f.size.y, 1.0);
    vec2 q = vec2((f.uv.x - 0.5) * aspect, 0.5 - f.uv.y);
    q = rotate(q, layer.a.x) * 2.0 + 1.0;

    int count = int(clamp(layer.a.y, 1.0, 12.0));
    float pixel = 3.0 / max(f.size.y, 1.0);
    float coverage = 0.0;
    for (int i = 0; i < 12; i++) {
        if (i >= count) {
            break;
        }
        float offset = 0.3 + 0.8 * float(i) / max(float(count - 1), 1.0);
        coverage += smoothstep(-pixel, pixel, strataRidge(q, offset, layer.time, layer.a.z));
    }

    vec4 color = sampleRamp(layer, coverage / float(count));
    float light = mix(1.0, 0.65 + 1.1 * (1.0 - f.uv.y), layer.a.w);
    color.rgb = min(color.rgb * light, vec3(color.a));
    return color;
}

