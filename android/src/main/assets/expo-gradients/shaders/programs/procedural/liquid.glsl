vec4 liquidField(Fragment f, Layer layer) {
    vec2 p = f.point / max(min(f.size.x, f.size.y), 1.0) * layer.a.x + layer.b.xy;
    float t = layer.time * 0.12;
    float warp = layer.a.y;
    vec2 q = vec2(fbm(vec3(p, t), 3.0), fbm(vec3(p + vec2(5.2, 1.3), t), 3.0));
    vec2 r = vec2(
        fbm(vec3(p + warp * q + vec2(1.7, 9.2), t * 1.3), 3.0),
        fbm(vec3(p + warp * q + vec2(8.3, 2.8), t * 1.3), 3.0)
    );
    float n = fbm(vec3(p + warp * r, t * 0.7), 3.0);
    float value = saturate(0.5 + 0.5 * (n * 1.5 + 0.4 * length(q) - 0.25));
    vec4 color = sampleRamp(layer, value);
    float sheen = pow(saturate(0.5 + 0.5 * (r.x - r.y) * 1.8), 8.0) * layer.a.z;
    color.rgb += (color.a - color.rgb) * sheen;
    return color;
}

