float luminance(vec3 c) {
    return dot(c, vec3(0.3, 0.59, 0.11));
}

vec3 clipColor(vec3 color) {
    vec3 c = color;
    float l = luminance(c);
    float lowest = min(c.r, min(c.g, c.b));
    float highest = max(c.r, max(c.g, c.b));
    if (lowest < 0.0) {
        c = l + (c - l) * l / max(l - lowest, 1e-5);
    }
    if (highest > 1.0) {
        c = l + (c - l) * (1.0 - l) / max(highest - l, 1e-5);
    }
    return c;
}

vec3 setLuminance(vec3 c, float l) {
    return clipColor(c + (l - luminance(c)));
}

float saturation(vec3 c) {
    return max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
}

vec3 setSaturation(vec3 c, float s) {
    float lowest = min(c.r, min(c.g, c.b));
    float range = max(c.r, max(c.g, c.b)) - lowest;
    return range > 1e-5 ? (c - lowest) * s / range : vec3(0.0);
}

vec3 softLightChannel(vec3 b, vec3 s) {
    vec3 d = mix(sqrt(b), ((16.0 * b - 12.0) * b + 4.0) * b, lessThanEqual(b, vec3(0.25)));
    return mix(b + (2.0 * s - 1.0) * (d - b), b - (1.0 - 2.0 * s) * b * (1.0 - b), lessThanEqual(s, vec3(0.5)));
}

vec3 hardLightChannel(vec3 b, vec3 s) {
    vec3 screen = b + (2.0 * s - 1.0) - b * (2.0 * s - 1.0);
    return mix(screen, b * 2.0 * s, lessThanEqual(s, vec3(0.5)));
}

vec3 colorDodge(vec3 b, vec3 s) {
    vec3 value = mix(min(vec3(1.0), b / max(1.0 - s, 1e-5)), vec3(1.0), greaterThanEqual(s, vec3(1.0)));
    return mix(value, vec3(0.0), lessThanEqual(b, vec3(0.0)));
}

vec3 colorBurn(vec3 b, vec3 s) {
    vec3 value = mix(1.0 - min(vec3(1.0), (1.0 - b) / max(s, 1e-5)), vec3(0.0), lessThanEqual(s, vec3(0.0)));
    return mix(value, vec3(1.0), greaterThanEqual(b, vec3(1.0)));
}

vec3 blendChannels(vec3 b, vec3 s, int mode) {
    if (mode == 1) return b * s;
    if (mode == 2) return b + s - b * s;
    if (mode == 3) return hardLightChannel(s, b);
    if (mode == 4) return min(b, s);
    if (mode == 5) return max(b, s);
    if (mode == 6) return colorDodge(b, s);
    if (mode == 7) return colorBurn(b, s);
    if (mode == 8) return hardLightChannel(b, s);
    if (mode == 9) return softLightChannel(b, s);
    if (mode == 10) return abs(b - s);
    if (mode == 11) return b + s - 2.0 * b * s;
    if (mode == 12) return setLuminance(setSaturation(s, saturation(b)), luminance(b));
    if (mode == 13) return setLuminance(setSaturation(b, saturation(s)), luminance(b));
    if (mode == 14) return setLuminance(s, luminance(b));
    if (mode == 15) return setLuminance(b, luminance(s));
    if (mode == 17) return max(b + s - 1.0, 0.0);
    return s;
}

vec4 composite(vec4 backdrop, vec4 source, int mode) {
    if (source.a <= 0.0) {
        return backdrop;
    }
    if (mode == 16) {
        return min(backdrop + source, vec4(1.0));
    }
    if (mode == 0 || backdrop.a <= 0.0) {
        return source + backdrop * (1.0 - source.a);
    }
    vec3 cb = backdrop.rgb / backdrop.a;
    vec3 cs = source.rgb / source.a;
    vec3 mixed = saturate(blendChannels(cb, cs, mode));
    vec3 rgb = source.rgb * (1.0 - backdrop.a) + backdrop.rgb * (1.0 - source.a) + source.a * backdrop.a * mixed;
    return vec4(rgb, source.a + backdrop.a * (1.0 - source.a));
}

