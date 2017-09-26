// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/browser.h"

#include <stdlib.h>

#include "atom/browser/native_window.h"
#include "atom/browser/window_list.h"
#include "atom/common/atom_version.h"
#include "brightray/common/application_info.h"
#include "chrome/browser/ui/libgtkui/unity_service.h"

namespace atom {

void Browser::Focus() {
  // Focus on the first visible window.
  for (const auto& window : WindowList::GetWindows()) {
    if (window->IsVisible()) {
      window->Focus(true);
      break;
    }
  }
}

void Browser::AddRecentDocument(const base::FilePath& path) {
}

void Browser::ClearRecentDocuments() {
}

void Browser::SetAppUserModelID(const base::string16& name) {
}

bool Browser::RemoveAsDefaultProtocolClient(const std::string& protocol,
                                            mate::Arguments* args) {
  return false;
}

bool Browser::SetAsDefaultProtocolClient(const std::string& protocol,
                                         mate::Arguments* args) {
  return false;
}

bool Browser::IsDefaultProtocolClient(const std::string& protocol,
                                      mate::Arguments* args) {
  return false;
}

bool Browser::SetBadgeCount(int count) {
  if (IsUnityRunning()) {
    unity::SetDownloadCount(count);
    badge_count_ = count;
    return true;
  } else {
    return false;
  }
}

void Browser::SetLoginItemSettings(LoginItemSettings settings) {
}

Browser::LoginItemSettings Browser::GetLoginItemSettings(
    const LoginItemSettings& options) {
  return LoginItemSettings();
}

std::string Browser::GetExecutableFileVersion() const {
  return brightray::GetApplicationVersion();
}

std::string Browser::GetExecutableFileProductName() const {
  return brightray::GetApplicationName();
}

bool Browser::IsUnityRunning() {
  return unity::IsRunning();
}

}  // namespace atom
