import { mat4 } from 'gl-matrix'
import { uid } from 'uid'
import { findNodeInTreeCallback, Transform, traverseCallback } from '..'

export default class SceneNode extends Transform {
  parentNode: SceneNode | null = null
  children: SceneNode[] = []

  worldMatrix = mat4.create()
  normalMatrix = mat4.create()

  uid = uid(9)
  name: string | null

  constructor(name: string | null = null) {
    super()
    this.name = name
  }

  get levelIndex(): number {
    let levelIndex = 0
    let parentNode = this.parentNode
    while (parentNode) {
      levelIndex++
      parentNode = parentNode.parentNode
    }
    return levelIndex
  }

  setParent(parentNode: SceneNode | null = null): this {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this)
      if (idx >= 0) {
        this.parentNode.children.splice(idx, 1)
      }
    }
    if (parentNode) {
      parentNode.children.push(this)
    }
    this.parentNode = parentNode
    return this
  }

  updateWorldMatrix(parentWorldMatrix: mat4 | null = null): this {
    if (this.shouldUpdate) {
      this.updateModelMatrix()
    }
    if (parentWorldMatrix) {
      mat4.mul(this.worldMatrix, parentWorldMatrix, this.modelMatrix)
    } else {
      mat4.copy(this.worldMatrix, this.modelMatrix)
    }
    mat4.invert(this.normalMatrix, this.worldMatrix)
    mat4.transpose(this.normalMatrix, this.normalMatrix)

    this.children.forEach((child) => {
      child.updateWorldMatrix(this.worldMatrix)
    })
    return this
  }

  traverse(callback: traverseCallback, depth = 0): void {
    callback(this, depth)
    depth++
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      child.traverse(callback, depth)
    }
  }

  findChild(callback: findNodeInTreeCallback): SceneNode | null {
    if (callback(this)) {
      return this
    }
    let outNode: SceneNode | null = null
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if ((outNode = child.findChild(callback))) {
        break
      }
    }
    return outNode
  }

  findChildByName(name: string): SceneNode | null {
    if (this.name === name) {
      return this
    }
    let outNode: SceneNode | null = null
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if ((outNode = child.findChildByName(name))) {
        break
      }
    }
    return outNode
  }

  findParent(callback: findNodeInTreeCallback): SceneNode | null {
    if (callback(this)) {
      return this
    }
    let outNode: SceneNode | null = null
    let parentNode = this.parentNode
    while (parentNode) {
      if ((outNode = parentNode.findParent(callback))) {
        break
      }
      parentNode = parentNode?.parentNode
    }
    return outNode
  }

  findParentByName(name: string): SceneNode | null {
    if (this.name === name) {
      return this
    }
    let outNode: SceneNode | null = null
    let parentNode = this.parentNode
    while (parentNode) {
      if ((outNode = parentNode.findParentByName(name))) {
        break
      }
      parentNode = parentNode?.parentNode
    }
    return outNode
  }

  render(timeMS: DOMHighResTimeStamp): void {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].render(timeMS)
    }
  }
}
