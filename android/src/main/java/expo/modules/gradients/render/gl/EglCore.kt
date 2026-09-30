package expo.modules.gradients.render.gl

import android.graphics.SurfaceTexture
import android.opengl.EGL14
import android.opengl.EGLConfig
import android.opengl.EGLContext
import android.opengl.EGLDisplay
import android.opengl.EGLExt
import android.opengl.EGLSurface

class EglCore {
    private val display: EGLDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
    private val config: EGLConfig
    private val context: EGLContext
    private val idleSurface: EGLSurface
    private var current: EGLSurface = EGL14.EGL_NO_SURFACE

    init {
        val version = IntArray(2)
        check(EGL14.eglInitialize(display, version, 0, version, 1)) { "Unable to initialize EGL" }

        val attributes = intArrayOf(
            EGL14.EGL_RED_SIZE, 8,
            EGL14.EGL_GREEN_SIZE, 8,
            EGL14.EGL_BLUE_SIZE, 8,
            EGL14.EGL_ALPHA_SIZE, 8,
            EGL14.EGL_RENDERABLE_TYPE, EGLExt.EGL_OPENGL_ES3_BIT_KHR,
            EGL14.EGL_SURFACE_TYPE, EGL14.EGL_WINDOW_BIT or EGL14.EGL_PBUFFER_BIT,
            EGL14.EGL_NONE
        )
        val configs = arrayOfNulls<EGLConfig>(1)
        val count = IntArray(1)
        EGL14.eglChooseConfig(display, attributes, 0, configs, 0, 1, count, 0)
        config = checkNotNull(configs[0].takeIf { count[0] > 0 }) { "No OpenGL ES 3 configuration available" }

        context = EGL14.eglCreateContext(
            display,
            config,
            EGL14.EGL_NO_CONTEXT,
            intArrayOf(EGL14.EGL_CONTEXT_CLIENT_VERSION, 3, EGL14.EGL_NONE),
            0
        )
        check(context != EGL14.EGL_NO_CONTEXT) { "Unable to create an OpenGL ES 3 context" }

        idleSurface = EGL14.eglCreatePbufferSurface(
            display,
            config,
            intArrayOf(EGL14.EGL_WIDTH, 1, EGL14.EGL_HEIGHT, 1, EGL14.EGL_NONE),
            0
        )
        makeIdle()
    }

    fun createSurface(texture: SurfaceTexture): EGLSurface? {
        val surface = EGL14.eglCreateWindowSurface(display, config, texture, intArrayOf(EGL14.EGL_NONE), 0)
        if (surface == null || surface == EGL14.EGL_NO_SURFACE) return null
        if (makeCurrent(surface)) {
            EGL14.eglSwapInterval(display, 0)
        }
        return surface
    }

    fun makeCurrent(surface: EGLSurface): Boolean {
        if (current == surface) return true
        val success = EGL14.eglMakeCurrent(display, surface, surface, context)
        current = if (success) surface else EGL14.EGL_NO_SURFACE
        return success
    }

    fun makeIdle() {
        makeCurrent(idleSurface)
    }

    fun swap(surface: EGLSurface): Boolean = EGL14.eglSwapBuffers(display, surface)

    fun releaseSurface(surface: EGLSurface) {
        if (current == surface) makeIdle()
        EGL14.eglDestroySurface(display, surface)
    }

    fun release() {
        EGL14.eglMakeCurrent(display, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
        EGL14.eglDestroySurface(display, idleSurface)
        EGL14.eglDestroyContext(display, context)
        EGL14.eglTerminate(display)
        current = EGL14.EGL_NO_SURFACE
    }
}
