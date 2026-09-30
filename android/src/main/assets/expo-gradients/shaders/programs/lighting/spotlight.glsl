vec4 spotlightField(Fragment f, Layer layer) {
    vec2 offset = f.point - layer.a.xy;
    float reach = length(offset);
    vec2 direction = vec2(sin(layer.a.z), -cos(layer.a.z));
    float angle = acos(clamp(dot(offset, direction) / max(reach, 1e-3), -1.0, 1.0));
    float edge = layer.a.w;
    float soft = max(layer.b.y * edge, 1e-3);
    float cone = 1.0 - smoothstep(edge - soft, edge + soft, angle);
    float t = reach / max(layer.b.x, 1.0);
    float attenuation = pow(saturate(1.0 - t), 1.6);
    float core = exp(-t * t * 60.0) * 0.6;
    return sampleRamp(layer, t) * saturate((cone * attenuation + core) * layer.b.z);
}

