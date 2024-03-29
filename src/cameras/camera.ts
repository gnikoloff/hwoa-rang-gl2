import { mat4, vec3 } from 'gl-matrix'

export default class Camera {
  upVector = vec3.fromValues(0, 1, 0)
  position = vec3.fromValues(0, 0, 0)
  lookAt = vec3.fromValues(0, 0, 0)

  projectionMatrix = mat4.create()
  viewMatrix = mat4.create()
  viewMatrixInverse = mat4.create()

  projectionViewMatrix = mat4.create()

  updateViewMatrix(): this {
    mat4.lookAt(this.viewMatrix, this.position, this.lookAt, this.upVector)
    mat4.invert(this.viewMatrixInverse, this.viewMatrix)
    return this
  }

  updateProjectionMatrix(): this {
    // no-op
    return this
  }

  updateProjectionViewMatrix(): this {
    this.updateViewMatrix()
    this.updateProjectionMatrix()
    mat4.mul(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix)
    return this
  }
}
