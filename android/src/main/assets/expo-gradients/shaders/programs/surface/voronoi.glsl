vec4 voronoiField(Fragment f, Layer layer) {
    float minSide = max(min(f.size.x, f.size.y), 1.0);
    float nearest = 1e9;
    for (int i = 0; i < layer.count; i++) {
        nearest = min(nearest, length((f.point - fetchData(layer.data + i).xy) / minSide));
    }
    vec4 sum = vec4(0.0);
    float total = 0.0;
    for (int i = 0; i < layer.count; i++) {
        float d = length((f.point - fetchData(layer.data + i).xy) / minSide);
        float weight = exp(-(d - nearest) * layer.a.x);
        sum += weight * fetchData(layer.data + layer.count + i);
        total += weight;
    }
    return resolveColor(sum / max(total, 1e-6), layer.space);
}

