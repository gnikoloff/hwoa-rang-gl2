import { mat4 } from 'gl-matrix'
import { BoundingBox, createProgram, SceneNode, ShaderDefineValue } from '..'

export default class Drawable extends SceneNode {
  protected gl: WebGL2RenderingContext
  protected vao: WebGLVertexArrayObject
  protected vertexCount!: number
  protected uploadWorldMatrixToGPU = false
  protected uniformLocations: {
    [name: string]: WebGLUniformLocation | null
  } = {}
  protected attributeLocations: {
    [name: string]: GLint | -1
  } = {}

  boundingBox!: BoundingBox
  program!: WebGLProgram

  constructor(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    shaderDefines: { [name: string]: ShaderDefineValue },
    name: string | null = null,
  ) {
    super(name)
    this.gl = gl

    this.vao = gl.createVertexArray()!
    this.program = createProgram(
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      shaderDefines,
    )
    const worldMatrixLoc = gl.getUniformLocation(this.program, 'u_modelMatrix')!

    if (!worldMatrixLoc) {
      throw new Error(
        'Each Drawable is expected to have a model matrix implemented in shader',
      )
    }

    this.uniformLocations.worldMatrix = worldMatrixLoc
  }

  updateWorldMatrix(parentWorldMatrix?: mat4 | null): this {
    super.updateWorldMatrix(parentWorldMatrix)
    this.uploadWorldMatrixToGPU = true
    return this
  }

  uploadWorldMatrix(): this {
    if (!this.uploadWorldMatrixToGPU) {
      return this
    }
    this.uploadWorldMatrixToGPU = false

    this.gl.useProgram(this.program)
    this.gl.uniformMatrix4fv(
      this.uniformLocations.worldMatrix,
      false,
      this.worldMatrix,
    )
    return this
  }
}
