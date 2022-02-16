import { Box, BoxGeometry } from '..'

/**
 * Generates geometry data for a box
 * @param {Box} params
 * @returns {BoxGeometry}
 */
const createBox = (params: Box = {}): BoxGeometry => {
  const {
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
    uvOffsetEachFace = false,
    flipUVy = false,
  } = params

  const wSegs = widthSegments
  const hSegs = heightSegments
  const dSegs = depthSegments

  const itemCount =
    (wSegs + 1) * (hSegs + 1) * 2 +
    (wSegs + 1) * (dSegs + 1) * 2 +
    (hSegs + 1) * (dSegs + 1) * 2

  const vertexCount =
    (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6

  const vertexStride = 3 + 3 + 2

  const interleavedArray = new Float32Array(itemCount * vertexStride)
  const indicesArray =
    vertexCount > 65536
      ? new Uint32Array(vertexCount)
      : new Uint16Array(vertexCount)

  let i = 0
  let ii = 0

  // RIGHT
  buildPlane(
    interleavedArray,
    indicesArray,
    depth,
    height,
    width,
    dSegs,
    hSegs,
    4,
    2,
    1,
    0,
    -1,
    -1,
    i,
    ii,
    vertexStride,
    uvOffsetEachFace,
    flipUVy,
  )
  // LEFT
  buildPlane(
    interleavedArray,
    indicesArray,
    depth,
    height,
    -width,
    dSegs,
    hSegs,
    2,
    2,
    1,
    0,
    1,
    -1,
    (i += (dSegs + 1) * (hSegs + 1)),
    (ii += dSegs * hSegs),
    vertexStride,
    uvOffsetEachFace,
    flipUVy,
  )
  // TOP
  buildPlane(
    interleavedArray,
    indicesArray,
    width,
    depth,
    height,
    dSegs,
    hSegs,
    0,
    0,
    2,
    1,
    1,
    1,
    (i += (dSegs + 1) * (hSegs + 1)),
    (ii += dSegs * hSegs),
    vertexStride,
    uvOffsetEachFace,
    flipUVy,
  )
  // BOTTOM
  buildPlane(
    interleavedArray,
    indicesArray,
    width,
    depth,
    -height,
    dSegs,
    hSegs,
    5,
    0,
    2,
    1,
    1,
    -1,
    (i += (wSegs + 1) * (dSegs + 1)),
    (ii += wSegs * dSegs),
    vertexStride,
    uvOffsetEachFace,
    flipUVy,
  )
  // BACK
  buildPlane(
    interleavedArray,
    indicesArray,
    width,
    height,
    -depth,
    wSegs,
    hSegs,
    3,
    0,
    1,
    2,
    -1,
    -1,
    (i += (wSegs + 1) * (dSegs + 1)),
    (ii += wSegs * dSegs),
    vertexStride,
    uvOffsetEachFace,
    flipUVy,
  )
  // FRONT
  buildPlane(
    interleavedArray,
    indicesArray,
    width,
    height,
    depth,
    wSegs,
    hSegs,
    1,
    0,
    1,
    2,
    1,
    -1,
    (i += (wSegs + 1) * (hSegs + 1)),
    (ii += wSegs * hSegs),
    vertexStride,
    uvOffsetEachFace,
    flipUVy,
  )

  return {
    width,
    height,
    depth,
    vertexCount,
    vertexStride,
    interleavedArray,
    indicesArray,
  }
}

export default createBox

function buildPlane(
  interleavedArray: Float32Array,
  indicesArray: Uint16Array | Uint32Array,
  width: number,
  height: number,
  depth: number,
  wSegs: number,
  hSegs: number,
  faceIdx: number,
  u = 0,
  v = 1,
  w = 2,
  uDir = 1,
  vDir = -1,
  i = 0,
  ii = 0,
  vertexStride = 8,
  uvOffsetEachFace = false,
  flipUVy = false,
) {
  const io = i
  const segW = width / wSegs
  const segH = height / hSegs

  for (let iy = 0; iy <= hSegs; iy++) {
    const y = iy * segH - height / 2
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      const x = ix * segW - width / 2

      // vertices
      interleavedArray[i * vertexStride + 0 + u] = x * uDir
      interleavedArray[i * vertexStride + 0 + v] = y * vDir
      interleavedArray[i * vertexStride + 0 + w] = depth / 2

      // normal
      interleavedArray[i * vertexStride + 3 + u] = 0
      interleavedArray[i * vertexStride + 3 + v] = 0
      interleavedArray[i * vertexStride + 3 + w] = depth >= 0 ? 1 : -1

      // uv
      const step = 1 / 6
      const stepOffset = step * faceIdx
      const uvX = uvOffsetEachFace
        ? stepOffset + (ix / wSegs) * step
        : ix / wSegs
      const uvY = uvOffsetEachFace
        ? flipUVy
          ? stepOffset + step - stepOffset + (iy / hSegs) * step
          : stepOffset + (iy / hSegs) * step
        : flipUVy
        ? 1 - iy / hSegs
        : iy / hSegs
      interleavedArray[i * vertexStride + 6 + 0] = uvX
      interleavedArray[i * vertexStride + 6 + 1] = uvY
      if (iy === hSegs || ix === wSegs) {
        continue
      }
      const a = io + ix + iy * (wSegs + 1)
      const b = io + ix + (iy + 1) * (wSegs + 1)
      const c = io + ix + (iy + 1) * (wSegs + 1) + 1
      const d = io + ix + iy * (wSegs + 1) + 1

      indicesArray[ii * 6] = a
      indicesArray[ii * 6 + 1] = b
      indicesArray[ii * 6 + 2] = d
      indicesArray[ii * 6 + 3] = b
      indicesArray[ii * 6 + 4] = c
      indicesArray[ii * 6 + 5] = d

      ii++
    }
  }
}
