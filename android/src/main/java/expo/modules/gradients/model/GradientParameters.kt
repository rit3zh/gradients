package expo.modules.gradients.model

import expo.modules.gradients.enums.RadialShape
import expo.modules.gradients.records.GradientLayerRecord

data class GradientParameters(
    val angle: Double = 180.0,
    val start: Vec2 = Vec2(0.5, 0.0),
    val end: Vec2 = Vec2(0.5, 1.0),
    val usesPoints: Double = 0.0,
    val center: Vec2 = Vec2(0.5, 0.5),
    val radius: Double = 1.0,
    val ellipse: Double = 0.0,
    val startAngle: Double = 0.0,
    val endAngle: Double = 360.0,
    val scale: Double = 1.0,
    val octaves: Double = 4.0,
    val warp: Double = 0.0,
    val smoothness: Double = 0.5,
    val intensity: Double = 1.0,
    val softness: Double = 0.5,
    val roundness: Double = 1.0,
    val width: Double = 0.2,
    val spread: Double = 30.0,
    val falloff: Double = 1.0,
    val power: Double = 2.0,
    val cornerRadius: Double = 0.0,
    val highlight: Double = 0.0,
    val bands: Double = 3.0,
    val period: Double = 2.0,
    val delay: Double = 0.0,
    val speed: Double = 0.0,
    val spin: Double = 0.0,
    val flow: Double = 0.0,
    val drift: Double = 0.0,
    val opacity: Double = 1.0,
    val extinction: Vec3 = DEFAULT_EXTINCTION,
    val horizon: Double = 0.8,
    val fisheye: Double = 0.5
) {
    companion object {
        private val DEFAULT_EXTINCTION = Vec3(0.1, 0.3, 0.6)

        fun from(record: GradientLayerRecord): GradientParameters {
            val hasPoints = record.start?.size == 2 && record.end?.size == 2
            return GradientParameters(
                angle = record.angle,
                start = if (hasPoints) Vec2.of(record.start, Vec2(0.5, 0.0)) else Vec2(0.5, 0.0),
                end = if (hasPoints) Vec2.of(record.end, Vec2(0.5, 1.0)) else Vec2(0.5, 1.0),
                usesPoints = if (hasPoints) 1.0 else 0.0,
                center = Vec2.of(record.center, Vec2(0.5, 0.5)),
                radius = record.radius,
                ellipse = if (record.shape == RadialShape.ELLIPSE) 1.0 else 0.0,
                startAngle = record.startAngle,
                endAngle = record.endAngle,
                scale = record.scale,
                octaves = record.octaves.coerceIn(1.0, 6.0),
                warp = record.warp,
                smoothness = record.smoothness,
                intensity = record.intensity,
                softness = record.softness,
                roundness = record.roundness,
                width = record.width,
                spread = record.spread,
                falloff = record.falloff,
                power = record.power,
                cornerRadius = record.cornerRadius,
                highlight = record.highlight,
                bands = record.bands.coerceIn(0.5, 24.0),
                period = maxOf(record.period, 0.05),
                delay = maxOf(record.delay, 0.0),
                speed = record.speed,
                spin = record.spin,
                flow = record.flow,
                drift = record.drift,
                opacity = record.opacity.coerceIn(0.0, 1.0),
                extinction = Vec3.of(record.extinction, DEFAULT_EXTINCTION),
                horizon = record.horizon,
                fisheye = record.fisheye
            )
        }

        fun mix(a: GradientParameters, b: GradientParameters, t: Double): GradientParameters {
            fun lerp(x: Double, y: Double) = x + (y - x) * t
            return GradientParameters(
                angle = lerp(a.angle, b.angle),
                start = (if (a.usesPoints > 0) a.start else b.start).lerp(if (b.usesPoints > 0) b.start else a.start, t),
                end = (if (a.usesPoints > 0) a.end else b.end).lerp(if (b.usesPoints > 0) b.end else a.end, t),
                usesPoints = lerp(a.usesPoints, b.usesPoints),
                center = a.center.lerp(b.center, t),
                radius = lerp(a.radius, b.radius),
                ellipse = lerp(a.ellipse, b.ellipse),
                startAngle = lerp(a.startAngle, b.startAngle),
                endAngle = lerp(a.endAngle, b.endAngle),
                scale = lerp(a.scale, b.scale),
                octaves = lerp(a.octaves, b.octaves),
                warp = lerp(a.warp, b.warp),
                smoothness = lerp(a.smoothness, b.smoothness),
                intensity = lerp(a.intensity, b.intensity),
                softness = lerp(a.softness, b.softness),
                roundness = lerp(a.roundness, b.roundness),
                width = lerp(a.width, b.width),
                spread = lerp(a.spread, b.spread),
                falloff = lerp(a.falloff, b.falloff),
                power = lerp(a.power, b.power),
                cornerRadius = lerp(a.cornerRadius, b.cornerRadius),
                highlight = lerp(a.highlight, b.highlight),
                bands = lerp(a.bands, b.bands),
                period = lerp(a.period, b.period),
                delay = lerp(a.delay, b.delay),
                speed = lerp(a.speed, b.speed),
                spin = lerp(a.spin, b.spin),
                flow = lerp(a.flow, b.flow),
                drift = lerp(a.drift, b.drift),
                opacity = lerp(a.opacity, b.opacity),
                extinction = a.extinction.lerp(b.extinction, t),
                horizon = lerp(a.horizon, b.horizon),
                fisheye = lerp(a.fisheye, b.fisheye)
            )
        }
    }
}
