var Nano = require('nanocomponent')
var defregl = require('deferred-regl')
var mregl = require('./multi.js')

module.exports = Root

function Root (regl) {
  if (!(this instanceof Root)) return new Root(regl)
  Nano.call(this)
  this.components = []
  this._regl = regl
}
Root.prototype = Object.create(Nano.prototype)

Root.prototype.create = function () {
  var c = new Component()
  this.components.push(c)
  if (this._mregl) c._setMregl(this._mregl)
  return c
}

Root.prototype._render = function () {
  if (!this.element) {
    this.element = document.createElement('canvas')
  }
  return this.element
}

Root.prototype._update = function () { return false }

Root.prototype._load = function () {
  this._mregl = mregl(this._regl, this.element)
  for (var i = 0; i < this.components.length; i++) {
    this.components[i]._setMregl(this._mregl)
  }
}

Root.prototype._unload = function () {
  this._mregl.destroy()
  for (var i = 0; i < this.components.length; i++) {
    this.components[i]._setMregl(null)
  }
  this._mregl = null
}

function Component (opts) {
  var self = this
  if (!(self instanceof Component)) return new Component(opts)
  Nano.call(self)
  if (!opts) opts = {}
  self._elwidth = null
  self._elheight = null
  self._opts = opts
  self.element = document.createElement('div')
  self.element.style.display = 'inline-block'
  if (opts.width) {
    self.element.style.width = opts.width + 'px'
    self._elwidth = opts.width
  }
  if (opts.height) {
    self.element.style.height = opts.height + 'px'
    self._elheight = opts.height
  }
  self.regl = defregl()
  self._regl = null
  self._mregl = null
  self._mreglqueue = []
}
Component.prototype = Object.create(Nano.prototype)

Component.prototype._getMregl = function (fn) {
  if (this._mregl) fn(this._mregl)
  else this._mreglqueue.push(fn)
}
Component.prototype._setMregl = function (mr) {
  this._mregl = mr
  for (var i = 0; i < this._mreglqueue.length; i++) {
    this._mreglqueue[i](this._mregl)
  }
  this._mreglqueue = null
}

Component.prototype._update = function (props) {
  return this._elwidth !== props.width
    || this._elheight !== props.height
}

Component.prototype._render = function () {
  if (this.props.width !== this._elwidth) {
    this.element.style.width = this.props.width + 'px'
    this._elwidth = this.props.width
  }
  if (this.props.height !== this._elheight) {
    this.element.style.height = this.props.height + 'px'
    this._elheight = this.props.height
  }
  return this.element
}

Component.prototype._load = function () {
  var self = this
  if (self._regl) return
  self._getMregl(function (mregl) {
    self._regl = mregl(self.element)
    self.regl.setRegl(self._regl)
  })
}

Component.prototype._unload = function () {
  if (this._regl) {
    this._regl.destroy()
    this._regl = null
    this.regl.setRegl(null)
  }
}
