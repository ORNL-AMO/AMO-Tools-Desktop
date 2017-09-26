// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/ui/win/taskbar_host.h"

#include <string>

#include "atom/browser/native_window.h"
#include "base/stl_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/win/scoped_gdi_object.h"
#include "third_party/skia/include/core/SkBitmap.h"
#include "ui/display/win/screen_win.h"
#include "ui/gfx/icon_util.h"

namespace atom {

namespace {

// From MSDN: https://msdn.microsoft.com/en-us/library/windows/desktop/dd378460(v=vs.85).aspx#thumbbars
// The thumbnail toolbar has a maximum of seven buttons due to the limited room.
const size_t kMaxButtonsCount = 7;

// The base id of Thumbar button.
const int kButtonIdBase = 40001;

bool GetThumbarButtonFlags(const std::vector<std::string>& flags,
                           THUMBBUTTONFLAGS* out) {
  THUMBBUTTONFLAGS result = THBF_ENABLED;  // THBF_ENABLED == 0
  for (const auto& flag : flags) {
    if (flag == "disabled")
      result |= THBF_DISABLED;
    else if (flag == "dismissonclick")
      result |= THBF_DISMISSONCLICK;
    else if (flag == "nobackground")
      result |= THBF_NOBACKGROUND;
    else if (flag == "hidden")
      result |= THBF_HIDDEN;
    else if (flag == "noninteractive")
      result |= THBF_NONINTERACTIVE;
    else
      return false;
  }
  *out = result;
  return true;
}

}  // namespace

TaskbarHost::TaskbarHost() : thumbar_buttons_added_(false) {
}

TaskbarHost::~TaskbarHost() {
}

bool TaskbarHost::SetThumbarButtons(
    HWND window, const std::vector<ThumbarButton>& buttons) {
  if (buttons.size() > kMaxButtonsCount || !InitializeTaskbar())
    return false;

  callback_map_.clear();

  // The number of buttons in thumbar can not be changed once it is created,
  // so we have to claim kMaxButtonsCount buttons initialy in case users add
  // more buttons later.
  base::win::ScopedHICON icons[kMaxButtonsCount] = {};
  THUMBBUTTON thumb_buttons[kMaxButtonsCount] = {};

  for (size_t i = 0; i < kMaxButtonsCount; ++i) {
    THUMBBUTTON& thumb_button = thumb_buttons[i];

    // Set ID.
    thumb_button.iId = kButtonIdBase + i;
    thumb_button.dwMask = THB_FLAGS;

    if (i >= buttons.size()) {
      // This button is used to occupy the place in toolbar, and it does not
      // show.
      thumb_button.dwFlags = THBF_HIDDEN;
      continue;
    }

    // This button is user's button.
    const ThumbarButton& button = buttons[i];

    // Generate flags.
    thumb_button.dwFlags = THBF_ENABLED;
    if (!GetThumbarButtonFlags(button.flags, &thumb_button.dwFlags))
      return false;

    // Set icon.
    if (!button.icon.IsEmpty()) {
      thumb_button.dwMask |= THB_ICON;
      icons[i] = IconUtil::CreateHICONFromSkBitmap(button.icon.AsBitmap());
      thumb_button.hIcon = icons[i].get();
    }

    // Set tooltip.
    if (!button.tooltip.empty()) {
      thumb_button.dwMask |= THB_TOOLTIP;
      wcsncpy_s(thumb_button.szTip, base::UTF8ToUTF16(button.tooltip).c_str(),
                _TRUNCATE);
    }

    // Save callback.
    callback_map_[thumb_button.iId] = button.clicked_callback;
  }

  // Finally add them to taskbar.
  HRESULT r;
  if (thumbar_buttons_added_)
    r = taskbar_->ThumbBarUpdateButtons(window, kMaxButtonsCount,
                                        thumb_buttons);
  else
    r = taskbar_->ThumbBarAddButtons(window, kMaxButtonsCount, thumb_buttons);

  thumbar_buttons_added_ = true;
  last_buttons_ = buttons;
  return SUCCEEDED(r);
}

void TaskbarHost::RestoreThumbarButtons(HWND window) {
  if (thumbar_buttons_added_) {
    thumbar_buttons_added_ = false;
    SetThumbarButtons(window, last_buttons_);
  }
}

bool TaskbarHost::SetProgressBar(
    HWND window, double value, const NativeWindow::ProgressState state) {
  if (!InitializeTaskbar())
    return false;

  bool success;
  if (value > 1.0 || state == NativeWindow::PROGRESS_INDETERMINATE) {
    success = SUCCEEDED(taskbar_->SetProgressState(window, TBPF_INDETERMINATE));
  } else if (value < 0 || state == NativeWindow::PROGRESS_NONE) {
    success = SUCCEEDED(taskbar_->SetProgressState(window, TBPF_NOPROGRESS));
  } else {
    // Unless SetProgressState set a blocking state (TBPF_ERROR, TBPF_PAUSED)
    // for the window, a call to SetProgressValue assumes the TBPF_NORMAL
    // state even if it is not explicitly set.
    // SetProgressValue overrides and clears the TBPF_INDETERMINATE state.
    if (state == NativeWindow::PROGRESS_ERROR) {
      success = SUCCEEDED(taskbar_->SetProgressState(window, TBPF_ERROR));
    } else if (state == NativeWindow::PROGRESS_PAUSED) {
      success = SUCCEEDED(taskbar_->SetProgressState(window, TBPF_PAUSED));
    } else {
      success = SUCCEEDED(taskbar_->SetProgressState(window, TBPF_NORMAL));
    }

    if (success) {
      int val = static_cast<int>(value * 100);
      success = SUCCEEDED(taskbar_->SetProgressValue(window, val, 100));
    }
  }

  return success;
}

bool TaskbarHost::SetOverlayIcon(
    HWND window, const gfx::Image& overlay, const std::string& text) {
  if (!InitializeTaskbar())
    return false;

  base::win::ScopedHICON icon(
      IconUtil::CreateHICONFromSkBitmap(overlay.AsBitmap()));
  return SUCCEEDED(taskbar_->SetOverlayIcon(
      window, icon.get(), base::UTF8ToUTF16(text).c_str()));
}

bool TaskbarHost::SetThumbnailClip(HWND window, const gfx::Rect& region) {
  if (!InitializeTaskbar())
    return false;

  if (region.IsEmpty()) {
    return SUCCEEDED(taskbar_->SetThumbnailClip(window, NULL));
  } else {
    RECT rect = display::win::ScreenWin::DIPToScreenRect(window, region)
        .ToRECT();
    return SUCCEEDED(taskbar_->SetThumbnailClip(window, &rect));
  }
}

bool TaskbarHost::SetThumbnailToolTip(
    HWND window, const std::string& tooltip) {
  if (!InitializeTaskbar())
    return false;

  return SUCCEEDED(taskbar_->SetThumbnailTooltip(
      window, base::UTF8ToUTF16(tooltip).c_str()));
}

bool TaskbarHost::HandleThumbarButtonEvent(int button_id) {
  if (ContainsKey(callback_map_, button_id)) {
    auto callback = callback_map_[button_id];
    if (!callback.is_null())
      callback.Run();
    return true;
  }
  return false;
}

bool TaskbarHost::InitializeTaskbar() {
  if (FAILED(taskbar_.CreateInstance(CLSID_TaskbarList,
                                     nullptr,
                                     CLSCTX_INPROC_SERVER)) ||
      FAILED(taskbar_->HrInit())) {
    return false;
  } else {
    return true;
  }
}

}  // namespace atom
