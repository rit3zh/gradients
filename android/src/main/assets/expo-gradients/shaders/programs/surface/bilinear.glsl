vec4 bilinearField(Fragment f, Layer layer) {
    vec2 uv = saturate(f.uv);
    vec2 eased = uv * uv * (3.0 - 2.0 * uv);
    vec2 w = mix(uv, eased, layer.a.x);
    vec4 top = mix(fetchData(layer.data), fetchData(layer.data + 1), w.x);
    vec4 bottom = mix(fetchData(layer.data + 2), fetchData(layer.data + 3), w.x);
    return resolveColor(mix(top, bottom, w.y), layer.space);
}

