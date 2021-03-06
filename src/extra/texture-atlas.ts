import { Atlas } from 'texture-atlas'

const _c = document.createElement('canvas')
const _gl = _c.getContext('webgl2')!

let textureSize: number = _gl.MAX_TEXTURE_SIZE
let textureFormat = _gl.RGB

let instance: TextureAtlas
let gl: WebGL2RenderingContext

let debugMode = false

export default class TextureAtlas {
  #atlases: Atlas[] = []
  #textures: WebGLTexture[] = []

  #debugDomContainer = document.createElement('div')

  static set debugMode(newDebugMode: boolean) {
    debugMode = newDebugMode
  }

  static get textureSize() {
    return textureSize
  }

  static set textureSize(newTexSize) {
    textureSize = newTexSize
  }

  static set textureFormat(newTextureFormat: GLenum) {
    textureFormat = newTextureFormat
  }

  static set gl(glContext: WebGL2RenderingContext) {
    gl = glContext
  }

  static getInstance(): TextureAtlas {
    if (!gl) {
      throw new Error(
        'You must provide a WebGL2RenderingContext first via setting the TextureAtlas.gl property!',
      )
    }
    if (!instance) {
      instance = new TextureAtlas()
    }
    return instance
  }

  static scaleDownDrawableByFactor = (
    drawable: HTMLCanvasElement | HTMLImageElement,
    downscaleFactor: number,
  ) => {
    const canvas = document.createElement('canvas')
    const drawableWidth =
      drawable instanceof HTMLImageElement
        ? drawable.naturalWidth
        : drawable.width
    const drawableHeight =
      drawable instanceof HTMLImageElement
        ? drawable.naturalHeight
        : drawable.height

    canvas.width = drawableWidth / downscaleFactor
    canvas.height = drawableHeight / downscaleFactor

    if (debugMode) {
      console.log(
        `Scaled ${drawableWidth}x${drawableHeight} project image to ${canvas.width}x${canvas.height}`,
      )
    }

    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      drawable,
      0,
      0,
      drawableWidth,
      drawableHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    return canvas
  }

  constructor() {
    if (debugMode) {
      const maxWidthPX = 400
      const style = document.createElement('style')
      const elID = 'hwoa-rang-texture-atlas-debug'
      style.setAttribute('type', 'text/css')
      const styles = `
        #${elID} {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          transform-origin: 100% 100%;
          width: ${maxWidthPX}px;
          max-height: 100vh;
          overflow: scroll;
        }
        #${elID} canvas {
          max-width: 100%;
        }
      `
      style.appendChild(document.createTextNode(styles))
      document.getElementsByTagName('head')[0].appendChild(style)
      this.#debugDomContainer = document.createElement('div')
      this.#debugDomContainer.setAttribute('id', elID)
      document.body.appendChild(this.#debugDomContainer)
    }
  }

  pack(
    id: string,
    drawable: HTMLCanvasElement | HTMLImageElement,
    downscaleFactor = 1,
  ): this {
    const allocateNewAtlas = () => {
      const canvas = document.createElement('canvas')
      this.#debugDomContainer.appendChild(canvas)
      canvas.width = textureSize
      canvas.height = textureSize
      const texture = gl.createTexture()!

      // upload empty texture now, fill subregions with texSubImage2D later
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameterf(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      )
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        textureFormat,
        textureSize,
        textureSize,
        0,
        textureFormat,
        gl.UNSIGNED_BYTE,
        null,
      )
      // https://limnu.com/webgl-blending-youre-probably-wrong/
      // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.bindTexture(gl.TEXTURE_2D, null)

      const atlas = new Atlas(canvas)
      this.#atlases.push(atlas)
      this.#textures.push(texture)
      return atlas
    }

    let atlas = this.#atlases[this.#atlases.length - 1]
    if (!atlas) {
      atlas = allocateNewAtlas()
    }

    const drawableToPack =
      downscaleFactor === 1
        ? drawable
        : TextureAtlas.scaleDownDrawableByFactor(drawable, downscaleFactor)

    const success = atlas.pack(id, drawableToPack)
    if (!success) {
      atlas = allocateNewAtlas()
      atlas.pack(id, drawableToPack)
    }

    const uv = atlas.uv()[id]
    for (let i = 0; i < uv.length; i++) {
      uv[i][0] *= textureSize
      uv[i][1] *= textureSize
    }

    // upload drawable graphic to correct texture and correct subregion on GPU
    const texture = this.#textures[this.#textures.length - 1]
    const xOffset = uv[0][0]
    const yOffset = uv[0][1]
    const regionWidth = uv[2][0] - uv[0][0]
    const regionHeight = uv[2][1] - uv[0][1]

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      xOffset,
      yOffset,
      regionWidth,
      regionHeight,
      textureFormat,
      gl.UNSIGNED_BYTE,
      drawableToPack,
    )
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.bindTexture(gl.TEXTURE_2D, null)

    return this
  }

  getUv2(id: string): [Float32Array | null, WebGLTexture] {
    let texIdx = -1
    for (let i = 0; i < this.#atlases.length; i++) {
      const atlas = this.#atlases[i]
      const subRegionUvs = atlas.uv2()[id]
      if (subRegionUvs) {
        texIdx = i
        const texture = this.#textures[texIdx]
        return [subRegionUvs, texture]
      }
    }
    throw new Error(`Can't get uvs`)
  }
}
