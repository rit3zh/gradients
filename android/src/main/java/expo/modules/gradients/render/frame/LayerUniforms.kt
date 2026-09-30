package expo.modules.gradients.render.frame

class LayerUniforms {
    val a = FloatArray(4)
    val b = FloatArray(4)
    val c = FloatArray(4)
    val d = FloatArray(4)
    var rangeStart = 0f
    var rangeEnd = 1f
    var opacity = 1f
    var time = 0f
    var phase = 0f
    var kind = 0
    var blend = 0
    var tile = 0
    var space = 0
    var ramp = 0
    var data = 0
    var count = 0
    var surface = 0

    fun reset() {
        a.fill(0f)
        b.fill(0f)
        c.fill(0f)
        d.fill(0f)
        rangeStart = 0f
        rangeEnd = 1f
        opacity = 1f
        time = 0f
        phase = 0f
        kind = 0
        blend = 0
        tile = 0
        space = 0
        ramp = 0
        data = 0
        count = 0
        surface = 0
    }

    fun writeTo(target: FloatArray, offset: Int) {
        a.copyInto(target, offset)
        b.copyInto(target, offset + 4)
        c.copyInto(target, offset + 8)
        d.copyInto(target, offset + 12)
        target[offset + 16] = rangeStart
        target[offset + 17] = rangeEnd
        target[offset + 18] = opacity
        target[offset + 19] = time
        target[offset + 20] = phase
        target[offset + 21] = kind.toFloat()
        target[offset + 22] = blend.toFloat()
        target[offset + 23] = tile.toFloat()
        target[offset + 24] = space.toFloat()
        target[offset + 25] = ramp.toFloat()
        target[offset + 26] = data.toFloat()
        target[offset + 27] = count.toFloat()
        target[offset + 28] = surface.toFloat()
        target[offset + 29] = 0f
        target[offset + 30] = 0f
        target[offset + 31] = 0f
    }

    companion object {
        const val TEXELS = 8
    }
}

fun FloatArray.set(x: Float, y: Float = 0f, z: Float = 0f, w: Float = 0f) {
    this[0] = x
    this[1] = y
    this[2] = z
    this[3] = w
}
