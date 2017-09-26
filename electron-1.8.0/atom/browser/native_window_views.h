// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_NATIVE_WINDOW_VIEWS_H_
#define ATOM_BROWSER_NATIVE_WINDOW_VIEWS_H_

#include "atom/browser/native_window.h"

#include <set>
#include <string>
#include <vector>

#include "atom/browser/ui/accelerator_util.h"
#include "atom/browser/ui/autofill_popup.h"
#include "ui/views/widget/widget_delegate.h"
#include "ui/views/widget/widget_observer.h"

#if defined(OS_WIN)
#include "atom/browser/ui/win/message_handler_delegate.h"
#include "atom/browser/ui/win/taskbar_host.h"
#include "base/win/scoped_gdi_object.h"
#include "ui/base/win/accessibility_misc_utils.h"
#include <UIAutomationCoreApi.h>
#endif

namespace views {
class UnhandledKeyboardEventHandler;
}

namespace atom {

class GlobalMenuBarX11;
class MenuBar;
class WindowStateWatcher;

#if defined(OS_WIN)
class AtomDesktopWindowTreeHostWin;
#elif defined(USE_X11)
class EventDisabler;
#endif

class NativeWindowViews : public NativeWindow,
#if defined(OS_WIN)
                          public MessageHandlerDelegate,
#endif
                          public views::WidgetDelegateView,
                          public views::WidgetObserver {
 public:
  NativeWindowViews(brightray::InspectableWebContents* inspectable_web_contents,
                    const mate::Dictionary& options,
                    NativeWindow* parent);
  ~NativeWindowViews() override;

  // NativeWindow:
  void Close() override;
  void CloseImmediately() override;
  void Focus(bool focus) override;
  bool IsFocused() override;
  void Show() override;
  void ShowInactive() override;
  void Hide() override;
  bool IsVisible() override;
  bool IsEnabled() override;
  void Maximize() override;
  void Unmaximize() override;
  bool IsMaximized() override;
  void Minimize() override;
  void Restore() override;
  bool IsMinimized() override;
  void SetFullScreen(bool fullscreen) override;
  bool IsFullscreen() const override;
  void SetBounds(const gfx::Rect& bounds, bool animate) override;
  gfx::Rect GetBounds() override;
  gfx::Rect GetContentBounds() override;
  gfx::Size GetContentSize() override;
  void SetContentSizeConstraints(
      const extensions::SizeConstraints& size_constraints) override;
  void SetResizable(bool resizable) override;
  bool IsResizable() override;
  void SetMovable(bool movable) override;
  bool IsMovable() override;
  void SetMinimizable(bool minimizable) override;
  bool IsMinimizable() override;
  void SetMaximizable(bool maximizable) override;
  bool IsMaximizable() override;
  void SetFullScreenable(bool fullscreenable) override;
  bool IsFullScreenable() override;
  void SetClosable(bool closable) override;
  bool IsClosable() override;
  void SetAlwaysOnTop(bool top, const std::string& level,
                      int relativeLevel, std::string* error) override;
  bool IsAlwaysOnTop() override;
  void Center() override;
  void Invalidate() override;
  void SetTitle(const std::string& title) override;
  std::string GetTitle() override;
  void FlashFrame(bool flash) override;
  void SetSkipTaskbar(bool skip) override;
  void SetKiosk(bool kiosk) override;
  bool IsKiosk() override;
  void SetBackgroundColor(const std::string& color_name) override;
  void SetHasShadow(bool has_shadow) override;
  bool HasShadow() override;
  void SetIgnoreMouseEvents(bool ignore, bool forward) override;
  void SetContentProtection(bool enable) override;
  void SetFocusable(bool focusable) override;
  void SetMenu(AtomMenuModel* menu_model) override;
  void SetBrowserView(NativeBrowserView* browser_view) override;
  void SetParentWindow(NativeWindow* parent) override;
  gfx::NativeView GetNativeView() const override;
  gfx::NativeWindow GetNativeWindow() const override;
  void SetOverlayIcon(const gfx::Image& overlay,
                      const std::string& description) override;
  void SetProgressBar(double progress, const ProgressState state) override;
  void SetAutoHideMenuBar(bool auto_hide) override;
  bool IsMenuBarAutoHide() override;
  void SetMenuBarVisibility(bool visible) override;
  bool IsMenuBarVisible() override;
  void SetVisibleOnAllWorkspaces(bool visible) override;
  bool IsVisibleOnAllWorkspaces() override;

  gfx::AcceleratedWidget GetAcceleratedWidget() const override;

#if defined(OS_WIN)
  void SetIcon(HICON small_icon, HICON app_icon);
#elif defined(USE_X11)
  void SetIcon(const gfx::ImageSkia& icon);
#endif

  void SetEnabled(bool enable);

  views::Widget* widget() const { return window_.get(); }

#if defined(OS_WIN)
  TaskbarHost& taskbar_host() { return taskbar_host_; }
#endif

 private:
  // views::WidgetObserver:
  void OnWidgetActivationChanged(
      views::Widget* widget, bool active) override;
  void OnWidgetBoundsChanged(
      views::Widget* widget, const gfx::Rect& bounds) override;

  // views::WidgetDelegate:
  void DeleteDelegate() override;
  views::View* GetInitiallyFocusedView() override;
  bool CanResize() const override;
  bool CanMaximize() const override;
  bool CanMinimize() const override;
  base::string16 GetWindowTitle() const override;
  bool ShouldHandleSystemCommands() const override;
  views::Widget* GetWidget() override;
  const views::Widget* GetWidget() const override;
  views::View* GetContentsView() override;
  bool ShouldDescendIntoChildForEventHandling(
     gfx::NativeView child,
     const gfx::Point& location) override;
  views::ClientView* CreateClientView(views::Widget* widget) override;
  views::NonClientFrameView* CreateNonClientFrameView(
      views::Widget* widget) override;
  void OnWidgetMove() override;
#if defined(OS_WIN)
  bool ExecuteWindowsCommand(int command_id) override;
#endif

#if defined(OS_WIN)
  // MessageHandlerDelegate:
  bool PreHandleMSG(
      UINT message, WPARAM w_param, LPARAM l_param, LRESULT* result) override;
  void HandleSizeEvent(WPARAM w_param, LPARAM l_param);
  void SetForwardMouseMessages(bool forward);
  static LRESULT CALLBACK SubclassProc(
      HWND hwnd, UINT msg, WPARAM w_param, LPARAM l_param, UINT_PTR subclass_id,
      DWORD_PTR ref_data);
  static LRESULT CALLBACK MouseHookProc(
      int n_code, WPARAM w_param, LPARAM l_param);
#endif

  // NativeWindow:
  gfx::Rect ContentBoundsToWindowBounds(const gfx::Rect& bounds) const override;
  gfx::Rect WindowBoundsToContentBounds(const gfx::Rect& bounds) const override;
  void HandleKeyboardEvent(
      content::WebContents*,
      const content::NativeWebKeyboardEvent& event) override;
  void ShowAutofillPopup(
    content::RenderFrameHost* frame_host,
    const gfx::RectF& bounds,
    const std::vector<base::string16>& values,
    const std::vector<base::string16>& labels) override;
  void HideAutofillPopup(content::RenderFrameHost* frame_host) override;

  // views::View:
  void Layout() override;
  gfx::Size GetMinimumSize() const override;
  gfx::Size GetMaximumSize() const override;
  bool AcceleratorPressed(const ui::Accelerator& accelerator) override;

  // Register accelerators supported by the menu model.
  void RegisterAccelerators(AtomMenuModel* menu_model);

  // Returns the restore state for the window.
  ui::WindowShowState GetRestoredState();

  std::unique_ptr<views::Widget> window_;
  views::View* web_view_;  // Managed by inspectable_web_contents_.

  NativeBrowserView* browser_view_;

  std::unique_ptr<AutofillPopup> autofill_popup_;

  std::unique_ptr<MenuBar> menu_bar_;
  bool menu_bar_autohide_;
  bool menu_bar_visible_;
  bool menu_bar_alt_pressed_;

#if defined(USE_X11)
  std::unique_ptr<GlobalMenuBarX11> global_menu_bar_;

  // Handles window state events.
  std::unique_ptr<WindowStateWatcher> window_state_watcher_;

  // To disable the mouse events.
  std::unique_ptr<EventDisabler> event_disabler_;

  // The "resizable" flag on Linux is implemented by setting size constraints,
  // we need to make sure size constraints are restored when window becomes
  // resizable again.
  extensions::SizeConstraints old_size_constraints_;
#elif defined(OS_WIN)
  // Weak ref.
  AtomDesktopWindowTreeHostWin* atom_desktop_window_tree_host_win_;

  ui::WindowShowState last_window_state_;

  // There's an issue with restore on Windows, that sometimes causes the Window
  // to receive the wrong size (#2498). To circumvent that, we keep tabs on the
  // size of the window while in the normal state (not maximized, minimized or
  // fullscreen), so we restore it correctly.
  gfx::Rect last_normal_bounds_;
  gfx::Rect last_normal_bounds_before_move_;

  // last_normal_bounds_ may or may not require update on WM_MOVE. When a
  // window is maximized, it is moved (WM_MOVE) to maximum size first and then
  // sized (WM_SIZE). In this case, last_normal_bounds_ should not update. We
  // keep last_normal_bounds_candidate_ as a candidate which will become valid
  // last_normal_bounds_ if the moves are consecutive with no WM_SIZE event in
  // between.
  gfx::Rect last_normal_bounds_candidate_;

  bool consecutive_moves_;

  // In charge of running taskbar related APIs.
  TaskbarHost taskbar_host_;

  // Memoized version of a11y check
  bool checked_for_a11y_support_;

  // Whether to show the WS_THICKFRAME style.
  bool thick_frame_;

  // The bounds of window before maximize/fullscreen.
  gfx::Rect restore_bounds_;

  // The icons of window and taskbar.
  base::win::ScopedHICON window_icon_;
  base::win::ScopedHICON app_icon_;

  // The set of windows currently forwarding mouse messages.
  static std::set<NativeWindowViews*> forwarding_windows_;
  static HHOOK mouse_hook_;
  bool forwarding_mouse_messages_ = false;
  HWND legacy_window_ = NULL;
#endif

  // Handles unhandled keyboard messages coming back from the renderer process.
  std::unique_ptr<views::UnhandledKeyboardEventHandler> keyboard_event_handler_;

  // Map from accelerator to menu item's command id.
  accelerator_util::AcceleratorTable accelerator_table_;

  // How many times the Disable has been called.
  int disable_count_;

  bool use_content_size_;
  bool movable_;
  bool resizable_;
  bool maximizable_;
  bool minimizable_;
  bool fullscreenable_;
  std::string title_;
  gfx::Size widget_size_;

  DISALLOW_COPY_AND_ASSIGN(NativeWindowViews);
};

}  // namespace atom

#endif  // ATOM_BROWSER_NATIVE_WINDOW_VIEWS_H_
