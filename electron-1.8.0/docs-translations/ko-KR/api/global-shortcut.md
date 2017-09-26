# globalSortcut

> 애플리케이션에 키보드 포커스가 없을 때도 키보드 이벤트를 받을 수 있도록 합니다.

프로세스: [메인](../tutorial/quick-start.md#main-process)

`globalShortcut` 모듈은 운영체제의 전역 키보드 단축키를 등록/해제 하는 방법을
제공합니다. 이 모듈을 사용하여 사용자가 다양한 작업을 편하게 할 수 있도록 단축키를
정의 할 수 있습니다.

**참고:** 등록된 단축키는 애플리케이션이 백그라운드로 작동(창이 포커스 되지 않음) 할
때도 계속해서 작동합니다. 이 모듈은 `app` 모듈의 `ready` 이벤트가 발생하기 전까지
사용할 수 없습니다.

```javascript
const {app, globalShortcut} = require('electron')

app.on('ready', () => {
  // 'CommandOrControl+X' 단축키를 리스너에 등록합니다.
  const ret = globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed')
  })

  if (!ret) {
    console.log('registration failed')
  }

  // 단축키가 등록되었는지 확인합니다.
  console.log(globalShortcut.isRegistered('CommandOrControl+X'))
})

app.on('will-quit', () => {
  // 단축키의 등록을 해제합니다.
  globalShortcut.unregister('CommandOrControl+X')

  // 모든 단축키의 등록을 해제합니다.
  globalShortcut.unregisterAll()
})
```

## Methods

`globalShortcut` 모듈은 다음과 같은 메서드를 가지고 있습니다:

### `globalShortcut.register(accelerator, callback)`

* `accelerator` [Accelerator](accelerator.md)
* `callback` Function

`accelerator`의 전역 단축키를 등록합니다. 유저로부터 등록된 단축키가 눌렸을 경우
`callback` 함수가 호출됩니다.

accelerator가 이미 다른 애플리케이션에서 사용 중일 경우, 이 작업은 조용히 실패합니다.
이러한 동작은 애플리케이션이 전역 키보드 단축키를 가지고 충돌이 일어나지 않도록 하기
위해 운영체제에 의해 예정된 동작입니다.

### `globalShortcut.isRegistered(accelerator)`

* `accelerator` [Accelerator](accelerator.md)

Returns `Boolean` - `accelerator` 가 등록되었는지 여부.

Accelerator가 이미 다른 애플리케이션에서 사용 중일 경우, 여전히 `false`를 반환합니다.
이러한 동작은 애플리케이션이 전역 키보드 단축키를 가지고 충돌이 일어나지 않도록 하기
위해 운영체제에 의해 예정된 동작입니다.

### `globalShortcut.unregister(accelerator)`

* `accelerator` [Accelerator](accelerator.md)

`accelerator`에 해당하는 전역 단축키를 등록 해제합니다.

### `globalShortcut.unregisterAll()`

모든 전역 단축키의 등록을 해제합니다.
