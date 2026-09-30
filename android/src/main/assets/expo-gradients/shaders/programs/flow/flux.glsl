vec4 fluxField(Fragment f, Layer layer) {
    float aspect = f.size.x / max(f.size.y, 1.0);
    vec2 q = f.uv - 0.5;
    q.x *= aspect;
    float time = layer.time;
    float swirl = simplex(vec3(q * 0.8 + layer.b.xy, time * 0.08));
    q = rotate(q, swirl * Pi * layer.a.x + time * 0.05);
    vec2 frequency = vec2(6.0, 9.0) * layer.a.z;
    q += vec2(sin(q.y * frequency.x + time * 1.6), sin(q.x * frequency.y + time * 1.6)) * vec2(0.033, 0.066) * layer.a.y;
    float across = smoothstep(-0.3, 0.25, q.x + q.y * 0.1);
    float down = smoothstep(0.1, -0.25, q.y);
    return sampleRamp(layer, 0.5 * across + 0.5 * down);
}

