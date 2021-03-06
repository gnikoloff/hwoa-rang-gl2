import { ShaderDefineValue } from '..'
import createShader from './create-shader'

/**
 * Create and link WebGLProgram with provided shader strings
 * @param {(WebGL2RenderingContext)} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @returns {WebGLProgram}
 */
const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  defines: { [key: string]: ShaderDefineValue },
): WebGLProgram => {
  const vertexShader: WebGLShader | null = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource,
    defines,
  )

  const fragmentShader: WebGLShader | null = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
    defines,
  )

  const program: WebGLProgram = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  // It is safe to detach and delete shaders once a program is linked
  gl.detachShader(program, vertexShader)
  gl.deleteShader(vertexShader)
  gl.detachShader(program, fragmentShader)
  gl.deleteShader(fragmentShader)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  }
  const err = new Error(
    `Error linking program: ${gl.getProgramInfoLog(program)}`,
  )
  gl.deleteProgram(program)
  throw err
}

export default createProgram
