#version 300 es

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec4 aColor;

out vec4 vColor;

void main() {
    vColor = aColor;
    gl_Position = vec4(aPosition.x * 2.0 - 1.0, 1.0 - aPosition.y * 2.0, 0.0, 1.0);
}
