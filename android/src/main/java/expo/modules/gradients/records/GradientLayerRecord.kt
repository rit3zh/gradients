package expo.modules.gradients.records

import expo.modules.gradients.enums.ColorInterpolation
import expo.modules.gradients.enums.GradientBlendMode
import expo.modules.gradients.enums.GradientKind
import expo.modules.gradients.enums.GradientTileMode
import expo.modules.gradients.enums.RadialShape
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class GradientLayerRecord : Record {
    @Field val type: GradientKind = GradientKind.LINEAR
    @Field val colors: List<Int> = emptyList()
    @Field val stops: List<Double> = emptyList()
    @Field val interpolation: ColorInterpolation = ColorInterpolation.OKLAB
    @Field val easing: List<Double> = listOf(0.0, 0.0, 1.0, 1.0)
    @Field val tileMode: GradientTileMode = GradientTileMode.CLAMP
    @Field val blendMode: GradientBlendMode = GradientBlendMode.NORMAL
    @Field val opacity: Double = 1.0

    @Field val angle: Double = 180.0
    @Field val start: List<Double>? = null
    @Field val end: List<Double>? = null
    @Field val center: List<Double> = listOf(0.5, 0.5)
    @Field val radius: Double = 1.0
    @Field val shape: RadialShape = RadialShape.CIRCLE
    @Field val startAngle: Double = 0.0
    @Field val endAngle: Double = 360.0

    @Field val rows: Int = 0
    @Field val columns: Int = 0
    @Field val points: List<List<Double>> = emptyList()
    @Field val cells: Int = 0

    @Field val scale: Double = 1.0
    @Field val octaves: Double = 4.0
    @Field val warp: Double = 0.0
    @Field val smoothness: Double = 0.5
    @Field val intensity: Double = 1.0
    @Field val softness: Double = 0.5
    @Field val roundness: Double = 1.0
    @Field val width: Double = 0.2
    @Field val spread: Double = 30.0
    @Field val falloff: Double = 1.0
    @Field val power: Double = 2.0
    @Field val cornerRadius: Double = 0.0
    @Field val highlight: Double = 0.0
    @Field val bands: Double = 3.0
    @Field val period: Double = 2.0
    @Field val delay: Double = 0.0
    @Field val seed: Double = 0.0
    @Field val extinction: List<Double> = listOf(0.1, 0.3, 0.6)
    @Field val horizon: Double = 0.8
    @Field val fisheye: Double = 0.5

    @Field val speed: Double = 0.0
    @Field val spin: Double = 0.0
    @Field val flow: Double = 0.0
    @Field val drift: Double = 0.0
}
