// Verifies that Electron cannot play a video that uses proprietary codecs
//
// This application should be run with the ffmpeg that does not include
// proprietary codecs to ensure Electron uses it instead of the version
// that does include proprietary codecs.

const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

const MEDIA_ERR_SRC_NOT_SUPPORTED = 4
const FIVE_MINUTES = 5 * 60 * 1000

let window

app.once('ready', () => {
  window = new BrowserWindow({
    show: false
  })

  window.loadURL(url.format({
    protocol: 'file',
    slashed: true,
    pathname: path.resolve(__dirname, 'asar', 'video.asar', 'index.html')
  }))

  ipcMain.on('asar-video', (event, message, error) => {
    if (message === 'ended') {
      console.log('Video played, proprietary codecs are included')
      app.exit(1)
      return
    }

    if (message === 'error' && error === MEDIA_ERR_SRC_NOT_SUPPORTED) {
      app.exit(0)
      return
    }

    console.log(`Unexpected response from page: ${message} ${error}`)
    app.exit(1)
  })

  setTimeout(() => {
    console.log('No IPC message after 5 minutes')
    app.exit(1)
  }, FIVE_MINUTES)
})
