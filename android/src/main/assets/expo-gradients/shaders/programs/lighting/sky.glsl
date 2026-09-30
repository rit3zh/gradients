vec4 skyField(Fragment f, Layer layer) {
    vec2 lens = (f.point - f.size * 0.5) / max(f.size.y, 1.0);
    lens.y = -lens.y;
    vec3 ray = normalize(vec3(lens, layer.a.x - dot(lens, lens) * layer.a.y));

    vec3 forward = normalize(vec3(0.0, layer.a.z, 1.0));
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    ray = ray.x * right + ray.y * up + ray.z * forward;

    vec4 tint = sampleRamp(layer, 0.0);
    vec3 tintLight = pow(unpremultiply(tint), vec3(2.2));
    vec3 light = exp2(-ray.y / max(layer.b.xyz, vec3(1e-3))) * tintLight;
    vec3 color = pow(saturate(light), vec3(1.0 / 2.2));
    return vec4(color * tint.a, tint.a);
}

