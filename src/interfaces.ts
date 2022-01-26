import { SceneNode } from '.'

export type UniformValue = GLfloat | GLint | Float32Array | Int32Array

export interface UniformInfo {
  type: GLint
  value?: UniformValue
}

export interface Uniform extends UniformInfo {
  location: WebGLUniformLocation | null
}

export interface Attribute {
  location: GLint | -1
  value: Float32Array
}

export type ShaderDefineValue = boolean | number | string

export interface UBOVariableInfo {
  index: GLuint
  offset: GLuint
}

export interface FramebufferInfo {
  width: number
  height: number
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
  depthTexture?: WebGLTexture
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

export interface Geometry {
  vertexCount: number
  vertexStride: number
  interleavedArray: Float32Array
  indicesArray: Uint16Array | Uint32Array
}

export interface PlaneGeometry extends Geometry {
  width: number
  height: number
}

export interface BoxGeometry extends Geometry {
  width: number
  height: number
  depth: number
}

export type traverseCallback = (node: SceneNode, depthLevel: number) => void

export type findNodeInTreeCallback = (
  node: SceneNode,
) => SceneNode | boolean | null

export interface Plane {
  /**
   * @default 1
   */
  width?: number
  /**
   * @default 1
   */
  height?: number
  /**
   * @default 1
   */
  widthSegments?: number
  /**
   * @default 1
   */
  heightSegments?: number
  /**
   * @default false
   */
  flipUVy?: boolean
}

export interface RoundBox {
  /**
   * @default 1
   */
  width?: number
  /**
   * @default 1
   */
  height?: number
  /**
   * @default 1
   */
  depth?: number
  /**
   * @default 0.5
   */
  radius?: number
  /**
   * @default 4
   */
  div?: number
}

export interface Box {
  /**
   * @defaultValue 1
   */
  width?: number
  /**
   * @defaultValue 1
   */
  height?: number
  /**
   * @defaultValue 1
   */
  depth?: number
  /**
   * @defaultValue 1
   */
  widthSegments?: number
  /**
   * @defaultValue 1
   */
  heightSegments?: number
  /**
   * @defaultValue 1
   */
  depthSegments?: number
  /**
   * @defaultValue false
   */
  uvOffsetEachFace?: boolean
}
