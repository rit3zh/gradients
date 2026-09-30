package expo.modules.gradients.render.gl

import android.opengl.GLES30
import android.util.Log

class GlProgram(vertexSource: String, fragmentSource: String) {
    val handle: Int
    private val locations = HashMap<String, Int>()

    init {
        val vertex = compile(GLES30.GL_VERTEX_SHADER, vertexSource)
        val fragment = compile(GLES30.GL_FRAGMENT_SHADER, fragmentSource)
        handle = GLES30.glCreateProgram()
        GLES30.glAttachShader(handle, vertex)
        GLES30.glAttachShader(handle, fragment)
        GLES30.glLinkProgram(handle)
        GLES30.glDeleteShader(vertex)
        GLES30.glDeleteShader(fragment)

        val status = IntArray(1)
        GLES30.glGetProgramiv(handle, GLES30.GL_LINK_STATUS, status, 0)
        if (status[0] == 0) {
            val log = GLES30.glGetProgramInfoLog(handle)
            GLES30.glDeleteProgram(handle)
            throw IllegalStateException("Gradient program failed to link: $log")
        }
    }

    fun use() {
        GLES30.glUseProgram(handle)
    }

    fun uniform(name: String): Int = locations.getOrPut(name) { GLES30.glGetUniformLocation(handle, name) }

    fun release() {
        GLES30.glDeleteProgram(handle)
    }

    private companion object {
        const val TAG = "ExpoGradients"

        fun compile(type: Int, source: String): Int {
            val shader = GLES30.glCreateShader(type)
            GLES30.glShaderSource(shader, source)
            GLES30.glCompileShader(shader)
            val status = IntArray(1)
            GLES30.glGetShaderiv(shader, GLES30.GL_COMPILE_STATUS, status, 0)
            if (status[0] == 0) {
                val log = GLES30.glGetShaderInfoLog(shader)
                GLES30.glDeleteShader(shader)
                Log.e(TAG, log)
                throw IllegalStateException("Gradient shader failed to compile: $log")
            }
            return shader
        }
    }
}
