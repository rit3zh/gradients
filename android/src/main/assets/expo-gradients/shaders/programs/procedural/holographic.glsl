vec3 prism(float phase) {
    return 0.5 + 0.5 * cos(Tau * (phase + vec3(0.0, 0.33, 0.67)));
}

vec4 holographicField(Fragment f, Layer layer) {
    float minSide = max(min(f.size.x, f.size.y), 1.0);
    vec2 uv = (f.point - f.size * 0.5) / minSide;
    vec2 direction = vec2(sin(layer.a.x), -cos(layer.a.x));
    vec2 across = vec2(-direction.y, direction.x);
    float time = layer.time;
    vec2 tilt = f.tilt + vec2(sin(time * 0.41), cos(time * 0.33)) * 0.22;

    float warp = simplex(vec3(uv * 0.9 + layer.b.xy, time * 0.08)) * layer.a.w;
    float grating = dot(uv, direction) * layer.a.y + dot(tilt, vec2(1.3, 0.9)) + warp * 0.35 + time * 0.03;
    float lattice = dot(uv, across) * layer.a.y * 0.6 - dot(tilt, vec2(0.9, -1.2)) + warp * 0.2;

    vec3 primary = prism(grating);
    vec3 secondary = prism(lattice + 0.5);
    vec3 spectrum = mix(primary, secondary, 0.3);

    float brushed = simplex(vec3(dot(uv, across) * 3.0 + 7.31, dot(uv, direction) * 90.0 + 1.93, 1.7));
    vec3 silver = vec3(0.82, 0.84, 0.88) + 0.035 * brushed;

    float intensity = pow(saturate(0.5 + 0.5 * cos(Tau * (grating * 0.5 + 0.25))), 1.5);
    vec3 foil = mix(silver, spectrum * 0.9 + 0.12, 0.35 + 0.4 * intensity);

    float band = dot(uv - tilt * 0.5, normalize(across + direction * 0.3));
    foil += (1.0 - foil) * exp(-band * band * 8.0) * layer.b.w;

    vec2 grid = f.point / 5.0;
    vec2 cell = floor(grid);
    float seed = cellHash(cell);
    vec2 center = vec2(cellHash(cell + 17.3), cellHash(cell.yx + 41.9)) * 0.6 + 0.2;
    float spot = saturate(1.0 - length(fract(grid) - center) * 4.0);
    float glint = pow(saturate(sin(seed * 113.0 + dot(tilt, vec2(8.0, 6.0)) * 3.0 + time * 1.2)), 24.0);
    float sparkle = spot * spot * glint * step(0.86, seed) * layer.a.z;
    foil += sparkle * mix(vec3(1.0), primary, 0.35);

    if (layer.b.z > 0.0) {
        vec3 tint = unpremultiply(sampleRamp(layer, grating));
        tint = mix(silver, tint, 0.45 + 0.45 * intensity);
        foil = mix(foil, tint + sparkle, layer.b.z);
    }
    return vec4(saturate(foil), 1.0);
}

