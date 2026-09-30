//
//  FrameArena.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import Metal

final class FrameArena {
  private static let alignment = 256
  private static let depth = 3

  private var buffers: [MTLBuffer?] = Array(repeating: nil, count: depth)
  private var index = 0
  private var pendingIndex: Int?
  private let semaphore = DispatchSemaphore(value: depth)

  var allocatedBytes: Int {
    buffers.reduce(0) { $0 + ($1?.length ?? 0) }
  }

  func reserve() -> Bool {
    semaphore.wait(timeout: .now()) == .success
  }

  func buffer(device: MTLDevice, length: Int) -> MTLBuffer? {
    let slot = (index + 1) % Self.depth
    pendingIndex = slot
    if let buffer = buffers[slot], buffer.length >= length {
      return buffer
    }
    let capacity = max(length, 64 * 1024).roundedUp(to: 16 * 1024)
    let buffer = device.makeBuffer(length: capacity, options: .storageModeShared)
    buffers[slot] = buffer
    return buffer
  }

  func commit(with commandBuffer: MTLCommandBuffer) {
    if let pendingIndex {
      index = pendingIndex
    }
    pendingIndex = nil
    commandBuffer.addCompletedHandler { [semaphore] _ in
      semaphore.signal()
    }
  }

  func cancel() {
    pendingIndex = nil
    semaphore.signal()
  }

  static func align(_ offset: Int) -> Int {
    offset.roundedUp(to: alignment)
  }
}

private extension Int {
  func roundedUp(to multiple: Int) -> Int {
    (self + multiple - 1) / multiple * multiple
  }
}
