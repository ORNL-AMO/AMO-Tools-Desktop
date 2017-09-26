const {globalShortcut} = require('electron').remote
const assert = require('assert')

const isCI = require('electron').remote.getGlobal('isCi')

describe('globalShortcut module', () => {
  if (isCI && process.platform === 'win32') {
    return
  }

  beforeEach(() => {
    globalShortcut.unregisterAll()
  })

  it('can register and unregister accelerators', () => {
    const accelerator = 'CommandOrControl+A+B+C'

    assert.equal(globalShortcut.isRegistered(accelerator), false)
    globalShortcut.register(accelerator, () => {})
    assert.equal(globalShortcut.isRegistered(accelerator), true)
    globalShortcut.unregister(accelerator)
    assert.equal(globalShortcut.isRegistered(accelerator), false)

    assert.equal(globalShortcut.isRegistered(accelerator), false)
    globalShortcut.register(accelerator, () => {})
    assert.equal(globalShortcut.isRegistered(accelerator), true)
    globalShortcut.unregisterAll()
    assert.equal(globalShortcut.isRegistered(accelerator), false)
  })
})
