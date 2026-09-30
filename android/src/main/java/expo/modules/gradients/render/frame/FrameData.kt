package expo.modules.gradients.render.frame

class FrameData(initialTexels: Int = 4096) {
    var floats = FloatArray(initialTexels * 4)
        private set

    var texelCount = 0
        private set

    fun reset(reservedTexels: Int) {
        ensureCapacity(reservedTexels)
        texelCount = reservedTexels
    }

    fun put(x: Float, y: Float, z: Float, w: Float) {
        ensureCapacity(texelCount + 1)
        val offset = texelCount * 4
        floats[offset] = x
        floats[offset + 1] = y
        floats[offset + 2] = z
        floats[offset + 3] = w
        texelCount += 1
    }

    fun putAll(values: FloatArray): Int {
        val start = texelCount
        val texels = values.size / 4
        ensureCapacity(texelCount + texels)
        values.copyInto(floats, texelCount * 4)
        texelCount += texels
        return start
    }

    fun ensureCapacity(texels: Int) {
        if (texels * 4 <= floats.size) return
        var capacity = floats.size
        while (capacity < texels * 4) {
            capacity *= 2
        }
        floats = floats.copyOf(capacity)
    }
}
