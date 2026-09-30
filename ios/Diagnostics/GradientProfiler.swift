//
//  GradientProfiler.swift
//  Pods
//
//  Created by rit3zh CX on 9/27/26.
//

import Darwin
import Foundation
import QuartzCore

final class GradientProfiler {
  static let shared = GradientProfiler()

  private let lock = NSLock()
  private let renderers = NSHashTable<GradientRenderer>.weakObjects()
  private var enabled = false
  private var startedAt: CFTimeInterval = 0
  private var startedCPU: Double = 0
  private var tickCosts: [Double] = []
  private var gpuCosts: [Double] = []
  private var droppedFrames = 0
  private var expectedInterval: CFTimeInterval = 1.0 / 60
  private var renders = 0
  private var views = Set<ObjectIdentifier>()

  private init() {}

  var isEnabled: Bool {
    lock.lock()
    defer { lock.unlock() }
    return enabled
  }

  func start() {
    lock.lock()
    defer { lock.unlock() }
    tickCosts.removeAll(keepingCapacity: true)
    gpuCosts.removeAll(keepingCapacity: true)
    droppedFrames = 0
    renders = 0
    views.removeAll()
    startedAt = CACurrentMediaTime()
    startedCPU = Self.processCPUTime()
    enabled = true
  }

  func stop() -> [String: Any] {
    lock.lock()
    defer { lock.unlock() }
    let duration = max(CACurrentMediaTime() - startedAt, 0.001)
    let cpuTime = Self.processCPUTime() - startedCPU
    enabled = false

    let gpu = gpuCosts.isEmpty ? nil : PerformanceSummary(gpuCosts)
    let gpuBusy = gpuCosts.reduce(0, +) / (duration * 1000)
    let memory = renderers.allObjects.reduce(0) { $0 + $1.estimatedMemory }

    return [
      "platform": "ios",
      "device": Self.deviceName,
      "gpuName": MetalContext.shared.device?.name ?? "unknown",
      "simulator": Self.isSimulator,
      "duration": duration,
      "frames": tickCosts.count,
      "renders": renders,
      "views": views.count,
      "fps": Double(tickCosts.count) / duration,
      "droppedFrames": droppedFrames,
      "cpu": PerformanceSummary(tickCosts).dictionary,
      "gpu": gpu?.dictionary ?? NSNull(),
      "gpuUtilization": gpu == nil ? NSNull() : gpuBusy,
      "processCpu": cpuTime / duration,
      "memory": memory,
    ]
  }

  func register(_ renderer: GradientRenderer) {
    lock.lock()
    defer { lock.unlock() }
    renderers.add(renderer)
  }

  func recordTick(cost: CFTimeInterval, expected: CFTimeInterval) {
    lock.lock()
    defer { lock.unlock() }
    guard enabled else { return }
    tickCosts.append(cost * 1000)
    if expected > 0 {
      expectedInterval = expected
    }
  }

  func recordRender(of view: ObjectIdentifier, interval: CFTimeInterval) {
    lock.lock()
    defer { lock.unlock() }
    guard enabled else { return }
    renders += 1
    views.insert(view)
    if interval > expectedInterval * 1.5 {
      droppedFrames += Int((interval / expectedInterval).rounded()) - 1
    }
  }

  func recordGPU(seconds: CFTimeInterval) {
    guard seconds > 0 else { return }
    lock.lock()
    defer { lock.unlock() }
    guard enabled else { return }
    gpuCosts.append(seconds * 1000)
  }

  private static func processCPUTime() -> Double {
    var usage = rusage()
    getrusage(RUSAGE_SELF, &usage)
    let user = Double(usage.ru_utime.tv_sec) + Double(usage.ru_utime.tv_usec) / 1_000_000
    let system = Double(usage.ru_stime.tv_sec) + Double(usage.ru_stime.tv_usec) / 1_000_000
    return user + system
  }

  private static var isSimulator: Bool {
    ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] != nil
  }

  private static var deviceName: String {
    if let model = ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] {
      return "\(model) Simulator, iOS \(ProcessInfo.processInfo.operatingSystemVersionString)"
    }
    var system = utsname()
    uname(&system)
    let machine = withUnsafeBytes(of: &system.machine) { bytes in
      String(decoding: bytes.prefix { $0 != 0 }, as: UTF8.self)
    }
    return "\(machine), iOS \(ProcessInfo.processInfo.operatingSystemVersionString)"
  }
}
