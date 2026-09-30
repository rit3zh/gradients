package expo.modules.gradients.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager

object MotionSource : SensorEventListener {
    @Volatile
    var tiltX = 0f
        private set

    @Volatile
    var tiltY = 0f
        private set

    private var manager: SensorManager? = null
    private var subscribers = 0
    private var referenceRoll: Double? = null
    private var referencePitch = 0.0
    private var smoothedX = 0.0
    private var smoothedY = 0.0
    private val rotation = FloatArray(9)
    private val orientation = FloatArray(3)

    fun subscribe(context: Context) {
        subscribers += 1
        if (subscribers != 1) return
        val manager = context.applicationContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager ?: return
        val sensor = manager.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR)
            ?: manager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
            ?: return
        this.manager = manager
        manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
    }

    fun unsubscribe() {
        subscribers = maxOf(subscribers - 1, 0)
        if (subscribers != 0) return
        manager?.unregisterListener(this)
        manager = null
        referenceRoll = null
        smoothedX = 0.0
        smoothedY = 0.0
        tiltX = 0f
        tiltY = 0f
    }

    override fun onSensorChanged(event: SensorEvent) {
        SensorManager.getRotationMatrixFromVector(rotation, event.values)
        SensorManager.getOrientation(rotation, orientation)
        val roll = orientation[2].toDouble()
        val pitch = orientation[1].toDouble()

        val originRoll = referenceRoll ?: roll
        val originPitch = if (referenceRoll == null) pitch else referencePitch
        referenceRoll = originRoll + (roll - originRoll) * DRIFT
        referencePitch = originPitch + (pitch - originPitch) * DRIFT

        val offsetX = ((roll - originRoll).coerceIn(-RANGE, RANGE)) / RANGE
        val offsetY = ((pitch - originPitch).coerceIn(-RANGE, RANGE)) / RANGE
        smoothedX += (offsetX - smoothedX) * SMOOTHING
        smoothedY += (offsetY - smoothedY) * SMOOTHING
        tiltX = smoothedX.toFloat()
        tiltY = smoothedY.toFloat()
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) = Unit

    private const val DRIFT = 0.004
    private const val RANGE = 0.7
    private const val SMOOTHING = 0.18
}
