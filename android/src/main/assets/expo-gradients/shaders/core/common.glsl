precision highp float;
precision highp int;
precision highp sampler2D;

const float Tau = 6.28318530718;
const float Pi = 3.14159265359;
const int RampResolution = 256;
const int DataWidth = 256;

uniform sampler2D uData;

struct Fragment {
    vec2 uv;
    vec2 point;
    vec2 size;
    vec2 tilt;
};

struct Layer {
    vec4 a;
    vec4 b;
    vec4 c;
    vec4 d;
    vec2 range;
    float opacity;
    float time;
    float phase;
    int kind;
    int blend;
    int tile;
    int space;
    int ramp;
    int data;
    int count;
    int surface;
};

float saturate(float value) {
    return clamp(value, 0.0, 1.0);
}

vec2 saturate(vec2 value) {
    return clamp(value, 0.0, 1.0);
}

vec3 saturate(vec3 value) {
    return clamp(value, 0.0, 1.0);
}

vec4 fetchData(int index) {
    return texelFetch(uData, ivec2(index % DataWidth, index / DataWidth), 0);
}

Layer loadLayer(int index) {
    int base = index * 8;
    vec4 timing = fetchData(base + 4);
    vec4 modes = fetchData(base + 5);
    vec4 offsets = fetchData(base + 6);
    vec4 extra = fetchData(base + 7);

    Layer layer;
    layer.a = fetchData(base);
    layer.b = fetchData(base + 1);
    layer.c = fetchData(base + 2);
    layer.d = fetchData(base + 3);
    layer.range = timing.xy;
    layer.opacity = timing.z;
    layer.time = timing.w;
    layer.phase = modes.x;
    layer.kind = int(modes.y + 0.5);
    layer.blend = int(modes.z + 0.5);
    layer.tile = int(modes.w + 0.5);
    layer.space = int(offsets.x + 0.5);
    layer.ramp = int(offsets.y + 0.5);
    layer.data = int(offsets.z + 0.5);
    layer.count = int(offsets.w + 0.5);
    layer.surface = int(extra.x + 0.5);
    return layer;
}

vec2 rotate(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float tileValue(float t, int tile) {
    if (tile == 1) {
        return fract(t);
    }
    if (tile == 2) {
        return 1.0 - abs(fract(t * 0.5) * 2.0 - 1.0);
    }
    return t;
}

vec4 sampleRamp(Layer layer, float t) {
    float span = max(layer.range.y - layer.range.x, 1e-5);
    float x = (t + layer.phase - layer.range.x) / span;
    if (layer.tile == 3 && (x < 0.0 || x > 1.0)) {
        return vec4(0.0);
    }
    x = saturate(tileValue(x, layer.tile));
    float position = x * float(RampResolution - 1);
    int index = min(int(position), RampResolution - 2);
    return mix(fetchData(layer.ramp + index), fetchData(layer.ramp + index + 1), position - float(index));
}

vec3 srgbEncode(vec3 color) {
    vec3 c = saturate(color);
    return mix(1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, c * 12.92, lessThanEqual(c, vec3(0.0031308)));
}

vec3 oklabToLinear(vec3 lab) {
    float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
    float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
    float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
    l = l * l * l;
    m = m * m * m;
    s = s * s * s;
    return vec3(
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

vec4 resolveColor(vec4 premultiplied, int space) {
    float alpha = saturate(premultiplied.a);
    if (alpha <= 1e-5) {
        return vec4(0.0);
    }
    vec3 value = premultiplied.rgb / premultiplied.a;
    vec3 encoded = space == 0 ? saturate(value) : srgbEncode(space == 1 ? value : oklabToLinear(value));
    return vec4(encoded * alpha, alpha);
}

float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
}

float cellHash(vec2 cell) {
    vec2 q = fract(cell * vec2(0.1031, 0.1030) + vec2(0.217, 0.613));
    q += dot(q, q.yx + 19.19);
    return fract((q.x + q.y) * q.y * 3.7 + sin(dot(cell, vec2(12.9898, 78.233))) * 0.5);
}

float interleavedNoise(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

vec3 thinFilm(float phase) {
    return 0.5 - 0.5 * cos(Tau * phase * vec3(1.0, 1.226, 1.413));
}

vec3 unpremultiply(vec4 color) {
    return color.rgb / max(color.a, 1e-4);
}

