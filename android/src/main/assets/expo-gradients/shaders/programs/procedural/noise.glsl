vec4 noiseField(Fragment f, Layer layer) {
    vec2 p = f.point / max(min(f.size.x, f.size.y), 1.0) * layer.a.x + layer.b.xy;
    float z = layer.time * 0.25;
    if (layer.a.z > 0.0) {
        vec2 q = vec2(fbm(vec3(p, z), 2.0), fbm(vec3(p + vec2(5.2, 1.3), z), 2.0));
        p += q * layer.a.z;
    }
    float n = fbm(vec3(p, z), layer.a.y);
    float t = saturate(0.5 + 0.5 * n * layer.a.w);
    return sampleRamp(layer, t);
}

