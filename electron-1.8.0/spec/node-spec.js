const assert = require('assert')
const ChildProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
const {ipcRenderer, remote} = require('electron')

const isCI = remote.getGlobal('isCi')

describe('node feature', function () {
  var fixtures = path.join(__dirname, 'fixtures')

  describe('child_process', function () {
    describe('child_process.fork', function () {
      it('works in current process', function (done) {
        var child = ChildProcess.fork(path.join(fixtures, 'module', 'ping.js'))
        child.on('message', function (msg) {
          assert.equal(msg, 'message')
          done()
        })
        child.send('message')
      })

      it('preserves args', function (done) {
        var args = ['--expose_gc', '-test', '1']
        var child = ChildProcess.fork(path.join(fixtures, 'module', 'process_args.js'), args)
        child.on('message', function (msg) {
          assert.deepEqual(args, msg.slice(2))
          done()
        })
        child.send('message')
      })

      it('works in forked process', function (done) {
        var child = ChildProcess.fork(path.join(fixtures, 'module', 'fork_ping.js'))
        child.on('message', function (msg) {
          assert.equal(msg, 'message')
          done()
        })
        child.send('message')
      })

      it('works in forked process when options.env is specifed', function (done) {
        var child = ChildProcess.fork(path.join(fixtures, 'module', 'fork_ping.js'), [], {
          path: process.env['PATH']
        })
        child.on('message', function (msg) {
          assert.equal(msg, 'message')
          done()
        })
        child.send('message')
      })

      it('works in browser process', function (done) {
        var fork = remote.require('child_process').fork
        var child = fork(path.join(fixtures, 'module', 'ping.js'))
        child.on('message', function (msg) {
          assert.equal(msg, 'message')
          done()
        })
        child.send('message')
      })

      it('has String::localeCompare working in script', function (done) {
        var child = ChildProcess.fork(path.join(fixtures, 'module', 'locale-compare.js'))
        child.on('message', function (msg) {
          assert.deepEqual(msg, [0, -1, 1])
          done()
        })
        child.send('message')
      })

      it('has setImmediate working in script', function (done) {
        var child = ChildProcess.fork(path.join(fixtures, 'module', 'set-immediate.js'))
        child.on('message', function (msg) {
          assert.equal(msg, 'ok')
          done()
        })
        child.send('message')
      })

      it('pipes stdio', function (done) {
        let child = ChildProcess.fork(path.join(fixtures, 'module', 'process-stdout.js'), {silent: true})
        let data = ''
        child.stdout.on('data', (chunk) => {
          data += String(chunk)
        })
        child.on('close', (code) => {
          assert.equal(code, 0)
          assert.equal(data, 'pipes stdio')
          done()
        })
      })

      it('works when sending a message to a process forked with the --eval argument', function (done) {
        const source = "process.on('message', (message) => { process.send(message) })"
        const forked = ChildProcess.fork('--eval', [source])
        forked.once('message', (message) => {
          assert.equal(message, 'hello')
          done()
        })
        forked.send('hello')
      })
    })

    describe('child_process.spawn', function () {
      let child

      afterEach(function () {
        if (child != null) {
          child.kill()
        }
      })

      it('supports spawning Electron as a node process via the ELECTRON_RUN_AS_NODE env var', function (done) {
        child = ChildProcess.spawn(process.execPath, [path.join(__dirname, 'fixtures', 'module', 'run-as-node.js')], {
          env: {
            ELECTRON_RUN_AS_NODE: true
          }
        })

        let output = ''
        child.stdout.on('data', function (data) {
          output += data
        })
        child.stdout.on('close', function () {
          assert.deepEqual(JSON.parse(output), {
            processLog: process.platform === 'win32' ? 'function' : 'undefined',
            processType: 'undefined',
            window: 'undefined'
          })
          done()
        })
      })

      it('supports starting the v8 inspector with --inspect/--inspect-brk', function (done) {
        child = ChildProcess.spawn(process.execPath, ['--inspect-brk', path.join(__dirname, 'fixtures', 'module', 'run-as-node.js')], {
          env: {
            ELECTRON_RUN_AS_NODE: true
          }
        })

        let output = ''
        child.stderr.on('data', function (data) {
          output += data

          if (output.trim().startsWith('Debugger listening on ws://')) {
            done()
          }
        })

        child.stdout.on('data', function (data) {
          done(new Error(`Unexpected output: ${data.toString()}`))
        })
      })
    })
  })

  describe('contexts', function () {
    describe('setTimeout in fs callback', function () {
      if (process.env.TRAVIS === 'true') {
        return
      }

      it('does not crash', function (done) {
        fs.readFile(__filename, function () {
          setTimeout(done, 0)
        })
      })
    })

    describe('error thrown in renderer process node context', function () {
      it('gets emitted as a process uncaughtException event', function (done) {
        const error = new Error('boo!')
        const listeners = process.listeners('uncaughtException')
        process.removeAllListeners('uncaughtException')
        process.on('uncaughtException', (thrown) => {
          assert.strictEqual(thrown, error)
          process.removeAllListeners('uncaughtException')
          listeners.forEach((listener) => {
            process.on('uncaughtException', listener)
          })
          done()
        })
        fs.readFile(__filename, () => {
          throw error
        })
      })
    })

    describe('error thrown in main process node context', function () {
      it('gets emitted as a process uncaughtException event', function () {
        const error = ipcRenderer.sendSync('handle-uncaught-exception', 'hello')
        assert.equal(error, 'hello')
      })
    })

    describe('promise rejection in main process node context', function () {
      it('gets emitted as a process unhandledRejection event', function () {
        const error = ipcRenderer.sendSync('handle-unhandled-rejection', 'hello')
        assert.equal(error, 'hello')
      })
    })

    describe('setTimeout called under Chromium event loop in browser process', function () {
      it('can be scheduled in time', function (done) {
        remote.getGlobal('setTimeout')(done, 0)
      })
    })

    describe('setInterval called under Chromium event loop in browser process', function () {
      it('can be scheduled in time', function (done) {
        var clear, interval
        clear = function () {
          remote.getGlobal('clearInterval')(interval)
          done()
        }
        interval = remote.getGlobal('setInterval')(clear, 10)
      })
    })
  })

  describe('message loop', function () {
    describe('process.nextTick', function () {
      it('emits the callback', function (done) {
        process.nextTick(done)
      })

      it('works in nested calls', function (done) {
        process.nextTick(function () {
          process.nextTick(function () {
            process.nextTick(done)
          })
        })
      })
    })

    describe('setImmediate', function () {
      it('emits the callback', function (done) {
        setImmediate(done)
      })

      it('works in nested calls', function (done) {
        setImmediate(function () {
          setImmediate(function () {
            setImmediate(done)
          })
        })
      })
    })
  })

  describe('net.connect', function () {
    if (process.platform !== 'darwin') {
      return
    }

    it('emit error when connect to a socket path without listeners', function (done) {
      var socketPath = path.join(os.tmpdir(), 'atom-shell-test.sock')
      var script = path.join(fixtures, 'module', 'create_socket.js')
      var child = ChildProcess.fork(script, [socketPath])
      child.on('exit', function (code) {
        assert.equal(code, 0)
        var client = require('net').connect(socketPath)
        client.on('error', function (error) {
          assert.equal(error.code, 'ECONNREFUSED')
          done()
        })
      })
    })
  })

  describe('Buffer', function () {
    it('can be created from WebKit external string', function () {
      var p = document.createElement('p')
      p.innerText = '闲云潭影日悠悠，物换星移几度秋'
      var b = new Buffer(p.innerText)
      assert.equal(b.toString(), '闲云潭影日悠悠，物换星移几度秋')
      assert.equal(Buffer.byteLength(p.innerText), 45)
    })

    it('correctly parses external one-byte UTF8 string', function () {
      var p = document.createElement('p')
      p.innerText = 'Jøhänñéß'
      var b = new Buffer(p.innerText)
      assert.equal(b.toString(), 'Jøhänñéß')
      assert.equal(Buffer.byteLength(p.innerText), 13)
    })

    it('does not crash when creating large Buffers', function () {
      var buffer = new Buffer(new Array(4096).join(' '))
      assert.equal(buffer.length, 4095)
      buffer = new Buffer(new Array(4097).join(' '))
      assert.equal(buffer.length, 4096)
    })
  })

  describe('process.stdout', function () {
    it('does not throw an exception when accessed', function () {
      assert.doesNotThrow(function () {
        process.stdout
      })
    })

    it('does not throw an exception when calling write()', function () {
      assert.doesNotThrow(function () {
        process.stdout.write('test')
      })
    })

    it('should have isTTY defined on Mac and Linux', function () {
      if (isCI) return

      if (process.platform === 'win32') {
        assert.equal(process.stdout.isTTY, undefined)
      } else {
        assert.equal(typeof process.stdout.isTTY, 'boolean')
      }
    })
  })

  describe('process.stdin', function () {
    it('does not throw an exception when accessed', function () {
      assert.doesNotThrow(function () {
        process.stdin
      })
    })

    it('returns null when read from', function () {
      assert.equal(process.stdin.read(), null)
    })
  })

  describe('process.version', function () {
    it('should not have -pre', function () {
      assert(!process.version.endsWith('-pre'))
    })
  })

  describe('vm.createContext', function () {
    it('should not crash', function () {
      require('vm').runInNewContext('')
    })
  })

  it('includes the electron version in process.versions', () => {
    assert(/^\d+\.\d+\.\d+$/.test(process.versions.electron))
  })

  it('includes the chrome version in process.versions', () => {
    assert(/^\d+\.\d+\.\d+\.\d+$/.test(process.versions.chrome))
  })
})
