'use strict'

const {ipcRenderer, remote, webFrame} = require('electron')

const v8Util = process.atomBinding('v8_util')
const guestViewInternal = require('./guest-view-internal')
const webViewConstants = require('./web-view-constants')

const hasProp = {}.hasOwnProperty

// ID generator.
let nextId = 0

const getNextId = function () {
  return ++nextId
}

// Represents the internal state of the WebView node.
class WebViewImpl {
  constructor (webviewNode) {
    this.webviewNode = webviewNode
    v8Util.setHiddenValue(this.webviewNode, 'internal', this)
    this.attached = false
    this.elementAttached = false
    this.beforeFirstNavigation = true

    // on* Event handlers.
    this.on = {}
    this.browserPluginNode = this.createBrowserPluginNode()
    const shadowRoot = this.webviewNode.createShadowRoot()
    shadowRoot.innerHTML = '<!DOCTYPE html><style type="text/css">:host { display: flex; }</style>'
    this.setupWebViewAttributes()
    this.setupFocusPropagation()
    this.viewInstanceId = getNextId()
    shadowRoot.appendChild(this.browserPluginNode)
  }

  createBrowserPluginNode () {
    // We create BrowserPlugin as a custom element in order to observe changes
    // to attributes synchronously.
    const browserPluginNode = new WebViewImpl.BrowserPlugin()
    v8Util.setHiddenValue(browserPluginNode, 'internal', this)
    return browserPluginNode
  }

  // Resets some state upon reattaching <webview> element to the DOM.
  reset () {
    // If guestInstanceId is defined then the <webview> has navigated and has
    // already picked up a partition ID. Thus, we need to reset the initialization
    // state. However, it may be the case that beforeFirstNavigation is false BUT
    // guestInstanceId has yet to be initialized. This means that we have not
    // heard back from createGuest yet. We will not reset the flag in this case so
    // that we don't end up allocating a second guest.
    if (this.guestInstanceId) {
      guestViewInternal.destroyGuest(this.guestInstanceId)
      this.guestInstanceId = void 0
    }

    this.webContents = null
    this.beforeFirstNavigation = true
    this.attributes[webViewConstants.ATTRIBUTE_PARTITION].validPartitionId = true

    // Set guestinstance last since this can trigger the attachedCallback to fire
    // when moving the webview using element.replaceChild
    this.attributes[webViewConstants.ATTRIBUTE_GUESTINSTANCE].setValueIgnoreMutation(undefined)
  }

  // Sets the <webview>.request property.
  setRequestPropertyOnWebViewNode (request) {
    Object.defineProperty(this.webviewNode, 'request', {
      value: request,
      enumerable: true
    })
  }

  setupFocusPropagation () {
    if (!this.webviewNode.hasAttribute('tabIndex')) {
      // <webview> needs a tabIndex in order to be focusable.
      // TODO(fsamuel): It would be nice to avoid exposing a tabIndex attribute
      // to allow <webview> to be focusable.
      // See http://crbug.com/231664.
      this.webviewNode.setAttribute('tabIndex', -1)
    }

    // Focus the BrowserPlugin when the <webview> takes focus.
    this.webviewNode.addEventListener('focus', () => {
      this.browserPluginNode.focus()
    })

    // Blur the BrowserPlugin when the <webview> loses focus.
    this.webviewNode.addEventListener('blur', () => {
      this.browserPluginNode.blur()
    })
  }

  // This observer monitors mutations to attributes of the <webview> and
  // updates the BrowserPlugin properties accordingly. In turn, updating
  // a BrowserPlugin property will update the corresponding BrowserPlugin
  // attribute, if necessary. See BrowserPlugin::UpdateDOMAttribute for more
  // details.
  handleWebviewAttributeMutation (attributeName, oldValue, newValue) {
    if (!this.attributes[attributeName] || this.attributes[attributeName].ignoreMutation) {
      return
    }

    // Let the changed attribute handle its own mutation
    this.attributes[attributeName].handleMutation(oldValue, newValue)
  }

  handleBrowserPluginAttributeMutation (attributeName, oldValue, newValue) {
    if (attributeName === webViewConstants.ATTRIBUTE_INTERNALINSTANCEID && !oldValue && !!newValue) {
      this.browserPluginNode.removeAttribute(webViewConstants.ATTRIBUTE_INTERNALINSTANCEID)
      this.internalInstanceId = parseInt(newValue)

      // Track when the element resizes using the element resize callback.
      webFrame.registerElementResizeCallback(this.internalInstanceId, this.onElementResize.bind(this))
      if (this.guestInstanceId) {
        guestViewInternal.attachGuest(this.internalInstanceId, this.guestInstanceId, this.buildParams())
      }
    }
  }

  onSizeChanged (webViewEvent) {
    const {newHeight, newWidth} = webViewEvent
    const node = this.webviewNode
    const width = node.offsetWidth

    // Check the current bounds to make sure we do not resize <webview>
    // outside of current constraints.
    const maxWidth = this.attributes[webViewConstants.ATTRIBUTE_MAXWIDTH].getValue() | width
    const maxHeight = this.attributes[webViewConstants.ATTRIBUTE_MAXHEIGHT].getValue() | width
    let minWidth = this.attributes[webViewConstants.ATTRIBUTE_MINWIDTH].getValue() | width
    let minHeight = this.attributes[webViewConstants.ATTRIBUTE_MINHEIGHT].getValue() | width
    minWidth = Math.min(minWidth, maxWidth)
    minHeight = Math.min(minHeight, maxHeight)
    if (!this.attributes[webViewConstants.ATTRIBUTE_AUTOSIZE].getValue() || (newWidth >= minWidth && newWidth <= maxWidth && newHeight >= minHeight && newHeight <= maxHeight)) {
      node.style.width = `${newWidth}px`
      node.style.height = `${newHeight}px`

      // Only fire the DOM event if the size of the <webview> has actually
      // changed.
      this.dispatchEvent(webViewEvent)
    }
  }

  onElementResize (newSize) {
    // Dispatch the 'resize' event.
    const resizeEvent = new Event('resize', {
      bubbles: true
    })

    // Using client size values, because when a webview is transformed `newSize`
    // is incorrect
    newSize.width = this.webviewNode.clientWidth
    newSize.height = this.webviewNode.clientHeight

    resizeEvent.newWidth = newSize.width
    resizeEvent.newHeight = newSize.height
    this.dispatchEvent(resizeEvent)
    if (this.guestInstanceId &&
        !this.attributes[webViewConstants.ATTRIBUTE_DISABLEGUESTRESIZE].getValue()) {
      guestViewInternal.setSize(this.guestInstanceId, {
        normal: newSize
      })
    }
  }

  createGuest () {
    return guestViewInternal.createGuest(this.buildParams(), (event, guestInstanceId) => {
      this.attachGuestInstance(guestInstanceId)
    })
  }

  dispatchEvent (webViewEvent) {
    this.webviewNode.dispatchEvent(webViewEvent)
  }

  // Adds an 'on<event>' property on the webview, which can be used to set/unset
  // an event handler.
  setupEventProperty (eventName) {
    const propertyName = `on${eventName.toLowerCase()}`
    return Object.defineProperty(this.webviewNode, propertyName, {
      get: () => {
        return this.on[propertyName]
      },
      set: (value) => {
        if (this.on[propertyName]) {
          this.webviewNode.removeEventListener(eventName, this.on[propertyName])
        }
        this.on[propertyName] = value
        if (value) {
          return this.webviewNode.addEventListener(eventName, value)
        }
      },
      enumerable: true
    })
  }

  // Updates state upon loadcommit.
  onLoadCommit (webViewEvent) {
    const oldValue = this.webviewNode.getAttribute(webViewConstants.ATTRIBUTE_SRC)
    const newValue = webViewEvent.url
    if (webViewEvent.isMainFrame && (oldValue !== newValue)) {
      // Touching the src attribute triggers a navigation. To avoid
      // triggering a page reload on every guest-initiated navigation,
      // we do not handle this mutation.
      this.attributes[webViewConstants.ATTRIBUTE_SRC].setValueIgnoreMutation(newValue)
    }
  }

  onAttach (storagePartitionId) {
    return this.attributes[webViewConstants.ATTRIBUTE_PARTITION].setValue(storagePartitionId)
  }

  buildParams () {
    const params = {
      instanceId: this.viewInstanceId,
      userAgentOverride: this.userAgentOverride
    }
    for (const attributeName in this.attributes) {
      if (hasProp.call(this.attributes, attributeName)) {
        params[attributeName] = this.attributes[attributeName].getValue()
      }
    }

    // When the WebView is not participating in layout (display:none)
    // then getBoundingClientRect() would report a width and height of 0.
    // However, in the case where the WebView has a fixed size we can
    // use that value to initially size the guest so as to avoid a relayout of
    // the on display:block.
    const css = window.getComputedStyle(this.webviewNode, null)
    const elementRect = this.webviewNode.getBoundingClientRect()
    params.elementWidth = parseInt(elementRect.width) || parseInt(css.getPropertyValue('width'))
    params.elementHeight = parseInt(elementRect.height) || parseInt(css.getPropertyValue('height'))
    return params
  }

  attachGuestInstance (guestInstanceId) {
    this.guestInstanceId = guestInstanceId
    this.attributes[webViewConstants.ATTRIBUTE_GUESTINSTANCE].setValueIgnoreMutation(guestInstanceId)
    this.webContents = remote.getGuestWebContents(this.guestInstanceId)
    if (!this.internalInstanceId) {
      return true
    }
    return guestViewInternal.attachGuest(this.internalInstanceId, this.guestInstanceId, this.buildParams())
  }
}

// Registers browser plugin <object> custom element.
const registerBrowserPluginElement = function () {
  const proto = Object.create(HTMLObjectElement.prototype)
  proto.createdCallback = function () {
    this.setAttribute('type', 'application/browser-plugin')
    this.setAttribute('id', `browser-plugin-${getNextId()}`)

    // The <object> node fills in the <webview> container.
    this.style.flex = '1 1 auto'
  }
  proto.attributeChangedCallback = function (name, oldValue, newValue) {
    const internal = v8Util.getHiddenValue(this, 'internal')
    if (internal) {
      internal.handleBrowserPluginAttributeMutation(name, oldValue, newValue)
    }
  }
  proto.attachedCallback = function () {
    // Load the plugin immediately.
    return this.nonExistentAttribute
  }
  WebViewImpl.BrowserPlugin = webFrame.registerEmbedderCustomElement('browserplugin', {
    'extends': 'object',
    prototype: proto
  })
  delete proto.createdCallback
  delete proto.attachedCallback
  delete proto.detachedCallback
  delete proto.attributeChangedCallback
}

// Registers <webview> custom element.
const registerWebViewElement = function () {
  const proto = Object.create(HTMLObjectElement.prototype)
  proto.createdCallback = function () {
    return new WebViewImpl(this)
  }
  proto.attributeChangedCallback = function (name, oldValue, newValue) {
    const internal = v8Util.getHiddenValue(this, 'internal')
    if (internal) {
      internal.handleWebviewAttributeMutation(name, oldValue, newValue)
    }
  }
  proto.detachedCallback = function () {
    const internal = v8Util.getHiddenValue(this, 'internal')
    if (!internal) {
      return
    }
    guestViewInternal.deregisterEvents(internal.viewInstanceId)
    internal.elementAttached = false
    this.internalInstanceId = 0
    internal.reset()
  }
  proto.attachedCallback = function () {
    const internal = v8Util.getHiddenValue(this, 'internal')
    if (!internal) {
      return
    }
    if (!internal.elementAttached) {
      guestViewInternal.registerEvents(internal, internal.viewInstanceId)
      internal.elementAttached = true
      const instance = internal.attributes[webViewConstants.ATTRIBUTE_GUESTINSTANCE].getValue()
      if (instance) {
        internal.attachGuestInstance(instance)
      } else {
        internal.attributes[webViewConstants.ATTRIBUTE_SRC].parse()
      }
    }
  }

  // Public-facing API methods.
  const methods = [
    'getURL',
    'loadURL',
    'getTitle',
    'isLoading',
    'isLoadingMainFrame',
    'isWaitingForResponse',
    'stop',
    'reload',
    'reloadIgnoringCache',
    'canGoBack',
    'canGoForward',
    'canGoToOffset',
    'clearHistory',
    'goBack',
    'goForward',
    'goToIndex',
    'goToOffset',
    'isCrashed',
    'setUserAgent',
    'getUserAgent',
    'openDevTools',
    'closeDevTools',
    'isDevToolsOpened',
    'isDevToolsFocused',
    'inspectElement',
    'setAudioMuted',
    'isAudioMuted',
    'undo',
    'redo',
    'cut',
    'copy',
    'paste',
    'pasteAndMatchStyle',
    'delete',
    'selectAll',
    'unselect',
    'replace',
    'replaceMisspelling',
    'findInPage',
    'stopFindInPage',
    'getId',
    'downloadURL',
    'inspectServiceWorker',
    'print',
    'printToPDF',
    'showDefinitionForSelection',
    'capturePage',
    'setZoomFactor',
    'setZoomLevel',
    'getZoomLevel',
    'getZoomFactor'
  ]
  const nonblockMethods = [
    'insertCSS',
    'insertText',
    'send',
    'sendInputEvent',
    'setLayoutZoomLevelLimits',
    'setVisualZoomLevelLimits',
    // TODO(kevinsawicki): Remove in 2.0, deprecate before then with warnings
    'setZoomLevelLimits'
  ]

  // Forward proto.foo* method calls to WebViewImpl.foo*.
  const createBlockHandler = function (m) {
    return function (...args) {
      const internal = v8Util.getHiddenValue(this, 'internal')
      if (internal.webContents) {
        return internal.webContents[m](...args)
      } else {
        throw new Error(`Cannot call ${m} because the webContents is unavailable. The WebView must be attached to the DOM and the dom-ready event emitted before this method can be called.`)
      }
    }
  }
  for (const method of methods) {
    proto[method] = createBlockHandler(method)
  }

  const createNonBlockHandler = function (m) {
    return function (...args) {
      const internal = v8Util.getHiddenValue(this, 'internal')
      ipcRenderer.send('ELECTRON_BROWSER_ASYNC_CALL_TO_GUEST_VIEW', null, internal.guestInstanceId, m, ...args)
    }
  }
  for (const method of nonblockMethods) {
    proto[method] = createNonBlockHandler(method)
  }

  proto.executeJavaScript = function (code, hasUserGesture, callback) {
    const internal = v8Util.getHiddenValue(this, 'internal')
    if (typeof hasUserGesture === 'function') {
      callback = hasUserGesture
      hasUserGesture = false
    }
    const requestId = getNextId()
    ipcRenderer.send('ELECTRON_BROWSER_ASYNC_CALL_TO_GUEST_VIEW', requestId, internal.guestInstanceId, 'executeJavaScript', code, hasUserGesture)
    ipcRenderer.once(`ELECTRON_RENDERER_ASYNC_CALL_TO_GUEST_VIEW_RESPONSE_${requestId}`, function (event, result) {
      if (callback) callback(result)
    })
  }

  // WebContents associated with this webview.
  proto.getWebContents = function () {
    return v8Util.getHiddenValue(this, 'internal').webContents
  }

  window.WebView = webFrame.registerEmbedderCustomElement('webview', {
    prototype: proto
  })

  // Delete the callbacks so developers cannot call them and produce unexpected
  // behavior.
  delete proto.createdCallback
  delete proto.attachedCallback
  delete proto.detachedCallback
  delete proto.attributeChangedCallback
}

const useCapture = true

const listener = function (event) {
  if (document.readyState === 'loading') {
    return
  }
  registerBrowserPluginElement()
  registerWebViewElement()
  window.removeEventListener(event.type, listener, useCapture)
}

window.addEventListener('readystatechange', listener, true)

module.exports = WebViewImpl
