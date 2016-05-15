(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _virtualElement = require('virtual-element');

var _virtualElement2 = _interopRequireDefault(_virtualElement);

var _deku = require('deku');

var _src = require('../src');

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = document.querySelector('#root');

var App = {
  initialState: function initialState() {
    return { loading: true };
  },
  render: function render(_ref) {
    var state = _ref.state;

    return (0, _virtualElement2.default)(
      'div',
      { 'class': 'App' },
      (0, _virtualElement2.default)(
        'h1',
        null,
        'loader'
      ),
      (0, _virtualElement2.default)(
        _src2.default,
        { isLoading: state.loading },
        (0, _virtualElement2.default)(
          'h2',
          null,
          'hi! im some content that takes awhile to load.'
        )
      )
    );
  },
  afterMount: function afterMount(_, __, setState) {
    setTimeout(function () {
      setState({ loading: false });
    }, 1500);
  }
};

(0, _deku.render)((0, _deku.tree)((0, _virtualElement2.default)(App)), root);

},{"../src":31,"deku":4,"virtual-element":27}],2:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter')

/**
 * Expose `scene`.
 */

module.exports = Application

/**
 * Create a new `Application`.
 *
 * @param {Object} element Optional initial element
 */

function Application (element) {
  if (!(this instanceof Application)) return new Application(element)
  this.options = {}
  this.sources = {}
  this.element = element
}

/**
 * Mixin `Emitter`.
 */

Emitter(Application.prototype)

/**
 * Add a plugin
 *
 * @param {Function} plugin
 */

Application.prototype.use = function (plugin) {
  plugin(this)
  return this
}

/**
 * Set an option
 *
 * @param {String} name
 */

Application.prototype.option = function (name, val) {
  this.options[name] = val
  return this
}

/**
 * Set value used somewhere in the IO network.
 */

Application.prototype.set = function (name, data) {
  this.sources[name] = data
  this.emit('source', name, data)
  return this
}

/**
 * Mount a virtual element.
 *
 * @param {VirtualElement} element
 */

Application.prototype.mount = function (element) {
  this.element = element
  this.emit('mount', element)
  return this
}

/**
 * Remove the world. Unmount everything.
 */

Application.prototype.unmount = function () {
  if (!this.element) return
  this.element = null
  this.emit('unmount')
  return this
}

},{"component-emitter":9}],3:[function(require,module,exports){
/**
 * All of the events can bind to
 */

module.exports = {
  onBlur: 'blur',
  onChange: 'change',
  onClick: 'click',
  onContextMenu: 'contextmenu',
  onCopy: 'copy',
  onCut: 'cut',
  onDoubleClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragEnter: 'dragenter',
  onDragExit: 'dragexit',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragStart: 'dragstart',
  onDrop: 'drop',
  onError: 'error',
  onFocus: 'focus',
  onInput: 'input',
  onInvalid: 'invalid',
  onKeyDown: 'keydown',
  onKeyPress: 'keypress',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onReset: 'reset',
  onScroll: 'scroll',
  onSubmit: 'submit',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart',
  onWheel: 'wheel'
}

},{}],4:[function(require,module,exports){
/**
 * Create the application.
 */

exports.tree =
exports.scene =
exports.deku = require('./application')

/**
 * Render scenes to the DOM.
 */

if (typeof document !== 'undefined') {
  exports.render = require('./render')
}

/**
 * Render scenes to a string
 */

exports.renderString = require('./stringify')
},{"./application":2,"./render":6,"./stringify":7}],5:[function(require,module,exports){
var type = require('component-type')

/**
 * Returns the type of a virtual node
 *
 * @param  {Object} node
 * @return {String}
 */

module.exports = function nodeType (node) {
  var v = type(node)
  if (v === 'null' || node === false) return 'empty'
  if (v !== 'object') return 'text'
  if (type(node.type) === 'string') return 'element'
  return 'component'
}

},{"component-type":11}],6:[function(require,module,exports){
/**
 * Dependencies.
 */

var raf = require('component-raf')
var isDom = require('is-dom')
var uid = require('get-uid')
var keypath = require('object-path')
var events = require('./events')
var svg = require('./svg')
var defaults = require('object-defaults')
var forEach = require('fast.js/forEach')
var assign = require('fast.js/object/assign')
var reduce = require('fast.js/reduce')
var nodeType = require('./node-type')

/**
 * Expose `dom`.
 */

module.exports = render

/**
 * Render an app to the DOM
 *
 * @param {Application} app
 * @param {HTMLElement} container
 * @param {Object} opts
 *
 * @return {Object}
 */

function render (app, container, opts) {
  var frameId
  var isRendering
  var rootId = 'root'
  var currentElement
  var currentNativeElement
  var connections = {}
  var components = {}
  var entities = {}
  var handlers = {}
  var mountQueue = []
  var children = {}
  children[rootId] = {}

  if (!isDom(container)) {
    throw new Error('Container element must be a DOM element')
  }

  /**
   * Rendering options. Batching is only ever really disabled
   * when running tests, and pooling can be disabled if the user
   * is doing something stupid with the DOM in their components.
   */

  var options = defaults(assign({}, app.options || {}, opts || {}), {
    batching: true
  })

  /**
   * Listen to DOM events
   */
  var rootElement = getRootElement(container)
  addNativeEventListeners()

  /**
   * Watch for changes to the app so that we can update
   * the DOM as needed.
   */

  app.on('unmount', onunmount)
  app.on('mount', onmount)
  app.on('source', onupdate)

  /**
   * If the app has already mounted an element, we can just
   * render that straight away.
   */

  if (app.element) render()

  /**
   * Teardown the DOM rendering so that it stops
   * rendering and everything can be garbage collected.
   */

  function teardown () {
    removeNativeEventListeners()
    removeNativeElement()
    app.off('unmount', onunmount)
    app.off('mount', onmount)
    app.off('source', onupdate)
  }

  /**
   * Swap the current rendered node with a new one that is rendered
   * from the new virtual element mounted on the app.
   *
   * @param {VirtualElement} element
   */

  function onmount () {
    invalidate()
  }

  /**
   * If the app unmounts an element, we should clear out the current
   * rendered element. This will remove all the entities.
   */

  function onunmount () {
    removeNativeElement()
    currentElement = null
  }

  /**
   * Update all components that are bound to the source
   *
   * @param {String} name
   * @param {*} data
   */

  function onupdate (name, data) {
    if (!connections[name]) return;
    connections[name].forEach(function(update) {
      update(data)
    })
  }

  /**
   * Render and mount a component to the native dom.
   *
   * @param {Entity} entity
   * @return {HTMLElement}
   */

  function mountEntity (entity) {
    register(entity)
    setSources(entity)
    children[entity.id] = {}
    entities[entity.id] = entity

    // commit initial state and props.
    commit(entity)

    // callback before mounting.
    trigger('beforeMount', entity, [entity.context])
    trigger('beforeRender', entity, [entity.context])

    // render virtual element.
    var virtualElement = renderEntity(entity)
    // create native element.
    var nativeElement = toNative(entity.id, '0', virtualElement)

    entity.virtualElement = virtualElement
    entity.nativeElement = nativeElement

    // Fire afterRender and afterMount hooks at the end
    // of the render cycle
    mountQueue.push(entity.id)

    return nativeElement
  }

  /**
   * Remove a component from the native dom.
   *
   * @param {Entity} entity
   */

  function unmountEntity (entityId) {
    var entity = entities[entityId]
    if (!entity) return
    trigger('beforeUnmount', entity, [entity.context, entity.nativeElement])
    unmountChildren(entityId)
    removeAllEvents(entityId)
    var componentEntities = components[entityId].entities;
    delete componentEntities[entityId]
    delete components[entityId]
    delete entities[entityId]
    delete children[entityId]
  }

  /**
   * Render the entity and make sure it returns a node
   *
   * @param {Entity} entity
   *
   * @return {VirtualTree}
   */

  function renderEntity (entity) {
    var component = entity.component
    var fn = typeof component === 'function' ? component : component.render
    if (!fn) throw new Error('Component needs a render function')
    var result = fn(entity.context, setState(entity))
    if (!result) throw new Error('Render function must return an element.')
    return result
  }

  /**
   * Whenever setState or setProps is called, we mark the entity
   * as dirty in the renderer. This lets us optimize the re-rendering
   * and skip components that definitely haven't changed.
   *
   * @param {Entity} entity
   *
   * @return {Function} A curried function for updating the state of an entity
   */

  function setState (entity) {
    return function (nextState) {
      updateEntityState(entity, nextState)
    }
  }

  /**
   * Tell the app it's dirty and needs to re-render. If batching is disabled
   * we can just trigger a render immediately, otherwise we'll wait until
   * the next available frame.
   */

  function invalidate () {
    if (!options.batching) {
      if (!isRendering) render()
    } else {
      if (!frameId) frameId = raf(render)
    }
  }

  /**
   * Update the DOM. If the update fails we stop the loop
   * so we don't get errors on every frame.
   *
   * @api public
   */

  function render () {
    // If this is called synchronously we need to
    // cancel any pending future updates
    clearFrame()

    // If the rendering from the previous frame is still going,
    // we'll just wait until the next frame. Ideally renders should
    // not take over 16ms to stay within a single frame, but this should
    // catch it if it does.
    if (isRendering) {
      frameId = raf(render)
      return
    } else {
      isRendering = true
    }

    // 1. If there isn't a native element rendered for the current mounted element
    // then we need to create it from scratch.
    // 2. If a new element has been mounted, we should diff them.
    // 3. We should update check all child components for changes.
    if (!currentNativeElement) {
      currentElement = app.element
      currentNativeElement = toNative(rootId, '0', currentElement)
      if (container.children.length > 0) {
        console.info('deku: The container element is not empty. These elements will be removed. Read more: http://cl.ly/b0Sr')
      }
      if (container === document.body) {
        console.warn('deku: Using document.body is allowed but it can cause some issues. Read more: http://cl.ly/b0SC')
      }
      removeAllChildren(container)
      container.appendChild(currentNativeElement)
    } else if (currentElement !== app.element) {
      currentNativeElement = patch(rootId, currentElement, app.element, currentNativeElement)
      currentElement = app.element
      updateChildren(rootId)
    } else {
      updateChildren(rootId)
    }

    // Call mount events on all new entities
    flushMountQueue()

    // Allow rendering again.
    isRendering = false

  }

  /**
   * Call hooks for all new entities that have been created in
   * the last render from the bottom up.
   */

  function flushMountQueue () {
    while (mountQueue.length > 0) {
      var entityId = mountQueue.shift()
      var entity = entities[entityId]
      trigger('afterRender', entity, [entity.context, entity.nativeElement])
      trigger('afterMount', entity, [entity.context, entity.nativeElement, setState(entity)])
    }
  }

  /**
   * Clear the current scheduled frame
   */

  function clearFrame () {
    if (!frameId) return
    raf.cancel(frameId)
    frameId = 0
  }

  /**
   * Update a component.
   *
   * The entity is just the data object for a component instance.
   *
   * @param {String} id Component instance id.
   */

  function updateEntity (entityId) {
    var entity = entities[entityId]
    setSources(entity)

    if (!shouldUpdate(entity)) {
      commit(entity)
      return updateChildren(entityId)
    }

    var currentTree = entity.virtualElement
    var nextProps = entity.pendingProps
    var nextState = entity.pendingState
    var previousState = entity.context.state
    var previousProps = entity.context.props

    // hook before rendering. could modify state just before the render occurs.
    trigger('beforeUpdate', entity, [entity.context, nextProps, nextState])
    trigger('beforeRender', entity, [entity.context])

    // commit state and props.
    commit(entity)

    // re-render.
    var nextTree = renderEntity(entity)

    // if the tree is the same we can just skip this component
    // but we should still check the children to see if they're dirty.
    // This allows us to memoize the render function of components.
    if (nextTree === currentTree) return updateChildren(entityId)

    // apply new virtual tree to native dom.
    entity.nativeElement = patch(entityId, currentTree, nextTree, entity.nativeElement)
    entity.virtualElement = nextTree
    updateChildren(entityId)

    // trigger render hook
    trigger('afterRender', entity, [entity.context, entity.nativeElement])

    // trigger afterUpdate after all children have updated.
    trigger('afterUpdate', entity, [entity.context, previousProps, previousState, setState(entity)])
  }

  /**
   * Update all the children of an entity.
   *
   * @param {String} id Component instance id.
   */

  function updateChildren (entityId) {
    forEach(children[entityId], function (childId) {
      updateEntity(childId)
    })
  }

  /**
   * Remove all of the child entities of an entity
   *
   * @param {Entity} entity
   */

  function unmountChildren (entityId) {
    forEach(children[entityId], function (childId) {
      unmountEntity(childId)
    })
  }

  /**
   * Remove the root element. If this is called synchronously we need to
   * cancel any pending future updates.
   */

  function removeNativeElement () {
    clearFrame()
    removeElement(rootId, '0', currentNativeElement)
    currentNativeElement = null
  }

  /**
   * Create a native element from a virtual element.
   *
   * @param {String} entityId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative (entityId, path, vnode) {
    switch (nodeType(vnode)) {
      case 'text': return toNativeText(vnode)
      case 'empty': return toNativeEmptyElement(entityId, path)
      case 'element': return toNativeElement(entityId, path, vnode)
      case 'component': return toNativeComponent(entityId, path, vnode)
    }
  }

  /**
   * Create a native text element from a virtual element.
   *
   * @param {Object} vnode
   */

  function toNativeText (text) {
    return document.createTextNode(text)
  }

  /**
   * Create a native element from a virtual element.
   */

  function toNativeElement (entityId, path, vnode) {
    var el
    var attributes = vnode.attributes
    var tagName = vnode.type
    var childNodes = vnode.children

    // create element either from pool or fresh.
    if (svg.isElement(tagName)) {
      el = document.createElementNS(svg.namespace, tagName)
    } else {
      el = document.createElement(tagName)
    }

    // set attributes.
    forEach(attributes, function (value, name) {
      setAttribute(entityId, path, el, name, value)
    })

    // add children.
    forEach(childNodes, function (child, i) {
      var childEl = toNative(entityId, path + '.' + i, child)
      if (!childEl.parentNode) el.appendChild(childEl)
    })

    // store keys on the native element for fast event handling.
    el.__entity__ = entityId
    el.__path__ = path

    return el
  }

  /**
   * Create a native element from a virtual element.
   */

  function toNativeEmptyElement (entityId, path) {
    var el = document.createElement('noscript')
    el.__entity__ = entityId
    el.__path__ = path
    return el
  }

  /**
   * Create a native element from a component.
   */

  function toNativeComponent (entityId, path, vnode) {
    var child = new Entity(vnode.type, assign({ children: vnode.children }, vnode.attributes), entityId)
    children[entityId][path] = child.id
    return mountEntity(child)
  }

  /**
   * Patch an element with the diff from two trees.
   */

  function patch (entityId, prev, next, el) {
    return diffNode('0', entityId, prev, next, el)
  }

  /**
   * Create a diff between two trees of nodes.
   */

  function diffNode (path, entityId, prev, next, el) {
    var leftType = nodeType(prev)
    var rightType = nodeType(next)

    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (leftType !== rightType) return replaceElement(entityId, path, el, next)

    switch (rightType) {
      case 'text': return diffText(prev, next, el)
      case 'empty': return el
      case 'element': return diffElement(path, entityId, prev, next, el)
      case 'component': return diffComponent(path, entityId, prev, next, el)
    }
  }

  /**
   * Diff two text nodes and update the element.
   */

  function diffText (previous, current, el) {
    if (current !== previous) el.data = current
    return el
  }

  /**
   * Diff the children of an ElementNode.
   */

  function diffChildren (path, entityId, prev, next, el) {
    var positions = []
    var hasKeys = false
    var childNodes = Array.prototype.slice.apply(el.childNodes)
    var leftKeys = reduce(prev.children, keyMapReducer, {})
    var rightKeys = reduce(next.children, keyMapReducer, {})
    var currentChildren = assign({}, children[entityId])

    function keyMapReducer (acc, child, i) {
      if (child && child.attributes && child.attributes.key != null) {
        acc[child.attributes.key] = {
          element: child,
          index: i
        }
        hasKeys = true
      }
      return acc
    }

    // Diff all of the nodes that have keys. This lets us re-used elements
    // instead of overriding them and lets us move them around.
    if (hasKeys) {

      // Removals
      forEach(leftKeys, function (leftNode, key) {
        if (rightKeys[key] == null) {
          var leftPath = path + '.' + leftNode.index
          removeElement(
            entityId,
            leftPath,
            childNodes[leftNode.index]
          )
        }
      })

      // Update nodes
      forEach(rightKeys, function (rightNode, key) {
        var leftNode = leftKeys[key]

        // We only want updates for now
        if (leftNode == null) return

        var leftPath = path + '.' + leftNode.index

        // Updated
        positions[rightNode.index] = diffNode(
          leftPath,
          entityId,
          leftNode.element,
          rightNode.element,
          childNodes[leftNode.index]
        )
      })

      // Update the positions of all child components and event handlers
      forEach(rightKeys, function (rightNode, key) {
        var leftNode = leftKeys[key]

        // We just want elements that have moved around
        if (leftNode == null || leftNode.index === rightNode.index) return

        var rightPath = path + '.' + rightNode.index
        var leftPath = path + '.' + leftNode.index

        // Update all the child component path positions to match
        // the latest positions if they've changed. This is a bit hacky.
        forEach(currentChildren, function (childId, childPath) {
          if (leftPath === childPath) {
            delete children[entityId][childPath]
            children[entityId][rightPath] = childId
          }
        })
      })

      // Now add all of the new nodes last in case their path
      // would have conflicted with one of the previous paths.
      forEach(rightKeys, function (rightNode, key) {
        var rightPath = path + '.' + rightNode.index
        if (leftKeys[key] == null) {
          positions[rightNode.index] = toNative(
            entityId,
            rightPath,
            rightNode.element
          )
        }
      })

    } else {
      var maxLength = Math.max(prev.children.length, next.children.length)

      // Now diff all of the nodes that don't have keys
      for (var i = 0; i < maxLength; i++) {
        var leftNode = prev.children[i]
        var rightNode = next.children[i]

        // Removals
        if (rightNode === undefined) {
          removeElement(
            entityId,
            path + '.' + i,
            childNodes[i]
          )
          continue
        }

        // New Node
        if (leftNode === undefined) {
          positions[i] = toNative(
            entityId,
            path + '.' + i,
            rightNode
          )
          continue
        }

        // Updated
        positions[i] = diffNode(
          path + '.' + i,
          entityId,
          leftNode,
          rightNode,
          childNodes[i]
        )
      }
    }

    // Reposition all the elements
    forEach(positions, function (childEl, newPosition) {
      var target = el.childNodes[newPosition]
      if (childEl && childEl !== target) {
        if (target) {
          el.insertBefore(childEl, target)
        } else {
          el.appendChild(childEl)
        }
      }
    })
  }

  /**
   * Diff the attributes and add/remove them.
   */

  function diffAttributes (prev, next, el, entityId, path) {
    var nextAttrs = next.attributes
    var prevAttrs = prev.attributes

    // add new attrs
    forEach(nextAttrs, function (value, name) {
      if (events[name] || !(name in prevAttrs) || prevAttrs[name] !== value) {
        setAttribute(entityId, path, el, name, value)
      }
    })

    // remove old attrs
    forEach(prevAttrs, function (value, name) {
      if (!(name in nextAttrs)) {
        removeAttribute(entityId, path, el, name)
      }
    })
  }

  /**
   * Update a component with the props from the next node. If
   * the component type has changed, we'll just remove the old one
   * and replace it with the new component.
   */

  function diffComponent (path, entityId, prev, next, el) {
    if (next.type !== prev.type) {
      return replaceElement(entityId, path, el, next)
    } else {
      var targetId = children[entityId][path]

      // This is a hack for now
      if (targetId) {
        updateEntityProps(targetId, assign({ children: next.children }, next.attributes))
      }

      return el
    }
  }

  /**
   * Diff two element nodes.
   */

  function diffElement (path, entityId, prev, next, el) {
    if (next.type !== prev.type) return replaceElement(entityId, path, el, next)
    diffAttributes(prev, next, el, entityId, path)
    diffChildren(path, entityId, prev, next, el)
    return el
  }

  /**
   * Removes an element from the DOM and unmounts and components
   * that are within that branch
   *
   * side effects:
   *   - removes element from the DOM
   *   - removes internal references
   *
   * @param {String} entityId
   * @param {String} path
   * @param {HTMLElement} el
   */

  function removeElement (entityId, path, el) {
    var childrenByPath = children[entityId]
    var childId = childrenByPath[path]
    var entityHandlers = handlers[entityId] || {}
    var removals = []

    // If the path points to a component we should use that
    // components element instead, because it might have moved it.
    if (childId) {
      var child = entities[childId]
      el = child.nativeElement
      unmountEntity(childId)
      removals.push(path)
    } else {

      // Just remove the text node
      if (!isElement(el)) return el && el.parentNode.removeChild(el)

      // Then we need to find any components within this
      // branch and unmount them.
      forEach(childrenByPath, function (childId, childPath) {
        if (childPath === path || isWithinPath(path, childPath)) {
          unmountEntity(childId)
          removals.push(childPath)
        }
      })

      // Remove all events at this path or below it
      forEach(entityHandlers, function (fn, handlerPath) {
        if (handlerPath === path || isWithinPath(path, handlerPath)) {
          removeEvent(entityId, handlerPath)
        }
      })
    }

    // Remove the paths from the object without touching the
    // old object. This keeps the object using fast properties.
    forEach(removals, function (path) {
      delete children[entityId][path]
    })

    // Remove it from the DOM
    el.parentNode.removeChild(el)
  }

  /**
   * Replace an element in the DOM. Removing all components
   * within that element and re-rendering the new virtual node.
   *
   * @param {Entity} entity
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement (entityId, path, el, vnode) {
    var parent = el.parentNode
    var index = Array.prototype.indexOf.call(parent.childNodes, el)

    // remove the previous element and all nested components. This
    // needs to happen before we create the new element so we don't
    // get clashes on the component paths.
    removeElement(entityId, path, el)

    // then add the new element in there
    var newEl = toNative(entityId, path, vnode)
    var target = parent.childNodes[index]

    if (target) {
      parent.insertBefore(newEl, target)
    } else {
      parent.appendChild(newEl)
    }

    // walk up the tree and update all `entity.nativeElement` references.
    if (entityId !== 'root' && path === '0') {
      updateNativeElement(entityId, newEl)
    }

    return newEl
  }

  /**
   * Update all entities in a branch that have the same nativeElement. This
   * happens when a component has another component as it's root node.
   *
   * @param {String} entityId
   * @param {HTMLElement} newEl
   *
   * @return {void}
   */

  function updateNativeElement (entityId, newEl) {
    var target = entities[entityId]
    if (target.ownerId === 'root') return
    if (children[target.ownerId]['0'] === entityId) {
      entities[target.ownerId].nativeElement = newEl
      updateNativeElement(target.ownerId, newEl)
    }
  }

  /**
   * Set the attribute of an element, performing additional transformations
   * dependning on the attribute name
   *
   * @param {HTMLElement} el
   * @param {String} name
   * @param {String} value
   */

  function setAttribute (entityId, path, el, name, value) {
    if (!value) {
      removeAttribute(entityId, path, el, name)
      return
    }
    if (events[name]) {
      addEvent(entityId, path, events[name], value)
      return
    }
    switch (name) {
      case 'checked':
      case 'disabled':
      case 'selected':
        el[name] = true
        break
      case 'innerHTML':
        el.innerHTML = value
        break
      case 'value':
        setElementValue(el, value)
        break
      case svg.isAttribute(name):
        el.setAttributeNS(svg.namespace, name, value)
        break
      default:
        el.setAttribute(name, value)
        break
    }
  }

  /**
   * Remove an attribute, performing additional transformations
   * dependning on the attribute name
   *
   * @param {HTMLElement} el
   * @param {String} name
   */

  function removeAttribute (entityId, path, el, name) {
    if (events[name]) {
      removeEvent(entityId, path, events[name])
      return
    }
    switch (name) {
      case 'checked':
      case 'disabled':
      case 'selected':
        el[name] = false
        break
      case 'innerHTML':
        el.innerHTML = ''
      case 'value':
        setElementValue(el, null)
        break
      default:
        el.removeAttribute(name)
        break
    }
  }

  /**
   * Checks to see if one tree path is within
   * another tree path. Example:
   *
   * 0.1 vs 0.1.1 = true
   * 0.2 vs 0.3.5 = false
   *
   * @param {String} target
   * @param {String} path
   *
   * @return {Boolean}
   */

  function isWithinPath (target, path) {
    return path.indexOf(target + '.') === 0
  }

  /**
   * Is the DOM node an element node
   *
   * @param {HTMLElement} el
   *
   * @return {Boolean}
   */

  function isElement (el) {
    return !!(el && el.tagName)
  }

  /**
   * Remove all the child nodes from an element
   *
   * @param {HTMLElement} el
   */

  function removeAllChildren (el) {
    while (el.firstChild) el.removeChild(el.firstChild)
  }

  /**
   * Trigger a hook on a component.
   *
   * @param {String} name Name of hook.
   * @param {Entity} entity The component instance.
   * @param {Array} args To pass along to hook.
   */

  function trigger (name, entity, args) {
    if (typeof entity.component[name] !== 'function') return
    return entity.component[name].apply(null, args)
  }

  /**
   * Update an entity to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {Entity} entity
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateEntityProps (entityId, nextProps) {
    var entity = entities[entityId]
    entity.pendingProps = defaults({}, nextProps, entity.component.defaultProps || {})
    entity.dirty = true
    invalidate()
  }

  /**
   * Update component instance state.
   */

  function updateEntityState (entity, nextState) {
    entity.pendingState = assign(entity.pendingState, nextState)
    entity.dirty = true
    invalidate()
  }

  /**
   * Commit props and state changes to an entity.
   */

  function commit (entity) {
    entity.context = {
      state: entity.pendingState,
      props: entity.pendingProps,
      id: entity.id
    }
    entity.pendingState = assign({}, entity.context.state)
    entity.pendingProps = assign({}, entity.context.props)
    entity.dirty = false
    if (typeof entity.component.validate === 'function') {
      entity.component.validate(entity.context)
    }
  }

  /**
   * Try to avoid creating new virtual dom if possible.
   *
   * Later we may expose this so you can override, but not there yet.
   */

  function shouldUpdate (entity) {
    if (!entity.dirty) return false
    if (!entity.component.shouldUpdate) return true
    var nextProps = entity.pendingProps
    var nextState = entity.pendingState
    var bool = entity.component.shouldUpdate(entity.context, nextProps, nextState)
    return bool
  }

  /**
   * Register an entity.
   *
   * This is mostly to pre-preprocess component properties and values chains.
   *
   * The end result is for every component that gets mounted,
   * you create a set of IO nodes in the network from the `value` definitions.
   *
   * @param {Component} component
   */

  function register (entity) {
    registerEntity(entity)
    var component = entity.component
    if (component.registered) return

    // initialize sources once for a component type.
    registerSources(entity)
    component.registered = true
  }

  /**
   * Add entity to data-structures related to components/entities.
   *
   * @param {Entity} entity
   */

  function registerEntity(entity) {
    var component = entity.component
    // all entities for this component type.
    var entities = component.entities = component.entities || {}
    // add entity to component list
    entities[entity.id] = entity
    // map to component so you can remove later.
    components[entity.id] = component
  }

  /**
   * Initialize sources for a component by type.
   *
   * @param {Entity} entity
   */

  function registerSources(entity) {
    var component = components[entity.id]
    // get 'class-level' sources.
    // if we've already hooked it up, then we're good.
    var sources = component.sources
    if (sources) return
    var entities = component.entities

    // hook up sources.
    var map = component.sourceToPropertyName = {}
    component.sources = sources = []
    var propTypes = component.propTypes
    for (var name in propTypes) {
      var data = propTypes[name]
      if (!data) continue
      if (!data.source) continue
      sources.push(data.source)
      map[data.source] = name
    }

    // send value updates to all component instances.
    sources.forEach(function (source) {
      connections[source] = connections[source] || []
      connections[source].push(update)

      function update (data) {
        var prop = map[source]
        for (var entityId in entities) {
          var entity = entities[entityId]
          var changes = {}
          changes[prop] = data
          updateEntityProps(entityId, assign(entity.pendingProps, changes))
        }
      }
    })
  }

  /**
   * Set the initial source value on the entity
   *
   * @param {Entity} entity
   */

  function setSources (entity) {
    var component = entity.component
    var map = component.sourceToPropertyName
    var sources = component.sources
    sources.forEach(function (source) {
      var name = map[source]
      if (entity.pendingProps[name] != null) return
      entity.pendingProps[name] = app.sources[source] // get latest value plugged into global store
    })
  }

  /**
   * Add all of the DOM event listeners
   */

  function addNativeEventListeners () {
    forEach(events, function (eventType) {
      rootElement.addEventListener(eventType, handleEvent, true)
    })
  }

  /**
   * Add all of the DOM event listeners
   */

  function removeNativeEventListeners () {
    forEach(events, function (eventType) {
      rootElement.removeEventListener(eventType, handleEvent, true)
    })
  }

  /**
   * Handle an event that has occured within the container
   *
   * @param {Event} event
   */

  function handleEvent (event) {
    var target = event.target
    var eventType = event.type

    // Walk up the DOM tree and see if there is a handler
    // for this event type higher up.
    while (target) {
      var fn = keypath.get(handlers, [target.__entity__, target.__path__, eventType])
      if (fn) {
        event.delegateTarget = target
        if (fn(event) === false) break
      }
      target = target.parentNode
    }
  }

  /**
   * Bind events for an element, and all it's rendered child elements.
   *
   * @param {String} path
   * @param {String} event
   * @param {Function} fn
   */

  function addEvent (entityId, path, eventType, fn) {
    keypath.set(handlers, [entityId, path, eventType], function (e) {
      var entity = entities[entityId]
      if (entity) {
        return fn.call(null, e, entity.context, setState(entity))
      } else {
        return fn.call(null, e)
      }
    })
  }

  /**
   * Unbind events for a entityId
   *
   * @param {String} entityId
   */

  function removeEvent (entityId, path, eventType) {
    var args = [entityId]
    if (path) args.push(path)
    if (eventType) args.push(eventType)
    keypath.del(handlers, args)
  }

  /**
   * Unbind all events from an entity
   *
   * @param {Entity} entity
   */

  function removeAllEvents (entityId) {
    keypath.del(handlers, [entityId])
  }

  /**
   * Used for debugging to inspect the current state without
   * us needing to explicitly manage storing/updating references.
   *
   * @return {Object}
   */

  function inspect () {
    return {
      entities: entities,
      handlers: handlers,
      connections: connections,
      currentElement: currentElement,
      options: options,
      app: app,
      container: container,
      children: children
    }
  }

  /**
   * Return an object that lets us completely remove the automatic
   * DOM rendering and export debugging tools.
   */

  return {
    remove: teardown,
    inspect: inspect
  }
}

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 * It's basically just a data object for more straightfoward lookup.
 *
 * @param {Component} component
 * @param {Object} props
 */

function Entity (component, props, ownerId) {
  this.id = uid()
  this.ownerId = ownerId
  this.component = component
  this.propTypes = component.propTypes || {}
  this.context = {}
  this.context.id = this.id
  this.context.props = defaults(props || {}, component.defaultProps || {})
  this.context.state = this.component.initialState ? this.component.initialState(this.context.props) : {}
  this.pendingProps = assign({}, this.context.props)
  this.pendingState = assign({}, this.context.state)
  this.dirty = false
  this.virtualElement = null
  this.nativeElement = null
  this.displayName = component.name || 'Component'
}

/**
 * Retrieve the nearest 'body' ancestor of the given element or else the root
 * element of the document in which stands the given element.
 *
 * This is necessary if you want to attach the events handler to the correct
 * element and be able to dispatch events in document fragments such as
 * Shadow DOM.
 *
 * @param  {HTMLElement} el The element on which we will render an app.
 * @return {HTMLElement}    The root element on which we will attach the events
 *                          handler.
 */

function getRootElement (el) {
  while (el.parentElement) {
    if (el.tagName === 'BODY' || !el.parentElement) {
      return el
    }
    el = el.parentElement
  }
  return el
}

/**
 * Set the value property of an element and keep the text selection
 * for input fields.
 *
 * @param {HTMLElement} el
 * @param {String} value
 */

function setElementValue (el, value) {
  if (el === document.activeElement && canSelectText(el)) {
    var start = el.selectionStart
    var end = el.selectionEnd
    el.value = value
    el.setSelectionRange(start, end)
  } else {
    el.value = value
  }
}

/**
 * For some reason only certain types of inputs can set the selection range.
 *
 * @param {HTMLElement} el
 *
 * @return {Boolean}
 */

function canSelectText (el) {
  return el.tagName === 'INPUT' && ['text','search','password','tel','url'].indexOf(el.type) > -1
}

},{"./events":3,"./node-type":5,"./svg":8,"component-raf":10,"fast.js/forEach":14,"fast.js/object/assign":17,"fast.js/reduce":20,"get-uid":21,"is-dom":22,"object-defaults":25,"object-path":26}],7:[function(require,module,exports){
var defaults = require('object-defaults')
var nodeType = require('./node-type')
var type = require('component-type')

/**
 * Expose `stringify`.
 */

module.exports = function (app) {
  if (!app.element) {
    throw new Error('No element mounted')
  }

  /**
   * Render to string.
   *
   * @param {Component} component
   * @param {Object} [props]
   * @return {String}
   */

  function stringify (component, optProps, children) {
    var propTypes = component.propTypes || {}
    var props = defaults(optProps || {}, component.defaultProps || {})
    var state = component.initialState ? component.initialState(props) : {}
    props.children = children;

    for (var name in propTypes) {
      var options = propTypes[name]
      if (options.source) {
        props[name] = app.sources[options.source]
      }
    }

    if (component.beforeMount) component.beforeMount({ props: props, state: state })
    if (component.beforeRender) component.beforeRender({ props: props, state: state })
    var node = component.render({ props: props, state: state })
    return stringifyNode(node, '0')
  }

  /**
   * Render a node to a string
   *
   * @param {Node} node
   * @param {Tree} tree
   *
   * @return {String}
   */

  function stringifyNode (node, path) {
    switch (nodeType(node)) {
      case 'empty': return '<noscript />'
      case 'text': return node
      case 'element':
        var children = node.children
        var attributes = node.attributes
        var tagName = node.type
        var innerHTML = attributes.innerHTML
        var str = '<' + tagName + attrs(attributes) + '>'

        if (innerHTML) {
          str += innerHTML
        } else {
          for (var i = 0, n = children.length; i < n; i++) {
            str += stringifyNode(children[i], path + '.' + i)
          }
        }

        str += '</' + tagName + '>'
        return str
      case 'component': return stringify(node.type, node.attributes, node.children)
    }

    throw new Error('Invalid type')
  }

  return stringifyNode(app.element, '0')
}

/**
 * HTML attributes to string.
 *
 * @param {Object} attributes
 * @return {String}
 * @api private
 */

function attrs (attributes) {
  var str = ''
  for (var key in attributes) {
    var value = attributes[key]
    if (key === 'innerHTML') continue
    if (isValidAttributeValue(value)) str += attr(key, attributes[key])
  }
  return str
}

/**
 * HTML attribute to string.
 *
 * @param {String} key
 * @param {String} val
 * @return {String}
 * @api private
 */

function attr (key, val) {
  return ' ' + key + '="' + val + '"'
}

/**
 * Is a value able to be set a an attribute value?
 *
 * @param {Any} value
 *
 * @return {Boolean}
 */

function isValidAttributeValue (value) {
  var valueType = type(value)
  switch (valueType) {
  case 'string':
  case 'number':
    return true;

  case 'boolean':
    return value;

  default:
    return false;
  }
}

},{"./node-type":5,"component-type":11,"object-defaults":25}],8:[function(require,module,exports){
module.exports = {
  isElement: require('is-svg-element').isElement,
  isAttribute: require('is-svg-attribute'),
  namespace: 'http://www.w3.org/2000/svg'
}

},{"is-svg-attribute":23,"is-svg-element":24}],9:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],10:[function(require,module,exports){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

},{}],11:[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  if (isBuffer(val)) return 'buffer';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val);

  return typeof val;
};

// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],12:[function(require,module,exports){
'use strict';

var bindInternal3 = require('../function/bindInternal3');

/**
 * # For Each
 *
 * A fast `.forEach()` implementation.
 *
 * @param  {Array}    subject     The array (or array-like) to iterate over.
 * @param  {Function} fn          The visitor function.
 * @param  {Object}   thisContext The context for the visitor.
 */
module.exports = function fastForEach (subject, fn, thisContext) {
  var length = subject.length,
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      i;
  for (i = 0; i < length; i++) {
    iterator(subject[i], i, subject);
  }
};

},{"../function/bindInternal3":15}],13:[function(require,module,exports){
'use strict';

var bindInternal4 = require('../function/bindInternal4');

/**
 * # Reduce
 *
 * A fast `.reduce()` implementation.
 *
 * @param  {Array}    subject      The array (or array-like) to reduce.
 * @param  {Function} fn           The reducer function.
 * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
 * @param  {Object}   thisContext  The context for the reducer.
 * @return {mixed}                 The final result.
 */
module.exports = function fastReduce (subject, fn, initialValue, thisContext) {
  var length = subject.length,
      iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
      i, result;

  if (initialValue === undefined) {
    i = 1;
    result = subject[0];
  }
  else {
    i = 0;
    result = initialValue;
  }

  for (; i < length; i++) {
    result = iterator(result, subject[i], i, subject);
  }

  return result;
};

},{"../function/bindInternal4":16}],14:[function(require,module,exports){
'use strict';

var forEachArray = require('./array/forEach'),
    forEachObject = require('./object/forEach');

/**
 * # ForEach
 *
 * A fast `.forEach()` implementation.
 *
 * @param  {Array|Object} subject     The array or object to iterate over.
 * @param  {Function}     fn          The visitor function.
 * @param  {Object}       thisContext The context for the visitor.
 */
module.exports = function fastForEach (subject, fn, thisContext) {
  if (subject instanceof Array) {
    return forEachArray(subject, fn, thisContext);
  }
  else {
    return forEachObject(subject, fn, thisContext);
  }
};
},{"./array/forEach":12,"./object/forEach":18}],15:[function(require,module,exports){
'use strict';

/**
 * Internal helper to bind a function known to have 3 arguments
 * to a given context.
 */
module.exports = function bindInternal3 (func, thisContext) {
  return function (a, b, c) {
    return func.call(thisContext, a, b, c);
  };
};

},{}],16:[function(require,module,exports){
'use strict';

/**
 * Internal helper to bind a function known to have 4 arguments
 * to a given context.
 */
module.exports = function bindInternal4 (func, thisContext) {
  return function (a, b, c, d) {
    return func.call(thisContext, a, b, c, d);
  };
};

},{}],17:[function(require,module,exports){
'use strict';

/**
 * Analogue of Object.assign().
 * Copies properties from one or more source objects to
 * a target object. Existing keys on the target object will be overwritten.
 *
 * > Note: This differs from spec in some important ways:
 * > 1. Will throw if passed non-objects, including `undefined` or `null` values.
 * > 2. Does not support the curious Exception handling behavior, exceptions are thrown immediately.
 * > For more details, see:
 * > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 *
 *
 *
 * @param  {Object} target      The target object to copy properties to.
 * @param  {Object} source, ... The source(s) to copy properties from.
 * @return {Object}             The updated target object.
 */
module.exports = function fastAssign (target) {
  var totalArgs = arguments.length,
      source, i, totalKeys, keys, key, j;

  for (i = 1; i < totalArgs; i++) {
    source = arguments[i];
    keys = Object.keys(source);
    totalKeys = keys.length;
    for (j = 0; j < totalKeys; j++) {
      key = keys[j];
      target[key] = source[key];
    }
  }
  return target;
};

},{}],18:[function(require,module,exports){
'use strict';

var bindInternal3 = require('../function/bindInternal3');

/**
 * # For Each
 *
 * A fast object `.forEach()` implementation.
 *
 * @param  {Object}   subject     The object to iterate over.
 * @param  {Function} fn          The visitor function.
 * @param  {Object}   thisContext The context for the visitor.
 */
module.exports = function fastForEachObject (subject, fn, thisContext) {
  var keys = Object.keys(subject),
      length = keys.length,
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      key, i;
  for (i = 0; i < length; i++) {
    key = keys[i];
    iterator(subject[key], key, subject);
  }
};

},{"../function/bindInternal3":15}],19:[function(require,module,exports){
'use strict';

var bindInternal4 = require('../function/bindInternal4');

/**
 * # Reduce
 *
 * A fast object `.reduce()` implementation.
 *
 * @param  {Object}   subject      The object to reduce over.
 * @param  {Function} fn           The reducer function.
 * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
 * @param  {Object}   thisContext  The context for the reducer.
 * @return {mixed}                 The final result.
 */
module.exports = function fastReduceObject (subject, fn, initialValue, thisContext) {
  var keys = Object.keys(subject),
      length = keys.length,
      iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
      i, key, result;

  if (initialValue === undefined) {
    i = 1;
    result = subject[keys[0]];
  }
  else {
    i = 0;
    result = initialValue;
  }

  for (; i < length; i++) {
    key = keys[i];
    result = iterator(result, subject[key], key, subject);
  }

  return result;
};

},{"../function/bindInternal4":16}],20:[function(require,module,exports){
'use strict';

var reduceArray = require('./array/reduce'),
    reduceObject = require('./object/reduce');

/**
 * # Reduce
 *
 * A fast `.reduce()` implementation.
 *
 * @param  {Array|Object} subject      The array or object to reduce over.
 * @param  {Function}     fn           The reducer function.
 * @param  {mixed}        initialValue The initial value for the reducer, defaults to subject[0].
 * @param  {Object}       thisContext  The context for the reducer.
 * @return {Array|Object}              The array or object containing the results.
 */
module.exports = function fastReduce (subject, fn, initialValue, thisContext) {
  if (subject instanceof Array) {
    return reduceArray(subject, fn, initialValue, thisContext);
  }
  else {
    return reduceObject(subject, fn, initialValue, thisContext);
  }
};
},{"./array/reduce":13,"./object/reduce":19}],21:[function(require,module,exports){
/** generate unique id for selector */
var counter = Date.now() % 1e9;

module.exports = function getUid(){
	return (Math.random() * 1e9 >>> 0) + (counter++);
};
},{}],22:[function(require,module,exports){
/*global window*/

/**
 * Check if object is dom node.
 *
 * @param {Object} val
 * @return {Boolean}
 * @api public
 */

module.exports = function isNode(val){
  if (!val || typeof val !== 'object') return false;
  if (window && 'object' == typeof window.Node) return val instanceof window.Node;
  return 'number' == typeof val.nodeType && 'string' == typeof val.nodeName;
}

},{}],23:[function(require,module,exports){
/**
 * Supported SVG attributes
 */

exports.attributes = {
  'cx': true,
  'cy': true,
  'd': true,
  'dx': true,
  'dy': true,
  'fill': true,
  'fillOpacity': true,
  'fontFamily': true,
  'fontSize': true,
  'fx': true,
  'fy': true,
  'gradientTransform': true,
  'gradientUnits': true,
  'markerEnd': true,
  'markerMid': true,
  'markerStart': true,
  'offset': true,
  'opacity': true,
  'patternContentUnits': true,
  'patternUnits': true,
  'points': true,
  'preserveAspectRatio': true,
  'r': true,
  'rx': true,
  'ry': true,
  'spreadMethod': true,
  'stopColor': true,
  'stopOpacity': true,
  'stroke': true,
  'strokeDasharray': true,
  'strokeLinecap': true,
  'strokeOpacity': true,
  'strokeWidth': true,
  'textAnchor': true,
  'transform': true,
  'version': true,
  'viewBox': true,
  'x1': true,
  'x2': true,
  'x': true,
  'y1': true,
  'y2': true,
  'y': true
}

/**
 * Are element's attributes SVG?
 *
 * @param {String} attr
 */

module.exports = function (attr) {
  return exports.attributes[attr] === true
}

},{}],24:[function(require,module,exports){
/**
 * Supported SVG elements
 *
 * @type {Array}
 */

exports.elements = {
  'animate': true,
  'circle': true,
  'defs': true,
  'ellipse': true,
  'g': true,
  'line': true,
  'linearGradient': true,
  'mask': true,
  'path': true,
  'pattern': true,
  'polygon': true,
  'polyline': true,
  'radialGradient': true,
  'rect': true,
  'stop': true,
  'svg': true,
  'text': true,
  'tspan': true
}

/**
 * Is element's namespace SVG?
 *
 * @param {String} name
 */

exports.isElement = function (name) {
  return name in exports.elements
}

},{}],25:[function(require,module,exports){
'use strict'

module.exports = function(target) {
  target = target || {}

  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]
    if (!source) continue

    Object.getOwnPropertyNames(source).forEach(function(key) {
      if (undefined === target[key])
        target[key] = source[key]
    })
  }

  return target
}

},{}],26:[function(require,module,exports){
(function (root, factory){
  'use strict';

  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';

  var
    toStr = Object.prototype.toString,
    _hasOwnProperty = Object.prototype.hasOwnProperty;

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
        return true;
    } else if (!isString(value)) {
        for (var i in value) {
            if (_hasOwnProperty.call(value, i)) {
                return false;
            }
        }
        return true;
    }
    return false;
  }

  function toString(type){
    return toStr.call(type);
  }

  function isNumber(value){
    return typeof value === 'number' || toString(value) === "[object Number]";
  }

  function isString(obj){
    return typeof obj === 'string' || toString(obj) === "[object String]";
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  function isArray(obj){
    return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
  }

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function set(obj, path, value, doNotReplace){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isString(path)) {
      return set(obj, path.split('.').map(getKey), value, doNotReplace);
    }
    var currentPath = path[0];

    if (path.length === 1) {
      var oldVal = obj[currentPath];
      if (oldVal === void 0 || !doNotReplace) {
        obj[currentPath] = value;
      }
      return oldVal;
    }

    if (obj[currentPath] === void 0) {
      //check if we assume an array
      if(isNumber(path[1])) {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }

    return set(obj[currentPath], path.slice(1), value, doNotReplace);
  }

  function del(obj, path) {
    if (isNumber(path)) {
      path = [path];
    }

    if (isEmpty(obj)) {
      return void 0;
    }

    if (isEmpty(path)) {
      return obj;
    }
    if(isString(path)) {
      return del(obj, path.split('.'));
    }

    var currentPath = getKey(path[0]);
    var oldVal = obj[currentPath];

    if(path.length === 1) {
      if (oldVal !== void 0) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      }
    } else {
      if (obj[currentPath] !== void 0) {
        return del(obj[currentPath], path.slice(1));
      }
    }

    return obj;
  }

  var objectPath = function(obj) {
    return Object.keys(objectPath).reduce(function(proxy, prop) {
      if (typeof objectPath[prop] === 'function') {
        proxy[prop] = objectPath[prop].bind(objectPath, obj);
      }

      return proxy;
    }, {});
  };

  objectPath.has = function (obj, path) {
    if (isEmpty(obj)) {
      return false;
    }

    if (isNumber(path)) {
      path = [path];
    } else if (isString(path)) {
      path = path.split('.');
    }

    if (isEmpty(path) || path.length === 0) {
      return false;
    }

    for (var i = 0; i < path.length; i++) {
      var j = path[i];
      if ((isObject(obj) || isArray(obj)) && _hasOwnProperty.call(obj, j)) {
        obj = obj[j];
      } else {
        return false;
      }
    }

    return true;
  };

  objectPath.ensureExists = function (obj, path, value){
    return set(obj, path, value, true);
  };

  objectPath.set = function (obj, path, value, doNotReplace){
    return set(obj, path, value, doNotReplace);
  };

  objectPath.insert = function (obj, path, value, at){
    var arr = objectPath.get(obj, path);
    at = ~~at;
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }
    arr.splice(at, 0, value);
  };

  objectPath.empty = function(obj, path) {
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return void 0;
    }

    var value, i;
    if (!(value = objectPath.get(obj, path))) {
      return obj;
    }

    if (isString(value)) {
      return objectPath.set(obj, path, '');
    } else if (isBoolean(value)) {
      return objectPath.set(obj, path, false);
    } else if (isNumber(value)) {
      return objectPath.set(obj, path, 0);
    } else if (isArray(value)) {
      value.length = 0;
    } else if (isObject(value)) {
      for (i in value) {
        if (_hasOwnProperty.call(value, i)) {
          delete value[i];
        }
      }
    } else {
      return objectPath.set(obj, path, null);
    }
  };

  objectPath.push = function (obj, path /*, values */){
    var arr = objectPath.get(obj, path);
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }

    arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
  };

  objectPath.coalesce = function (obj, paths, defaultValue) {
    var value;

    for (var i = 0, len = paths.length; i < len; i++) {
      if ((value = objectPath.get(obj, paths[i])) !== void 0) {
        return value;
      }
    }

    return defaultValue;
  };

  objectPath.get = function (obj, path, defaultValue){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return defaultValue;
    }
    if (isString(path)) {
      return objectPath.get(obj, path.split('.'), defaultValue);
    }

    var currentPath = getKey(path[0]);

    if (path.length === 1) {
      if (obj[currentPath] === void 0) {
        return defaultValue;
      }
      return obj[currentPath];
    }

    return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
  };

  objectPath.del = function(obj, path) {
    return del(obj, path);
  };

  return objectPath;
});

},{}],27:[function(require,module,exports){
/**
 * Module dependencies.
 */

var slice = require('sliced')
var flatten = require('array-flatten')

/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = element('div', { id: 'foo' }, [
 *   element('a', { href: 'http://google.com' }, 'Google')
 * ])
 *
 * You can leave out the attributes or the children if either
 * of them aren't needed and it will figure out what you're
 * trying to do.
 */

module.exports = element

/**
 * Create virtual trees of components.
 *
 * This creates the nicer API for the user.
 * It translates that friendly API into an actual tree of nodes.
 *
 * @param {*} type
 * @param {Object} attributes
 * @param {Array} children
 * @return {Object}
 * @api public
 */

function element (type, attributes, children) {
  // Default to div with no args
  if (!type) {
    throw new TypeError('element() needs a type.')
  }

  // Skipped adding attributes and we're passing
  // in children instead.
  if (arguments.length === 2 && (typeof attributes === 'string' || Array.isArray(attributes))) {
    children = [ attributes ]
    attributes = {}
  }

  // Account for JSX putting the children as multiple arguments.
  // This is essentially just the ES6 rest param
  if (arguments.length > 2) {
    children = slice(arguments, 2)
  }

  children = children || []
  attributes = attributes || {}

  // Flatten nested child arrays. This is how JSX compiles some nodes.
  children = flatten(children, 2)

  // Filter out any `undefined` elements
  children = children.filter(function (i) { return typeof i !== 'undefined' })

  // if you pass in a function, it's a `Component` constructor.
  // otherwise it's an element.
  return {
    type: type,
    children: children,
    attributes: attributes
  }
}

},{"array-flatten":28,"sliced":29}],28:[function(require,module,exports){
'use strict'

/**
 * Expose `arrayFlatten`.
 */
module.exports = arrayFlatten

/**
 * Recursive flatten function with depth.
 *
 * @param  {Array}  array
 * @param  {Array}  result
 * @param  {Number} depth
 * @return {Array}
 */
function flattenWithDepth (array, result, depth) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (depth > 0 && Array.isArray(value)) {
      flattenWithDepth(value, result, depth - 1)
    } else {
      result.push(value)
    }
  }

  return result
}

/**
 * Recursive flatten function. Omitting depth is slightly faster.
 *
 * @param  {Array} array
 * @param  {Array} result
 * @return {Array}
 */
function flattenForever (array, result) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (Array.isArray(value)) {
      flattenForever(value, result)
    } else {
      result.push(value)
    }
  }

  return result
}

/**
 * Flatten an array, with the ability to define a depth.
 *
 * @param  {Array}  array
 * @param  {Number} depth
 * @return {Array}
 */
function arrayFlatten (array, depth) {
  if (depth == null) {
    return flattenForever(array, [])
  }

  return flattenWithDepth(array, [], depth)
}

},{}],29:[function(require,module,exports){
module.exports = exports = require('./lib/sliced');

},{"./lib/sliced":30}],30:[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _virtualElement = require("virtual-element");

var _virtualElement2 = _interopRequireDefault(_virtualElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Exports.
 */

exports.default = { render: render };

/**
 * Render.
 */

/**
 * Module dependencies.
 */

function render(_ref) {
  var props = _ref.props;
  var isLoading = props.isLoading;
  var children = props.children;

  if (!isLoading) return (0, _virtualElement2.default)(
    "div",
    null,
    children
  );
  return (0, _virtualElement2.default)(
    "div",
    { "class": "Loader" },
    (0, _virtualElement2.default)("div", { "class": "LoaderSpinner" })
  );
}

},{"virtual-element":27}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Rla3UvbGliL2FwcGxpY2F0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2Rla3UvbGliL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWt1L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWt1L2xpYi9ub2RlLXR5cGUuanMiLCJub2RlX21vZHVsZXMvZGVrdS9saWIvcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2Rla3UvbGliL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy9kZWt1L2xpYi9zdmcuanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvY29tcG9uZW50LXJhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWt1L25vZGVfbW9kdWxlcy9jb21wb25lbnQtdHlwZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWt1L25vZGVfbW9kdWxlcy9mYXN0LmpzL2FycmF5L2ZvckVhY2guanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvZmFzdC5qcy9hcnJheS9yZWR1Y2UuanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvZmFzdC5qcy9mb3JFYWNoLmpzIiwibm9kZV9tb2R1bGVzL2Rla3Uvbm9kZV9tb2R1bGVzL2Zhc3QuanMvZnVuY3Rpb24vYmluZEludGVybmFsMy5qcyIsIm5vZGVfbW9kdWxlcy9kZWt1L25vZGVfbW9kdWxlcy9mYXN0LmpzL2Z1bmN0aW9uL2JpbmRJbnRlcm5hbDQuanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvZmFzdC5qcy9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2Rla3Uvbm9kZV9tb2R1bGVzL2Zhc3QuanMvb2JqZWN0L2ZvckVhY2guanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvZmFzdC5qcy9vYmplY3QvcmVkdWNlLmpzIiwibm9kZV9tb2R1bGVzL2Rla3Uvbm9kZV9tb2R1bGVzL2Zhc3QuanMvcmVkdWNlLmpzIiwibm9kZV9tb2R1bGVzL2Rla3Uvbm9kZV9tb2R1bGVzL2dldC11aWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvaXMtZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Rla3Uvbm9kZV9tb2R1bGVzL2lzLXN2Zy1hdHRyaWJ1dGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvaXMtc3ZnLWVsZW1lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVrdS9ub2RlX21vZHVsZXMvb2JqZWN0LWRlZmF1bHRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Rla3Uvbm9kZV9tb2R1bGVzL29iamVjdC1wYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZWxlbWVudC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWVsZW1lbnQvbm9kZV9tb2R1bGVzL2FycmF5LWZsYXR0ZW4vYXJyYXktZmxhdHRlbi5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWVsZW1lbnQvbm9kZV9tb2R1bGVzL3NsaWNlZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWVsZW1lbnQvbm9kZV9tb2R1bGVzL3NsaWNlZC9saWIvc2xpY2VkLmpzIiwic3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFNLE9BQU8sU0FBUyxhQUFULENBQXVCLE9BQXZCLENBQWI7O0FBRUEsSUFBTSxNQUFNO0FBQ1YsY0FEVSwwQkFDSztBQUNiLFdBQU8sRUFBRSxTQUFTLElBQVgsRUFBUDtBQUNELEdBSFM7QUFLVixRQUxVLHdCQUtRO0FBQUEsUUFBVCxLQUFTLFFBQVQsS0FBUzs7QUFDaEIsV0FDRTtBQUFBO01BQUEsRUFBSyxTQUFNLEtBQVg7TUFDRTtBQUFBO1FBQUE7UUFBQTtBQUFBLE9BREY7TUFFRTtBQUFBO1FBQUEsRUFBUSxXQUFXLE1BQU0sT0FBekI7UUFDRTtBQUFBO1VBQUE7VUFBQTtBQUFBO0FBREY7QUFGRixLQURGO0FBUUQsR0FkUztBQWdCVixZQWhCVSxzQkFnQkMsQ0FoQkQsRUFnQkksRUFoQkosRUFnQlEsUUFoQlIsRUFnQmtCO0FBQzFCLGVBQVcsWUFBVztBQUNwQixlQUFTLEVBQUUsU0FBUyxLQUFYLEVBQVQ7QUFDRCxLQUZELEVBRUcsSUFGSDtBQUdEO0FBcEJTLENBQVo7O0FBdUJBLGtCQUFPLGdCQUFLLDhCQUFRLEdBQVIsQ0FBTCxDQUFQLEVBQTJCLElBQTNCOzs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzVCQTs7Ozs7Ozs7OztrQkFNZSxFQUFFLGNBQUYsRTs7Ozs7Ozs7OztBQU1mLFNBQVMsTUFBVCxPQUEyQjtBQUFBLE1BQVQsS0FBUyxRQUFULEtBQVM7QUFBQSxNQUNqQixTQURpQixHQUNNLEtBRE4sQ0FDakIsU0FEaUI7QUFBQSxNQUNOLFFBRE0sR0FDTSxLQUROLENBQ04sUUFETTs7QUFFekIsTUFBSSxDQUFDLFNBQUwsRUFBZ0IsT0FBTztBQUFBO0lBQUE7SUFBTTtBQUFOLEdBQVA7QUFDaEIsU0FDRTtBQUFBO0lBQUEsRUFBSyxTQUFNLFFBQVg7SUFDRSx1Q0FBSyxTQUFNLGVBQVg7QUFERixHQURGO0FBS0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5pbXBvcnQgZWxlbWVudCBmcm9tICd2aXJ0dWFsLWVsZW1lbnQnXG5pbXBvcnQgeyB0cmVlLCByZW5kZXIgfSBmcm9tICdkZWt1J1xuaW1wb3J0IExvYWRlciBmcm9tICcuLi9zcmMnXG5cbmNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcm9vdCcpXG5cbmNvbnN0IEFwcCA9IHtcbiAgaW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7IGxvYWRpbmc6IHRydWUgfVxuICB9LFxuXG4gIHJlbmRlcih7IHN0YXRlIH0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzcz1cIkFwcFwiPlxuICAgICAgICA8aDE+bG9hZGVyPC9oMT5cbiAgICAgICAgPExvYWRlciBpc0xvYWRpbmc9e3N0YXRlLmxvYWRpbmd9PlxuICAgICAgICAgIDxoMj5oaSEgaW0gc29tZSBjb250ZW50IHRoYXQgdGFrZXMgYXdoaWxlIHRvIGxvYWQuPC9oMj5cbiAgICAgICAgPC9Mb2FkZXI+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgYWZ0ZXJNb3VudChfLCBfXywgc2V0U3RhdGUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KVxuICAgIH0sIDE1MDApXG4gIH1cbn1cblxucmVuZGVyKHRyZWUoZWxlbWVudChBcHApKSwgcm9vdClcbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJylcblxuLyoqXG4gKiBFeHBvc2UgYHNjZW5lYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgT3B0aW9uYWwgaW5pdGlhbCBlbGVtZW50XG4gKi9cblxuZnVuY3Rpb24gQXBwbGljYXRpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEFwcGxpY2F0aW9uKSkgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbihlbGVtZW50KVxuICB0aGlzLm9wdGlvbnMgPSB7fVxuICB0aGlzLnNvdXJjZXMgPSB7fVxuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoQXBwbGljYXRpb24ucHJvdG90eXBlKVxuXG4vKipcbiAqIEFkZCBhIHBsdWdpblxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHBsdWdpblxuICovXG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbih0aGlzKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNldCBhbiBvcHRpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICovXG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5vcHRpb24gPSBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gIHRoaXMub3B0aW9uc1tuYW1lXSA9IHZhbFxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNldCB2YWx1ZSB1c2VkIHNvbWV3aGVyZSBpbiB0aGUgSU8gbmV0d29yay5cbiAqL1xuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEpIHtcbiAgdGhpcy5zb3VyY2VzW25hbWVdID0gZGF0YVxuICB0aGlzLmVtaXQoJ3NvdXJjZScsIG5hbWUsIGRhdGEpXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogTW91bnQgYSB2aXJ0dWFsIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtWaXJ0dWFsRWxlbWVudH0gZWxlbWVudFxuICovXG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5tb3VudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcbiAgdGhpcy5lbWl0KCdtb3VudCcsIGVsZW1lbnQpXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmVtb3ZlIHRoZSB3b3JsZC4gVW5tb3VudCBldmVyeXRoaW5nLlxuICovXG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS51bm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuZWxlbWVudCkgcmV0dXJuXG4gIHRoaXMuZWxlbWVudCA9IG51bGxcbiAgdGhpcy5lbWl0KCd1bm1vdW50JylcbiAgcmV0dXJuIHRoaXNcbn1cbiIsIi8qKlxuICogQWxsIG9mIHRoZSBldmVudHMgY2FuIGJpbmQgdG9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25CbHVyOiAnYmx1cicsXG4gIG9uQ2hhbmdlOiAnY2hhbmdlJyxcbiAgb25DbGljazogJ2NsaWNrJyxcbiAgb25Db250ZXh0TWVudTogJ2NvbnRleHRtZW51JyxcbiAgb25Db3B5OiAnY29weScsXG4gIG9uQ3V0OiAnY3V0JyxcbiAgb25Eb3VibGVDbGljazogJ2RibGNsaWNrJyxcbiAgb25EcmFnOiAnZHJhZycsXG4gIG9uRHJhZ0VuZDogJ2RyYWdlbmQnLFxuICBvbkRyYWdFbnRlcjogJ2RyYWdlbnRlcicsXG4gIG9uRHJhZ0V4aXQ6ICdkcmFnZXhpdCcsXG4gIG9uRHJhZ0xlYXZlOiAnZHJhZ2xlYXZlJyxcbiAgb25EcmFnT3ZlcjogJ2RyYWdvdmVyJyxcbiAgb25EcmFnU3RhcnQ6ICdkcmFnc3RhcnQnLFxuICBvbkRyb3A6ICdkcm9wJyxcbiAgb25FcnJvcjogJ2Vycm9yJyxcbiAgb25Gb2N1czogJ2ZvY3VzJyxcbiAgb25JbnB1dDogJ2lucHV0JyxcbiAgb25JbnZhbGlkOiAnaW52YWxpZCcsXG4gIG9uS2V5RG93bjogJ2tleWRvd24nLFxuICBvbktleVByZXNzOiAna2V5cHJlc3MnLFxuICBvbktleVVwOiAna2V5dXAnLFxuICBvbk1vdXNlRG93bjogJ21vdXNlZG93bicsXG4gIG9uTW91c2VFbnRlcjogJ21vdXNlZW50ZXInLFxuICBvbk1vdXNlTGVhdmU6ICdtb3VzZWxlYXZlJyxcbiAgb25Nb3VzZU1vdmU6ICdtb3VzZW1vdmUnLFxuICBvbk1vdXNlT3V0OiAnbW91c2VvdXQnLFxuICBvbk1vdXNlT3ZlcjogJ21vdXNlb3ZlcicsXG4gIG9uTW91c2VVcDogJ21vdXNldXAnLFxuICBvblBhc3RlOiAncGFzdGUnLFxuICBvblJlc2V0OiAncmVzZXQnLFxuICBvblNjcm9sbDogJ3Njcm9sbCcsXG4gIG9uU3VibWl0OiAnc3VibWl0JyxcbiAgb25Ub3VjaENhbmNlbDogJ3RvdWNoY2FuY2VsJyxcbiAgb25Ub3VjaEVuZDogJ3RvdWNoZW5kJyxcbiAgb25Ub3VjaE1vdmU6ICd0b3VjaG1vdmUnLFxuICBvblRvdWNoU3RhcnQ6ICd0b3VjaHN0YXJ0JyxcbiAgb25XaGVlbDogJ3doZWVsJ1xufVxuIiwiLyoqXG4gKiBDcmVhdGUgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5cbmV4cG9ydHMudHJlZSA9XG5leHBvcnRzLnNjZW5lID1cbmV4cG9ydHMuZGVrdSA9IHJlcXVpcmUoJy4vYXBwbGljYXRpb24nKVxuXG4vKipcbiAqIFJlbmRlciBzY2VuZXMgdG8gdGhlIERPTS5cbiAqL1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICBleHBvcnRzLnJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbn1cblxuLyoqXG4gKiBSZW5kZXIgc2NlbmVzIHRvIGEgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5yZW5kZXJTdHJpbmcgPSByZXF1aXJlKCcuL3N0cmluZ2lmeScpIiwidmFyIHR5cGUgPSByZXF1aXJlKCdjb21wb25lbnQtdHlwZScpXG5cbi8qKlxuICogUmV0dXJucyB0aGUgdHlwZSBvZiBhIHZpcnR1YWwgbm9kZVxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gbm9kZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9kZVR5cGUgKG5vZGUpIHtcbiAgdmFyIHYgPSB0eXBlKG5vZGUpXG4gIGlmICh2ID09PSAnbnVsbCcgfHwgbm9kZSA9PT0gZmFsc2UpIHJldHVybiAnZW1wdHknXG4gIGlmICh2ICE9PSAnb2JqZWN0JykgcmV0dXJuICd0ZXh0J1xuICBpZiAodHlwZShub2RlLnR5cGUpID09PSAnc3RyaW5nJykgcmV0dXJuICdlbGVtZW50J1xuICByZXR1cm4gJ2NvbXBvbmVudCdcbn1cbiIsIi8qKlxuICogRGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciByYWYgPSByZXF1aXJlKCdjb21wb25lbnQtcmFmJylcbnZhciBpc0RvbSA9IHJlcXVpcmUoJ2lzLWRvbScpXG52YXIgdWlkID0gcmVxdWlyZSgnZ2V0LXVpZCcpXG52YXIga2V5cGF0aCA9IHJlcXVpcmUoJ29iamVjdC1wYXRoJylcbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpXG52YXIgc3ZnID0gcmVxdWlyZSgnLi9zdmcnKVxudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnb2JqZWN0LWRlZmF1bHRzJylcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnZmFzdC5qcy9mb3JFYWNoJylcbnZhciBhc3NpZ24gPSByZXF1aXJlKCdmYXN0LmpzL29iamVjdC9hc3NpZ24nKVxudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ2Zhc3QuanMvcmVkdWNlJylcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJylcblxuLyoqXG4gKiBFeHBvc2UgYGRvbWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJcblxuLyoqXG4gKiBSZW5kZXIgYW4gYXBwIHRvIHRoZSBET01cbiAqXG4gKiBAcGFyYW0ge0FwcGxpY2F0aW9ufSBhcHBcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lclxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcmVuZGVyIChhcHAsIGNvbnRhaW5lciwgb3B0cykge1xuICB2YXIgZnJhbWVJZFxuICB2YXIgaXNSZW5kZXJpbmdcbiAgdmFyIHJvb3RJZCA9ICdyb290J1xuICB2YXIgY3VycmVudEVsZW1lbnRcbiAgdmFyIGN1cnJlbnROYXRpdmVFbGVtZW50XG4gIHZhciBjb25uZWN0aW9ucyA9IHt9XG4gIHZhciBjb21wb25lbnRzID0ge31cbiAgdmFyIGVudGl0aWVzID0ge31cbiAgdmFyIGhhbmRsZXJzID0ge31cbiAgdmFyIG1vdW50UXVldWUgPSBbXVxuICB2YXIgY2hpbGRyZW4gPSB7fVxuICBjaGlsZHJlbltyb290SWRdID0ge31cblxuICBpZiAoIWlzRG9tKGNvbnRhaW5lcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbnRhaW5lciBlbGVtZW50IG11c3QgYmUgYSBET00gZWxlbWVudCcpXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyaW5nIG9wdGlvbnMuIEJhdGNoaW5nIGlzIG9ubHkgZXZlciByZWFsbHkgZGlzYWJsZWRcbiAgICogd2hlbiBydW5uaW5nIHRlc3RzLCBhbmQgcG9vbGluZyBjYW4gYmUgZGlzYWJsZWQgaWYgdGhlIHVzZXJcbiAgICogaXMgZG9pbmcgc29tZXRoaW5nIHN0dXBpZCB3aXRoIHRoZSBET00gaW4gdGhlaXIgY29tcG9uZW50cy5cbiAgICovXG5cbiAgdmFyIG9wdGlvbnMgPSBkZWZhdWx0cyhhc3NpZ24oe30sIGFwcC5vcHRpb25zIHx8IHt9LCBvcHRzIHx8IHt9KSwge1xuICAgIGJhdGNoaW5nOiB0cnVlXG4gIH0pXG5cbiAgLyoqXG4gICAqIExpc3RlbiB0byBET00gZXZlbnRzXG4gICAqL1xuICB2YXIgcm9vdEVsZW1lbnQgPSBnZXRSb290RWxlbWVudChjb250YWluZXIpXG4gIGFkZE5hdGl2ZUV2ZW50TGlzdGVuZXJzKClcblxuICAvKipcbiAgICogV2F0Y2ggZm9yIGNoYW5nZXMgdG8gdGhlIGFwcCBzbyB0aGF0IHdlIGNhbiB1cGRhdGVcbiAgICogdGhlIERPTSBhcyBuZWVkZWQuXG4gICAqL1xuXG4gIGFwcC5vbigndW5tb3VudCcsIG9udW5tb3VudClcbiAgYXBwLm9uKCdtb3VudCcsIG9ubW91bnQpXG4gIGFwcC5vbignc291cmNlJywgb251cGRhdGUpXG5cbiAgLyoqXG4gICAqIElmIHRoZSBhcHAgaGFzIGFscmVhZHkgbW91bnRlZCBhbiBlbGVtZW50LCB3ZSBjYW4ganVzdFxuICAgKiByZW5kZXIgdGhhdCBzdHJhaWdodCBhd2F5LlxuICAgKi9cblxuICBpZiAoYXBwLmVsZW1lbnQpIHJlbmRlcigpXG5cbiAgLyoqXG4gICAqIFRlYXJkb3duIHRoZSBET00gcmVuZGVyaW5nIHNvIHRoYXQgaXQgc3RvcHNcbiAgICogcmVuZGVyaW5nIGFuZCBldmVyeXRoaW5nIGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbiAgICovXG5cbiAgZnVuY3Rpb24gdGVhcmRvd24gKCkge1xuICAgIHJlbW92ZU5hdGl2ZUV2ZW50TGlzdGVuZXJzKClcbiAgICByZW1vdmVOYXRpdmVFbGVtZW50KClcbiAgICBhcHAub2ZmKCd1bm1vdW50Jywgb251bm1vdW50KVxuICAgIGFwcC5vZmYoJ21vdW50Jywgb25tb3VudClcbiAgICBhcHAub2ZmKCdzb3VyY2UnLCBvbnVwZGF0ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTd2FwIHRoZSBjdXJyZW50IHJlbmRlcmVkIG5vZGUgd2l0aCBhIG5ldyBvbmUgdGhhdCBpcyByZW5kZXJlZFxuICAgKiBmcm9tIHRoZSBuZXcgdmlydHVhbCBlbGVtZW50IG1vdW50ZWQgb24gdGhlIGFwcC5cbiAgICpcbiAgICogQHBhcmFtIHtWaXJ0dWFsRWxlbWVudH0gZWxlbWVudFxuICAgKi9cblxuICBmdW5jdGlvbiBvbm1vdW50ICgpIHtcbiAgICBpbnZhbGlkYXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgYXBwIHVubW91bnRzIGFuIGVsZW1lbnQsIHdlIHNob3VsZCBjbGVhciBvdXQgdGhlIGN1cnJlbnRcbiAgICogcmVuZGVyZWQgZWxlbWVudC4gVGhpcyB3aWxsIHJlbW92ZSBhbGwgdGhlIGVudGl0aWVzLlxuICAgKi9cblxuICBmdW5jdGlvbiBvbnVubW91bnQgKCkge1xuICAgIHJlbW92ZU5hdGl2ZUVsZW1lbnQoKVxuICAgIGN1cnJlbnRFbGVtZW50ID0gbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbGwgY29tcG9uZW50cyB0aGF0IGFyZSBib3VuZCB0byB0aGUgc291cmNlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gZGF0YVxuICAgKi9cblxuICBmdW5jdGlvbiBvbnVwZGF0ZSAobmFtZSwgZGF0YSkge1xuICAgIGlmICghY29ubmVjdGlvbnNbbmFtZV0pIHJldHVybjtcbiAgICBjb25uZWN0aW9uc1tuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKHVwZGF0ZSkge1xuICAgICAgdXBkYXRlKGRhdGEpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgYW5kIG1vdW50IGEgY29tcG9uZW50IHRvIHRoZSBuYXRpdmUgZG9tLlxuICAgKlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVxuICAgKi9cblxuICBmdW5jdGlvbiBtb3VudEVudGl0eSAoZW50aXR5KSB7XG4gICAgcmVnaXN0ZXIoZW50aXR5KVxuICAgIHNldFNvdXJjZXMoZW50aXR5KVxuICAgIGNoaWxkcmVuW2VudGl0eS5pZF0gPSB7fVxuICAgIGVudGl0aWVzW2VudGl0eS5pZF0gPSBlbnRpdHlcblxuICAgIC8vIGNvbW1pdCBpbml0aWFsIHN0YXRlIGFuZCBwcm9wcy5cbiAgICBjb21taXQoZW50aXR5KVxuXG4gICAgLy8gY2FsbGJhY2sgYmVmb3JlIG1vdW50aW5nLlxuICAgIHRyaWdnZXIoJ2JlZm9yZU1vdW50JywgZW50aXR5LCBbZW50aXR5LmNvbnRleHRdKVxuICAgIHRyaWdnZXIoJ2JlZm9yZVJlbmRlcicsIGVudGl0eSwgW2VudGl0eS5jb250ZXh0XSlcblxuICAgIC8vIHJlbmRlciB2aXJ0dWFsIGVsZW1lbnQuXG4gICAgdmFyIHZpcnR1YWxFbGVtZW50ID0gcmVuZGVyRW50aXR5KGVudGl0eSlcbiAgICAvLyBjcmVhdGUgbmF0aXZlIGVsZW1lbnQuXG4gICAgdmFyIG5hdGl2ZUVsZW1lbnQgPSB0b05hdGl2ZShlbnRpdHkuaWQsICcwJywgdmlydHVhbEVsZW1lbnQpXG5cbiAgICBlbnRpdHkudmlydHVhbEVsZW1lbnQgPSB2aXJ0dWFsRWxlbWVudFxuICAgIGVudGl0eS5uYXRpdmVFbGVtZW50ID0gbmF0aXZlRWxlbWVudFxuXG4gICAgLy8gRmlyZSBhZnRlclJlbmRlciBhbmQgYWZ0ZXJNb3VudCBob29rcyBhdCB0aGUgZW5kXG4gICAgLy8gb2YgdGhlIHJlbmRlciBjeWNsZVxuICAgIG1vdW50UXVldWUucHVzaChlbnRpdHkuaWQpXG5cbiAgICByZXR1cm4gbmF0aXZlRWxlbWVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbXBvbmVudCBmcm9tIHRoZSBuYXRpdmUgZG9tLlxuICAgKlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAqL1xuXG4gIGZ1bmN0aW9uIHVubW91bnRFbnRpdHkgKGVudGl0eUlkKSB7XG4gICAgdmFyIGVudGl0eSA9IGVudGl0aWVzW2VudGl0eUlkXVxuICAgIGlmICghZW50aXR5KSByZXR1cm5cbiAgICB0cmlnZ2VyKCdiZWZvcmVVbm1vdW50JywgZW50aXR5LCBbZW50aXR5LmNvbnRleHQsIGVudGl0eS5uYXRpdmVFbGVtZW50XSlcbiAgICB1bm1vdW50Q2hpbGRyZW4oZW50aXR5SWQpXG4gICAgcmVtb3ZlQWxsRXZlbnRzKGVudGl0eUlkKVxuICAgIHZhciBjb21wb25lbnRFbnRpdGllcyA9IGNvbXBvbmVudHNbZW50aXR5SWRdLmVudGl0aWVzO1xuICAgIGRlbGV0ZSBjb21wb25lbnRFbnRpdGllc1tlbnRpdHlJZF1cbiAgICBkZWxldGUgY29tcG9uZW50c1tlbnRpdHlJZF1cbiAgICBkZWxldGUgZW50aXRpZXNbZW50aXR5SWRdXG4gICAgZGVsZXRlIGNoaWxkcmVuW2VudGl0eUlkXVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgZW50aXR5IGFuZCBtYWtlIHN1cmUgaXQgcmV0dXJucyBhIG5vZGVcbiAgICpcbiAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgKlxuICAgKiBAcmV0dXJuIHtWaXJ0dWFsVHJlZX1cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVuZGVyRW50aXR5IChlbnRpdHkpIHtcbiAgICB2YXIgY29tcG9uZW50ID0gZW50aXR5LmNvbXBvbmVudFxuICAgIHZhciBmbiA9IHR5cGVvZiBjb21wb25lbnQgPT09ICdmdW5jdGlvbicgPyBjb21wb25lbnQgOiBjb21wb25lbnQucmVuZGVyXG4gICAgaWYgKCFmbikgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgbmVlZHMgYSByZW5kZXIgZnVuY3Rpb24nKVxuICAgIHZhciByZXN1bHQgPSBmbihlbnRpdHkuY29udGV4dCwgc2V0U3RhdGUoZW50aXR5KSlcbiAgICBpZiAoIXJlc3VsdCkgdGhyb3cgbmV3IEVycm9yKCdSZW5kZXIgZnVuY3Rpb24gbXVzdCByZXR1cm4gYW4gZWxlbWVudC4nKVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuZXZlciBzZXRTdGF0ZSBvciBzZXRQcm9wcyBpcyBjYWxsZWQsIHdlIG1hcmsgdGhlIGVudGl0eVxuICAgKiBhcyBkaXJ0eSBpbiB0aGUgcmVuZGVyZXIuIFRoaXMgbGV0cyB1cyBvcHRpbWl6ZSB0aGUgcmUtcmVuZGVyaW5nXG4gICAqIGFuZCBza2lwIGNvbXBvbmVudHMgdGhhdCBkZWZpbml0ZWx5IGhhdmVuJ3QgY2hhbmdlZC5cbiAgICpcbiAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgKlxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBjdXJyaWVkIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgc3RhdGUgb2YgYW4gZW50aXR5XG4gICAqL1xuXG4gIGZ1bmN0aW9uIHNldFN0YXRlIChlbnRpdHkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5leHRTdGF0ZSkge1xuICAgICAgdXBkYXRlRW50aXR5U3RhdGUoZW50aXR5LCBuZXh0U3RhdGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlbGwgdGhlIGFwcCBpdCdzIGRpcnR5IGFuZCBuZWVkcyB0byByZS1yZW5kZXIuIElmIGJhdGNoaW5nIGlzIGRpc2FibGVkXG4gICAqIHdlIGNhbiBqdXN0IHRyaWdnZXIgYSByZW5kZXIgaW1tZWRpYXRlbHksIG90aGVyd2lzZSB3ZSdsbCB3YWl0IHVudGlsXG4gICAqIHRoZSBuZXh0IGF2YWlsYWJsZSBmcmFtZS5cbiAgICovXG5cbiAgZnVuY3Rpb24gaW52YWxpZGF0ZSAoKSB7XG4gICAgaWYgKCFvcHRpb25zLmJhdGNoaW5nKSB7XG4gICAgICBpZiAoIWlzUmVuZGVyaW5nKSByZW5kZXIoKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWZyYW1lSWQpIGZyYW1lSWQgPSByYWYocmVuZGVyKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIERPTS4gSWYgdGhlIHVwZGF0ZSBmYWlscyB3ZSBzdG9wIHRoZSBsb29wXG4gICAqIHNvIHdlIGRvbid0IGdldCBlcnJvcnMgb24gZXZlcnkgZnJhbWUuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlbmRlciAoKSB7XG4gICAgLy8gSWYgdGhpcyBpcyBjYWxsZWQgc3luY2hyb25vdXNseSB3ZSBuZWVkIHRvXG4gICAgLy8gY2FuY2VsIGFueSBwZW5kaW5nIGZ1dHVyZSB1cGRhdGVzXG4gICAgY2xlYXJGcmFtZSgpXG5cbiAgICAvLyBJZiB0aGUgcmVuZGVyaW5nIGZyb20gdGhlIHByZXZpb3VzIGZyYW1lIGlzIHN0aWxsIGdvaW5nLFxuICAgIC8vIHdlJ2xsIGp1c3Qgd2FpdCB1bnRpbCB0aGUgbmV4dCBmcmFtZS4gSWRlYWxseSByZW5kZXJzIHNob3VsZFxuICAgIC8vIG5vdCB0YWtlIG92ZXIgMTZtcyB0byBzdGF5IHdpdGhpbiBhIHNpbmdsZSBmcmFtZSwgYnV0IHRoaXMgc2hvdWxkXG4gICAgLy8gY2F0Y2ggaXQgaWYgaXQgZG9lcy5cbiAgICBpZiAoaXNSZW5kZXJpbmcpIHtcbiAgICAgIGZyYW1lSWQgPSByYWYocmVuZGVyKVxuICAgICAgcmV0dXJuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlzUmVuZGVyaW5nID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIDEuIElmIHRoZXJlIGlzbid0IGEgbmF0aXZlIGVsZW1lbnQgcmVuZGVyZWQgZm9yIHRoZSBjdXJyZW50IG1vdW50ZWQgZWxlbWVudFxuICAgIC8vIHRoZW4gd2UgbmVlZCB0byBjcmVhdGUgaXQgZnJvbSBzY3JhdGNoLlxuICAgIC8vIDIuIElmIGEgbmV3IGVsZW1lbnQgaGFzIGJlZW4gbW91bnRlZCwgd2Ugc2hvdWxkIGRpZmYgdGhlbS5cbiAgICAvLyAzLiBXZSBzaG91bGQgdXBkYXRlIGNoZWNrIGFsbCBjaGlsZCBjb21wb25lbnRzIGZvciBjaGFuZ2VzLlxuICAgIGlmICghY3VycmVudE5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIGN1cnJlbnRFbGVtZW50ID0gYXBwLmVsZW1lbnRcbiAgICAgIGN1cnJlbnROYXRpdmVFbGVtZW50ID0gdG9OYXRpdmUocm9vdElkLCAnMCcsIGN1cnJlbnRFbGVtZW50KVxuICAgICAgaWYgKGNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnZGVrdTogVGhlIGNvbnRhaW5lciBlbGVtZW50IGlzIG5vdCBlbXB0eS4gVGhlc2UgZWxlbWVudHMgd2lsbCBiZSByZW1vdmVkLiBSZWFkIG1vcmU6IGh0dHA6Ly9jbC5seS9iMFNyJylcbiAgICAgIH1cbiAgICAgIGlmIChjb250YWluZXIgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkZWt1OiBVc2luZyBkb2N1bWVudC5ib2R5IGlzIGFsbG93ZWQgYnV0IGl0IGNhbiBjYXVzZSBzb21lIGlzc3Vlcy4gUmVhZCBtb3JlOiBodHRwOi8vY2wubHkvYjBTQycpXG4gICAgICB9XG4gICAgICByZW1vdmVBbGxDaGlsZHJlbihjb250YWluZXIpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3VycmVudE5hdGl2ZUVsZW1lbnQpXG4gICAgfSBlbHNlIGlmIChjdXJyZW50RWxlbWVudCAhPT0gYXBwLmVsZW1lbnQpIHtcbiAgICAgIGN1cnJlbnROYXRpdmVFbGVtZW50ID0gcGF0Y2gocm9vdElkLCBjdXJyZW50RWxlbWVudCwgYXBwLmVsZW1lbnQsIGN1cnJlbnROYXRpdmVFbGVtZW50KVxuICAgICAgY3VycmVudEVsZW1lbnQgPSBhcHAuZWxlbWVudFxuICAgICAgdXBkYXRlQ2hpbGRyZW4ocm9vdElkKVxuICAgIH0gZWxzZSB7XG4gICAgICB1cGRhdGVDaGlsZHJlbihyb290SWQpXG4gICAgfVxuXG4gICAgLy8gQ2FsbCBtb3VudCBldmVudHMgb24gYWxsIG5ldyBlbnRpdGllc1xuICAgIGZsdXNoTW91bnRRdWV1ZSgpXG5cbiAgICAvLyBBbGxvdyByZW5kZXJpbmcgYWdhaW4uXG4gICAgaXNSZW5kZXJpbmcgPSBmYWxzZVxuXG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBob29rcyBmb3IgYWxsIG5ldyBlbnRpdGllcyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGluXG4gICAqIHRoZSBsYXN0IHJlbmRlciBmcm9tIHRoZSBib3R0b20gdXAuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGZsdXNoTW91bnRRdWV1ZSAoKSB7XG4gICAgd2hpbGUgKG1vdW50UXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGVudGl0eUlkID0gbW91bnRRdWV1ZS5zaGlmdCgpXG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXNbZW50aXR5SWRdXG4gICAgICB0cmlnZ2VyKCdhZnRlclJlbmRlcicsIGVudGl0eSwgW2VudGl0eS5jb250ZXh0LCBlbnRpdHkubmF0aXZlRWxlbWVudF0pXG4gICAgICB0cmlnZ2VyKCdhZnRlck1vdW50JywgZW50aXR5LCBbZW50aXR5LmNvbnRleHQsIGVudGl0eS5uYXRpdmVFbGVtZW50LCBzZXRTdGF0ZShlbnRpdHkpXSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIGN1cnJlbnQgc2NoZWR1bGVkIGZyYW1lXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNsZWFyRnJhbWUgKCkge1xuICAgIGlmICghZnJhbWVJZCkgcmV0dXJuXG4gICAgcmFmLmNhbmNlbChmcmFtZUlkKVxuICAgIGZyYW1lSWQgPSAwXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGEgY29tcG9uZW50LlxuICAgKlxuICAgKiBUaGUgZW50aXR5IGlzIGp1c3QgdGhlIGRhdGEgb2JqZWN0IGZvciBhIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIENvbXBvbmVudCBpbnN0YW5jZSBpZC5cbiAgICovXG5cbiAgZnVuY3Rpb24gdXBkYXRlRW50aXR5IChlbnRpdHlJZCkge1xuICAgIHZhciBlbnRpdHkgPSBlbnRpdGllc1tlbnRpdHlJZF1cbiAgICBzZXRTb3VyY2VzKGVudGl0eSlcblxuICAgIGlmICghc2hvdWxkVXBkYXRlKGVudGl0eSkpIHtcbiAgICAgIGNvbW1pdChlbnRpdHkpXG4gICAgICByZXR1cm4gdXBkYXRlQ2hpbGRyZW4oZW50aXR5SWQpXG4gICAgfVxuXG4gICAgdmFyIGN1cnJlbnRUcmVlID0gZW50aXR5LnZpcnR1YWxFbGVtZW50XG4gICAgdmFyIG5leHRQcm9wcyA9IGVudGl0eS5wZW5kaW5nUHJvcHNcbiAgICB2YXIgbmV4dFN0YXRlID0gZW50aXR5LnBlbmRpbmdTdGF0ZVxuICAgIHZhciBwcmV2aW91c1N0YXRlID0gZW50aXR5LmNvbnRleHQuc3RhdGVcbiAgICB2YXIgcHJldmlvdXNQcm9wcyA9IGVudGl0eS5jb250ZXh0LnByb3BzXG5cbiAgICAvLyBob29rIGJlZm9yZSByZW5kZXJpbmcuIGNvdWxkIG1vZGlmeSBzdGF0ZSBqdXN0IGJlZm9yZSB0aGUgcmVuZGVyIG9jY3Vycy5cbiAgICB0cmlnZ2VyKCdiZWZvcmVVcGRhdGUnLCBlbnRpdHksIFtlbnRpdHkuY29udGV4dCwgbmV4dFByb3BzLCBuZXh0U3RhdGVdKVxuICAgIHRyaWdnZXIoJ2JlZm9yZVJlbmRlcicsIGVudGl0eSwgW2VudGl0eS5jb250ZXh0XSlcblxuICAgIC8vIGNvbW1pdCBzdGF0ZSBhbmQgcHJvcHMuXG4gICAgY29tbWl0KGVudGl0eSlcblxuICAgIC8vIHJlLXJlbmRlci5cbiAgICB2YXIgbmV4dFRyZWUgPSByZW5kZXJFbnRpdHkoZW50aXR5KVxuXG4gICAgLy8gaWYgdGhlIHRyZWUgaXMgdGhlIHNhbWUgd2UgY2FuIGp1c3Qgc2tpcCB0aGlzIGNvbXBvbmVudFxuICAgIC8vIGJ1dCB3ZSBzaG91bGQgc3RpbGwgY2hlY2sgdGhlIGNoaWxkcmVuIHRvIHNlZSBpZiB0aGV5J3JlIGRpcnR5LlxuICAgIC8vIFRoaXMgYWxsb3dzIHVzIHRvIG1lbW9pemUgdGhlIHJlbmRlciBmdW5jdGlvbiBvZiBjb21wb25lbnRzLlxuICAgIGlmIChuZXh0VHJlZSA9PT0gY3VycmVudFRyZWUpIHJldHVybiB1cGRhdGVDaGlsZHJlbihlbnRpdHlJZClcblxuICAgIC8vIGFwcGx5IG5ldyB2aXJ0dWFsIHRyZWUgdG8gbmF0aXZlIGRvbS5cbiAgICBlbnRpdHkubmF0aXZlRWxlbWVudCA9IHBhdGNoKGVudGl0eUlkLCBjdXJyZW50VHJlZSwgbmV4dFRyZWUsIGVudGl0eS5uYXRpdmVFbGVtZW50KVxuICAgIGVudGl0eS52aXJ0dWFsRWxlbWVudCA9IG5leHRUcmVlXG4gICAgdXBkYXRlQ2hpbGRyZW4oZW50aXR5SWQpXG5cbiAgICAvLyB0cmlnZ2VyIHJlbmRlciBob29rXG4gICAgdHJpZ2dlcignYWZ0ZXJSZW5kZXInLCBlbnRpdHksIFtlbnRpdHkuY29udGV4dCwgZW50aXR5Lm5hdGl2ZUVsZW1lbnRdKVxuXG4gICAgLy8gdHJpZ2dlciBhZnRlclVwZGF0ZSBhZnRlciBhbGwgY2hpbGRyZW4gaGF2ZSB1cGRhdGVkLlxuICAgIHRyaWdnZXIoJ2FmdGVyVXBkYXRlJywgZW50aXR5LCBbZW50aXR5LmNvbnRleHQsIHByZXZpb3VzUHJvcHMsIHByZXZpb3VzU3RhdGUsIHNldFN0YXRlKGVudGl0eSldKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbGwgdGhlIGNoaWxkcmVuIG9mIGFuIGVudGl0eS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIENvbXBvbmVudCBpbnN0YW5jZSBpZC5cbiAgICovXG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4gKGVudGl0eUlkKSB7XG4gICAgZm9yRWFjaChjaGlsZHJlbltlbnRpdHlJZF0sIGZ1bmN0aW9uIChjaGlsZElkKSB7XG4gICAgICB1cGRhdGVFbnRpdHkoY2hpbGRJZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgb2YgdGhlIGNoaWxkIGVudGl0aWVzIG9mIGFuIGVudGl0eVxuICAgKlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAqL1xuXG4gIGZ1bmN0aW9uIHVubW91bnRDaGlsZHJlbiAoZW50aXR5SWQpIHtcbiAgICBmb3JFYWNoKGNoaWxkcmVuW2VudGl0eUlkXSwgZnVuY3Rpb24gKGNoaWxkSWQpIHtcbiAgICAgIHVubW91bnRFbnRpdHkoY2hpbGRJZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgcm9vdCBlbGVtZW50LiBJZiB0aGlzIGlzIGNhbGxlZCBzeW5jaHJvbm91c2x5IHdlIG5lZWQgdG9cbiAgICogY2FuY2VsIGFueSBwZW5kaW5nIGZ1dHVyZSB1cGRhdGVzLlxuICAgKi9cblxuICBmdW5jdGlvbiByZW1vdmVOYXRpdmVFbGVtZW50ICgpIHtcbiAgICBjbGVhckZyYW1lKClcbiAgICByZW1vdmVFbGVtZW50KHJvb3RJZCwgJzAnLCBjdXJyZW50TmF0aXZlRWxlbWVudClcbiAgICBjdXJyZW50TmF0aXZlRWxlbWVudCA9IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuYXRpdmUgZWxlbWVudCBmcm9tIGEgdmlydHVhbCBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZW50aXR5SWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHZub2RlXG4gICAqXG4gICAqIEByZXR1cm4ge0hUTUxEb2N1bWVudEZyYWdtZW50fVxuICAgKi9cblxuICBmdW5jdGlvbiB0b05hdGl2ZSAoZW50aXR5SWQsIHBhdGgsIHZub2RlKSB7XG4gICAgc3dpdGNoIChub2RlVHlwZSh2bm9kZSkpIHtcbiAgICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gdG9OYXRpdmVUZXh0KHZub2RlKVxuICAgICAgY2FzZSAnZW1wdHknOiByZXR1cm4gdG9OYXRpdmVFbXB0eUVsZW1lbnQoZW50aXR5SWQsIHBhdGgpXG4gICAgICBjYXNlICdlbGVtZW50JzogcmV0dXJuIHRvTmF0aXZlRWxlbWVudChlbnRpdHlJZCwgcGF0aCwgdm5vZGUpXG4gICAgICBjYXNlICdjb21wb25lbnQnOiByZXR1cm4gdG9OYXRpdmVDb21wb25lbnQoZW50aXR5SWQsIHBhdGgsIHZub2RlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuYXRpdmUgdGV4dCBlbGVtZW50IGZyb20gYSB2aXJ0dWFsIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2bm9kZVxuICAgKi9cblxuICBmdW5jdGlvbiB0b05hdGl2ZVRleHQgKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuYXRpdmUgZWxlbWVudCBmcm9tIGEgdmlydHVhbCBlbGVtZW50LlxuICAgKi9cblxuICBmdW5jdGlvbiB0b05hdGl2ZUVsZW1lbnQgKGVudGl0eUlkLCBwYXRoLCB2bm9kZSkge1xuICAgIHZhciBlbFxuICAgIHZhciBhdHRyaWJ1dGVzID0gdm5vZGUuYXR0cmlidXRlc1xuICAgIHZhciB0YWdOYW1lID0gdm5vZGUudHlwZVxuICAgIHZhciBjaGlsZE5vZGVzID0gdm5vZGUuY2hpbGRyZW5cblxuICAgIC8vIGNyZWF0ZSBlbGVtZW50IGVpdGhlciBmcm9tIHBvb2wgb3IgZnJlc2guXG4gICAgaWYgKHN2Zy5pc0VsZW1lbnQodGFnTmFtZSkpIHtcbiAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Zy5uYW1lc3BhY2UsIHRhZ05hbWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKVxuICAgIH1cblxuICAgIC8vIHNldCBhdHRyaWJ1dGVzLlxuICAgIGZvckVhY2goYXR0cmlidXRlcywgZnVuY3Rpb24gKHZhbHVlLCBuYW1lKSB7XG4gICAgICBzZXRBdHRyaWJ1dGUoZW50aXR5SWQsIHBhdGgsIGVsLCBuYW1lLCB2YWx1ZSlcbiAgICB9KVxuXG4gICAgLy8gYWRkIGNoaWxkcmVuLlxuICAgIGZvckVhY2goY2hpbGROb2RlcywgZnVuY3Rpb24gKGNoaWxkLCBpKSB7XG4gICAgICB2YXIgY2hpbGRFbCA9IHRvTmF0aXZlKGVudGl0eUlkLCBwYXRoICsgJy4nICsgaSwgY2hpbGQpXG4gICAgICBpZiAoIWNoaWxkRWwucGFyZW50Tm9kZSkgZWwuYXBwZW5kQ2hpbGQoY2hpbGRFbClcbiAgICB9KVxuXG4gICAgLy8gc3RvcmUga2V5cyBvbiB0aGUgbmF0aXZlIGVsZW1lbnQgZm9yIGZhc3QgZXZlbnQgaGFuZGxpbmcuXG4gICAgZWwuX19lbnRpdHlfXyA9IGVudGl0eUlkXG4gICAgZWwuX19wYXRoX18gPSBwYXRoXG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuYXRpdmUgZWxlbWVudCBmcm9tIGEgdmlydHVhbCBlbGVtZW50LlxuICAgKi9cblxuICBmdW5jdGlvbiB0b05hdGl2ZUVtcHR5RWxlbWVudCAoZW50aXR5SWQsIHBhdGgpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdub3NjcmlwdCcpXG4gICAgZWwuX19lbnRpdHlfXyA9IGVudGl0eUlkXG4gICAgZWwuX19wYXRoX18gPSBwYXRoXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmF0aXZlIGVsZW1lbnQgZnJvbSBhIGNvbXBvbmVudC5cbiAgICovXG5cbiAgZnVuY3Rpb24gdG9OYXRpdmVDb21wb25lbnQgKGVudGl0eUlkLCBwYXRoLCB2bm9kZSkge1xuICAgIHZhciBjaGlsZCA9IG5ldyBFbnRpdHkodm5vZGUudHlwZSwgYXNzaWduKHsgY2hpbGRyZW46IHZub2RlLmNoaWxkcmVuIH0sIHZub2RlLmF0dHJpYnV0ZXMpLCBlbnRpdHlJZClcbiAgICBjaGlsZHJlbltlbnRpdHlJZF1bcGF0aF0gPSBjaGlsZC5pZFxuICAgIHJldHVybiBtb3VudEVudGl0eShjaGlsZClcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRjaCBhbiBlbGVtZW50IHdpdGggdGhlIGRpZmYgZnJvbSB0d28gdHJlZXMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHBhdGNoIChlbnRpdHlJZCwgcHJldiwgbmV4dCwgZWwpIHtcbiAgICByZXR1cm4gZGlmZk5vZGUoJzAnLCBlbnRpdHlJZCwgcHJldiwgbmV4dCwgZWwpXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgZGlmZiBiZXR3ZWVuIHR3byB0cmVlcyBvZiBub2Rlcy5cbiAgICovXG5cbiAgZnVuY3Rpb24gZGlmZk5vZGUgKHBhdGgsIGVudGl0eUlkLCBwcmV2LCBuZXh0LCBlbCkge1xuICAgIHZhciBsZWZ0VHlwZSA9IG5vZGVUeXBlKHByZXYpXG4gICAgdmFyIHJpZ2h0VHlwZSA9IG5vZGVUeXBlKG5leHQpXG5cbiAgICAvLyBUeXBlIGNoYW5nZWQuIFRoaXMgY291bGQgYmUgZnJvbSBlbGVtZW50LT50ZXh0LCB0ZXh0LT5Db21wb25lbnRBLFxuICAgIC8vIENvbXBvbmVudEEtPkNvbXBvbmVudEIgZXRjLiBCdXQgTk9UIGRpdi0+c3Bhbi4gVGhlc2UgYXJlIHRoZSBzYW1lIHR5cGVcbiAgICAvLyAoRWxlbWVudE5vZGUpIGJ1dCBkaWZmZXJlbnQgdGFnIG5hbWUuXG4gICAgaWYgKGxlZnRUeXBlICE9PSByaWdodFR5cGUpIHJldHVybiByZXBsYWNlRWxlbWVudChlbnRpdHlJZCwgcGF0aCwgZWwsIG5leHQpXG5cbiAgICBzd2l0Y2ggKHJpZ2h0VHlwZSkge1xuICAgICAgY2FzZSAndGV4dCc6IHJldHVybiBkaWZmVGV4dChwcmV2LCBuZXh0LCBlbClcbiAgICAgIGNhc2UgJ2VtcHR5JzogcmV0dXJuIGVsXG4gICAgICBjYXNlICdlbGVtZW50JzogcmV0dXJuIGRpZmZFbGVtZW50KHBhdGgsIGVudGl0eUlkLCBwcmV2LCBuZXh0LCBlbClcbiAgICAgIGNhc2UgJ2NvbXBvbmVudCc6IHJldHVybiBkaWZmQ29tcG9uZW50KHBhdGgsIGVudGl0eUlkLCBwcmV2LCBuZXh0LCBlbClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlmZiB0d28gdGV4dCBub2RlcyBhbmQgdXBkYXRlIHRoZSBlbGVtZW50LlxuICAgKi9cblxuICBmdW5jdGlvbiBkaWZmVGV4dCAocHJldmlvdXMsIGN1cnJlbnQsIGVsKSB7XG4gICAgaWYgKGN1cnJlbnQgIT09IHByZXZpb3VzKSBlbC5kYXRhID0gY3VycmVudFxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIERpZmYgdGhlIGNoaWxkcmVuIG9mIGFuIEVsZW1lbnROb2RlLlxuICAgKi9cblxuICBmdW5jdGlvbiBkaWZmQ2hpbGRyZW4gKHBhdGgsIGVudGl0eUlkLCBwcmV2LCBuZXh0LCBlbCkge1xuICAgIHZhciBwb3NpdGlvbnMgPSBbXVxuICAgIHZhciBoYXNLZXlzID0gZmFsc2VcbiAgICB2YXIgY2hpbGROb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShlbC5jaGlsZE5vZGVzKVxuICAgIHZhciBsZWZ0S2V5cyA9IHJlZHVjZShwcmV2LmNoaWxkcmVuLCBrZXlNYXBSZWR1Y2VyLCB7fSlcbiAgICB2YXIgcmlnaHRLZXlzID0gcmVkdWNlKG5leHQuY2hpbGRyZW4sIGtleU1hcFJlZHVjZXIsIHt9KVxuICAgIHZhciBjdXJyZW50Q2hpbGRyZW4gPSBhc3NpZ24oe30sIGNoaWxkcmVuW2VudGl0eUlkXSlcblxuICAgIGZ1bmN0aW9uIGtleU1hcFJlZHVjZXIgKGFjYywgY2hpbGQsIGkpIHtcbiAgICAgIGlmIChjaGlsZCAmJiBjaGlsZC5hdHRyaWJ1dGVzICYmIGNoaWxkLmF0dHJpYnV0ZXMua2V5ICE9IG51bGwpIHtcbiAgICAgICAgYWNjW2NoaWxkLmF0dHJpYnV0ZXMua2V5XSA9IHtcbiAgICAgICAgICBlbGVtZW50OiBjaGlsZCxcbiAgICAgICAgICBpbmRleDogaVxuICAgICAgICB9XG4gICAgICAgIGhhc0tleXMgPSB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgLy8gRGlmZiBhbGwgb2YgdGhlIG5vZGVzIHRoYXQgaGF2ZSBrZXlzLiBUaGlzIGxldHMgdXMgcmUtdXNlZCBlbGVtZW50c1xuICAgIC8vIGluc3RlYWQgb2Ygb3ZlcnJpZGluZyB0aGVtIGFuZCBsZXRzIHVzIG1vdmUgdGhlbSBhcm91bmQuXG4gICAgaWYgKGhhc0tleXMpIHtcblxuICAgICAgLy8gUmVtb3ZhbHNcbiAgICAgIGZvckVhY2gobGVmdEtleXMsIGZ1bmN0aW9uIChsZWZ0Tm9kZSwga2V5KSB7XG4gICAgICAgIGlmIChyaWdodEtleXNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgdmFyIGxlZnRQYXRoID0gcGF0aCArICcuJyArIGxlZnROb2RlLmluZGV4XG4gICAgICAgICAgcmVtb3ZlRWxlbWVudChcbiAgICAgICAgICAgIGVudGl0eUlkLFxuICAgICAgICAgICAgbGVmdFBhdGgsXG4gICAgICAgICAgICBjaGlsZE5vZGVzW2xlZnROb2RlLmluZGV4XVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gVXBkYXRlIG5vZGVzXG4gICAgICBmb3JFYWNoKHJpZ2h0S2V5cywgZnVuY3Rpb24gKHJpZ2h0Tm9kZSwga2V5KSB7XG4gICAgICAgIHZhciBsZWZ0Tm9kZSA9IGxlZnRLZXlzW2tleV1cblxuICAgICAgICAvLyBXZSBvbmx5IHdhbnQgdXBkYXRlcyBmb3Igbm93XG4gICAgICAgIGlmIChsZWZ0Tm9kZSA9PSBudWxsKSByZXR1cm5cblxuICAgICAgICB2YXIgbGVmdFBhdGggPSBwYXRoICsgJy4nICsgbGVmdE5vZGUuaW5kZXhcblxuICAgICAgICAvLyBVcGRhdGVkXG4gICAgICAgIHBvc2l0aW9uc1tyaWdodE5vZGUuaW5kZXhdID0gZGlmZk5vZGUoXG4gICAgICAgICAgbGVmdFBhdGgsXG4gICAgICAgICAgZW50aXR5SWQsXG4gICAgICAgICAgbGVmdE5vZGUuZWxlbWVudCxcbiAgICAgICAgICByaWdodE5vZGUuZWxlbWVudCxcbiAgICAgICAgICBjaGlsZE5vZGVzW2xlZnROb2RlLmluZGV4XVxuICAgICAgICApXG4gICAgICB9KVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9ucyBvZiBhbGwgY2hpbGQgY29tcG9uZW50cyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAgICAgIGZvckVhY2gocmlnaHRLZXlzLCBmdW5jdGlvbiAocmlnaHROb2RlLCBrZXkpIHtcbiAgICAgICAgdmFyIGxlZnROb2RlID0gbGVmdEtleXNba2V5XVxuXG4gICAgICAgIC8vIFdlIGp1c3Qgd2FudCBlbGVtZW50cyB0aGF0IGhhdmUgbW92ZWQgYXJvdW5kXG4gICAgICAgIGlmIChsZWZ0Tm9kZSA9PSBudWxsIHx8IGxlZnROb2RlLmluZGV4ID09PSByaWdodE5vZGUuaW5kZXgpIHJldHVyblxuXG4gICAgICAgIHZhciByaWdodFBhdGggPSBwYXRoICsgJy4nICsgcmlnaHROb2RlLmluZGV4XG4gICAgICAgIHZhciBsZWZ0UGF0aCA9IHBhdGggKyAnLicgKyBsZWZ0Tm9kZS5pbmRleFxuXG4gICAgICAgIC8vIFVwZGF0ZSBhbGwgdGhlIGNoaWxkIGNvbXBvbmVudCBwYXRoIHBvc2l0aW9ucyB0byBtYXRjaFxuICAgICAgICAvLyB0aGUgbGF0ZXN0IHBvc2l0aW9ucyBpZiB0aGV5J3ZlIGNoYW5nZWQuIFRoaXMgaXMgYSBiaXQgaGFja3kuXG4gICAgICAgIGZvckVhY2goY3VycmVudENoaWxkcmVuLCBmdW5jdGlvbiAoY2hpbGRJZCwgY2hpbGRQYXRoKSB7XG4gICAgICAgICAgaWYgKGxlZnRQYXRoID09PSBjaGlsZFBhdGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjaGlsZHJlbltlbnRpdHlJZF1bY2hpbGRQYXRoXVxuICAgICAgICAgICAgY2hpbGRyZW5bZW50aXR5SWRdW3JpZ2h0UGF0aF0gPSBjaGlsZElkXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gTm93IGFkZCBhbGwgb2YgdGhlIG5ldyBub2RlcyBsYXN0IGluIGNhc2UgdGhlaXIgcGF0aFxuICAgICAgLy8gd291bGQgaGF2ZSBjb25mbGljdGVkIHdpdGggb25lIG9mIHRoZSBwcmV2aW91cyBwYXRocy5cbiAgICAgIGZvckVhY2gocmlnaHRLZXlzLCBmdW5jdGlvbiAocmlnaHROb2RlLCBrZXkpIHtcbiAgICAgICAgdmFyIHJpZ2h0UGF0aCA9IHBhdGggKyAnLicgKyByaWdodE5vZGUuaW5kZXhcbiAgICAgICAgaWYgKGxlZnRLZXlzW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgIHBvc2l0aW9uc1tyaWdodE5vZGUuaW5kZXhdID0gdG9OYXRpdmUoXG4gICAgICAgICAgICBlbnRpdHlJZCxcbiAgICAgICAgICAgIHJpZ2h0UGF0aCxcbiAgICAgICAgICAgIHJpZ2h0Tm9kZS5lbGVtZW50XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBtYXhMZW5ndGggPSBNYXRoLm1heChwcmV2LmNoaWxkcmVuLmxlbmd0aCwgbmV4dC5jaGlsZHJlbi5sZW5ndGgpXG5cbiAgICAgIC8vIE5vdyBkaWZmIGFsbCBvZiB0aGUgbm9kZXMgdGhhdCBkb24ndCBoYXZlIGtleXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGxlZnROb2RlID0gcHJldi5jaGlsZHJlbltpXVxuICAgICAgICB2YXIgcmlnaHROb2RlID0gbmV4dC5jaGlsZHJlbltpXVxuXG4gICAgICAgIC8vIFJlbW92YWxzXG4gICAgICAgIGlmIChyaWdodE5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlbW92ZUVsZW1lbnQoXG4gICAgICAgICAgICBlbnRpdHlJZCxcbiAgICAgICAgICAgIHBhdGggKyAnLicgKyBpLFxuICAgICAgICAgICAgY2hpbGROb2Rlc1tpXVxuICAgICAgICAgIClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTmV3IE5vZGVcbiAgICAgICAgaWYgKGxlZnROb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPSB0b05hdGl2ZShcbiAgICAgICAgICAgIGVudGl0eUlkLFxuICAgICAgICAgICAgcGF0aCArICcuJyArIGksXG4gICAgICAgICAgICByaWdodE5vZGVcbiAgICAgICAgICApXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZWRcbiAgICAgICAgcG9zaXRpb25zW2ldID0gZGlmZk5vZGUoXG4gICAgICAgICAgcGF0aCArICcuJyArIGksXG4gICAgICAgICAgZW50aXR5SWQsXG4gICAgICAgICAgbGVmdE5vZGUsXG4gICAgICAgICAgcmlnaHROb2RlLFxuICAgICAgICAgIGNoaWxkTm9kZXNbaV1cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlcG9zaXRpb24gYWxsIHRoZSBlbGVtZW50c1xuICAgIGZvckVhY2gocG9zaXRpb25zLCBmdW5jdGlvbiAoY2hpbGRFbCwgbmV3UG9zaXRpb24pIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlbC5jaGlsZE5vZGVzW25ld1Bvc2l0aW9uXVxuICAgICAgaWYgKGNoaWxkRWwgJiYgY2hpbGRFbCAhPT0gdGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICBlbC5pbnNlcnRCZWZvcmUoY2hpbGRFbCwgdGFyZ2V0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkRWwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERpZmYgdGhlIGF0dHJpYnV0ZXMgYW5kIGFkZC9yZW1vdmUgdGhlbS5cbiAgICovXG5cbiAgZnVuY3Rpb24gZGlmZkF0dHJpYnV0ZXMgKHByZXYsIG5leHQsIGVsLCBlbnRpdHlJZCwgcGF0aCkge1xuICAgIHZhciBuZXh0QXR0cnMgPSBuZXh0LmF0dHJpYnV0ZXNcbiAgICB2YXIgcHJldkF0dHJzID0gcHJldi5hdHRyaWJ1dGVzXG5cbiAgICAvLyBhZGQgbmV3IGF0dHJzXG4gICAgZm9yRWFjaChuZXh0QXR0cnMsIGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkge1xuICAgICAgaWYgKGV2ZW50c1tuYW1lXSB8fCAhKG5hbWUgaW4gcHJldkF0dHJzKSB8fCBwcmV2QXR0cnNbbmFtZV0gIT09IHZhbHVlKSB7XG4gICAgICAgIHNldEF0dHJpYnV0ZShlbnRpdHlJZCwgcGF0aCwgZWwsIG5hbWUsIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyByZW1vdmUgb2xkIGF0dHJzXG4gICAgZm9yRWFjaChwcmV2QXR0cnMsIGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBuZXh0QXR0cnMpKSB7XG4gICAgICAgIHJlbW92ZUF0dHJpYnV0ZShlbnRpdHlJZCwgcGF0aCwgZWwsIG5hbWUpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYSBjb21wb25lbnQgd2l0aCB0aGUgcHJvcHMgZnJvbSB0aGUgbmV4dCBub2RlLiBJZlxuICAgKiB0aGUgY29tcG9uZW50IHR5cGUgaGFzIGNoYW5nZWQsIHdlJ2xsIGp1c3QgcmVtb3ZlIHRoZSBvbGQgb25lXG4gICAqIGFuZCByZXBsYWNlIGl0IHdpdGggdGhlIG5ldyBjb21wb25lbnQuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGRpZmZDb21wb25lbnQgKHBhdGgsIGVudGl0eUlkLCBwcmV2LCBuZXh0LCBlbCkge1xuICAgIGlmIChuZXh0LnR5cGUgIT09IHByZXYudHlwZSkge1xuICAgICAgcmV0dXJuIHJlcGxhY2VFbGVtZW50KGVudGl0eUlkLCBwYXRoLCBlbCwgbmV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRhcmdldElkID0gY2hpbGRyZW5bZW50aXR5SWRdW3BhdGhdXG5cbiAgICAgIC8vIFRoaXMgaXMgYSBoYWNrIGZvciBub3dcbiAgICAgIGlmICh0YXJnZXRJZCkge1xuICAgICAgICB1cGRhdGVFbnRpdHlQcm9wcyh0YXJnZXRJZCwgYXNzaWduKHsgY2hpbGRyZW46IG5leHQuY2hpbGRyZW4gfSwgbmV4dC5hdHRyaWJ1dGVzKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpZmYgdHdvIGVsZW1lbnQgbm9kZXMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGRpZmZFbGVtZW50IChwYXRoLCBlbnRpdHlJZCwgcHJldiwgbmV4dCwgZWwpIHtcbiAgICBpZiAobmV4dC50eXBlICE9PSBwcmV2LnR5cGUpIHJldHVybiByZXBsYWNlRWxlbWVudChlbnRpdHlJZCwgcGF0aCwgZWwsIG5leHQpXG4gICAgZGlmZkF0dHJpYnV0ZXMocHJldiwgbmV4dCwgZWwsIGVudGl0eUlkLCBwYXRoKVxuICAgIGRpZmZDaGlsZHJlbihwYXRoLCBlbnRpdHlJZCwgcHJldiwgbmV4dCwgZWwpXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBlbGVtZW50IGZyb20gdGhlIERPTSBhbmQgdW5tb3VudHMgYW5kIGNvbXBvbmVudHNcbiAgICogdGhhdCBhcmUgd2l0aGluIHRoYXQgYnJhbmNoXG4gICAqXG4gICAqIHNpZGUgZWZmZWN0czpcbiAgICogICAtIHJlbW92ZXMgZWxlbWVudCBmcm9tIHRoZSBET01cbiAgICogICAtIHJlbW92ZXMgaW50ZXJuYWwgcmVmZXJlbmNlc1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZW50aXR5SWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICovXG5cbiAgZnVuY3Rpb24gcmVtb3ZlRWxlbWVudCAoZW50aXR5SWQsIHBhdGgsIGVsKSB7XG4gICAgdmFyIGNoaWxkcmVuQnlQYXRoID0gY2hpbGRyZW5bZW50aXR5SWRdXG4gICAgdmFyIGNoaWxkSWQgPSBjaGlsZHJlbkJ5UGF0aFtwYXRoXVxuICAgIHZhciBlbnRpdHlIYW5kbGVycyA9IGhhbmRsZXJzW2VudGl0eUlkXSB8fCB7fVxuICAgIHZhciByZW1vdmFscyA9IFtdXG5cbiAgICAvLyBJZiB0aGUgcGF0aCBwb2ludHMgdG8gYSBjb21wb25lbnQgd2Ugc2hvdWxkIHVzZSB0aGF0XG4gICAgLy8gY29tcG9uZW50cyBlbGVtZW50IGluc3RlYWQsIGJlY2F1c2UgaXQgbWlnaHQgaGF2ZSBtb3ZlZCBpdC5cbiAgICBpZiAoY2hpbGRJZCkge1xuICAgICAgdmFyIGNoaWxkID0gZW50aXRpZXNbY2hpbGRJZF1cbiAgICAgIGVsID0gY2hpbGQubmF0aXZlRWxlbWVudFxuICAgICAgdW5tb3VudEVudGl0eShjaGlsZElkKVxuICAgICAgcmVtb3ZhbHMucHVzaChwYXRoKVxuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIEp1c3QgcmVtb3ZlIHRoZSB0ZXh0IG5vZGVcbiAgICAgIGlmICghaXNFbGVtZW50KGVsKSkgcmV0dXJuIGVsICYmIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG5cbiAgICAgIC8vIFRoZW4gd2UgbmVlZCB0byBmaW5kIGFueSBjb21wb25lbnRzIHdpdGhpbiB0aGlzXG4gICAgICAvLyBicmFuY2ggYW5kIHVubW91bnQgdGhlbS5cbiAgICAgIGZvckVhY2goY2hpbGRyZW5CeVBhdGgsIGZ1bmN0aW9uIChjaGlsZElkLCBjaGlsZFBhdGgpIHtcbiAgICAgICAgaWYgKGNoaWxkUGF0aCA9PT0gcGF0aCB8fCBpc1dpdGhpblBhdGgocGF0aCwgY2hpbGRQYXRoKSkge1xuICAgICAgICAgIHVubW91bnRFbnRpdHkoY2hpbGRJZClcbiAgICAgICAgICByZW1vdmFscy5wdXNoKGNoaWxkUGF0aClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gUmVtb3ZlIGFsbCBldmVudHMgYXQgdGhpcyBwYXRoIG9yIGJlbG93IGl0XG4gICAgICBmb3JFYWNoKGVudGl0eUhhbmRsZXJzLCBmdW5jdGlvbiAoZm4sIGhhbmRsZXJQYXRoKSB7XG4gICAgICAgIGlmIChoYW5kbGVyUGF0aCA9PT0gcGF0aCB8fCBpc1dpdGhpblBhdGgocGF0aCwgaGFuZGxlclBhdGgpKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZW50aXR5SWQsIGhhbmRsZXJQYXRoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0aGUgcGF0aHMgZnJvbSB0aGUgb2JqZWN0IHdpdGhvdXQgdG91Y2hpbmcgdGhlXG4gICAgLy8gb2xkIG9iamVjdC4gVGhpcyBrZWVwcyB0aGUgb2JqZWN0IHVzaW5nIGZhc3QgcHJvcGVydGllcy5cbiAgICBmb3JFYWNoKHJlbW92YWxzLCBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgZGVsZXRlIGNoaWxkcmVuW2VudGl0eUlkXVtwYXRoXVxuICAgIH0pXG5cbiAgICAvLyBSZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGFuIGVsZW1lbnQgaW4gdGhlIERPTS4gUmVtb3ZpbmcgYWxsIGNvbXBvbmVudHNcbiAgICogd2l0aGluIHRoYXQgZWxlbWVudCBhbmQgcmUtcmVuZGVyaW5nIHRoZSBuZXcgdmlydHVhbCBub2RlLlxuICAgKlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2bm9kZVxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cblxuICBmdW5jdGlvbiByZXBsYWNlRWxlbWVudCAoZW50aXR5SWQsIHBhdGgsIGVsLCB2bm9kZSkge1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlXG4gICAgdmFyIGluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChwYXJlbnQuY2hpbGROb2RlcywgZWwpXG5cbiAgICAvLyByZW1vdmUgdGhlIHByZXZpb3VzIGVsZW1lbnQgYW5kIGFsbCBuZXN0ZWQgY29tcG9uZW50cy4gVGhpc1xuICAgIC8vIG5lZWRzIHRvIGhhcHBlbiBiZWZvcmUgd2UgY3JlYXRlIHRoZSBuZXcgZWxlbWVudCBzbyB3ZSBkb24ndFxuICAgIC8vIGdldCBjbGFzaGVzIG9uIHRoZSBjb21wb25lbnQgcGF0aHMuXG4gICAgcmVtb3ZlRWxlbWVudChlbnRpdHlJZCwgcGF0aCwgZWwpXG5cbiAgICAvLyB0aGVuIGFkZCB0aGUgbmV3IGVsZW1lbnQgaW4gdGhlcmVcbiAgICB2YXIgbmV3RWwgPSB0b05hdGl2ZShlbnRpdHlJZCwgcGF0aCwgdm5vZGUpXG4gICAgdmFyIHRhcmdldCA9IHBhcmVudC5jaGlsZE5vZGVzW2luZGV4XVxuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShuZXdFbCwgdGFyZ2V0KVxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQobmV3RWwpXG4gICAgfVxuXG4gICAgLy8gd2FsayB1cCB0aGUgdHJlZSBhbmQgdXBkYXRlIGFsbCBgZW50aXR5Lm5hdGl2ZUVsZW1lbnRgIHJlZmVyZW5jZXMuXG4gICAgaWYgKGVudGl0eUlkICE9PSAncm9vdCcgJiYgcGF0aCA9PT0gJzAnKSB7XG4gICAgICB1cGRhdGVOYXRpdmVFbGVtZW50KGVudGl0eUlkLCBuZXdFbClcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3RWxcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYWxsIGVudGl0aWVzIGluIGEgYnJhbmNoIHRoYXQgaGF2ZSB0aGUgc2FtZSBuYXRpdmVFbGVtZW50LiBUaGlzXG4gICAqIGhhcHBlbnMgd2hlbiBhIGNvbXBvbmVudCBoYXMgYW5vdGhlciBjb21wb25lbnQgYXMgaXQncyByb290IG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbnRpdHlJZFxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBuZXdFbFxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cblxuICBmdW5jdGlvbiB1cGRhdGVOYXRpdmVFbGVtZW50IChlbnRpdHlJZCwgbmV3RWwpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZW50aXRpZXNbZW50aXR5SWRdXG4gICAgaWYgKHRhcmdldC5vd25lcklkID09PSAncm9vdCcpIHJldHVyblxuICAgIGlmIChjaGlsZHJlblt0YXJnZXQub3duZXJJZF1bJzAnXSA9PT0gZW50aXR5SWQpIHtcbiAgICAgIGVudGl0aWVzW3RhcmdldC5vd25lcklkXS5uYXRpdmVFbGVtZW50ID0gbmV3RWxcbiAgICAgIHVwZGF0ZU5hdGl2ZUVsZW1lbnQodGFyZ2V0Lm93bmVySWQsIG5ld0VsKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGF0dHJpYnV0ZSBvZiBhbiBlbGVtZW50LCBwZXJmb3JtaW5nIGFkZGl0aW9uYWwgdHJhbnNmb3JtYXRpb25zXG4gICAqIGRlcGVuZG5pbmcgb24gdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgKi9cblxuICBmdW5jdGlvbiBzZXRBdHRyaWJ1dGUgKGVudGl0eUlkLCBwYXRoLCBlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZW1vdmVBdHRyaWJ1dGUoZW50aXR5SWQsIHBhdGgsIGVsLCBuYW1lKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChldmVudHNbbmFtZV0pIHtcbiAgICAgIGFkZEV2ZW50KGVudGl0eUlkLCBwYXRoLCBldmVudHNbbmFtZV0sIHZhbHVlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgY2FzZSAnY2hlY2tlZCc6XG4gICAgICBjYXNlICdkaXNhYmxlZCc6XG4gICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgIGVsW25hbWVdID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnaW5uZXJIVE1MJzpcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gdmFsdWVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgc2V0RWxlbWVudFZhbHVlKGVsLCB2YWx1ZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2Ugc3ZnLmlzQXR0cmlidXRlKG5hbWUpOlxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhzdmcubmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGF0dHJpYnV0ZSwgcGVyZm9ybWluZyBhZGRpdGlvbmFsIHRyYW5zZm9ybWF0aW9uc1xuICAgKiBkZXBlbmRuaW5nIG9uIHRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKi9cblxuICBmdW5jdGlvbiByZW1vdmVBdHRyaWJ1dGUgKGVudGl0eUlkLCBwYXRoLCBlbCwgbmFtZSkge1xuICAgIGlmIChldmVudHNbbmFtZV0pIHtcbiAgICAgIHJlbW92ZUV2ZW50KGVudGl0eUlkLCBwYXRoLCBldmVudHNbbmFtZV0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICBjYXNlICdjaGVja2VkJzpcbiAgICAgIGNhc2UgJ2Rpc2FibGVkJzpcbiAgICAgIGNhc2UgJ3NlbGVjdGVkJzpcbiAgICAgICAgZWxbbmFtZV0gPSBmYWxzZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnaW5uZXJIVE1MJzpcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gJydcbiAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgc2V0RWxlbWVudFZhbHVlKGVsLCBudWxsKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0byBzZWUgaWYgb25lIHRyZWUgcGF0aCBpcyB3aXRoaW5cbiAgICogYW5vdGhlciB0cmVlIHBhdGguIEV4YW1wbGU6XG4gICAqXG4gICAqIDAuMSB2cyAwLjEuMSA9IHRydWVcbiAgICogMC4yIHZzIDAuMy41ID0gZmFsc2VcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRhcmdldFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBmdW5jdGlvbiBpc1dpdGhpblBhdGggKHRhcmdldCwgcGF0aCkge1xuICAgIHJldHVybiBwYXRoLmluZGV4T2YodGFyZ2V0ICsgJy4nKSA9PT0gMFxuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBET00gbm9kZSBhbiBlbGVtZW50IG5vZGVcbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZnVuY3Rpb24gaXNFbGVtZW50IChlbCkge1xuICAgIHJldHVybiAhIShlbCAmJiBlbC50YWdOYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGhlIGNoaWxkIG5vZGVzIGZyb20gYW4gZWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKi9cblxuICBmdW5jdGlvbiByZW1vdmVBbGxDaGlsZHJlbiAoZWwpIHtcbiAgICB3aGlsZSAoZWwuZmlyc3RDaGlsZCkgZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZClcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgaG9vayBvbiBhIGNvbXBvbmVudC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBob29rLlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IFRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgVG8gcGFzcyBhbG9uZyB0byBob29rLlxuICAgKi9cblxuICBmdW5jdGlvbiB0cmlnZ2VyIChuYW1lLCBlbnRpdHksIGFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIGVudGl0eS5jb21wb25lbnRbbmFtZV0gIT09ICdmdW5jdGlvbicpIHJldHVyblxuICAgIHJldHVybiBlbnRpdHkuY29tcG9uZW50W25hbWVdLmFwcGx5KG51bGwsIGFyZ3MpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGFuIGVudGl0eSB0byBtYXRjaCB0aGUgbGF0ZXN0IHJlbmRlcmVkIHZvZGUuIFdlIGFsd2F5c1xuICAgKiByZXBsYWNlIHRoZSBwcm9wcyBvbiB0aGUgY29tcG9uZW50IHdoZW4gY29tcG9zaW5nIHRoZW0uIFRoaXNcbiAgICogd2lsbCB0cmlnZ2VyIGEgcmUtcmVuZGVyIG9uIGFsbCBjaGlsZHJlbiBiZWxvdyB0aGlzIHBvaW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2bm9kZVxuICAgKlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cblxuICBmdW5jdGlvbiB1cGRhdGVFbnRpdHlQcm9wcyAoZW50aXR5SWQsIG5leHRQcm9wcykge1xuICAgIHZhciBlbnRpdHkgPSBlbnRpdGllc1tlbnRpdHlJZF1cbiAgICBlbnRpdHkucGVuZGluZ1Byb3BzID0gZGVmYXVsdHMoe30sIG5leHRQcm9wcywgZW50aXR5LmNvbXBvbmVudC5kZWZhdWx0UHJvcHMgfHwge30pXG4gICAgZW50aXR5LmRpcnR5ID0gdHJ1ZVxuICAgIGludmFsaWRhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjb21wb25lbnQgaW5zdGFuY2Ugc3RhdGUuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZUVudGl0eVN0YXRlIChlbnRpdHksIG5leHRTdGF0ZSkge1xuICAgIGVudGl0eS5wZW5kaW5nU3RhdGUgPSBhc3NpZ24oZW50aXR5LnBlbmRpbmdTdGF0ZSwgbmV4dFN0YXRlKVxuICAgIGVudGl0eS5kaXJ0eSA9IHRydWVcbiAgICBpbnZhbGlkYXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21taXQgcHJvcHMgYW5kIHN0YXRlIGNoYW5nZXMgdG8gYW4gZW50aXR5LlxuICAgKi9cblxuICBmdW5jdGlvbiBjb21taXQgKGVudGl0eSkge1xuICAgIGVudGl0eS5jb250ZXh0ID0ge1xuICAgICAgc3RhdGU6IGVudGl0eS5wZW5kaW5nU3RhdGUsXG4gICAgICBwcm9wczogZW50aXR5LnBlbmRpbmdQcm9wcyxcbiAgICAgIGlkOiBlbnRpdHkuaWRcbiAgICB9XG4gICAgZW50aXR5LnBlbmRpbmdTdGF0ZSA9IGFzc2lnbih7fSwgZW50aXR5LmNvbnRleHQuc3RhdGUpXG4gICAgZW50aXR5LnBlbmRpbmdQcm9wcyA9IGFzc2lnbih7fSwgZW50aXR5LmNvbnRleHQucHJvcHMpXG4gICAgZW50aXR5LmRpcnR5ID0gZmFsc2VcbiAgICBpZiAodHlwZW9mIGVudGl0eS5jb21wb25lbnQudmFsaWRhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGVudGl0eS5jb21wb25lbnQudmFsaWRhdGUoZW50aXR5LmNvbnRleHQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyeSB0byBhdm9pZCBjcmVhdGluZyBuZXcgdmlydHVhbCBkb20gaWYgcG9zc2libGUuXG4gICAqXG4gICAqIExhdGVyIHdlIG1heSBleHBvc2UgdGhpcyBzbyB5b3UgY2FuIG92ZXJyaWRlLCBidXQgbm90IHRoZXJlIHlldC5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2hvdWxkVXBkYXRlIChlbnRpdHkpIHtcbiAgICBpZiAoIWVudGl0eS5kaXJ0eSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKCFlbnRpdHkuY29tcG9uZW50LnNob3VsZFVwZGF0ZSkgcmV0dXJuIHRydWVcbiAgICB2YXIgbmV4dFByb3BzID0gZW50aXR5LnBlbmRpbmdQcm9wc1xuICAgIHZhciBuZXh0U3RhdGUgPSBlbnRpdHkucGVuZGluZ1N0YXRlXG4gICAgdmFyIGJvb2wgPSBlbnRpdHkuY29tcG9uZW50LnNob3VsZFVwZGF0ZShlbnRpdHkuY29udGV4dCwgbmV4dFByb3BzLCBuZXh0U3RhdGUpXG4gICAgcmV0dXJuIGJvb2xcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBlbnRpdHkuXG4gICAqXG4gICAqIFRoaXMgaXMgbW9zdGx5IHRvIHByZS1wcmVwcm9jZXNzIGNvbXBvbmVudCBwcm9wZXJ0aWVzIGFuZCB2YWx1ZXMgY2hhaW5zLlxuICAgKlxuICAgKiBUaGUgZW5kIHJlc3VsdCBpcyBmb3IgZXZlcnkgY29tcG9uZW50IHRoYXQgZ2V0cyBtb3VudGVkLFxuICAgKiB5b3UgY3JlYXRlIGEgc2V0IG9mIElPIG5vZGVzIGluIHRoZSBuZXR3b3JrIGZyb20gdGhlIGB2YWx1ZWAgZGVmaW5pdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcbiAgICovXG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIgKGVudGl0eSkge1xuICAgIHJlZ2lzdGVyRW50aXR5KGVudGl0eSlcbiAgICB2YXIgY29tcG9uZW50ID0gZW50aXR5LmNvbXBvbmVudFxuICAgIGlmIChjb21wb25lbnQucmVnaXN0ZXJlZCkgcmV0dXJuXG5cbiAgICAvLyBpbml0aWFsaXplIHNvdXJjZXMgb25jZSBmb3IgYSBjb21wb25lbnQgdHlwZS5cbiAgICByZWdpc3RlclNvdXJjZXMoZW50aXR5KVxuICAgIGNvbXBvbmVudC5yZWdpc3RlcmVkID0gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBlbnRpdHkgdG8gZGF0YS1zdHJ1Y3R1cmVzIHJlbGF0ZWQgdG8gY29tcG9uZW50cy9lbnRpdGllcy5cbiAgICpcbiAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgKi9cblxuICBmdW5jdGlvbiByZWdpc3RlckVudGl0eShlbnRpdHkpIHtcbiAgICB2YXIgY29tcG9uZW50ID0gZW50aXR5LmNvbXBvbmVudFxuICAgIC8vIGFsbCBlbnRpdGllcyBmb3IgdGhpcyBjb21wb25lbnQgdHlwZS5cbiAgICB2YXIgZW50aXRpZXMgPSBjb21wb25lbnQuZW50aXRpZXMgPSBjb21wb25lbnQuZW50aXRpZXMgfHwge31cbiAgICAvLyBhZGQgZW50aXR5IHRvIGNvbXBvbmVudCBsaXN0XG4gICAgZW50aXRpZXNbZW50aXR5LmlkXSA9IGVudGl0eVxuICAgIC8vIG1hcCB0byBjb21wb25lbnQgc28geW91IGNhbiByZW1vdmUgbGF0ZXIuXG4gICAgY29tcG9uZW50c1tlbnRpdHkuaWRdID0gY29tcG9uZW50XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBzb3VyY2VzIGZvciBhIGNvbXBvbmVudCBieSB0eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyU291cmNlcyhlbnRpdHkpIHtcbiAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c1tlbnRpdHkuaWRdXG4gICAgLy8gZ2V0ICdjbGFzcy1sZXZlbCcgc291cmNlcy5cbiAgICAvLyBpZiB3ZSd2ZSBhbHJlYWR5IGhvb2tlZCBpdCB1cCwgdGhlbiB3ZSdyZSBnb29kLlxuICAgIHZhciBzb3VyY2VzID0gY29tcG9uZW50LnNvdXJjZXNcbiAgICBpZiAoc291cmNlcykgcmV0dXJuXG4gICAgdmFyIGVudGl0aWVzID0gY29tcG9uZW50LmVudGl0aWVzXG5cbiAgICAvLyBob29rIHVwIHNvdXJjZXMuXG4gICAgdmFyIG1hcCA9IGNvbXBvbmVudC5zb3VyY2VUb1Byb3BlcnR5TmFtZSA9IHt9XG4gICAgY29tcG9uZW50LnNvdXJjZXMgPSBzb3VyY2VzID0gW11cbiAgICB2YXIgcHJvcFR5cGVzID0gY29tcG9uZW50LnByb3BUeXBlc1xuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvcFR5cGVzKSB7XG4gICAgICB2YXIgZGF0YSA9IHByb3BUeXBlc1tuYW1lXVxuICAgICAgaWYgKCFkYXRhKSBjb250aW51ZVxuICAgICAgaWYgKCFkYXRhLnNvdXJjZSkgY29udGludWVcbiAgICAgIHNvdXJjZXMucHVzaChkYXRhLnNvdXJjZSlcbiAgICAgIG1hcFtkYXRhLnNvdXJjZV0gPSBuYW1lXG4gICAgfVxuXG4gICAgLy8gc2VuZCB2YWx1ZSB1cGRhdGVzIHRvIGFsbCBjb21wb25lbnQgaW5zdGFuY2VzLlxuICAgIHNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICBjb25uZWN0aW9uc1tzb3VyY2VdID0gY29ubmVjdGlvbnNbc291cmNlXSB8fCBbXVxuICAgICAgY29ubmVjdGlvbnNbc291cmNlXS5wdXNoKHVwZGF0ZSlcblxuICAgICAgZnVuY3Rpb24gdXBkYXRlIChkYXRhKSB7XG4gICAgICAgIHZhciBwcm9wID0gbWFwW3NvdXJjZV1cbiAgICAgICAgZm9yICh2YXIgZW50aXR5SWQgaW4gZW50aXRpZXMpIHtcbiAgICAgICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXNbZW50aXR5SWRdXG4gICAgICAgICAgdmFyIGNoYW5nZXMgPSB7fVxuICAgICAgICAgIGNoYW5nZXNbcHJvcF0gPSBkYXRhXG4gICAgICAgICAgdXBkYXRlRW50aXR5UHJvcHMoZW50aXR5SWQsIGFzc2lnbihlbnRpdHkucGVuZGluZ1Byb3BzLCBjaGFuZ2VzKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBpbml0aWFsIHNvdXJjZSB2YWx1ZSBvbiB0aGUgZW50aXR5XG4gICAqXG4gICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICovXG5cbiAgZnVuY3Rpb24gc2V0U291cmNlcyAoZW50aXR5KSB7XG4gICAgdmFyIGNvbXBvbmVudCA9IGVudGl0eS5jb21wb25lbnRcbiAgICB2YXIgbWFwID0gY29tcG9uZW50LnNvdXJjZVRvUHJvcGVydHlOYW1lXG4gICAgdmFyIHNvdXJjZXMgPSBjb21wb25lbnQuc291cmNlc1xuICAgIHNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICB2YXIgbmFtZSA9IG1hcFtzb3VyY2VdXG4gICAgICBpZiAoZW50aXR5LnBlbmRpbmdQcm9wc1tuYW1lXSAhPSBudWxsKSByZXR1cm5cbiAgICAgIGVudGl0eS5wZW5kaW5nUHJvcHNbbmFtZV0gPSBhcHAuc291cmNlc1tzb3VyY2VdIC8vIGdldCBsYXRlc3QgdmFsdWUgcGx1Z2dlZCBpbnRvIGdsb2JhbCBzdG9yZVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQWRkIGFsbCBvZiB0aGUgRE9NIGV2ZW50IGxpc3RlbmVyc1xuICAgKi9cblxuICBmdW5jdGlvbiBhZGROYXRpdmVFdmVudExpc3RlbmVycyAoKSB7XG4gICAgZm9yRWFjaChldmVudHMsIGZ1bmN0aW9uIChldmVudFR5cGUpIHtcbiAgICAgIHJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVFdmVudCwgdHJ1ZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbGwgb2YgdGhlIERPTSBldmVudCBsaXN0ZW5lcnNcbiAgICovXG5cbiAgZnVuY3Rpb24gcmVtb3ZlTmF0aXZlRXZlbnRMaXN0ZW5lcnMgKCkge1xuICAgIGZvckVhY2goZXZlbnRzLCBmdW5jdGlvbiAoZXZlbnRUeXBlKSB7XG4gICAgICByb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlRXZlbnQsIHRydWUpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYW4gZXZlbnQgdGhhdCBoYXMgb2NjdXJlZCB3aXRoaW4gdGhlIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKi9cblxuICBmdW5jdGlvbiBoYW5kbGVFdmVudCAoZXZlbnQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0XG4gICAgdmFyIGV2ZW50VHlwZSA9IGV2ZW50LnR5cGVcblxuICAgIC8vIFdhbGsgdXAgdGhlIERPTSB0cmVlIGFuZCBzZWUgaWYgdGhlcmUgaXMgYSBoYW5kbGVyXG4gICAgLy8gZm9yIHRoaXMgZXZlbnQgdHlwZSBoaWdoZXIgdXAuXG4gICAgd2hpbGUgKHRhcmdldCkge1xuICAgICAgdmFyIGZuID0ga2V5cGF0aC5nZXQoaGFuZGxlcnMsIFt0YXJnZXQuX19lbnRpdHlfXywgdGFyZ2V0Ll9fcGF0aF9fLCBldmVudFR5cGVdKVxuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIGV2ZW50LmRlbGVnYXRlVGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAgIGlmIChmbihldmVudCkgPT09IGZhbHNlKSBicmVha1xuICAgICAgfVxuICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQmluZCBldmVudHMgZm9yIGFuIGVsZW1lbnQsIGFuZCBhbGwgaXQncyByZW5kZXJlZCBjaGlsZCBlbGVtZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFkZEV2ZW50IChlbnRpdHlJZCwgcGF0aCwgZXZlbnRUeXBlLCBmbikge1xuICAgIGtleXBhdGguc2V0KGhhbmRsZXJzLCBbZW50aXR5SWQsIHBhdGgsIGV2ZW50VHlwZV0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXNbZW50aXR5SWRdXG4gICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgIHJldHVybiBmbi5jYWxsKG51bGwsIGUsIGVudGl0eS5jb250ZXh0LCBzZXRTdGF0ZShlbnRpdHkpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwobnVsbCwgZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVuYmluZCBldmVudHMgZm9yIGEgZW50aXR5SWRcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGVudGl0eUlkXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlbW92ZUV2ZW50IChlbnRpdHlJZCwgcGF0aCwgZXZlbnRUeXBlKSB7XG4gICAgdmFyIGFyZ3MgPSBbZW50aXR5SWRdXG4gICAgaWYgKHBhdGgpIGFyZ3MucHVzaChwYXRoKVxuICAgIGlmIChldmVudFR5cGUpIGFyZ3MucHVzaChldmVudFR5cGUpXG4gICAga2V5cGF0aC5kZWwoaGFuZGxlcnMsIGFyZ3MpXG4gIH1cblxuICAvKipcbiAgICogVW5iaW5kIGFsbCBldmVudHMgZnJvbSBhbiBlbnRpdHlcbiAgICpcbiAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgKi9cblxuICBmdW5jdGlvbiByZW1vdmVBbGxFdmVudHMgKGVudGl0eUlkKSB7XG4gICAga2V5cGF0aC5kZWwoaGFuZGxlcnMsIFtlbnRpdHlJZF0pXG4gIH1cblxuICAvKipcbiAgICogVXNlZCBmb3IgZGVidWdnaW5nIHRvIGluc3BlY3QgdGhlIGN1cnJlbnQgc3RhdGUgd2l0aG91dFxuICAgKiB1cyBuZWVkaW5nIHRvIGV4cGxpY2l0bHkgbWFuYWdlIHN0b3JpbmcvdXBkYXRpbmcgcmVmZXJlbmNlcy5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZW50aXRpZXM6IGVudGl0aWVzLFxuICAgICAgaGFuZGxlcnM6IGhhbmRsZXJzLFxuICAgICAgY29ubmVjdGlvbnM6IGNvbm5lY3Rpb25zLFxuICAgICAgY3VycmVudEVsZW1lbnQ6IGN1cnJlbnRFbGVtZW50LFxuICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgIGFwcDogYXBwLFxuICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW5cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIG9iamVjdCB0aGF0IGxldHMgdXMgY29tcGxldGVseSByZW1vdmUgdGhlIGF1dG9tYXRpY1xuICAgKiBET00gcmVuZGVyaW5nIGFuZCBleHBvcnQgZGVidWdnaW5nIHRvb2xzLlxuICAgKi9cblxuICByZXR1cm4ge1xuICAgIHJlbW92ZTogdGVhcmRvd24sXG4gICAgaW5zcGVjdDogaW5zcGVjdFxuICB9XG59XG5cbi8qKlxuICogQSByZW5kZXJlZCBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogVGhpcyBtYW5hZ2VzIHRoZSBsaWZlY3ljbGUsIHByb3BzIGFuZCBzdGF0ZSBvZiB0aGUgY29tcG9uZW50LlxuICogSXQncyBiYXNpY2FsbHkganVzdCBhIGRhdGEgb2JqZWN0IGZvciBtb3JlIHN0cmFpZ2h0Zm93YXJkIGxvb2t1cC5cbiAqXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAqL1xuXG5mdW5jdGlvbiBFbnRpdHkgKGNvbXBvbmVudCwgcHJvcHMsIG93bmVySWQpIHtcbiAgdGhpcy5pZCA9IHVpZCgpXG4gIHRoaXMub3duZXJJZCA9IG93bmVySWRcbiAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnRcbiAgdGhpcy5wcm9wVHlwZXMgPSBjb21wb25lbnQucHJvcFR5cGVzIHx8IHt9XG4gIHRoaXMuY29udGV4dCA9IHt9XG4gIHRoaXMuY29udGV4dC5pZCA9IHRoaXMuaWRcbiAgdGhpcy5jb250ZXh0LnByb3BzID0gZGVmYXVsdHMocHJvcHMgfHwge30sIGNvbXBvbmVudC5kZWZhdWx0UHJvcHMgfHwge30pXG4gIHRoaXMuY29udGV4dC5zdGF0ZSA9IHRoaXMuY29tcG9uZW50LmluaXRpYWxTdGF0ZSA/IHRoaXMuY29tcG9uZW50LmluaXRpYWxTdGF0ZSh0aGlzLmNvbnRleHQucHJvcHMpIDoge31cbiAgdGhpcy5wZW5kaW5nUHJvcHMgPSBhc3NpZ24oe30sIHRoaXMuY29udGV4dC5wcm9wcylcbiAgdGhpcy5wZW5kaW5nU3RhdGUgPSBhc3NpZ24oe30sIHRoaXMuY29udGV4dC5zdGF0ZSlcbiAgdGhpcy5kaXJ0eSA9IGZhbHNlXG4gIHRoaXMudmlydHVhbEVsZW1lbnQgPSBudWxsXG4gIHRoaXMubmF0aXZlRWxlbWVudCA9IG51bGxcbiAgdGhpcy5kaXNwbGF5TmFtZSA9IGNvbXBvbmVudC5uYW1lIHx8ICdDb21wb25lbnQnXG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIG5lYXJlc3QgJ2JvZHknIGFuY2VzdG9yIG9mIHRoZSBnaXZlbiBlbGVtZW50IG9yIGVsc2UgdGhlIHJvb3RcbiAqIGVsZW1lbnQgb2YgdGhlIGRvY3VtZW50IGluIHdoaWNoIHN0YW5kcyB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBhdHRhY2ggdGhlIGV2ZW50cyBoYW5kbGVyIHRvIHRoZSBjb3JyZWN0XG4gKiBlbGVtZW50IGFuZCBiZSBhYmxlIHRvIGRpc3BhdGNoIGV2ZW50cyBpbiBkb2N1bWVudCBmcmFnbWVudHMgc3VjaCBhc1xuICogU2hhZG93IERPTS5cbiAqXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWwgVGhlIGVsZW1lbnQgb24gd2hpY2ggd2Ugd2lsbCByZW5kZXIgYW4gYXBwLlxuICogQHJldHVybiB7SFRNTEVsZW1lbnR9ICAgIFRoZSByb290IGVsZW1lbnQgb24gd2hpY2ggd2Ugd2lsbCBhdHRhY2ggdGhlIGV2ZW50c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuXG4gKi9cblxuZnVuY3Rpb24gZ2V0Um9vdEVsZW1lbnQgKGVsKSB7XG4gIHdoaWxlIChlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgaWYgKGVsLnRhZ05hbWUgPT09ICdCT0RZJyB8fCAhZWwucGFyZW50RWxlbWVudCkge1xuICAgICAgcmV0dXJuIGVsXG4gICAgfVxuICAgIGVsID0gZWwucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBlbFxufVxuXG4vKipcbiAqIFNldCB0aGUgdmFsdWUgcHJvcGVydHkgb2YgYW4gZWxlbWVudCBhbmQga2VlcCB0aGUgdGV4dCBzZWxlY3Rpb25cbiAqIGZvciBpbnB1dCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICovXG5cbmZ1bmN0aW9uIHNldEVsZW1lbnRWYWx1ZSAoZWwsIHZhbHVlKSB7XG4gIGlmIChlbCA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBjYW5TZWxlY3RUZXh0KGVsKSkge1xuICAgIHZhciBzdGFydCA9IGVsLnNlbGVjdGlvblN0YXJ0XG4gICAgdmFyIGVuZCA9IGVsLnNlbGVjdGlvbkVuZFxuICAgIGVsLnZhbHVlID0gdmFsdWVcbiAgICBlbC5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgZW5kKVxuICB9IGVsc2Uge1xuICAgIGVsLnZhbHVlID0gdmFsdWVcbiAgfVxufVxuXG4vKipcbiAqIEZvciBzb21lIHJlYXNvbiBvbmx5IGNlcnRhaW4gdHlwZXMgb2YgaW5wdXRzIGNhbiBzZXQgdGhlIHNlbGVjdGlvbiByYW5nZS5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gY2FuU2VsZWN0VGV4dCAoZWwpIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdJTlBVVCcgJiYgWyd0ZXh0Jywnc2VhcmNoJywncGFzc3dvcmQnLCd0ZWwnLCd1cmwnXS5pbmRleE9mKGVsLnR5cGUpID4gLTFcbn1cbiIsInZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ29iamVjdC1kZWZhdWx0cycpXG52YXIgbm9kZVR5cGUgPSByZXF1aXJlKCcuL25vZGUtdHlwZScpXG52YXIgdHlwZSA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJylcblxuLyoqXG4gKiBFeHBvc2UgYHN0cmluZ2lmeWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXBwKSB7XG4gIGlmICghYXBwLmVsZW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnQgbW91bnRlZCcpXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRvIHN0cmluZy5cbiAgICpcbiAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGZ1bmN0aW9uIHN0cmluZ2lmeSAoY29tcG9uZW50LCBvcHRQcm9wcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgcHJvcFR5cGVzID0gY29tcG9uZW50LnByb3BUeXBlcyB8fCB7fVxuICAgIHZhciBwcm9wcyA9IGRlZmF1bHRzKG9wdFByb3BzIHx8IHt9LCBjb21wb25lbnQuZGVmYXVsdFByb3BzIHx8IHt9KVxuICAgIHZhciBzdGF0ZSA9IGNvbXBvbmVudC5pbml0aWFsU3RhdGUgPyBjb21wb25lbnQuaW5pdGlhbFN0YXRlKHByb3BzKSA6IHt9XG4gICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvcFR5cGVzKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHByb3BUeXBlc1tuYW1lXVxuICAgICAgaWYgKG9wdGlvbnMuc291cmNlKSB7XG4gICAgICAgIHByb3BzW25hbWVdID0gYXBwLnNvdXJjZXNbb3B0aW9ucy5zb3VyY2VdXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudC5iZWZvcmVNb3VudCkgY29tcG9uZW50LmJlZm9yZU1vdW50KHsgcHJvcHM6IHByb3BzLCBzdGF0ZTogc3RhdGUgfSlcbiAgICBpZiAoY29tcG9uZW50LmJlZm9yZVJlbmRlcikgY29tcG9uZW50LmJlZm9yZVJlbmRlcih7IHByb3BzOiBwcm9wcywgc3RhdGU6IHN0YXRlIH0pXG4gICAgdmFyIG5vZGUgPSBjb21wb25lbnQucmVuZGVyKHsgcHJvcHM6IHByb3BzLCBzdGF0ZTogc3RhdGUgfSlcbiAgICByZXR1cm4gc3RyaW5naWZ5Tm9kZShub2RlLCAnMCcpXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGEgbm9kZSB0byBhIHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtUcmVlfSB0cmVlXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZnVuY3Rpb24gc3RyaW5naWZ5Tm9kZSAobm9kZSwgcGF0aCkge1xuICAgIHN3aXRjaCAobm9kZVR5cGUobm9kZSkpIHtcbiAgICAgIGNhc2UgJ2VtcHR5JzogcmV0dXJuICc8bm9zY3JpcHQgLz4nXG4gICAgICBjYXNlICd0ZXh0JzogcmV0dXJuIG5vZGVcbiAgICAgIGNhc2UgJ2VsZW1lbnQnOlxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuXG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzXG4gICAgICAgIHZhciB0YWdOYW1lID0gbm9kZS50eXBlXG4gICAgICAgIHZhciBpbm5lckhUTUwgPSBhdHRyaWJ1dGVzLmlubmVySFRNTFxuICAgICAgICB2YXIgc3RyID0gJzwnICsgdGFnTmFtZSArIGF0dHJzKGF0dHJpYnV0ZXMpICsgJz4nXG5cbiAgICAgICAgaWYgKGlubmVySFRNTCkge1xuICAgICAgICAgIHN0ciArPSBpbm5lckhUTUxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeU5vZGUoY2hpbGRyZW5baV0sIHBhdGggKyAnLicgKyBpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0ciArPSAnPC8nICsgdGFnTmFtZSArICc+J1xuICAgICAgICByZXR1cm4gc3RyXG4gICAgICBjYXNlICdjb21wb25lbnQnOiByZXR1cm4gc3RyaW5naWZ5KG5vZGUudHlwZSwgbm9kZS5hdHRyaWJ1dGVzLCBub2RlLmNoaWxkcmVuKVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0eXBlJylcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdpZnlOb2RlKGFwcC5lbGVtZW50LCAnMCcpXG59XG5cbi8qKlxuICogSFRNTCBhdHRyaWJ1dGVzIHRvIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYXR0cnMgKGF0dHJpYnV0ZXMpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgdmFyIHZhbHVlID0gYXR0cmlidXRlc1trZXldXG4gICAgaWYgKGtleSA9PT0gJ2lubmVySFRNTCcpIGNvbnRpbnVlXG4gICAgaWYgKGlzVmFsaWRBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkpIHN0ciArPSBhdHRyKGtleSwgYXR0cmlidXRlc1trZXldKVxuICB9XG4gIHJldHVybiBzdHJcbn1cblxuLyoqXG4gKiBIVE1MIGF0dHJpYnV0ZSB0byBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYXR0ciAoa2V5LCB2YWwpIHtcbiAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJ1xufVxuXG4vKipcbiAqIElzIGEgdmFsdWUgYWJsZSB0byBiZSBzZXQgYSBhbiBhdHRyaWJ1dGUgdmFsdWU/XG4gKlxuICogQHBhcmFtIHtBbnl9IHZhbHVlXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1ZhbGlkQXR0cmlidXRlVmFsdWUgKHZhbHVlKSB7XG4gIHZhciB2YWx1ZVR5cGUgPSB0eXBlKHZhbHVlKVxuICBzd2l0Y2ggKHZhbHVlVHlwZSkge1xuICBjYXNlICdzdHJpbmcnOlxuICBjYXNlICdudW1iZXInOlxuICAgIHJldHVybiB0cnVlO1xuXG4gIGNhc2UgJ2Jvb2xlYW4nOlxuICAgIHJldHVybiB2YWx1ZTtcblxuICBkZWZhdWx0OlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzRWxlbWVudDogcmVxdWlyZSgnaXMtc3ZnLWVsZW1lbnQnKS5pc0VsZW1lbnQsXG4gIGlzQXR0cmlidXRlOiByZXF1aXJlKCdpcy1zdmctYXR0cmlidXRlJyksXG4gIG5hbWVzcGFjZTogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xufVxuIiwiXHJcbi8qKlxyXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxyXG4gKlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XHJcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XHJcbn07XHJcblxyXG4vKipcclxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIG1peGluKG9iaikge1xyXG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xyXG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xyXG4gIH1cclxuICByZXR1cm4gb2JqO1xyXG59XHJcblxyXG4vKipcclxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub24gPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcbiAgKHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdKVxyXG4gICAgLnB1c2goZm4pO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxyXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICBmdW5jdGlvbiBvbigpIHtcclxuICAgIHRoaXMub2ZmKGV2ZW50LCBvbik7XHJcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuXHJcbiAgb24uZm4gPSBmbjtcclxuICB0aGlzLm9uKGV2ZW50LCBvbik7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcclxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG5cclxuICAvLyBhbGxcclxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gc3BlY2lmaWMgZXZlbnRcclxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcclxuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcclxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcclxuICB2YXIgY2I7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xyXG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcclxuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtNaXhlZH0gLi4uXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcclxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcclxuXHJcbiAgaWYgKGNhbGxiYWNrcykge1xyXG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHJldHVybiB7QXJyYXl9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcclxufTtcclxuIiwiLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RBbmltYXRpb25GcmFtZSgpYC5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCBmYWxsYmFjaztcblxuLyoqXG4gKiBGYWxsYmFjayBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuXG52YXIgcHJldiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuZnVuY3Rpb24gZmFsbGJhY2soZm4pIHtcbiAgdmFyIGN1cnIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIG1zID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyciAtIHByZXYpKTtcbiAgdmFyIHJlcSA9IHNldFRpbWVvdXQoZm4sIG1zKTtcbiAgcHJldiA9IGN1cnI7XG4gIHJldHVybiByZXE7XG59XG5cbi8qKlxuICogQ2FuY2VsLlxuICovXG5cbnZhciBjYW5jZWwgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cuY2xlYXJUaW1lb3V0O1xuXG5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKGlkKXtcbiAgY2FuY2VsLmNhbGwod2luZG93LCBpZCk7XG59O1xuIiwiLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBFcnJvcl0nOiByZXR1cm4gJ2Vycm9yJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICE9PSB2YWwpIHJldHVybiAnbmFuJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG5cbiAgaWYgKGlzQnVmZmVyKHZhbCkpIHJldHVybiAnYnVmZmVyJztcblxuICB2YWwgPSB2YWwudmFsdWVPZlxuICAgID8gdmFsLnZhbHVlT2YoKVxuICAgIDogT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHZhbCk7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuXG4vLyBjb2RlIGJvcnJvd2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9pcy1idWZmZXIvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGlzQnVmZmVyKG9iaikge1xuICByZXR1cm4gISEob2JqICE9IG51bGwgJiZcbiAgICAob2JqLl9pc0J1ZmZlciB8fCAvLyBGb3IgU2FmYXJpIDUtNyAobWlzc2luZyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yKVxuICAgICAgKG9iai5jb25zdHJ1Y3RvciAmJlxuICAgICAgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iaikpXG4gICAgKSlcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmRJbnRlcm5hbDMgPSByZXF1aXJlKCcuLi9mdW5jdGlvbi9iaW5kSW50ZXJuYWwzJyk7XG5cbi8qKlxuICogIyBGb3IgRWFjaFxuICpcbiAqIEEgZmFzdCBgLmZvckVhY2goKWAgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQHBhcmFtICB7QXJyYXl9ICAgIHN1YmplY3QgICAgIFRoZSBhcnJheSAob3IgYXJyYXktbGlrZSkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgICAgICAgIFRoZSB2aXNpdG9yIGZ1bmN0aW9uLlxuICogQHBhcmFtICB7T2JqZWN0fSAgIHRoaXNDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgdmlzaXRvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYXN0Rm9yRWFjaCAoc3ViamVjdCwgZm4sIHRoaXNDb250ZXh0KSB7XG4gIHZhciBsZW5ndGggPSBzdWJqZWN0Lmxlbmd0aCxcbiAgICAgIGl0ZXJhdG9yID0gdGhpc0NvbnRleHQgIT09IHVuZGVmaW5lZCA/IGJpbmRJbnRlcm5hbDMoZm4sIHRoaXNDb250ZXh0KSA6IGZuLFxuICAgICAgaTtcbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaXRlcmF0b3Ioc3ViamVjdFtpXSwgaSwgc3ViamVjdCk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kSW50ZXJuYWw0ID0gcmVxdWlyZSgnLi4vZnVuY3Rpb24vYmluZEludGVybmFsNCcpO1xuXG4vKipcbiAqICMgUmVkdWNlXG4gKlxuICogQSBmYXN0IGAucmVkdWNlKClgIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgICBzdWJqZWN0ICAgICAgVGhlIGFycmF5IChvciBhcnJheS1saWtlKSB0byByZWR1Y2UuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgICAgICAgIFRoZSByZWR1Y2VyIGZ1bmN0aW9uLlxuICogQHBhcmFtICB7bWl4ZWR9ICAgIGluaXRpYWxWYWx1ZSBUaGUgaW5pdGlhbCB2YWx1ZSBmb3IgdGhlIHJlZHVjZXIsIGRlZmF1bHRzIHRvIHN1YmplY3RbMF0uXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgdGhpc0NvbnRleHQgIFRoZSBjb250ZXh0IGZvciB0aGUgcmVkdWNlci5cbiAqIEByZXR1cm4ge21peGVkfSAgICAgICAgICAgICAgICAgVGhlIGZpbmFsIHJlc3VsdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYXN0UmVkdWNlIChzdWJqZWN0LCBmbiwgaW5pdGlhbFZhbHVlLCB0aGlzQ29udGV4dCkge1xuICB2YXIgbGVuZ3RoID0gc3ViamVjdC5sZW5ndGgsXG4gICAgICBpdGVyYXRvciA9IHRoaXNDb250ZXh0ICE9PSB1bmRlZmluZWQgPyBiaW5kSW50ZXJuYWw0KGZuLCB0aGlzQ29udGV4dCkgOiBmbixcbiAgICAgIGksIHJlc3VsdDtcblxuICBpZiAoaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICBpID0gMTtcbiAgICByZXN1bHQgPSBzdWJqZWN0WzBdO1xuICB9XG4gIGVsc2Uge1xuICAgIGkgPSAwO1xuICAgIHJlc3VsdCA9IGluaXRpYWxWYWx1ZTtcbiAgfVxuXG4gIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHQgPSBpdGVyYXRvcihyZXN1bHQsIHN1YmplY3RbaV0sIGksIHN1YmplY3QpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JFYWNoQXJyYXkgPSByZXF1aXJlKCcuL2FycmF5L2ZvckVhY2gnKSxcbiAgICBmb3JFYWNoT2JqZWN0ID0gcmVxdWlyZSgnLi9vYmplY3QvZm9yRWFjaCcpO1xuXG4vKipcbiAqICMgRm9yRWFjaFxuICpcbiAqIEEgZmFzdCBgLmZvckVhY2goKWAgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQHBhcmFtICB7QXJyYXl8T2JqZWN0fSBzdWJqZWN0ICAgICBUaGUgYXJyYXkgb3Igb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSAgICAgZm4gICAgICAgICAgVGhlIHZpc2l0b3IgZnVuY3Rpb24uXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgIHRoaXNDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgdmlzaXRvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYXN0Rm9yRWFjaCAoc3ViamVjdCwgZm4sIHRoaXNDb250ZXh0KSB7XG4gIGlmIChzdWJqZWN0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByZXR1cm4gZm9yRWFjaEFycmF5KHN1YmplY3QsIGZuLCB0aGlzQ29udGV4dCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZvckVhY2hPYmplY3Qoc3ViamVjdCwgZm4sIHRoaXNDb250ZXh0KTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSW50ZXJuYWwgaGVscGVyIHRvIGJpbmQgYSBmdW5jdGlvbiBrbm93biB0byBoYXZlIDMgYXJndW1lbnRzXG4gKiB0byBhIGdpdmVuIGNvbnRleHQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZEludGVybmFsMyAoZnVuYywgdGhpc0NvbnRleHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQ29udGV4dCwgYSwgYiwgYyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEludGVybmFsIGhlbHBlciB0byBiaW5kIGEgZnVuY3Rpb24ga25vd24gdG8gaGF2ZSA0IGFyZ3VtZW50c1xuICogdG8gYSBnaXZlbiBjb250ZXh0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmRJbnRlcm5hbDQgKGZ1bmMsIHRoaXNDb250ZXh0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYywgZCkge1xuICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0NvbnRleHQsIGEsIGIsIGMsIGQpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBbmFsb2d1ZSBvZiBPYmplY3QuYXNzaWduKCkuXG4gKiBDb3BpZXMgcHJvcGVydGllcyBmcm9tIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvXG4gKiBhIHRhcmdldCBvYmplY3QuIEV4aXN0aW5nIGtleXMgb24gdGhlIHRhcmdldCBvYmplY3Qgd2lsbCBiZSBvdmVyd3JpdHRlbi5cbiAqXG4gKiA+IE5vdGU6IFRoaXMgZGlmZmVycyBmcm9tIHNwZWMgaW4gc29tZSBpbXBvcnRhbnQgd2F5czpcbiAqID4gMS4gV2lsbCB0aHJvdyBpZiBwYXNzZWQgbm9uLW9iamVjdHMsIGluY2x1ZGluZyBgdW5kZWZpbmVkYCBvciBgbnVsbGAgdmFsdWVzLlxuICogPiAyLiBEb2VzIG5vdCBzdXBwb3J0IHRoZSBjdXJpb3VzIEV4Y2VwdGlvbiBoYW5kbGluZyBiZWhhdmlvciwgZXhjZXB0aW9ucyBhcmUgdGhyb3duIGltbWVkaWF0ZWx5LlxuICogPiBGb3IgbW9yZSBkZXRhaWxzLCBzZWU6XG4gKiA+IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ25cbiAqXG4gKlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0ICAgICAgVGhlIHRhcmdldCBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtICB7T2JqZWN0fSBzb3VyY2UsIC4uLiBUaGUgc291cmNlKHMpIHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICBUaGUgdXBkYXRlZCB0YXJnZXQgb2JqZWN0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZhc3RBc3NpZ24gKHRhcmdldCkge1xuICB2YXIgdG90YWxBcmdzID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgIHNvdXJjZSwgaSwgdG90YWxLZXlzLCBrZXlzLCBrZXksIGo7XG5cbiAgZm9yIChpID0gMTsgaSA8IHRvdGFsQXJnczsgaSsrKSB7XG4gICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgIGtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuICAgIHRvdGFsS2V5cyA9IGtleXMubGVuZ3RoO1xuICAgIGZvciAoaiA9IDA7IGogPCB0b3RhbEtleXM7IGorKykge1xuICAgICAga2V5ID0ga2V5c1tqXTtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZEludGVybmFsMyA9IHJlcXVpcmUoJy4uL2Z1bmN0aW9uL2JpbmRJbnRlcm5hbDMnKTtcblxuLyoqXG4gKiAjIEZvciBFYWNoXG4gKlxuICogQSBmYXN0IG9iamVjdCBgLmZvckVhY2goKWAgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSAgIHN1YmplY3QgICAgIFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgICAgICAgIFRoZSB2aXNpdG9yIGZ1bmN0aW9uLlxuICogQHBhcmFtICB7T2JqZWN0fSAgIHRoaXNDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgdmlzaXRvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYXN0Rm9yRWFjaE9iamVjdCAoc3ViamVjdCwgZm4sIHRoaXNDb250ZXh0KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoc3ViamVjdCksXG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgIGl0ZXJhdG9yID0gdGhpc0NvbnRleHQgIT09IHVuZGVmaW5lZCA/IGJpbmRJbnRlcm5hbDMoZm4sIHRoaXNDb250ZXh0KSA6IGZuLFxuICAgICAga2V5LCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBrZXkgPSBrZXlzW2ldO1xuICAgIGl0ZXJhdG9yKHN1YmplY3Rba2V5XSwga2V5LCBzdWJqZWN0KTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmRJbnRlcm5hbDQgPSByZXF1aXJlKCcuLi9mdW5jdGlvbi9iaW5kSW50ZXJuYWw0Jyk7XG5cbi8qKlxuICogIyBSZWR1Y2VcbiAqXG4gKiBBIGZhc3Qgb2JqZWN0IGAucmVkdWNlKClgIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gICBzdWJqZWN0ICAgICAgVGhlIG9iamVjdCB0byByZWR1Y2Ugb3Zlci5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgICAgICAgICAgVGhlIHJlZHVjZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0gIHttaXhlZH0gICAgaW5pdGlhbFZhbHVlIFRoZSBpbml0aWFsIHZhbHVlIGZvciB0aGUgcmVkdWNlciwgZGVmYXVsdHMgdG8gc3ViamVjdFswXS5cbiAqIEBwYXJhbSAge09iamVjdH0gICB0aGlzQ29udGV4dCAgVGhlIGNvbnRleHQgZm9yIHRoZSByZWR1Y2VyLlxuICogQHJldHVybiB7bWl4ZWR9ICAgICAgICAgICAgICAgICBUaGUgZmluYWwgcmVzdWx0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZhc3RSZWR1Y2VPYmplY3QgKHN1YmplY3QsIGZuLCBpbml0aWFsVmFsdWUsIHRoaXNDb250ZXh0KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoc3ViamVjdCksXG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgIGl0ZXJhdG9yID0gdGhpc0NvbnRleHQgIT09IHVuZGVmaW5lZCA/IGJpbmRJbnRlcm5hbDQoZm4sIHRoaXNDb250ZXh0KSA6IGZuLFxuICAgICAgaSwga2V5LCByZXN1bHQ7XG5cbiAgaWYgKGluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaSA9IDE7XG4gICAgcmVzdWx0ID0gc3ViamVjdFtrZXlzWzBdXTtcbiAgfVxuICBlbHNlIHtcbiAgICBpID0gMDtcbiAgICByZXN1bHQgPSBpbml0aWFsVmFsdWU7XG4gIH1cblxuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAga2V5ID0ga2V5c1tpXTtcbiAgICByZXN1bHQgPSBpdGVyYXRvcihyZXN1bHQsIHN1YmplY3Rba2V5XSwga2V5LCBzdWJqZWN0KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVkdWNlQXJyYXkgPSByZXF1aXJlKCcuL2FycmF5L3JlZHVjZScpLFxuICAgIHJlZHVjZU9iamVjdCA9IHJlcXVpcmUoJy4vb2JqZWN0L3JlZHVjZScpO1xuXG4vKipcbiAqICMgUmVkdWNlXG4gKlxuICogQSBmYXN0IGAucmVkdWNlKClgIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fE9iamVjdH0gc3ViamVjdCAgICAgIFRoZSBhcnJheSBvciBvYmplY3QgdG8gcmVkdWNlIG92ZXIuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gICAgIGZuICAgICAgICAgICBUaGUgcmVkdWNlciBmdW5jdGlvbi5cbiAqIEBwYXJhbSAge21peGVkfSAgICAgICAgaW5pdGlhbFZhbHVlIFRoZSBpbml0aWFsIHZhbHVlIGZvciB0aGUgcmVkdWNlciwgZGVmYXVsdHMgdG8gc3ViamVjdFswXS5cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICAgdGhpc0NvbnRleHQgIFRoZSBjb250ZXh0IGZvciB0aGUgcmVkdWNlci5cbiAqIEByZXR1cm4ge0FycmF5fE9iamVjdH0gICAgICAgICAgICAgIFRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbmluZyB0aGUgcmVzdWx0cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYXN0UmVkdWNlIChzdWJqZWN0LCBmbiwgaW5pdGlhbFZhbHVlLCB0aGlzQ29udGV4dCkge1xuICBpZiAoc3ViamVjdCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcmV0dXJuIHJlZHVjZUFycmF5KHN1YmplY3QsIGZuLCBpbml0aWFsVmFsdWUsIHRoaXNDb250ZXh0KTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gcmVkdWNlT2JqZWN0KHN1YmplY3QsIGZuLCBpbml0aWFsVmFsdWUsIHRoaXNDb250ZXh0KTtcbiAgfVxufTsiLCIvKiogZ2VuZXJhdGUgdW5pcXVlIGlkIGZvciBzZWxlY3RvciAqL1xyXG52YXIgY291bnRlciA9IERhdGUubm93KCkgJSAxZTk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFVpZCgpe1xyXG5cdHJldHVybiAoTWF0aC5yYW5kb20oKSAqIDFlOSA+Pj4gMCkgKyAoY291bnRlcisrKTtcclxufTsiLCIvKmdsb2JhbCB3aW5kb3cqL1xuXG4vKipcbiAqIENoZWNrIGlmIG9iamVjdCBpcyBkb20gbm9kZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzTm9kZSh2YWwpe1xuICBpZiAoIXZhbCB8fCB0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICBpZiAod2luZG93ICYmICdvYmplY3QnID09IHR5cGVvZiB3aW5kb3cuTm9kZSkgcmV0dXJuIHZhbCBpbnN0YW5jZW9mIHdpbmRvdy5Ob2RlO1xuICByZXR1cm4gJ251bWJlcicgPT0gdHlwZW9mIHZhbC5ub2RlVHlwZSAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgdmFsLm5vZGVOYW1lO1xufVxuIiwiLyoqXG4gKiBTdXBwb3J0ZWQgU1ZHIGF0dHJpYnV0ZXNcbiAqL1xuXG5leHBvcnRzLmF0dHJpYnV0ZXMgPSB7XG4gICdjeCc6IHRydWUsXG4gICdjeSc6IHRydWUsXG4gICdkJzogdHJ1ZSxcbiAgJ2R4JzogdHJ1ZSxcbiAgJ2R5JzogdHJ1ZSxcbiAgJ2ZpbGwnOiB0cnVlLFxuICAnZmlsbE9wYWNpdHknOiB0cnVlLFxuICAnZm9udEZhbWlseSc6IHRydWUsXG4gICdmb250U2l6ZSc6IHRydWUsXG4gICdmeCc6IHRydWUsXG4gICdmeSc6IHRydWUsXG4gICdncmFkaWVudFRyYW5zZm9ybSc6IHRydWUsXG4gICdncmFkaWVudFVuaXRzJzogdHJ1ZSxcbiAgJ21hcmtlckVuZCc6IHRydWUsXG4gICdtYXJrZXJNaWQnOiB0cnVlLFxuICAnbWFya2VyU3RhcnQnOiB0cnVlLFxuICAnb2Zmc2V0JzogdHJ1ZSxcbiAgJ29wYWNpdHknOiB0cnVlLFxuICAncGF0dGVybkNvbnRlbnRVbml0cyc6IHRydWUsXG4gICdwYXR0ZXJuVW5pdHMnOiB0cnVlLFxuICAncG9pbnRzJzogdHJ1ZSxcbiAgJ3ByZXNlcnZlQXNwZWN0UmF0aW8nOiB0cnVlLFxuICAncic6IHRydWUsXG4gICdyeCc6IHRydWUsXG4gICdyeSc6IHRydWUsXG4gICdzcHJlYWRNZXRob2QnOiB0cnVlLFxuICAnc3RvcENvbG9yJzogdHJ1ZSxcbiAgJ3N0b3BPcGFjaXR5JzogdHJ1ZSxcbiAgJ3N0cm9rZSc6IHRydWUsXG4gICdzdHJva2VEYXNoYXJyYXknOiB0cnVlLFxuICAnc3Ryb2tlTGluZWNhcCc6IHRydWUsXG4gICdzdHJva2VPcGFjaXR5JzogdHJ1ZSxcbiAgJ3N0cm9rZVdpZHRoJzogdHJ1ZSxcbiAgJ3RleHRBbmNob3InOiB0cnVlLFxuICAndHJhbnNmb3JtJzogdHJ1ZSxcbiAgJ3ZlcnNpb24nOiB0cnVlLFxuICAndmlld0JveCc6IHRydWUsXG4gICd4MSc6IHRydWUsXG4gICd4Mic6IHRydWUsXG4gICd4JzogdHJ1ZSxcbiAgJ3kxJzogdHJ1ZSxcbiAgJ3kyJzogdHJ1ZSxcbiAgJ3knOiB0cnVlXG59XG5cbi8qKlxuICogQXJlIGVsZW1lbnQncyBhdHRyaWJ1dGVzIFNWRz9cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0clxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGF0dHIpIHtcbiAgcmV0dXJuIGV4cG9ydHMuYXR0cmlidXRlc1thdHRyXSA9PT0gdHJ1ZVxufVxuIiwiLyoqXG4gKiBTdXBwb3J0ZWQgU1ZHIGVsZW1lbnRzXG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5cbmV4cG9ydHMuZWxlbWVudHMgPSB7XG4gICdhbmltYXRlJzogdHJ1ZSxcbiAgJ2NpcmNsZSc6IHRydWUsXG4gICdkZWZzJzogdHJ1ZSxcbiAgJ2VsbGlwc2UnOiB0cnVlLFxuICAnZyc6IHRydWUsXG4gICdsaW5lJzogdHJ1ZSxcbiAgJ2xpbmVhckdyYWRpZW50JzogdHJ1ZSxcbiAgJ21hc2snOiB0cnVlLFxuICAncGF0aCc6IHRydWUsXG4gICdwYXR0ZXJuJzogdHJ1ZSxcbiAgJ3BvbHlnb24nOiB0cnVlLFxuICAncG9seWxpbmUnOiB0cnVlLFxuICAncmFkaWFsR3JhZGllbnQnOiB0cnVlLFxuICAncmVjdCc6IHRydWUsXG4gICdzdG9wJzogdHJ1ZSxcbiAgJ3N2Zyc6IHRydWUsXG4gICd0ZXh0JzogdHJ1ZSxcbiAgJ3RzcGFuJzogdHJ1ZVxufVxuXG4vKipcbiAqIElzIGVsZW1lbnQncyBuYW1lc3BhY2UgU1ZHP1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKi9cblxuZXhwb3J0cy5pc0VsZW1lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gbmFtZSBpbiBleHBvcnRzLmVsZW1lbnRzXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG4gICAgaWYgKCFzb3VyY2UpIGNvbnRpbnVlXG5cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAodW5kZWZpbmVkID09PSB0YXJnZXRba2V5XSlcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdGFyZ2V0XG59XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3Rvcnkpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyppc3RhbmJ1bCBpZ25vcmUgbmV4dDpjYW50IHRlc3QqL1xuICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHJvb3Qub2JqZWN0UGF0aCA9IGZhY3RvcnkoKTtcbiAgfVxufSkodGhpcywgZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhclxuICAgIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpe1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIWlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoX2hhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB0b1N0cmluZyh0eXBlKXtcbiAgICByZXR1cm4gdG9TdHIuY2FsbCh0eXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTnVtYmVyKHZhbHVlKXtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0b1N0cmluZyh2YWx1ZSkgPT09IFwiW29iamVjdCBOdW1iZXJdXCI7XG4gIH1cblxuICBmdW5jdGlvbiBpc1N0cmluZyhvYmope1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCB0b1N0cmluZyhvYmopID09PSBcIltvYmplY3QgU3RyaW5nXVwiO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNPYmplY3Qob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmcob2JqKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQXJyYXkob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT09ICdudW1iZXInICYmIHRvU3RyaW5nKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH1cblxuICBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqKXtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nIHx8IHRvU3RyaW5nKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEtleShrZXkpe1xuICAgIHZhciBpbnRLZXkgPSBwYXJzZUludChrZXkpO1xuICAgIGlmIChpbnRLZXkudG9TdHJpbmcoKSA9PT0ga2V5KSB7XG4gICAgICByZXR1cm4gaW50S2V5O1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSl7XG4gICAgaWYgKGlzTnVtYmVyKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH1cbiAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKGlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICByZXR1cm4gc2V0KG9iaiwgcGF0aC5zcGxpdCgnLicpLm1hcChnZXRLZXkpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgICB9XG4gICAgdmFyIGN1cnJlbnRQYXRoID0gcGF0aFswXTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFyIG9sZFZhbCA9IG9ialtjdXJyZW50UGF0aF07XG4gICAgICBpZiAob2xkVmFsID09PSB2b2lkIDAgfHwgIWRvTm90UmVwbGFjZSkge1xuICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2xkVmFsO1xuICAgIH1cblxuICAgIGlmIChvYmpbY3VycmVudFBhdGhdID09PSB2b2lkIDApIHtcbiAgICAgIC8vY2hlY2sgaWYgd2UgYXNzdW1lIGFuIGFycmF5XG4gICAgICBpZihpc051bWJlcihwYXRoWzFdKSkge1xuICAgICAgICBvYmpbY3VycmVudFBhdGhdID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmpbY3VycmVudFBhdGhdID0ge307XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlbChvYmosIHBhdGgpIHtcbiAgICBpZiAoaXNOdW1iZXIocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuXG4gICAgaWYgKGlzRW1wdHkob2JqKSkge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG5cbiAgICBpZiAoaXNFbXB0eShwYXRoKSkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYoaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHJldHVybiBkZWwob2JqLCBwYXRoLnNwbGl0KCcuJykpO1xuICAgIH1cblxuICAgIHZhciBjdXJyZW50UGF0aCA9IGdldEtleShwYXRoWzBdKTtcbiAgICB2YXIgb2xkVmFsID0gb2JqW2N1cnJlbnRQYXRoXTtcblxuICAgIGlmKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAob2xkVmFsICE9PSB2b2lkIDApIHtcbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UoY3VycmVudFBhdGgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBvYmpbY3VycmVudFBhdGhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvYmpbY3VycmVudFBhdGhdICE9PSB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIGRlbChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIG9iamVjdFBhdGggPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqZWN0UGF0aCkucmVkdWNlKGZ1bmN0aW9uKHByb3h5LCBwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIG9iamVjdFBhdGhbcHJvcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJveHlbcHJvcF0gPSBvYmplY3RQYXRoW3Byb3BdLmJpbmQob2JqZWN0UGF0aCwgb2JqKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb3h5O1xuICAgIH0sIHt9KTtcbiAgfTtcblxuICBvYmplY3RQYXRoLmhhcyA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICBpZiAoaXNFbXB0eShvYmopKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGlzTnVtYmVyKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzRW1wdHkocGF0aCkgfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBqID0gcGF0aFtpXTtcbiAgICAgIGlmICgoaXNPYmplY3Qob2JqKSB8fCBpc0FycmF5KG9iaikpICYmIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaikpIHtcbiAgICAgICAgb2JqID0gb2JqW2pdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIG9iamVjdFBhdGguZW5zdXJlRXhpc3RzID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpe1xuICAgIHJldHVybiBzZXQob2JqLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG4gIH07XG5cbiAgb2JqZWN0UGF0aC5zZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgZG9Ob3RSZXBsYWNlKXtcbiAgICByZXR1cm4gc2V0KG9iaiwgcGF0aCwgdmFsdWUsIGRvTm90UmVwbGFjZSk7XG4gIH07XG5cbiAgb2JqZWN0UGF0aC5pbnNlcnQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSwgYXQpe1xuICAgIHZhciBhcnIgPSBvYmplY3RQYXRoLmdldChvYmosIHBhdGgpO1xuICAgIGF0ID0gfn5hdDtcbiAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgYXJyID0gW107XG4gICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgfVxuICAgIGFyci5zcGxpY2UoYXQsIDAsIHZhbHVlKTtcbiAgfTtcblxuICBvYmplY3RQYXRoLmVtcHR5ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgaWYgKGlzRW1wdHkocGF0aCkpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmIChpc0VtcHR5KG9iaikpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlLCBpO1xuICAgIGlmICghKHZhbHVlID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKSkpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgJycpO1xuICAgIH0gZWxzZSBpZiAoaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG9iamVjdFBhdGguc2V0KG9iaiwgcGF0aCwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCAwKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YWx1ZS5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICBmb3IgKGkgaW4gdmFsdWUpIHtcbiAgICAgICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBpKSkge1xuICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2JqZWN0UGF0aC5zZXQob2JqLCBwYXRoLCBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgb2JqZWN0UGF0aC5wdXNoID0gZnVuY3Rpb24gKG9iaiwgcGF0aCAvKiwgdmFsdWVzICovKXtcbiAgICB2YXIgYXJyID0gb2JqZWN0UGF0aC5nZXQob2JqLCBwYXRoKTtcbiAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgYXJyID0gW107XG4gICAgICBvYmplY3RQYXRoLnNldChvYmosIHBhdGgsIGFycik7XG4gICAgfVxuXG4gICAgYXJyLnB1c2guYXBwbHkoYXJyLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgfTtcblxuICBvYmplY3RQYXRoLmNvYWxlc2NlID0gZnVuY3Rpb24gKG9iaiwgcGF0aHMsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHZhciB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRocy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKCh2YWx1ZSA9IG9iamVjdFBhdGguZ2V0KG9iaiwgcGF0aHNbaV0pKSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICB9O1xuXG4gIG9iamVjdFBhdGguZ2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZGVmYXVsdFZhbHVlKXtcbiAgICBpZiAoaXNOdW1iZXIocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChpc0VtcHR5KHBhdGgpKSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAoaXNFbXB0eShvYmopKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgICBpZiAoaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmosIHBhdGguc3BsaXQoJy4nKSwgZGVmYXVsdFZhbHVlKTtcbiAgICB9XG5cbiAgICB2YXIgY3VycmVudFBhdGggPSBnZXRLZXkocGF0aFswXSk7XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmIChvYmpbY3VycmVudFBhdGhdID09PSB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbY3VycmVudFBhdGhdO1xuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RQYXRoLmdldChvYmpbY3VycmVudFBhdGhdLCBwYXRoLnNsaWNlKDEpLCBkZWZhdWx0VmFsdWUpO1xuICB9O1xuXG4gIG9iamVjdFBhdGguZGVsID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgcmV0dXJuIGRlbChvYmosIHBhdGgpO1xuICB9O1xuXG4gIHJldHVybiBvYmplY3RQYXRoO1xufSk7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHNsaWNlID0gcmVxdWlyZSgnc2xpY2VkJylcbnZhciBmbGF0dGVuID0gcmVxdWlyZSgnYXJyYXktZmxhdHRlbicpXG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBsZXRzIHVzIGNyZWF0ZSB2aXJ0dWFsIG5vZGVzIHVzaW5nIGEgc2ltcGxlXG4gKiBzeW50YXguIEl0IGlzIGNvbXBhdGlibGUgd2l0aCBKU1ggdHJhbnNmb3JtcyBzbyB5b3UgY2FuIHVzZVxuICogSlNYIHRvIHdyaXRlIG5vZGVzIHRoYXQgd2lsbCBjb21waWxlIHRvIHRoaXMgZnVuY3Rpb24uXG4gKlxuICogbGV0IG5vZGUgPSBlbGVtZW50KCdkaXYnLCB7IGlkOiAnZm9vJyB9LCBbXG4gKiAgIGVsZW1lbnQoJ2EnLCB7IGhyZWY6ICdodHRwOi8vZ29vZ2xlLmNvbScgfSwgJ0dvb2dsZScpXG4gKiBdKVxuICpcbiAqIFlvdSBjYW4gbGVhdmUgb3V0IHRoZSBhdHRyaWJ1dGVzIG9yIHRoZSBjaGlsZHJlbiBpZiBlaXRoZXJcbiAqIG9mIHRoZW0gYXJlbid0IG5lZWRlZCBhbmQgaXQgd2lsbCBmaWd1cmUgb3V0IHdoYXQgeW91J3JlXG4gKiB0cnlpbmcgdG8gZG8uXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBlbGVtZW50XG5cbi8qKlxuICogQ3JlYXRlIHZpcnR1YWwgdHJlZXMgb2YgY29tcG9uZW50cy5cbiAqXG4gKiBUaGlzIGNyZWF0ZXMgdGhlIG5pY2VyIEFQSSBmb3IgdGhlIHVzZXIuXG4gKiBJdCB0cmFuc2xhdGVzIHRoYXQgZnJpZW5kbHkgQVBJIGludG8gYW4gYWN0dWFsIHRyZWUgb2Ygbm9kZXMuXG4gKlxuICogQHBhcmFtIHsqfSB0eXBlXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICogQHBhcmFtIHtBcnJheX0gY2hpbGRyZW5cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZWxlbWVudCAodHlwZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgLy8gRGVmYXVsdCB0byBkaXYgd2l0aCBubyBhcmdzXG4gIGlmICghdHlwZSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VsZW1lbnQoKSBuZWVkcyBhIHR5cGUuJylcbiAgfVxuXG4gIC8vIFNraXBwZWQgYWRkaW5nIGF0dHJpYnV0ZXMgYW5kIHdlJ3JlIHBhc3NpbmdcbiAgLy8gaW4gY2hpbGRyZW4gaW5zdGVhZC5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgKHR5cGVvZiBhdHRyaWJ1dGVzID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KGF0dHJpYnV0ZXMpKSkge1xuICAgIGNoaWxkcmVuID0gWyBhdHRyaWJ1dGVzIF1cbiAgICBhdHRyaWJ1dGVzID0ge31cbiAgfVxuXG4gIC8vIEFjY291bnQgZm9yIEpTWCBwdXR0aW5nIHRoZSBjaGlsZHJlbiBhcyBtdWx0aXBsZSBhcmd1bWVudHMuXG4gIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkganVzdCB0aGUgRVM2IHJlc3QgcGFyYW1cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgY2hpbGRyZW4gPSBzbGljZShhcmd1bWVudHMsIDIpXG4gIH1cblxuICBjaGlsZHJlbiA9IGNoaWxkcmVuIHx8IFtdXG4gIGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9XG5cbiAgLy8gRmxhdHRlbiBuZXN0ZWQgY2hpbGQgYXJyYXlzLiBUaGlzIGlzIGhvdyBKU1ggY29tcGlsZXMgc29tZSBub2Rlcy5cbiAgY2hpbGRyZW4gPSBmbGF0dGVuKGNoaWxkcmVuLCAyKVxuXG4gIC8vIEZpbHRlciBvdXQgYW55IGB1bmRlZmluZWRgIGVsZW1lbnRzXG4gIGNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChpKSB7IHJldHVybiB0eXBlb2YgaSAhPT0gJ3VuZGVmaW5lZCcgfSlcblxuICAvLyBpZiB5b3UgcGFzcyBpbiBhIGZ1bmN0aW9uLCBpdCdzIGEgYENvbXBvbmVudGAgY29uc3RydWN0b3IuXG4gIC8vIG90aGVyd2lzZSBpdCdzIGFuIGVsZW1lbnQuXG4gIHJldHVybiB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgYXR0cmlidXRlczogYXR0cmlidXRlc1xuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBFeHBvc2UgYGFycmF5RmxhdHRlbmAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlGbGF0dGVuXG5cbi8qKlxuICogUmVjdXJzaXZlIGZsYXR0ZW4gZnVuY3Rpb24gd2l0aCBkZXB0aC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gIGFycmF5XG4gKiBAcGFyYW0gIHtBcnJheX0gIHJlc3VsdFxuICogQHBhcmFtICB7TnVtYmVyfSBkZXB0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW5XaXRoRGVwdGggKGFycmF5LCByZXN1bHQsIGRlcHRoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpXVxuXG4gICAgaWYgKGRlcHRoID4gMCAmJiBBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgZmxhdHRlbldpdGhEZXB0aCh2YWx1ZSwgcmVzdWx0LCBkZXB0aCAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmUgZmxhdHRlbiBmdW5jdGlvbi4gT21pdHRpbmcgZGVwdGggaXMgc2xpZ2h0bHkgZmFzdGVyLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBhcnJheVxuICogQHBhcmFtICB7QXJyYXl9IHJlc3VsdFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW5Gb3JldmVyIChhcnJheSwgcmVzdWx0KSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpXVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBmbGF0dGVuRm9yZXZlcih2YWx1ZSwgcmVzdWx0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucHVzaCh2YWx1ZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogRmxhdHRlbiBhbiBhcnJheSwgd2l0aCB0aGUgYWJpbGl0eSB0byBkZWZpbmUgYSBkZXB0aC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gIGFycmF5XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRlcHRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gYXJyYXlGbGF0dGVuIChhcnJheSwgZGVwdGgpIHtcbiAgaWYgKGRlcHRoID09IG51bGwpIHtcbiAgICByZXR1cm4gZmxhdHRlbkZvcmV2ZXIoYXJyYXksIFtdKVxuICB9XG5cbiAgcmV0dXJuIGZsYXR0ZW5XaXRoRGVwdGgoYXJyYXksIFtdLCBkZXB0aClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3NsaWNlZCcpO1xuIiwiXG4vKipcbiAqIEFuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykgYWx0ZXJuYXRpdmVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXJncyBzb21ldGhpbmcgd2l0aCBhIGxlbmd0aFxuICogQHBhcmFtIHtOdW1iZXJ9IHNsaWNlXG4gKiBAcGFyYW0ge051bWJlcn0gc2xpY2VFbmRcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgc2xpY2UsIHNsaWNlRW5kKSB7XG4gIHZhciByZXQgPSBbXTtcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuXG4gIGlmICgwID09PSBsZW4pIHJldHVybiByZXQ7XG5cbiAgdmFyIHN0YXJ0ID0gc2xpY2UgPCAwXG4gICAgPyBNYXRoLm1heCgwLCBzbGljZSArIGxlbilcbiAgICA6IHNsaWNlIHx8IDA7XG5cbiAgaWYgKHNsaWNlRW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICBsZW4gPSBzbGljZUVuZCA8IDBcbiAgICAgID8gc2xpY2VFbmQgKyBsZW5cbiAgICAgIDogc2xpY2VFbmRcbiAgfVxuXG4gIHdoaWxlIChsZW4tLSA+IHN0YXJ0KSB7XG4gICAgcmV0W2xlbiAtIHN0YXJ0XSA9IGFyZ3NbbGVuXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCBlbGVtZW50IGZyb20gJ3ZpcnR1YWwtZWxlbWVudCdcblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHsgcmVuZGVyIH1cblxuLyoqXG4gKiBSZW5kZXIuXG4gKi9cblxuZnVuY3Rpb24gcmVuZGVyKHsgcHJvcHMgfSkge1xuICBjb25zdCB7IGlzTG9hZGluZywgY2hpbGRyZW59ID0gcHJvcHNcbiAgaWYgKCFpc0xvYWRpbmcpIHJldHVybiA8ZGl2PntjaGlsZHJlbn08L2Rpdj5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPVwiTG9hZGVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiTG9hZGVyU3Bpbm5lclwiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiJdfQ==
