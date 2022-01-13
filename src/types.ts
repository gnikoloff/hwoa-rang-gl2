import { vec3 } from 'gl-matrix'
import { SceneNode } from '.'

export type ShaderDefineValue = boolean | number

export interface BoundingBox {
  min: vec3
  max: vec3
}

export interface Plane {
  width?: number
  height?: number
  widthSegments?: number
  heightSegments?: number
}

export interface RoundBox {
  width?: number
  height?: number
  depth?: number
  radius?: number
  div?: number
}

export interface RoundBoxGeometry {
  width: number
  height: number
  depth: number
  vertexCount: number
  vertexStride: number
  interleavedArray: Float32Array
  indicesArray: Int16Array
}

export type traverseCallback = (node: SceneNode, depthLevel: number) => void
