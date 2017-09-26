# MenuItem

> 네이티브 애플리케이션 메뉴와 컨텍스트 메뉴에 아이템을 추가합니다.

프로세스: [메인](../tutorial/quick-start.md#main-process)

[`Menu`](menu.md)에서 예시를 확인할 수 있습니다.

## Class: MenuItem

`MenuItem` 인스턴스 객체에서 사용할 수 있는 메서드입니다:

### `new MenuItem(options)`

* `options` Object
  * `click` Function - 메뉴 아이템이 클릭될 때 `click(menuItem, browserWindow,
    event)` 형태로 호출 되는 콜백 함수.
    * `menuItem` MenuItem
    * `browserWindow` BrowserWindow
    * `event` Event
  * `role` String - 메뉴 아이템의 액션을 정의합니다. 이 속성을 지정하면 `click`
    속성이 무시됩니다.
  * `type` String - `MenuItem`의 타입 `normal`, `separator`, `submenu`,
    `checkbox` 또는 `radio`를 사용할 수 있습니다. 만약 값이 `Menu`가 아니면
    `Menu.buildFromTemplate`를 통해 자동으로 변환됩니다.
  * `label` String
  * `sublabel` String
  * `accelerator` [Accelerator](accelerator.md)
  * `icon` [NativeImage](native-image.md)
  * `enabled` Boolean - 만약 `false`로 설정되면, 메뉴 아이템이 회색으로 변하며
    클릭할 수 없게 됩니다.
  * `visible` Boolean - 만약 `false`로 설정되면, 메뉴 아이템이 완전히 숨겨집니다.
  * `checked` Boolean - 반드시 `checkbox` 또는 `radio` 타입의 메뉴 아이템에만
    지정해야 합니다.
  * `submenu` Menu - 반드시 `submenu` 타입의 메뉴 아이템에만 지정해야 합니다. 만약
    `submenu`가 지정되면 `type: 'submenu'`는 생략될 수 있습니다. 만약 값이 `Menu`가
    아닐 경우 `Menu.buildFromTemplate`을 통해 자동적으로 변환됩니다.     
  * `id` String - 현재 메뉴 아이템에 대해 유일키를 지정합니다. 이 키는 이후
    `position` 옵션에서 사용할 수 있습니다.
  * `position` String - 미리 지정한 `id`를 이용하여 메뉴 아이템의 위치를 세밀하게
    조정합니다.

어떠한 메뉴 아이템이 표준 롤에 일치한다면, `role`을 지정하는 것이 동작을 `click`
함수로 일일이 구현하려 시도하는 것 보다 더 좋을 수 있습니다. 빌트-인 `role` 동작은
더 좋은 네이티브 경험을 제공할 것입니다.

`role`을 사용하는 동안에는 `label`과 `accelerator`는 필수가 아니며 각 플랫폼에 대해
적합한 값이 기본값으로 사용됩니다.

`role` 속성은 다음 값을 가질 수 있습니다:

* `undo`
* `redo`
* `cut`
* `copy`
* `paste`
* `pasteandmatchstyle`
* `selectall`
* `delete`
* `minimize` - 현재 윈도우를 최소화합니다.
* `close` - 현재 윈도우를 닫습니다.
* `quit`- 애플리케이션을 닫습니다.
* `togglefullscreen` - 현재 윈도우에서 전체 화면 모드를 토글합니다.
* `resetzoom` - 포커스된 페이지의 줌 레벨을 기본 크기로 초기화합니다.
* `zoomin` - 포커스된 페이지를 10% 줌인합니다.
* `zoomout` - 포커스된 페이지를 10% 줌아웃합니다.

macOS에서의 `role`은 다음 값을 추가로 가질 수 있습니다:

* `about` - `orderFrontStandardAboutPanel` 액션에 대응
* `hide` - `hide` 액션에 대응
* `hideothers` - `hideOtherApplications` 액션에 대응
* `unhide` - `unhideAllApplications` 액션에 대응
* `startspeaking` - `startSpeaking` 액션에 대응
* `stopspeaking` - `stopSpeaking` 액션에 대응
* `front` - `arrangeInFront` 액션에 대응
* `zoom` - `performZoom` 액션에 대응
* `window` - 부 메뉴를 가지는 "Window" 메뉴
* `help` - 부 메뉴를 가지는 "Help" 메뉴
* `services` - 부 메뉴를 가지는 "Services" 메뉴

macOS에서는 `role`을 지정할 때, `label`과 `accelerator`만 MenuItem에 효과가
적용되도록 변경되며, 다른 옵션들은 모두 무시됩니다.

### Instance Properties

다음은 `MenuItem`의 인스턴스에서 사용할 수 있는 속성입니다:

#### `menuItem.enabled`

아이템이 활성화되어있는지 여부를 표시하는 Boolean 값입니다. 이 속성은 동적으로 변경될
수 있습니다.

#### `menuItem.visible`

아이템이 보여지고있는지 여부를 표시하는 Boolean 값입니다. 이 속성은 동적으로 변경될
수 있습니다.

#### `menuItem.checked`

아이템이 선택되어있는지 여부를 반환하는 Boolean 값입니다. 이 속성은 동적으로 변경될
수 있습니다.

`checkbox` 메뉴 아이템은 선택되면 `checked` 속성을 토글합니다.

`radio` 메뉴 아이템은 클릭되었을 때 `checked` 속성을 활성화 합니다. 그리고
같은 메뉴의 모든 인접한 아이템에 대한 속성이 꺼집니다.

추가적인 작업을 위해 `click` 함수를 추가할 수도 있습니다.
