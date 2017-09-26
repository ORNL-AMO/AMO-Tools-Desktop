// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_API_ATOM_API_MENU_MAC_H_
#define ATOM_BROWSER_API_ATOM_API_MENU_MAC_H_

#include "atom/browser/api/atom_api_menu.h"

#include <map>
#include <string>

#import "atom/browser/ui/cocoa/atom_menu_controller.h"

using base::scoped_nsobject;

namespace atom {

namespace api {

class MenuMac : public Menu {
 protected:
  MenuMac(v8::Isolate* isolate, v8::Local<v8::Object> wrapper);

  void PopupAt(
      Window* window, int x, int y, int positioning_item, bool async) override;
  void PopupOnUI(const base::WeakPtr<NativeWindow>& native_window,
                 int32_t window_id, int x, int y, int positioning_item,
                 bool async);
  void ClosePopupAt(int32_t window_id) override;

 private:
  friend class Menu;

  static void SendActionToFirstResponder(const std::string& action);

  scoped_nsobject<AtomMenuController> menu_controller_;

  // window ID -> open context menu
  std::map<int32_t, scoped_nsobject<AtomMenuController>> popup_controllers_;

  base::WeakPtrFactory<MenuMac> weak_factory_;

  DISALLOW_COPY_AND_ASSIGN(MenuMac);
};

}  // namespace api

}  // namespace atom

#endif  // ATOM_BROWSER_API_ATOM_API_MENU_MAC_H_
