export class Tree<T, U> {
  map = new Map<T, Tree<T, U>>()
  value: U | undefined

  set (path: Array<T>, value: U, pathIndex: number = 0): void {
    if (pathIndex === path.length) {
      this.value = value
    } else {
      const pathElement: T | undefined = path[pathIndex]
      if (pathElement === undefined) {
        throw Error('path index out of bounds')
      }
      let subTree: Tree<T, U> | undefined = this.map.get(pathElement)
      if (subTree === undefined) {
        subTree = new Tree<T, U>()
        this.map.set(pathElement, subTree)
      }
      subTree.set(path, value, pathIndex + 1)
    }
  }

  get (path: Array<T>, pathIndex: number = 0): U | undefined {
    if (pathIndex === path.length) {
      return this.value
    } else {
      const pathElement: T | undefined = path[pathIndex]
      if (pathElement === undefined) {
        throw Error('path index out of bounds')
      }
      const subTree: Tree<T, U> | undefined = this.map.get(pathElement)
      if (subTree === undefined) {
        return undefined
      }
      return subTree.get(path, pathIndex + 1)
    }
  }

  *entries (): Generator<[Array<T>, U]> {
    if (this.value !== undefined) {
      yield [[], this.value]
    }
    for (const [pathElement, subTree] of this.map.entries()) {
      for (const [path, value] of subTree.entries()) {
        yield [[pathElement, ...path], value]
      }
    }
  }
}
