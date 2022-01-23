import { Drawable, PerspectiveCamera } from '..'

const vertexShader = `#version 300 es
  in vec4 a_position;
  in vec4 a_color;
  uniform mat4 u_worldMatrix;
  uniform mat4 u_projectionViewMatrix;
  out vec4 v_color;
  void main () {
    gl_Position = u_projectionViewMatrix * u_worldMatrix * a_position;
    v_color = a_color;
  }
`

const fragmentShader = `#version 300 es
  precision highp float;
  in vec4 v_color;
  out vec4 finalColor;
  void main () {
    finalColor = v_color;
  }
`

export default class CameraDebug extends Drawable {
  #camera: PerspectiveCamera

  constructor(gl: WebGL2RenderingContext, camera: PerspectiveCamera) {
    super(gl, vertexShader, fragmentShader)
    this.#camera = camera
    // console.log(rad)
    // prettier-ignore

    const numSides = 4
    const step = (Math.PI * 2) / numSides
    const frameVertices = new Float32Array(
      // frustum floats count
      numSides * 2 * 6 +
        // far rect floats count
        4 * 6,
    )

    for (let i = 0; i <= numSides; i++) {
      console.log('i', i)
      // for (let n = 0; n < 2; n++) {
      frameVertices[i * 12 + 0] = camera.near
      frameVertices[i * 12 + 1] = camera.near
      frameVertices[i * 12 + 2] = camera.near

      frameVertices[i * 12 + 3] = 1
      frameVertices[i * 12 + 4] = 0
      frameVertices[i * 12 + 5] = 0

      const offset = Math.PI * 0.25
      const radius = Math.PI * 2 * camera.fieldOfView
      frameVertices[i * 12 + 6] = Math.cos(i * step + offset) * radius
      frameVertices[i * 12 + 7] = Math.sin(i * step + offset) * radius
      frameVertices[i * 12 + 8] = -Math.abs(camera.far)

      frameVertices[i * 12 + 9] = 0
      frameVertices[i * 12 + 10] = 0
      frameVertices[i * 12 + 11] = 1
    }

    console.log(frameVertices)
    this.vertexCount = numSides * 2
    const interleavedBuffer = gl.createBuffer()

    const a_posLoc = gl.getAttribLocation(this.program, 'a_position')
    const a_colorLoc = gl.getAttribLocation(this.program, 'a_color')

    this.setUniform('u_worldMatrix', {
      type: gl.FLOAT_MAT4,
    })
    this.setUniform('u_projectionViewMatrix', {
      type: gl.FLOAT_MAT4,
    })

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, interleavedBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, frameVertices, gl.STATIC_DRAW)

    gl.enableVertexAttribArray(a_posLoc)
    gl.vertexAttribPointer(
      a_posLoc,
      3,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0,
    )
    gl.enableVertexAttribArray(a_colorLoc)
    gl.vertexAttribPointer(
      a_colorLoc,
      3,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
    )
    gl.bindVertexArray(null)
  }
  preRender(displayCamera: PerspectiveCamera): this {
    this.updateUniform(
      'u_projectionViewMatrix',
      displayCamera.projectionViewMatrix as Float32Array,
    )
    return this
  }
  render(): void {
    this.updateUniform(
      'u_worldMatrix',
      this.#camera.viewMatrixInverse as Float32Array,
    )

    const gl = this.gl
    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.LINES, 0, this.vertexCount)
  }
}
