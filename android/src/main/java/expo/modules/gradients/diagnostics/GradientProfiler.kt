package expo.modules.gradients.diagnostics

import android.os.Build
import android.os.Process
import android.os.SystemClock
import java.util.Collections
import java.util.WeakHashMap

object GradientProfiler {
    @Volatile
    var isEnabled = false
        private set

    @Volatile
    var gpuName = "unknown"

    @Volatile
    var gpuTimingSupported = false

    private val lock = Any()
    private val footprints = Collections.newSetFromMap(WeakHashMap<MemoryFootprint, Boolean>())
    private val tickCosts = HashMap<Long, Long>()
    private val gpuCosts = ArrayList<Double>()
    private val views = HashSet<Int>()
    private var droppedFrames = 0
    private var renders = 0
    private var startedAt = 0L
    private var startedCpu = 0L

    fun start() {
        synchronized(lock) {
            tickCosts.clear()
            gpuCosts.clear()
            views.clear()
            droppedFrames = 0
            renders = 0
            startedAt = SystemClock.elapsedRealtimeNanos()
            startedCpu = Process.getElapsedCpuTime()
            isEnabled = true
        }
    }

    fun stop(): Map<String, Any?> {
        synchronized(lock) {
            isEnabled = false
            val duration = maxOf((SystemClock.elapsedRealtimeNanos() - startedAt) / 1e9, 0.001)
            val cpuSeconds = (Process.getElapsedCpuTime() - startedCpu) / 1000.0
            val gpu = if (gpuCosts.isEmpty()) null else PerformanceSummary(gpuCosts)
            val memory = footprints.sumOf { it.estimatedMemory }
            return mapOf(
                "platform" to "android",
                "device" to deviceName,
                "gpuName" to gpuName,
                "simulator" to isEmulator,
                "duration" to duration,
                "frames" to tickCosts.size,
                "renders" to renders,
                "views" to views.size,
                "fps" to tickCosts.size / duration,
                "droppedFrames" to droppedFrames,
                "cpu" to PerformanceSummary(tickCosts.values.map { it / 1e6 }).toMap(),
                "gpu" to gpu?.toMap(),
                "gpuUtilization" to gpu?.let { gpuCosts.sum() / (duration * 1000) },
                "processCpu" to cpuSeconds / duration,
                "memory" to memory
            )
        }
    }

    fun register(footprint: MemoryFootprint) {
        synchronized(lock) { footprints.add(footprint) }
    }

    fun recordTick(frameTimeNanos: Long, costNanos: Long) {
        synchronized(lock) {
            if (!isEnabled) return
            val previous = tickCosts[frameTimeNanos] ?: 0L
            tickCosts[frameTimeNanos] = maxOf(previous, costNanos)
        }
    }

    fun recordRender(view: Int, intervalNanos: Long, periodNanos: Long) {
        synchronized(lock) {
            if (!isEnabled) return
            renders += 1
            views.add(view)
            if (periodNanos > 0 && intervalNanos > periodNanos * 3 / 2) {
                droppedFrames += Math.round(intervalNanos.toDouble() / periodNanos).toInt() - 1
            }
        }
    }

    fun recordGpu(milliseconds: Double) {
        if (milliseconds <= 0) return
        synchronized(lock) {
            if (isEnabled) gpuCosts.add(milliseconds)
        }
    }

    private val deviceName: String
        get() = "${Build.MANUFACTURER} ${Build.MODEL}, Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})"

    private val isEmulator: Boolean
        get() = Build.FINGERPRINT.contains("generic") ||
            Build.HARDWARE.contains("ranchu") ||
            Build.HARDWARE.contains("goldfish") ||
            Build.PRODUCT.contains("sdk")
}

interface MemoryFootprint {
    val estimatedMemory: Long
}
