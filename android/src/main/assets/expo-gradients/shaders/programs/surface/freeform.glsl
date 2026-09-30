vec4 freeformField(Fragment f, Layer layer) {
    float minSide = max(min(f.size.x, f.size.y), 1.0);
    vec4 sum = vec4(0.0);
    float total = 0.0;
    for (int i = 0; i < layer.count; i++) {
        vec2 site = fetchData(layer.data + i).xy;
        vec2 delta = (f.point - site) / minSide;
        float d = dot(delta, delta) + layer.a.y;
        float weight = pow(d, -layer.a.x * 0.5);
        sum += weight * fetchData(layer.data + layer.count + i);
        total += weight;
    }
    return resolveColor(sum / max(total, 1e-6), layer.space);
}

