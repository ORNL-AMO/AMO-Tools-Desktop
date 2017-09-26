// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/browser.h"
#include "atom/browser/native_window_views.h"
#include "content/public/browser/browser_accessibility_state.h"

namespace atom {

namespace {

// Convert Win32 WM_APPCOMMANDS to strings.
const char* AppCommandToString(int command_id) {
  switch (command_id) {
    case APPCOMMAND_BROWSER_BACKWARD       : return "browser-backward";
    case APPCOMMAND_BROWSER_FORWARD        : return "browser-forward";
    case APPCOMMAND_BROWSER_REFRESH        : return "browser-refresh";
    case APPCOMMAND_BROWSER_STOP           : return "browser-stop";
    case APPCOMMAND_BROWSER_SEARCH         : return "browser-search";
    case APPCOMMAND_BROWSER_FAVORITES      : return "browser-favorites";
    case APPCOMMAND_BROWSER_HOME           : return "browser-home";
    case APPCOMMAND_VOLUME_MUTE            : return "volume-mute";
    case APPCOMMAND_VOLUME_DOWN            : return "volume-down";
    case APPCOMMAND_VOLUME_UP              : return "volume-up";
    case APPCOMMAND_MEDIA_NEXTTRACK        : return "media-nexttrack";
    case APPCOMMAND_MEDIA_PREVIOUSTRACK    : return "media-previoustrack";
    case APPCOMMAND_MEDIA_STOP             : return "media-stop";
    case APPCOMMAND_MEDIA_PLAY_PAUSE       : return "media-play_pause";
    case APPCOMMAND_LAUNCH_MAIL            : return "launch-mail";
    case APPCOMMAND_LAUNCH_MEDIA_SELECT    : return "launch-media-select";
    case APPCOMMAND_LAUNCH_APP1            : return "launch-app1";
    case APPCOMMAND_LAUNCH_APP2            : return "launch-app2";
    case APPCOMMAND_BASS_DOWN              : return "bass-down";
    case APPCOMMAND_BASS_BOOST             : return "bass-boost";
    case APPCOMMAND_BASS_UP                : return "bass-up";
    case APPCOMMAND_TREBLE_DOWN            : return "treble-down";
    case APPCOMMAND_TREBLE_UP              : return "treble-up";
    case APPCOMMAND_MICROPHONE_VOLUME_MUTE : return "microphone-volume-mute";
    case APPCOMMAND_MICROPHONE_VOLUME_DOWN : return "microphone-volume-down";
    case APPCOMMAND_MICROPHONE_VOLUME_UP   : return "microphone-volume-up";
    case APPCOMMAND_HELP                   : return "help";
    case APPCOMMAND_FIND                   : return "find";
    case APPCOMMAND_NEW                    : return "new";
    case APPCOMMAND_OPEN                   : return "open";
    case APPCOMMAND_CLOSE                  : return "close";
    case APPCOMMAND_SAVE                   : return "save";
    case APPCOMMAND_PRINT                  : return "print";
    case APPCOMMAND_UNDO                   : return "undo";
    case APPCOMMAND_REDO                   : return "redo";
    case APPCOMMAND_COPY                   : return "copy";
    case APPCOMMAND_CUT                    : return "cut";
    case APPCOMMAND_PASTE                  : return "paste";
    case APPCOMMAND_REPLY_TO_MAIL          : return "reply-to-mail";
    case APPCOMMAND_FORWARD_MAIL           : return "forward-mail";
    case APPCOMMAND_SEND_MAIL              : return "send-mail";
    case APPCOMMAND_SPELL_CHECK            : return "spell-check";
    case APPCOMMAND_MIC_ON_OFF_TOGGLE      : return "mic-on-off-toggle";
    case APPCOMMAND_CORRECTION_LIST        : return "correction-list";
    case APPCOMMAND_MEDIA_PLAY             : return "media-play";
    case APPCOMMAND_MEDIA_PAUSE            : return "media-pause";
    case APPCOMMAND_MEDIA_RECORD           : return "media-record";
    case APPCOMMAND_MEDIA_FAST_FORWARD     : return "media-fast-forward";
    case APPCOMMAND_MEDIA_REWIND           : return "media-rewind";
    case APPCOMMAND_MEDIA_CHANNEL_UP       : return "media-channel-up";
    case APPCOMMAND_MEDIA_CHANNEL_DOWN     : return "media-channel-down";
    case APPCOMMAND_DELETE                 : return "delete";
    case APPCOMMAND_DICTATE_OR_COMMAND_CONTROL_TOGGLE:
      return "dictate-or-command-control-toggle";
    default:
      return "unknown";
  }
}

bool IsScreenReaderActive() {
  UINT screenReader = 0;
  SystemParametersInfo(SPI_GETSCREENREADER, 0, &screenReader, 0);
  return screenReader && UiaClientsAreListening();
}

}  // namespace

std::set<NativeWindowViews*> NativeWindowViews::forwarding_windows_;
HHOOK NativeWindowViews::mouse_hook_ = NULL;

bool NativeWindowViews::ExecuteWindowsCommand(int command_id) {
  std::string command = AppCommandToString(command_id);
  NotifyWindowExecuteWindowsCommand(command);
  return false;
}

bool NativeWindowViews::PreHandleMSG(
    UINT message, WPARAM w_param, LPARAM l_param, LRESULT* result) {
  NotifyWindowMessage(message, w_param, l_param);

  switch (message) {
    // Screen readers send WM_GETOBJECT in order to get the accessibility
    // object, so take this opportunity to push Chromium into accessible
    // mode if it isn't already, always say we didn't handle the message
    // because we still want Chromium to handle returning the actual
    // accessibility object.
    case WM_GETOBJECT: {
      if (checked_for_a11y_support_) return false;

      const DWORD obj_id = static_cast<DWORD>(l_param);

      if (obj_id != OBJID_CLIENT) {
        return false;
      }

      if (!IsScreenReaderActive()) {
        return false;
      }

      checked_for_a11y_support_ = true;

      const auto axState = content::BrowserAccessibilityState::GetInstance();
      if (axState && !axState->IsAccessibleBrowser()) {
        axState->OnScreenReaderDetected();
        Browser::Get()->OnAccessibilitySupportChanged();
      }

      return false;
    }
    case WM_COMMAND:
      // Handle thumbar button click message.
      if (HIWORD(w_param) == THBN_CLICKED)
        return taskbar_host_.HandleThumbarButtonEvent(LOWORD(w_param));
      return false;
    case WM_SIZE: {
      // Handle window state change.
      HandleSizeEvent(w_param, l_param);

      consecutive_moves_ = false;
      last_normal_bounds_before_move_ = last_normal_bounds_;

      return false;
    }
    case WM_MOVING: {
      if (!movable_)
        ::GetWindowRect(GetAcceleratedWidget(), (LPRECT)l_param);
      return false;
    }
    case WM_MOVE: {
      if (last_window_state_ == ui::SHOW_STATE_NORMAL) {
        if (consecutive_moves_)
          last_normal_bounds_ = last_normal_bounds_candidate_;
        last_normal_bounds_candidate_ = GetBounds();
        consecutive_moves_ = true;
      }
      return false;
    }
    case WM_ENDSESSION: {
      if (w_param) {
        NotifyWindowEndSession();
      }
      return false;
    }
    case WM_PARENTNOTIFY: {
      if (LOWORD(w_param) == WM_CREATE) {
        // Because of reasons regarding legacy drivers and stuff, a window that
        // matches the client area is created and used internally by Chromium.
        // This is used when forwarding mouse messages.
        legacy_window_ = reinterpret_cast<HWND>(l_param);
      }
      return false;
    }
    default:
      return false;
  }
}

void NativeWindowViews::HandleSizeEvent(WPARAM w_param, LPARAM l_param) {
  // Here we handle the WM_SIZE event in order to figure out what is the current
  // window state and notify the user accordingly.
  switch (w_param) {
    case SIZE_MAXIMIZED:
      last_window_state_ = ui::SHOW_STATE_MAXIMIZED;
      if (consecutive_moves_) {
        last_normal_bounds_ = last_normal_bounds_before_move_;
      }
      NotifyWindowMaximize();
      break;
    case SIZE_MINIMIZED:
      last_window_state_ = ui::SHOW_STATE_MINIMIZED;
      NotifyWindowMinimize();
      break;
    case SIZE_RESTORED:
      if (last_window_state_ == ui::SHOW_STATE_NORMAL) {
        // Window was resized so we save it's new size.
        last_normal_bounds_ = GetBounds();
        last_normal_bounds_before_move_ = last_normal_bounds_;
      } else {
        switch (last_window_state_) {
          case ui::SHOW_STATE_MAXIMIZED:
            last_window_state_ = ui::SHOW_STATE_NORMAL;

            // Don't force out last known bounds onto the window as Windows
            // actually gets these correct

            NotifyWindowUnmaximize();
            break;
          case ui::SHOW_STATE_MINIMIZED:
            if (IsFullscreen()) {
              last_window_state_ = ui::SHOW_STATE_FULLSCREEN;
              NotifyWindowEnterFullScreen();
            } else {
              last_window_state_ = ui::SHOW_STATE_NORMAL;

              // When the window is restored we resize it to the previous known
              // normal size.
              SetBounds(last_normal_bounds_, false);

              NotifyWindowRestore();
            }
            break;
        }
      }
      break;
  }
}

void NativeWindowViews::SetForwardMouseMessages(bool forward) {
  if (forward && !forwarding_mouse_messages_) {
    forwarding_mouse_messages_ = true;
    forwarding_windows_.insert(this);

    // Subclassing is used to fix some issues when forwarding mouse messages;
    // see comments in |SubclassProc|.
    SetWindowSubclass(
      legacy_window_, SubclassProc, 1, reinterpret_cast<DWORD_PTR>(this));

    if (!mouse_hook_) {
      mouse_hook_ = SetWindowsHookEx(WH_MOUSE_LL, MouseHookProc, NULL, 0);
    }
  } else if (!forward && forwarding_mouse_messages_) {
    forwarding_mouse_messages_ = false;
    forwarding_windows_.erase(this);

    RemoveWindowSubclass(legacy_window_, SubclassProc, 1);

    if (forwarding_windows_.size() == 0) {
      UnhookWindowsHookEx(mouse_hook_);
      mouse_hook_ = NULL;
    }
  }
}

LRESULT CALLBACK NativeWindowViews::SubclassProc(
    HWND hwnd, UINT msg, WPARAM w_param, LPARAM l_param, UINT_PTR subclass_id,
    DWORD_PTR ref_data) {
  NativeWindowViews* window = reinterpret_cast<NativeWindowViews*>(ref_data);
  switch (msg) {
    case WM_MOUSELEAVE: {
      // When input is forwarded to underlying windows, this message is posted.
      // If not handled, it interferes with Chromium logic, causing for example
      // mouseleave events to fire. If those events are used to exit forward
      // mode, excessive flickering on for example hover items in underlying
      // windows can occur due to rapidly entering and leaving forwarding mode.
      // By consuming and ignoring the message, we're essentially telling
      // Chromium that we have not left the window despite somebody else getting
      // the messages. As to why this is catched for the legacy window and not
      // the actual browser window is simply that the legacy window somehow
      // makes use of these events; posting to the main window didn't work.
      if (window->forwarding_mouse_messages_) {
        return 0;
      }
      break;
    }
  }

  return DefSubclassProc(hwnd, msg, w_param, l_param);
}

LRESULT CALLBACK NativeWindowViews::MouseHookProc(
    int n_code, WPARAM w_param, LPARAM l_param) {
  if (n_code < 0) {
    return CallNextHookEx(NULL, n_code, w_param, l_param);
  }

  // Post a WM_MOUSEMOVE message for those windows whose client area contains
  // the cursor since they are in a state where they would otherwise ignore all
  // mouse input.
  if (w_param == WM_MOUSEMOVE) {
    for (auto window : forwarding_windows_) {
      // At first I considered enumerating windows to check whether the cursor
      // was directly above the window, but since nothing bad seems to happen
      // if we post the message even if some other window occludes it I have
      // just left it as is.
      RECT client_rect;
      GetClientRect(window->legacy_window_, &client_rect);
      POINT p = reinterpret_cast<MSLLHOOKSTRUCT*>(l_param)->pt;
      ScreenToClient(window->legacy_window_, &p);
      if (PtInRect(&client_rect, p)) {
        WPARAM w = 0;  // No virtual keys pressed for our purposes
        LPARAM l = MAKELPARAM(p.x, p.y);
        PostMessage(window->legacy_window_, WM_MOUSEMOVE, w, l);
      }
    }
  }

  return CallNextHookEx(NULL, n_code, w_param, l_param);
}

}  // namespace atom
