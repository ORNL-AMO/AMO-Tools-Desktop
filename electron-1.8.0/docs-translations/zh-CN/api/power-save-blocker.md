# powerSaveBlocker

> 阻止系统进入低功耗（睡眠）模式。

进程： [Main](../glossary.md#main-process)

例如:

```javascript
const {powerSaveBlocker} = require('electron')

const id = powerSaveBlocker.start('prevent-display-sleep')
console.log(powerSaveBlocker.isStarted(id))

powerSaveBlocker.stop(id)
```

## 方法

`powerSaveBlocker` 模块有如下方法：

### `powerSaveBlocker.start(type)`

* `type` String - 强行保存阻塞类型。
  * `prevent-app-suspension` - 阻止应用挂起。
    保持系统活跃，但是允许屏幕不亮。例如：
    下载文件或者播放音频。
  * `prevent-display-sleep`- 阻止应用进入休眠。保持系统和屏幕活跃，屏幕一直亮。例如：播放音频。

返回 `Integer` - 分配给此阻断器的 blocker ID

开始阻止系统进入睡眠模式。返回一个整数，这个整数标识了保持活跃的blocker ID。

**注意：** `prevent-display-sleep` 有更高的优先级
`prevent-app-suspension`。只有最高优先级生效，换句话说, `prevent-display-sleep` 优先级永远高于
`prevent-app-suspension`。

例如, A 请求调用了 `prevent-app-suspension`，B请求调用了 `prevent-display-sleep`。`prevent-display-sleep`
将一直工作，直到B停止调用。在那之后，`prevent-app-suspension`
才起效。

### `powerSaveBlocker.stop(id)`

* `id` Integer - 通过 `powerSaveBlocker.start` 返回保持活跃的 blocker id.

让指定 blocker 停止活跃。

### `powerSaveBlocker.isStarted(id)`

* `id` Integer - 通过 `powerSaveBlocker.start` 返回保持活跃的 blocker id.

返回 boolean，对应的 `powerSaveBlocker` 是否已经启动。
