import { SupportedCompressedTextures } from '..'

export default class TextureLoader {
  static getSupportedFormats(
    gl: WebGL2RenderingContext,
  ): SupportedCompressedTextures {
    return {
      astc: gl.getExtension('WEBGL_compressed_texture_astc'),
      etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
      etc2: gl.getExtension('WEBGL_compressed_texture_etc'),
      s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
      pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc'),
    }
  }
  static async loadCompressed(url: string, loadMipmaps = true) {
    if (!url) {
      // console.trace()
    }
    const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer())
    const ktx = new KhronosTextureContainer(arrayBuffer, 1)
    return {
      mipmaps: ktx.mipmaps(loadMipmaps),
      width: ktx.pixelWidth,
      height: ktx.pixelHeight,
      format: ktx.glInternalFormat,
      mipmapCount: ktx.numberOfMipmapLevels,
    }
  }
}

// shamelessly lifted from https://github.com/TimvanScherpenzeel/texture-compressor/blob/master/docs/data/KTXLoader.js
class KhronosTextureContainer {
  static HEADER_LEN = 12 + 13 * 4 // identifier + header elements (not including key value meta-data pairs)
  // load types
  static COMPRESSED_2D = 0 // uses a gl.compressedTexImage2D()
  static COMPRESSED_3D = 1 // uses a gl.compressedTexImage3D()
  static TEX_2D = 2 // uses a gl.texImage2D()
  static TEX_3D = 3 // uses a gl.texImage3D()

  arrayBuffer: ArrayBuffer

  glType!: number
  glTypeSize!: number
  glFormat!: number
  glInternalFormat!: number

  numberOfArrayElements!: number
  numberOfMipmapLevels!: number
  bytesOfKeyValueData!: number
  numberOfFaces!: number
  loadType!: number

  pixelWidth!: number
  pixelHeight!: number
  pixelDepth!: number

  constructor(
    arrayBuffer: ArrayBuffer,
    facesExpected: 1 | 6 /*, threeDExpected, textureArrayExpected */,
  ) {
    this.arrayBuffer = arrayBuffer

    // Test that it is a ktx formatted file, based on the first 12 bytes, character representation is:
    // '??', 'K', 'T', 'X', ' ', '1', '1', '??', '\r', '\n', '\x1A', '\n'
    // 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
    var identifier = new Uint8Array(this.arrayBuffer, 0, 12)
    if (
      identifier[0] !== 0xab ||
      identifier[1] !== 0x4b ||
      identifier[2] !== 0x54 ||
      identifier[3] !== 0x58 ||
      identifier[4] !== 0x20 ||
      identifier[5] !== 0x31 ||
      identifier[6] !== 0x31 ||
      identifier[7] !== 0xbb ||
      identifier[8] !== 0x0d ||
      identifier[9] !== 0x0a ||
      identifier[10] !== 0x1a ||
      identifier[11] !== 0x0a
    ) {
      console.error('texture missing KTX identifier')
      return
    }

    // load the reset of the header in native 32 bit uint
    var dataSize = Uint32Array.BYTES_PER_ELEMENT
    var headerDataView = new DataView(this.arrayBuffer, 12, 13 * dataSize)
    var endianness = headerDataView.getUint32(0, true)
    var littleEndian = endianness === 0x04030201

    this.glType = headerDataView.getUint32(1 * dataSize, littleEndian) // must be 0 for compressed textures
    this.glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian) // must be 1 for compressed textures
    this.glFormat = headerDataView.getUint32(3 * dataSize, littleEndian) // must be 0 for compressed textures
    this.glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian) // the value of arg passed to gl.compressedTexImage2D(,,x,,,,)
    // this.glBaseInternalFormat = headerDataView.getUint32(
    //   5 * dataSize,
    //   littleEndian,
    // ) // specify GL_RGB, GL_RGBA, GL_ALPHA, etc (un-compressed only)
    this.pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian) // level 0 value of arg passed to gl.compressedTexImage2D(,,,x,,,)
    this.pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian) // level 0 value of arg passed to gl.compressedTexImage2D(,,,,x,,)
    this.pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian) // level 0 value of arg passed to gl.compressedTexImage3D(,,,,,x,,)
    this.numberOfArrayElements = headerDataView.getUint32(
      9 * dataSize,
      littleEndian,
    ) // used for texture arrays
    this.numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian) // used for cubemap textures, should either be 1 or 6
    this.numberOfMipmapLevels = headerDataView.getUint32(
      11 * dataSize,
      littleEndian,
    ) // number of levels; disregard possibility of 0 for compressed textures
    this.bytesOfKeyValueData = headerDataView.getUint32(
      12 * dataSize,
      littleEndian,
    ) // the amount of space after the header for meta-data

    // Make sure we have a compressed type.  Not only reduces work, but probably better to let dev know they are not compressing.
    if (this.glType !== 0) {
      console.warn('only compressed formats currently supported')
      return
    } else {
      // value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
      this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels)
    }
    if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
      console.warn('only 2D textures currently supported')
      return
    }
    if (this.numberOfArrayElements !== 0) {
      console.warn('texture arrays not currently supported')
      return
    }
    if (this.numberOfFaces !== facesExpected) {
      console.warn(
        'number of faces expected' +
          facesExpected +
          ', but found ' +
          this.numberOfFaces,
      )
      return
    }
    // we now have a completely validated file, so could use existence of loadType as success
    // would need to make this more elaborate & adjust checks above to support more than one load type
    this.loadType = KhronosTextureContainer.COMPRESSED_2D
  }
  mipmaps(loadMipmaps: boolean) {
    var mipmaps = []

    // initialize width & height for level 1
    var dataOffset =
      KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData
    var width = this.pixelWidth
    var height = this.pixelHeight
    var mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1

    for (var level = 0; level < mipmapCount; level++) {
      var imageSize = new Int32Array(this.arrayBuffer, dataOffset, 1)[0] // size per face, since not supporting array cubemaps
      dataOffset += 4 // size of the image + 4 for the imageSize field

      for (var face = 0; face < this.numberOfFaces; face++) {
        var byteArray = new Uint8Array(this.arrayBuffer, dataOffset, imageSize)

        mipmaps.push({ data: byteArray, width: width, height: height })

        dataOffset += imageSize
        dataOffset += 3 - ((imageSize + 3) % 4) // add padding for odd sized image
      }
      width = Math.max(1.0, width * 0.5)
      height = Math.max(1.0, height * 0.5)
    }

    return mipmaps
  }
}
