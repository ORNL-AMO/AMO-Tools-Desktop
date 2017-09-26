# Pepper 플래시 플러그인 사용하기

Electron은 Pepper 플래시 플러그인을 지원합니다. Electron에서 Pepper 플래시
플러그인을 사용하려면 Pepper 플래시 플러그인의 위치를 지정한 후 애플리케이션 내에서
활성화 시켜야 합니다.

## 플래시 플러그인 준비하기

크롬 브라우저의 `chrome://plugins` 페이지에 접속한 후 `세부정보`에서 플래시
플러그인의 위치와 버전을 찾을 수 있습니다. Electron에서 플래시 플러그인을 지원하기
위해선 이 두 가지를 복사해 와야 합니다.

## Electron 스위치 추가

플러그인을 사용하려면 Electron 커맨드 라인에 `--ppapi-flash-path` 와
`--ppapi-flash-version` 플래그를 `app`의 `ready` 이벤트가 발생하기 전에 추가해야
합니다. 그리고 `browser-window`에 `plugins` 옵션을 활성화해야 합니다.

예를 들면:

```javascript
// 플래시 플러그인의 위치를 설정합니다. main.js와 위치가 같다고 가정할 때:
let pluginName
switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll'
    break
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'libpepflashplayer.so'
    break
}

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))

// 선택적인으로 플래시 플레이어의 버전을 설정합니다. 예시로는, v17.0.0.169
app.commandLine.appendSwitch('ppapi-flash-version', '17.0.0.169')

app.on('ready', () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      plugins: true
    }
  })
  win.loadURL(`file://${__dirname}/index.html`)
  // 이외의 코드
})
```

직접 플러그인을 삽입하는 대신 시스템의 Pepper Flash 플러그인을 사용할 수도 있습니다.
시스템상의 플러그인의 경로는 `app.getPath('pepperFlashSystemPlugin')`로 불러올 수
있습니다.

## `<webview>` 태그를 이용하여 플러그인을 활성화

`plugins` 속성을 `<webview>` 태그에 추가합니다.

```html
<webview src="http://www.adobe.com/software/flash/about/" plugins></webview>
```

## 문제 해결

개발자 도구의 콘솔에서 `navigator.plugins`를 탐색하면 Pepper 플래시 플러그인이 잘
로드되었는지를 확인할 수 있습니다. (물론 플러그인의 경로를 잘 설정하지 않으면 확인할
수 없습니다)

Pepper 플래시 플러그인의 구조는 Electron과 일치해야 합니다. Windows에서 자주
발생하는 문제는 32비트 버전의 플래시 플레이어를 64비트 버전의 Electron에서 사용하는
것입니다.

Windows에선 `--ppapi-flash-path`로 전달되는 경로의 분리자로 `\`를 사용해야 합니다.
POSIX-스타일 경로는 작동하지 않을 것입니다.

RTMP 를 사용한 미디어 스트리밍같은 일부 작업의 경우 플레이어의 `.swf` 파일에
폭넓은 권한을 부여할 필요가 있습니다. 그러기 위한 한가지 방법은,
[nw-flash-trust](https://github.com/szwacz/nw-flash-trust)를 사용하는 것입니다.
