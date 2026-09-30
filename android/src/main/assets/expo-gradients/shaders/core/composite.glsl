uniform vec2 uSize;
uniform vec2 uTilt;
uniform float uScale;
uniform float uDither;
uniform float uGrain;
uniform int uLayerCount;
uniform int uMaskMode;
uniform vec2 uBorder;
uniform sampler2D uMask;

in vec2 vUv;

out vec4 fragColor;

float roundedBox(vec2 point, vec2 extent, float radius) {
    vec2 q = abs(point) - extent + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float borderCoverage(vec2 point, vec2 size) {
    vec2 extent = size * 0.5;
    vec2 p = point - extent;
    float width = max(uBorder.x, 0.0);
    float radius = min(max(uBorder.y, 0.0), min(extent.x, extent.y));
    float outer = saturate(0.5 - roundedBox(p, extent, radius) * uScale);
    vec2 innerExtent = extent - width;
    if (innerExtent.x <= 0.0 || innerExtent.y <= 0.0) {
        return outer;
    }
    float innerRadius = min(max(radius - width, 0.0), min(innerExtent.x, innerExtent.y));
    return outer * saturate(0.5 + roundedBox(p, innerExtent, innerRadius) * uScale);
}

void main() {
    Fragment f;
    f.uv = vUv;
    f.size = uSize;
    f.point = vUv * uSize;
    f.tilt = uTilt;

    vec4 result = vec4(0.0);
    for (int i = 0; i < uLayerCount; i++) {
        Layer layer = loadLayer(i);
        vec4 color = clamp(evaluateLayer(f, layer), 0.0, 1.0);
        color.rgb = min(color.rgb, vec3(color.a));
        color *= layer.opacity;
#ifdef SOURCE_OVER
        result = color + result * (1.0 - color.a);
#else
        result = composite(result, color, layer.blend);
#endif
    }

    if (uMaskMode == 1) {
        result *= texture(uMask, vUv).a;
    } else if (uMaskMode == 2) {
        result *= borderCoverage(f.point, uSize);
    }

    vec3 rgb = result.rgb;
    if (uGrain > 0.0) {
        rgb += (hash(floor(gl_FragCoord.xy / uScale)) - 0.5) * uGrain * 0.2 * result.a;
    }
    rgb += (interleavedNoise(gl_FragCoord.xy) - 0.5) * (uDither / 255.0) * result.a;
    fragColor = vec4(clamp(rgb, 0.0, result.a), result.a);
}
