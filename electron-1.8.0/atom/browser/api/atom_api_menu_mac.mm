// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#import "atom/browser/api/atom_api_menu_mac.h"

#include "atom/browser/native_window.h"
#include "atom/browser/unresponsive_suppressor.h"
#include "base/mac/scoped_sending_event.h"
#include "base/message_loop/message_loop.h"
#include "base/strings/sys_string_conversions.h"
#include "brightray/browser/inspectable_web_contents.h"
#include "brightray/browser/inspectable_web_contents_view.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/web_contents.h"

#include "atom/common/node_includes.h"

using content::BrowserThread;

namespace atom {

namespace api {

MenuMac::MenuMac(v8::Isolate* isolate, v8::Local<v8::Object> wrapper)
    : Menu(isolate, wrapper),
      weak_factory_(this) {
}

void MenuMac::PopupAt(
    Window* window, int x, int y, int positioning_item, bool async) {
  NativeWindow* native_window = window->window();
  if (!native_window)
    return;

  auto popup = base::Bind(&MenuMac::PopupOnUI, weak_factory_.GetWeakPtr(),
                          native_window->GetWeakPtr(), window->ID(), x, y,
                          positioning_item, async);
  if (async)
    BrowserThread::PostTask(BrowserThread::UI, FROM_HERE, popup);
  else
    popup.Run();
}

void MenuMac::PopupOnUI(const base::WeakPtr<NativeWindow>& native_window,
                        int32_t window_id, int x, int y, int positioning_item,
                        bool async) {
  if (!native_window)
    return;
  brightray::InspectableWebContents* web_contents =
      native_window->inspectable_web_contents();
  if (!web_contents)
    return;

  auto close_callback = base::Bind(&MenuMac::ClosePopupAt,
                                   weak_factory_.GetWeakPtr(), window_id);
  popup_controllers_[window_id] = base::scoped_nsobject<AtomMenuController>(
      [[AtomMenuController alloc] initWithModel:model()
                          useDefaultAccelerator:NO]);
  NSMenu* menu = [popup_controllers_[window_id] menu];
  NSView* view = web_contents->GetView()->GetNativeView();

  // Which menu item to show.
  NSMenuItem* item = nil;
  if (positioning_item < [menu numberOfItems] && positioning_item >= 0)
    item = [menu itemAtIndex:positioning_item];

  // (-1, -1) means showing on mouse location.
  NSPoint position;
  if (x == -1 || y == -1) {
    NSWindow* nswindow = native_window->GetNativeWindow();
    position = [view convertPoint:[nswindow mouseLocationOutsideOfEventStream]
                         fromView:nil];
  } else {
    position = NSMakePoint(x, [view frame].size.height - y);
  }

  // If no preferred item is specified, try to show all of the menu items.
  if (!positioning_item) {
    CGFloat windowBottom = CGRectGetMinY([view window].frame);
    CGFloat lowestMenuPoint = windowBottom + position.y - [menu size].height;
    CGFloat screenBottom = CGRectGetMinY([view window].screen.frame);
    CGFloat distanceFromBottom = lowestMenuPoint - screenBottom;
    if (distanceFromBottom < 0)
      position.y = position.y - distanceFromBottom + 4;
  }

  // Place the menu left of cursor if it is overflowing off right of screen.
  CGFloat windowLeft = CGRectGetMinX([view window].frame);
  CGFloat rightmostMenuPoint = windowLeft + position.x + [menu size].width;
  CGFloat screenRight = CGRectGetMaxX([view window].screen.frame);
  if (rightmostMenuPoint > screenRight)
    position.x = position.x - [menu size].width;


  if (async) {
    [popup_controllers_[window_id] setCloseCallback:close_callback];
    // Make sure events can be pumped while the menu is up.
    base::MessageLoop::ScopedNestableTaskAllower allow(
        base::MessageLoop::current());

    // One of the events that could be pumped is |window.close()|.
    // User-initiated event-tracking loops protect against this by
    // setting flags in -[CrApplication sendEvent:], but since
    // web-content menus are initiated by IPC message the setup has to
    // be done manually.
    base::mac::ScopedSendingEvent sendingEventScoper;

    // Don't emit unresponsive event when showing menu.
    atom::UnresponsiveSuppressor suppressor;
    [menu popUpMenuPositioningItem:item atLocation:position inView:view];
  } else {
    // Don't emit unresponsive event when showing menu.
    atom::UnresponsiveSuppressor suppressor;
    [menu popUpMenuPositioningItem:item atLocation:position inView:view];
    close_callback.Run();
  }
}

void MenuMac::ClosePopupAt(int32_t window_id) {
  popup_controllers_.erase(window_id);
}

// static
void Menu::SetApplicationMenu(Menu* base_menu) {
  MenuMac* menu = static_cast<MenuMac*>(base_menu);
  base::scoped_nsobject<AtomMenuController> menu_controller(
      [[AtomMenuController alloc] initWithModel:menu->model_.get()
                          useDefaultAccelerator:YES]);
  [NSApp setMainMenu:[menu_controller menu]];

  // Ensure the menu_controller_ is destroyed after main menu is set.
  menu_controller.swap(menu->menu_controller_);
}

// static
void Menu::SendActionToFirstResponder(const std::string& action) {
  SEL selector = NSSelectorFromString(base::SysUTF8ToNSString(action));
  [NSApp sendAction:selector to:nil from:[NSApp mainMenu]];
}

// static
mate::WrappableBase* Menu::New(mate::Arguments* args) {
  return new MenuMac(args->isolate(), args->GetThis());
}

}  // namespace api

}  // namespace atom
