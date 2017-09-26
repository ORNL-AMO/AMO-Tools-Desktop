'use strict'

const {ipcMain, webContents} = require('electron')
const parseFeaturesString = require('../common/parse-features-string')

// Doesn't exist in early initialization.
let webViewManager = null

const supportedWebViewEvents = [
  'load-commit',
  'did-attach',
  'did-finish-load',
  'did-fail-load',
  'did-frame-finish-load',
  'did-start-loading',
  'did-stop-loading',
  'did-get-response-details',
  'did-get-redirect-request',
  'dom-ready',
  'console-message',
  'context-menu',
  'devtools-opened',
  'devtools-closed',
  'devtools-focused',
  'new-window',
  'will-navigate',
  'did-navigate',
  'did-navigate-in-page',
  'close',
  'crashed',
  'gpu-crashed',
  'plugin-crashed',
  'destroyed',
  'page-title-updated',
  'page-favicon-updated',
  'enter-html-full-screen',
  'leave-html-full-screen',
  'media-started-playing',
  'media-paused',
  'found-in-page',
  'did-change-theme-color',
  'update-target-url'
]

let nextGuestInstanceId = 0
const guestInstances = {}
const embedderElementsMap = {}

// Moves the last element of array to the first one.
const moveLastToFirst = function (list) {
  list.unshift(list.pop())
}

// Generate guestInstanceId.
const getNextGuestInstanceId = function () {
  return ++nextGuestInstanceId
}

// Create a new guest instance.
const createGuest = function (embedder, params) {
  if (webViewManager == null) {
    webViewManager = process.atomBinding('web_view_manager')
  }

  const guestInstanceId = getNextGuestInstanceId(embedder)
  const guest = webContents.create({
    isGuest: true,
    partition: params.partition,
    embedder: embedder
  })
  guestInstances[guestInstanceId] = {
    guest: guest,
    embedder: embedder
  }

  watchEmbedder(embedder)

  // Init guest web view after attached.
  guest.on('did-attach', function () {
    params = this.attachParams
    delete this.attachParams

    const previouslyAttached = this.viewInstanceId != null
    this.viewInstanceId = params.instanceId

    // Only load URL and set size on first attach
    if (previouslyAttached) {
      return
    }

    this.setSize({
      normal: {
        width: params.elementWidth,
        height: params.elementHeight
      },
      enableAutoSize: params.autosize,
      min: {
        width: params.minwidth,
        height: params.minheight
      },
      max: {
        width: params.maxwidth,
        height: params.maxheight
      }
    })
    if (params.src) {
      const opts = {}
      if (params.httpreferrer) {
        opts.httpReferrer = params.httpreferrer
      }
      if (params.useragent) {
        opts.userAgent = params.useragent
      }
      this.loadURL(params.src, opts)
    }
    guest.allowPopups = params.allowpopups
  })

  const sendToEmbedder = (channel, ...args) => {
    const embedder = getEmbedder(guestInstanceId)
    if (embedder != null) {
      embedder.send(`${channel}-${guest.viewInstanceId}`, ...args)
    }
  }

  // Dispatch events to embedder.
  const fn = function (event) {
    guest.on(event, function (_, ...args) {
      sendToEmbedder('ELECTRON_GUEST_VIEW_INTERNAL_DISPATCH_EVENT', event, ...args)
    })
  }
  for (const event of supportedWebViewEvents) {
    fn(event)
  }

  // Dispatch guest's IPC messages to embedder.
  guest.on('ipc-message-host', function (_, [channel, ...args]) {
    sendToEmbedder('ELECTRON_GUEST_VIEW_INTERNAL_IPC_MESSAGE', channel, ...args)
  })

  // Autosize.
  guest.on('size-changed', function (_, ...args) {
    sendToEmbedder('ELECTRON_GUEST_VIEW_INTERNAL_SIZE_CHANGED', ...args)
  })

  // Notify guest of embedder window visibility when it is ready
  // FIXME Remove once https://github.com/electron/electron/issues/6828 is fixed
  guest.on('dom-ready', function () {
    const guestInstance = guestInstances[guestInstanceId]
    if (guestInstance != null && guestInstance.visibilityState != null) {
      guest.send('ELECTRON_GUEST_INSTANCE_VISIBILITY_CHANGE', guestInstance.visibilityState)
    }
  })

  // Forward internal web contents event to embedder to handle
  // native window.open setup
  guest.on('-add-new-contents', (...args) => {
    if (guest.getWebPreferences().nativeWindowOpen === true) {
      const embedder = getEmbedder(guestInstanceId)
      if (embedder != null) {
        embedder.emit('-add-new-contents', ...args)
      }
    }
  })
  guest.on('-web-contents-created', (...args) => {
    if (guest.getWebPreferences().nativeWindowOpen === true) {
      const embedder = getEmbedder(guestInstanceId)
      if (embedder != null) {
        embedder.emit('-web-contents-created', ...args)
      }
    }
  })

  return guestInstanceId
}

// Attach the guest to an element of embedder.
const attachGuest = function (event, elementInstanceId, guestInstanceId, params) {
  const embedder = event.sender
  // Destroy the old guest when attaching.
  const key = `${embedder.getId()}-${elementInstanceId}`
  const oldGuestInstanceId = embedderElementsMap[key]
  if (oldGuestInstanceId != null) {
    // Reattachment to the same guest is just a no-op.
    if (oldGuestInstanceId === guestInstanceId) {
      return
    }

    destroyGuest(embedder, oldGuestInstanceId)
  }

  const guestInstance = guestInstances[guestInstanceId]
  // If this isn't a valid guest instance then do nothing.
  if (!guestInstance) {
    return
  }
  const {guest} = guestInstance

  // If this guest is already attached to an element then remove it
  if (guestInstance.elementInstanceId) {
    const oldKey = `${guestInstance.embedder.getId()}-${guestInstance.elementInstanceId}`
    delete embedderElementsMap[oldKey]

    // Remove guest from embedder if moving across web views
    if (guest.viewInstanceId !== params.instanceId) {
      webViewManager.removeGuest(guestInstance.embedder, guestInstanceId)
      guestInstance.embedder.send(`ELECTRON_GUEST_VIEW_INTERNAL_DESTROY_GUEST-${guest.viewInstanceId}`)
    }
  }

  const webPreferences = {
    guestInstanceId: guestInstanceId,
    nodeIntegration: params.nodeintegration != null ? params.nodeintegration : false,
    plugins: params.plugins,
    zoomFactor: embedder._getZoomFactor(),
    webSecurity: !params.disablewebsecurity,
    blinkFeatures: params.blinkfeatures,
    disableBlinkFeatures: params.disableblinkfeatures
  }

  // parse the 'webpreferences' attribute string, if set
  // this uses the same parsing rules as window.open uses for its features
  if (typeof params.webpreferences === 'string') {
    parseFeaturesString(params.webpreferences, function (key, value) {
      if (value === undefined) {
        // no value was specified, default it to true
        value = true
      }
      webPreferences[key] = value
    })
  }

  if (params.preload) {
    webPreferences.preloadURL = params.preload
  }

  // Return null from native window.open if allowpopups is unset
  if (webPreferences.nativeWindowOpen === true && !params.allowpopups) {
    webPreferences.disablePopups = true
  }

  embedder.emit('will-attach-webview', event, webPreferences, params)
  if (event.defaultPrevented) {
    if (guest.viewInstanceId == null) guest.viewInstanceId = params.instanceId
    destroyGuest(embedder, guestInstanceId)
    return
  }

  webViewManager.addGuest(guestInstanceId, elementInstanceId, embedder, guest, webPreferences)
  guest.attachParams = params
  embedderElementsMap[key] = guestInstanceId

  guest.setEmbedder(embedder)
  guestInstance.embedder = embedder
  guestInstance.elementInstanceId = elementInstanceId

  watchEmbedder(embedder)
}

// Destroy an existing guest instance.
const destroyGuest = function (embedder, guestInstanceId) {
  if (!(guestInstanceId in guestInstances)) {
    return
  }

  const guestInstance = guestInstances[guestInstanceId]
  if (embedder !== guestInstance.embedder) {
    return
  }

  webViewManager.removeGuest(embedder, guestInstanceId)
  guestInstance.guest.destroy()
  delete guestInstances[guestInstanceId]

  const key = `${embedder.getId()}-${guestInstance.elementInstanceId}`
  delete embedderElementsMap[key]
}

// Once an embedder has had a guest attached we watch it for destruction to
// destroy any remaining guests.
const watchedEmbedders = new Set()
const watchEmbedder = function (embedder) {
  if (watchedEmbedders.has(embedder)) {
    return
  }
  watchedEmbedders.add(embedder)

  // Forward embedder window visiblity change events to guest
  const onVisibilityChange = function (visibilityState) {
    for (const guestInstanceId of Object.keys(guestInstances)) {
      const guestInstance = guestInstances[guestInstanceId]
      guestInstance.visibilityState = visibilityState
      if (guestInstance.embedder === embedder) {
        guestInstance.guest.send('ELECTRON_GUEST_INSTANCE_VISIBILITY_CHANGE', visibilityState)
      }
    }
  }
  embedder.on('-window-visibility-change', onVisibilityChange)

  const destroyEvents = ['will-destroy', 'crashed', 'did-navigate']
  const destroy = function () {
    for (const guestInstanceId of Object.keys(guestInstances)) {
      if (guestInstances[guestInstanceId].embedder === embedder) {
        destroyGuest(embedder, parseInt(guestInstanceId))
      }
    }

    for (const event of destroyEvents) {
      embedder.removeListener(event, destroy)
    }
    embedder.removeListener('-window-visibility-change', onVisibilityChange)

    watchedEmbedders.delete(embedder)
  }

  for (const event of destroyEvents) {
    embedder.once(event, destroy)

    // Users might also listen to the crashed event, so we must ensure the guest
    // is destroyed before users' listener gets called. It is done by moving our
    // listener to the first one in queue.
    const listeners = embedder._events[event]
    if (Array.isArray(listeners)) {
      moveLastToFirst(listeners)
    }
  }
}

ipcMain.on('ELECTRON_GUEST_VIEW_MANAGER_CREATE_GUEST', function (event, params, requestId) {
  event.sender.send(`ELECTRON_RESPONSE_${requestId}`, createGuest(event.sender, params))
})

ipcMain.on('ELECTRON_GUEST_VIEW_MANAGER_ATTACH_GUEST', function (event, elementInstanceId, guestInstanceId, params) {
  attachGuest(event, elementInstanceId, guestInstanceId, params)
})

ipcMain.on('ELECTRON_GUEST_VIEW_MANAGER_DESTROY_GUEST', function (event, guestInstanceId) {
  destroyGuest(event.sender, guestInstanceId)
})

ipcMain.on('ELECTRON_GUEST_VIEW_MANAGER_SET_SIZE', function (event, guestInstanceId, params) {
  const guest = getGuest(guestInstanceId)
  if (guest != null) guest.setSize(params)
})

// Returns WebContents from its guest id.
const getGuest = function (guestInstanceId) {
  const guestInstance = guestInstances[guestInstanceId]
  if (guestInstance != null) return guestInstance.guest
}

// Returns the embedder of the guest.
const getEmbedder = function (guestInstanceId) {
  const guestInstance = guestInstances[guestInstanceId]
  if (guestInstance != null) return guestInstance.embedder
}

exports.getGuest = getGuest
exports.getEmbedder = getEmbedder
