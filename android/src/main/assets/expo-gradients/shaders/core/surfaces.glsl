uniform sampler2D uSurface0;
uniform sampler2D uSurface1;
uniform sampler2D uSurface2;
uniform sampler2D uSurface3;

vec4 sampleSurface(int index, vec2 uv) {
    vec2 coordinate = vec2(uv.x, 1.0 - uv.y);
    if (index == 1) {
        return texture(uSurface1, coordinate);
    }
    if (index == 2) {
        return texture(uSurface2, coordinate);
    }
    if (index == 3) {
        return texture(uSurface3, coordinate);
    }
    return texture(uSurface0, coordinate);
}

