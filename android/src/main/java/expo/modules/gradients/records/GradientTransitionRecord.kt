package expo.modules.gradients.records

import expo.modules.gradients.enums.TransitionType
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class GradientTransitionRecord : Record {
    @Field val type: TransitionType = TransitionType.TIMING
    @Field val duration: Double = 400.0
    @Field val delay: Double = 0.0
    @Field val easing: List<Double> = listOf(0.42, 0.0, 0.58, 1.0)
    @Field val damping: Double = 18.0
    @Field val stiffness: Double = 160.0
    @Field val mass: Double = 1.0
}
