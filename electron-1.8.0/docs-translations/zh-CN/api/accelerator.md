# Accelerator

一个 `Accelerator` 是一个表示某个快捷键组合的字符串。它包含了用 `+` 连接的若干个按键。

例如：

* `CommandOrControl+A`
* `CommandOrControl+Shift+Z`

快捷键使用 [`globalShortcut`](global-shortcut.md)里的 [`register`](global-shortcut.md#globalshortcutregisteraccelerator-callback) 方法注册

```javascript
const {app, globalShortcut} = require('electron')

app.on('ready', () => {
  // Register a 'CommandOrControl+Y' shortcut listener.
  globalShortcut.register('CommandOrControl+Y', () => {
    // Do stuff when Y and either Command/Control is pressed.
  })
})
```

## 运行平台相关的提示

在 Linux 和 Windows 上，`Command` 键并不存在，因此我们通常用 `CommandOrControl` 来表示“在 macOS 下为 `Command` 键，但在
Linux 和 Windows 下为 `Control` 键。

使用 `Alt` 键 代替 `Option`。`Option` 键只在 macOS 系统上存在，而 `Alt` 键在任何系统上都有效。

`Super` 键是指 Linux 和 Windows 上的 `Windows` 键，但是在 macOS 下为 `Cmd` 键。

## 可用的功能按键

* `Command`（缩写为 `Cmd`）
* `Control`（缩写为 `Ctrl`）
* `CommandOrControl`（缩写为 `CmdOrCtrl`）
* `Alt`
* `Option`
* `AltGr`
* `Shift`
* `Super`

## 可用的普通按键

* `0` 到 `9`
* `A` 到 `Z`
* `F1` 到 `F24`
* 类似与 `~`、`!`、`@`、`#`、`$` 的标点符号。
* `Plus`
* `Space`
* `Tab`
* `Backspace`
* `Delete`
* `Insert`
* `Return`（和 `Enter` 等同）
* `Up`、`Down`、`Left` 和 `Right`
* `Home` 和 `End`
* `PageUp` 和 `PageDown`
* `Escape`（缩写为 `Esc`）
* `VolumeUp`、`VolumeDown` 和 `VolumeMute`
* `MediaNextTrack`、`MediaPreviousTrack`、`MediaStop` 和 `MediaPlayPause`
* `PrintScreen`
