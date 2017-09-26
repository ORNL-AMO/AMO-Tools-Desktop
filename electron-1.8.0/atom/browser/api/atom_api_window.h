// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_API_ATOM_API_WINDOW_H_
#define ATOM_BROWSER_API_ATOM_API_WINDOW_H_

#include <map>
#include <memory>
#include <string>
#include <vector>

#include "atom/browser/api/trackable_object.h"
#include "atom/browser/native_window.h"
#include "atom/browser/native_window_observer.h"
#include "atom/common/api/atom_api_native_image.h"
#include "atom/common/key_weak_map.h"
#include "native_mate/handle.h"
#include "native_mate/persistent_dictionary.h"
#include "ui/gfx/image/image.h"

class GURL;

namespace gfx {
class Rect;
}

namespace mate {
class Arguments;
class Dictionary;
}

namespace atom {

class NativeWindow;

namespace api {

class WebContents;

class Window : public mate::TrackableObject<Window>,
               public NativeWindowObserver {
 public:
  static mate::WrappableBase* New(mate::Arguments* args);

  static void BuildPrototype(v8::Isolate* isolate,
                             v8::Local<v8::FunctionTemplate> prototype);

  // Returns the BrowserWindow object from |native_window|.
  static v8::Local<v8::Value> From(v8::Isolate* isolate,
                                   NativeWindow* native_window);

  NativeWindow* window() const { return window_.get(); }

  int32_t ID() const;

 protected:
  Window(v8::Isolate* isolate, v8::Local<v8::Object> wrapper,
         const mate::Dictionary& options);
  ~Window() override;

  // NativeWindowObserver:
  void WillCloseWindow(bool* prevent_default) override;
  void WillDestroyNativeObject() override;
  void OnWindowClosed() override;
  void OnWindowEndSession() override;
  void OnWindowBlur() override;
  void OnWindowFocus() override;
  void OnWindowShow() override;
  void OnWindowHide() override;
  void OnReadyToShow() override;
  void OnWindowMaximize() override;
  void OnWindowUnmaximize() override;
  void OnWindowMinimize() override;
  void OnWindowRestore() override;
  void OnWindowResize() override;
  void OnWindowMove() override;
  void OnWindowMoved() override;
  void OnWindowScrollTouchBegin() override;
  void OnWindowScrollTouchEnd() override;
  void OnWindowScrollTouchEdge() override;
  void OnWindowSwipe(const std::string& direction) override;
  void OnWindowSheetBegin() override;
  void OnWindowSheetEnd() override;
  void OnWindowEnterFullScreen() override;
  void OnWindowLeaveFullScreen() override;
  void OnWindowEnterHtmlFullScreen() override;
  void OnWindowLeaveHtmlFullScreen() override;
  void OnRendererUnresponsive() override;
  void OnRendererResponsive() override;
  void OnExecuteWindowsCommand(const std::string& command_name) override;
  void OnTouchBarItemResult(const std::string& item_id,
                            const base::DictionaryValue& details) override;
  void OnNewWindowForTab() override;

  #if defined(OS_WIN)
  void OnWindowMessage(UINT message, WPARAM w_param, LPARAM l_param) override;
  #endif

 private:
  void Init(v8::Isolate* isolate,
            v8::Local<v8::Object> wrapper,
            const mate::Dictionary& options,
            mate::Handle<class WebContents> web_contents);
  // APIs for NativeWindow.
  void Close();
  void Focus();
  void Blur();
  bool IsFocused();
  void Show();
  void ShowInactive();
  void Hide();
  bool IsVisible();
  bool IsEnabled();
  void Maximize();
  void Unmaximize();
  bool IsMaximized();
  void Minimize();
  void Restore();
  bool IsMinimized();
  void SetFullScreen(bool fullscreen);
  bool IsFullscreen();
  void SetBounds(const gfx::Rect& bounds, mate::Arguments* args);
  gfx::Rect GetBounds();
  void SetSize(int width, int height, mate::Arguments* args);
  std::vector<int> GetSize();
  void SetContentSize(int width, int height, mate::Arguments* args);
  std::vector<int> GetContentSize();
  void SetContentBounds(const gfx::Rect& bounds, mate::Arguments* args);
  gfx::Rect GetContentBounds();
  void SetMinimumSize(int width, int height);
  std::vector<int> GetMinimumSize();
  void SetMaximumSize(int width, int height);
  std::vector<int> GetMaximumSize();
  void SetSheetOffset(double offsetY, mate::Arguments* args);
  void SetResizable(bool resizable);
  bool IsResizable();
  void SetMovable(bool movable);
  bool IsMovable();
  void SetMinimizable(bool minimizable);
  bool IsMinimizable();
  void SetMaximizable(bool maximizable);
  bool IsMaximizable();
  void SetFullScreenable(bool fullscreenable);
  bool IsFullScreenable();
  void SetClosable(bool closable);
  bool IsClosable();
  void SetAlwaysOnTop(bool top, mate::Arguments* args);
  bool IsAlwaysOnTop();
  void Center();
  void SetPosition(int x, int y, mate::Arguments* args);
  std::vector<int> GetPosition();
  void SetTitle(const std::string& title);
  std::string GetTitle();
  void FlashFrame(bool flash);
  void SetSkipTaskbar(bool skip);
  void SetKiosk(bool kiosk);
  bool IsKiosk();
  void SetBackgroundColor(const std::string& color_name);
  void SetHasShadow(bool has_shadow);
  bool HasShadow();
  void FocusOnWebView();
  void BlurWebView();
  bool IsWebViewFocused();
  void SetRepresentedFilename(const std::string& filename);
  std::string GetRepresentedFilename();
  void SetDocumentEdited(bool edited);
  bool IsDocumentEdited();
  void SetIgnoreMouseEvents(bool ignore, mate::Arguments* args);
  void SetContentProtection(bool enable);
  void SetFocusable(bool focusable);
  void SetProgressBar(double progress, mate::Arguments* args);
  void SetOverlayIcon(const gfx::Image& overlay,
                      const std::string& description);
  bool SetThumbarButtons(mate::Arguments* args);
  void SetMenu(v8::Isolate* isolate, v8::Local<v8::Value> menu);
  void SetAutoHideMenuBar(bool auto_hide);
  bool IsMenuBarAutoHide();
  void SetMenuBarVisibility(bool visible);
  bool IsMenuBarVisible();
  void SetAspectRatio(double aspect_ratio, mate::Arguments* args);
  void PreviewFile(const std::string& path, mate::Arguments* args);
  void CloseFilePreview();
  void SetParentWindow(v8::Local<v8::Value> value, mate::Arguments* args);
  v8::Local<v8::Value> GetParentWindow() const;
  std::vector<v8::Local<v8::Object>> GetChildWindows() const;
  v8::Local<v8::Value> GetBrowserView() const;
  void SetBrowserView(v8::Local<v8::Value> value);
  void ResetBrowserView();
  bool IsModal() const;
  v8::Local<v8::Value> GetNativeWindowHandle();

#if defined(OS_WIN)
  typedef base::Callback<void(v8::Local<v8::Value>,
                              v8::Local<v8::Value>)> MessageCallback;

  bool HookWindowMessage(UINT message, const MessageCallback& callback);
  bool IsWindowMessageHooked(UINT message);
  void UnhookWindowMessage(UINT message);
  void UnhookAllWindowMessages();
  bool SetThumbnailClip(const gfx::Rect& region);
  bool SetThumbnailToolTip(const std::string& tooltip);
  void SetAppDetails(const mate::Dictionary& options);
#endif

#if defined(TOOLKIT_VIEWS)
  void SetIcon(mate::Handle<NativeImage> icon);
#endif

  void SetVisibleOnAllWorkspaces(bool visible);
  bool IsVisibleOnAllWorkspaces();

  void SetAutoHideCursor(bool auto_hide);

  void SetVibrancy(mate::Arguments* args);
  void SetTouchBar(const std::vector<mate::PersistentDictionary>& items);
  void RefreshTouchBarItem(const std::string& item_id);
  void SetEscapeTouchBarItem(const mate::PersistentDictionary& item);

  v8::Local<v8::Value> WebContents(v8::Isolate* isolate);

  // Remove this window from parent window's |child_windows_|.
  void RemoveFromParentChildWindows();

#if defined(OS_WIN)
  typedef std::map<UINT, MessageCallback> MessageCallbackMap;
  MessageCallbackMap messages_callback_map_;
#endif

  v8::Global<v8::Value> browser_view_;
  v8::Global<v8::Value> web_contents_;
  v8::Global<v8::Value> menu_;
  v8::Global<v8::Value> parent_window_;
  KeyWeakMap<int> child_windows_;

  api::WebContents* api_web_contents_;

  std::unique_ptr<NativeWindow> window_;

  DISALLOW_COPY_AND_ASSIGN(Window);
};

}  // namespace api

}  // namespace atom


namespace mate {

template<>
struct Converter<atom::NativeWindow*> {
  static bool FromV8(v8::Isolate* isolate, v8::Local<v8::Value> val,
                     atom::NativeWindow** out) {
    // null would be tranfered to NULL.
    if (val->IsNull()) {
      *out = NULL;
      return true;
    }

    atom::api::Window* window;
    if (!Converter<atom::api::Window*>::FromV8(isolate, val, &window))
      return false;
    *out = window->window();
    return true;
  }
};

}  // namespace mate

#endif  // ATOM_BROWSER_API_ATOM_API_WINDOW_H_
