# Menu

> 네이티브 애플리케이션 메뉴와 컨텍스트 메뉴를 생성합니다.

프로세스: [메인](../tutorial/quick-start.md#main-process)

각 메뉴는 여러 개의 [메뉴 아이템](menu-item.md)으로 구성되고 서브 메뉴를 가질 수도 있습니다.

## 예시

`Menu` 클래스는 메인 프로세스에서만 사용할 수 있지만, [`remote`](remote.md) 모듈을
통해 랜더러 프로세스에서도 사용할 수 있습니다.

### 메인 프로세스

다음은 템플릿 API를 사용하여 메인 프로세스에서 어플리케이션 메뉴를 생성하는 예시입니다:

```javascript
const {app, Menu} = require('electron')

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electron.atom.io') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Edit menu.
  template[1].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```

### 렌더러 프로세스

밑은 [`remote`](remote.md) 모듈을 사용하여 동적으로 웹 페이지 (렌더러 프로세스)에서
메뉴를 직접적으로 생성하는 예시이며 오른쪽 클릭을 했을 때 메뉴를 표시합니다.

```html
<!-- index.html -->
<script>
const {remote} = require('electron')
const {Menu, MenuItem} = remote

const menu = new Menu()
menu.append(new MenuItem({label: 'MenuItem1', click() { console.log('item 1 clicked') }}))
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false)
</script>
```

## Class: Menu

### `new Menu()`

새로운 메뉴를 생성합니다.

## Static Methods

`menu` 클래스는 다음과 같은 정적 메서드를 가지고 있습니다:

#### `Menu.setApplicationMenu(menu)`

* `menu` Menu

지정한 `menu`를 애플리케이션 메뉴로 만듭니다. macOS에선 상단바에 표시되며 Windows와
Linux에선 각 창의 상단에 표시됩니다.

**참고** 이 API는 `app`의 `ready` 이벤트가 발생한 이후에 호출해야 합니다.

#### `Menu.getApplicationMenu()`

설정되어있는 어플리케이션 메뉴를 반환합니다. (`Menu`의 인스턴스) 만약 없다면 `null`을
반환합니다.

#### `Menu.sendActionToFirstResponder(action)` _macOS_

* `action` String

`action`을 애플리케이션의 first responder에 전달합니다. 이 메서드는 Cocoa 메뉴
동작을 에뮬레이트 하는데 사용되며 보통 `MenuItem`의 `role` 속성에 사용됩니다.

macOS의 네이티브 액션에 대해 자세히 알아보려면
[macOS Cocoa Event Handling Guide](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/EventOverview/EventArchitecture/EventArchitecture.html#//apple_ref/doc/uid/10000060i-CH3-SW7)
문서를 참고하세요.

#### `Menu.buildFromTemplate(template)`

* `template` MenuItem[]

기본적으로 `template`는 [MenuItem](menu-item.md)을 생성할 때 사용하는 `options`의
배열입니다. 사용법은 위에서 설명한 것과 같습니다.

또한 `template`에는 다른 속성도 추가할 수 있으며 메뉴가 만들어질 때 해당 메뉴 아이템의
프로퍼티로 변환됩니다.

### Instance Methods

`menu` 객체는 다음과 같은 인스턴스 메서드를 가지고 있습니다:

#### `menu.popup([browserWindow, x, y, positioningItem])`

* `browserWindow` BrowserWindow (optional) - 기본값은
  `BrowserWindow.getFocusedWindow()`입니다.
* `x` Number (optional) - 기본값은 현재 마우스의 위치입니다.
* `y` Number (만약 `x`를 지정한 경우 **필수 항목**) - 기본값은 현재 마우스의 위치입니다.
* `positioningItem` Number (optional) _macOS_ - 메뉴 팝업 시 마우스 커서에 바로
  위치시킬 메뉴 아이템의 인덱스. 기본값은 -1입니다.

메뉴를 `browserWindow` 내부 팝업으로 표시합니다.

#### `menu.append(menuItem)`

* `menuItem` MenuItem

메뉴의 리스트 끝에 `menuItem`을 삽입합니다.

#### `menu.insert(pos, menuItem)`

* `pos` Integer
* `menuItem` MenuItem

`pos` 위치에 `menuItem`을 삽입합니다.

### Instance Properties

`menu` 객체는 또한 다음과 같은 속성을 가지고 있습니다:

#### `menu.items`

메뉴 아이템을 포함하는 MenuItem[] 배열.

## macOS 애플리케이션 메뉴에 대해 알아 둬야 할 것들

macOS에선 Windows, Linux와 달리 완전히 다른 애플리케이션 메뉴 스타일을 가지고 있습니다.
그래서 애플리케이션을 네이티브처럼 작동할 수 있도록 하기 위해 다음 몇 가지 유의 사항을
숙지해야 합니다.

### 기본 메뉴

macOS엔 `Services`나 `Windows`와 같은 많은 시스템 지정 기본 메뉴가 있습니다. 기본
메뉴를 만들려면 반드시 다음 리스트 중 한 가지를 선택하여 메뉴의 `role`로 지정해야
합니다. 그러면 Electron이 자동으로 인식하여 해당 메뉴를 기본 메뉴로 만듭니다:

* `window`
* `help`
* `services`

### 메뉴 아이템 기본 동작

macOS는 몇가지 메뉴 아이템에 대해 `About xxx`, `Hide xxx`, `Hide Others`와 같은
기본 동작을 제공하고 있습니다. 메뉴 아이템의 기본 동작을 지정하려면 반드시 메뉴
아이템의 `role` 속성을 지정해야 합니다.

### 메인 메뉴의 이름

macOS에선 지정한 애플리케이션 메뉴에 상관없이 메뉴의 첫번째 라벨은 언제나 애플리케이션의
이름이 됩니다. 애플리케이션 이름을 변경하려면 앱 번들내의 `Info.plist` 파일을 수정해야
합니다. 자세한 내용은 [About Information Property List Files][AboutInformationPropertyListFiles]
문서를 참고하세요.

## 지정한 브라우저 윈도우에 메뉴 설정 (*Linux* *Windows*)

브라우저 윈도우의 [`setMenu` 메서드][setMenu]는 어떤 브라우저 윈도우의 메뉴를 설정할
수 있습니다.

## 메뉴 아이템 위치

`Menu.buildFromTemplate`로 메뉴를 만들 때 `position`과 `id`를 사용해서 아이템의
위치를 지정할 수 있습니다.

`MenuItem`의 `position` 속성은 `[placement]=[id]`와 같은 형식을 가지며
`placement`는 `before`, `after`, `endof` 속성 중 한가지를 사용할 수 있고 `id`는
메뉴 아이템이 가지는 유일 ID 입니다:

* `before` - 이 아이템을 지정한 id 이전의 위치에 삽입합니다. 만약 참조된 아이템이
  없을 경우 메뉴의 맨 뒤에 삽입됩니다.
* `after` - 이 아이템을 지정한 id 다음의 위치에 삽입합니다. 만약 참조된 아이템이
  없을 경우 메뉴의 맨 뒤에 삽입됩니다.
* `endof` - 이 아이템을 id의 논리 그룹에 맞춰서 각 그룹의 항목 뒤에 삽입합니다.
  (그룹은 분리자 아이템에 의해 만들어집니다) 만약 참조된 아이템의 분리자 그룹이
  존재하지 않을 경우 지정된 id로 새로운 분리자 그룹을 만든 후 해당 그룹의 뒤에
  삽입됩니다.

위치를 지정한 아이템의 뒤에 위치가 지정되지 않은 아이템이 있을 경우 각 아이템의 위치가
지정되기 전까지 모든 아이템이 위치가 지정된 아이템의 뒤에 삽입됩니다. 따라서 위치를
이동하고 싶은 특정 그룹의 아이템들이 있을 경우 해당 그룹의 맨 첫번째 메뉴 아이템의
위치만을 지정하면 됩니다.

### 예시

메뉴 템플릿:

```javascript
[
  {label: '4', id: '4'},
  {label: '5', id: '5'},
  {label: '1', id: '1', position: 'before=4'},
  {label: '2', id: '2'},
  {label: '3', id: '3'}
]
```

메뉴:

```
- 1
- 2
- 3
- 4
- 5
```

메뉴 템플릿:

```javascript
[
  {label: 'a', position: 'endof=letters'},
  {label: '1', position: 'endof=numbers'},
  {label: 'b', position: 'endof=letters'},
  {label: '2', position: 'endof=numbers'},
  {label: 'c', position: 'endof=letters'},
  {label: '3', position: 'endof=numbers'}
]
```

메뉴:

```
- ---
- a
- b
- c
- ---
- 1
- 2
- 3
```

[AboutInformationPropertyListFiles]: https://developer.apple.com/library/ios/documentation/general/Reference/InfoPlistKeyReference/Articles/AboutInformationPropertyListFiles.html
[setMenu]: ./browser-window.md#winsetmenumenu-linux-windows
