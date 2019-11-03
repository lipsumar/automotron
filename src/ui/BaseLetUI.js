const LARGE_SIDE = 10
const SMALL_SIDE = 6

export default {

  x(center = true) {
    switch (this.side) {
      case 'bottom':
      case 'top':
        return (this.node.hasOutlet.left ? SMALL_SIDE : 0) + this.node.rect.width() / 2 + this.offset.x - (center ? 0 : this.width() / 2)
      case 'left':
        return 0
      case 'right':
        return (this.node.hasOutlet.left ? SMALL_SIDE : 0) + this.node.rect.width() + this.offset.x
      case 'center':
        return center 
          ? (this.node.hasOutlet.left ? SMALL_SIDE : 0) + this.node.rect.width()/2
          : SMALL_SIDE * 2
    }
  },

  absX(center) {
    return this.node.group.x() + this.x(center)
  },

  y(center = true) {
    switch (this.side) {
      case 'bottom':
        return (this.node.hasOutlet.top ? SMALL_SIDE : 0) + this.node.rect.height() + this.offset.y
      case 'top':
        return 0
      case 'left':
      case 'right':
        return (this.node.hasOutlet.top ? SMALL_SIDE : 0) + this.node.rect.height() / 2 + this.offset.y - (center ? 0 : this.height() / 2)
      case 'center':
        return center 
          ? (this.node.hasOutlet.top ? SMALL_SIDE : 0) + this.node.rect.height()/2 
          : SMALL_SIDE * 2
    }
  },

  absY(center) {
    return this.node.group.y() + this.y(center)
  },

  width() {
    switch (this.side) {
      case 'bottom':
      case 'top':
        return LARGE_SIDE
      case 'left':
      case 'right':
        return SMALL_SIDE
      case 'center':
        return this.node.rect.width() - SMALL_SIDE*2
    }
  },

  height() {
    switch (this.side) {
      case 'bottom':
      case 'top':
        return SMALL_SIDE
      case 'left':
      case 'right':
        return LARGE_SIDE
      case 'center':
        return this.node.rect.height() - SMALL_SIDE*2
    }
  },

  absPos(center){
    return {
      x: this.absX(center),
      y: this.absY(center)
    }
  },

  reposition() {
    this.rect.x(this.x(false))
    this.rect.y(this.y(false))
    if (this.rectHandle) {
      this.rectHandle.x(this.handleX(false))
      this.rectHandle.y(this.handleY(false))
    }

  }

}