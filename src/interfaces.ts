import { vec3 } from 'gl-matrix'
import { SceneNode } from '.'

export interface ProjectedMouse {
  rayStart: vec3
  rayEnd: vec3
  rayDirection: vec3
}

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

export interface Geometry {
  vertexCount: number
  vertexStride: number
  interleavedArray: Float32Array
  indicesArray: Uint16Array | Uint32Array
}

export interface PlaneGeometry extends Geometry {
  width?: number
  height?: number
}

export interface RoundBox {
  width?: number
  height?: number
  depth?: number
  radius?: number
  div?: number
}

export interface RoundBoxGeometry extends Geometry {
  width: number
  height: number
  depth: number
}

export type iterateChildCallback = (node: SceneNode, idx: number) => void

export type traverseCallback = (node: SceneNode, depthLevel: number) => void

export type findChildCallback = (node: SceneNode) => SceneNode | null
