import { vec3 } from 'gl-matrix'
import { SceneNode } from '.'

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array

export type ShaderDefineValue = boolean | number

export interface UBOVariableInfo {
  index: GLuint
  offset: GLuint
}

export interface UBOInfo {
  blockIndex: GLuint
  blockSize: GLuint
  usedInVertexShader: GLboolean
  usedInFragmentShader: GLboolean
  uniforms: {
    [key: string]: UBOVariableInfo
  }
}

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

export type iterateChildCallback = (node: SceneNode, idx: number) => void

export type traverseCallback = (node: SceneNode, depthLevel: number) => void

export type findChildCallback = (node: SceneNode) => SceneNode | null
