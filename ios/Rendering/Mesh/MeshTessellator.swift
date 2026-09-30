//
//  MeshTessellator.swift
//  Pods
//
//  Created by rit3zh CX on 9/26/26.
//

import simd

enum MeshTessellator {
  static func surface(for key: MeshSurface.Key) -> MeshSurface {
    let rows = key.rows
    let columns = key.columns
    let subdivisions = max(6, min(16, 64 / max(rows - 1, columns - 1)))
    let gridColumns = (columns - 1) * subdivisions + 1
    let gridRows = (rows - 1) * subdivisions + 1
    let tension = min(max(key.smoothness, 0), 1)

    let stride = columns + 2
    let lattice = paddedPositions(key.points, rows: rows, columns: columns)
    let tints = paddedColors(key.colors.map { ColorSpace.encode($0, in: key.space) }, rows: rows, columns: columns)
    let steps = (0...subdivisions).map { weights(Double($0) / Double(subdivisions), tension: tension) }

    var vertices = [MeshVertex]()
    vertices.reserveCapacity(gridColumns * gridRows)

    for gridRow in 0..<gridRows {
      let row = min(gridRow / subdivisions, rows - 2)
      let wy = steps[gridRow - row * subdivisions]
      for gridColumn in 0..<gridColumns {
        let column = min(gridColumn / subdivisions, columns - 2)
        let wx = steps[gridColumn - column * subdivisions]

        var point = SIMD2<Double>(repeating: 0)
        var mixed = SIMD4<Float>(repeating: 0)
        for i in 0..<4 {
          let base = (row + i) * stride + column
          for j in 0..<4 {
            let weight = wy[i] * wx[j]
            guard weight != 0 else { continue }
            point += lattice[base + j] * weight
            mixed += tints[base + j] * Float(weight)
          }
        }

        let output = ColorSpace.output(ColorSpace.decode(mixed, from: key.space))
        vertices.append(MeshVertex(position: SIMD2(Float(point.x), Float(point.y)), color: output))
      }
    }

    return MeshSurface(key: key, vertices: vertices, columns: gridColumns, rows: gridRows)
  }

  private static func paddedPositions(_ points: [SIMD2<Double>], rows: Int, columns: Int) -> [SIMD2<Double>] {
    let stride = columns + 2
    var padded = [SIMD2<Double>](repeating: .zero, count: (rows + 2) * stride)
    for row in 0..<rows {
      let offset = (row + 1) * stride
      for column in 0..<columns {
        padded[offset + column + 1] = points[row * columns + column]
      }
      padded[offset] = 2 * padded[offset + 1] - padded[offset + 2]
      padded[offset + columns + 1] = 2 * padded[offset + columns] - padded[offset + columns - 1]
    }
    for column in 0..<stride {
      padded[column] = 2 * padded[stride + column] - padded[2 * stride + column]
      let last = (rows + 1) * stride + column
      padded[last] = 2 * padded[last - stride] - padded[last - 2 * stride]
    }
    return padded
  }

  private static func paddedColors(_ colors: [SIMD4<Float>], rows: Int, columns: Int) -> [SIMD4<Float>] {
    let stride = columns + 2
    var padded = [SIMD4<Float>](repeating: .zero, count: (rows + 2) * stride)
    for row in 0..<(rows + 2) {
      let source = min(max(row - 1, 0), rows - 1) * columns
      for column in 0..<stride {
        padded[row * stride + column] = colors[source + min(max(column - 1, 0), columns - 1)]
      }
    }
    return padded
  }

  private static func weights(_ t: Double, tension: Double) -> SIMD4<Double> {
    let t2 = t * t
    let t3 = t2 * t
    let spline = SIMD4(
      (-t3 + 2 * t2 - t) * 0.5,
      (3 * t3 - 5 * t2 + 2) * 0.5,
      (-3 * t3 + 4 * t2 + t) * 0.5,
      (t3 - t2) * 0.5
    )
    let eased = t2 * (3 - 2 * t)
    let linear = SIMD4(0, 1 - eased, eased, 0)
    return linear + (spline - linear) * tension
  }
}
