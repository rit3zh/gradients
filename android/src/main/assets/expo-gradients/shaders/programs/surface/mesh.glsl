vec4 meshField(Fragment f, Layer layer) {
    return sampleSurface(layer.surface, f.uv);
}

