import { mat4 } from 'gl-matrix'
import { createProgram } from './create-program'
import { SceneNode } from './scene-node'
// import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
// import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export class Renderable extends SceneNode {
  protected gl: WebGL2RenderingContext
  protected vao: WebGLVertexArrayObject
  protected drawProgram!: WebGLProgram
  protected cameraUBOIndex!: GLuint
  protected modelMatrixLocation: WebGLUniformLocation
  protected timeLocation: WebGLUniformLocation
  protected vertexCount: number
  protected shouldUploadModelMatrix = false

  get program(): WebGLProgram {
    return this.drawProgram
  }

  constructor(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    shaderDefines: Record<string, any> = {},
  ) {
    super()
    this.gl = gl
    this.vao = gl.createVertexArray()!
    this.drawProgram = createProgram(
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      shaderDefines,
    )
    this.modelMatrixLocation = gl.getUniformLocation(
      this.drawProgram,
      'modelMatrix',
    )!
    this.cameraUBOIndex = gl.getUniformBlockIndex(this.drawProgram, 'Camera')
    this.timeLocation = gl.getUniformLocation(this.drawProgram, 'time')!
  }

  updateWorldMatrix(parentWorldMatrix?: mat4 | null): this {
    super.updateWorldMatrix(parentWorldMatrix)
    this.shouldUploadModelMatrix = true
    return this
  }
}
