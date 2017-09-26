// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_WINDOW_LIST_H_
#define ATOM_BROWSER_WINDOW_LIST_H_

#include <vector>

#include "base/lazy_instance.h"
#include "base/macros.h"
#include "base/observer_list.h"

namespace atom {

class NativeWindow;
class WindowListObserver;

class WindowList {
 public:
  typedef std::vector<NativeWindow*> WindowVector;

  static WindowVector GetWindows();
  static bool IsEmpty();

  // Adds or removes |window| from the list it is associated with.
  static void AddWindow(NativeWindow* window);
  static void RemoveWindow(NativeWindow* window);

  // Called by window when a close is cancelled by beforeunload handler.
  static void WindowCloseCancelled(NativeWindow* window);

  // Adds and removes |observer| from the observer list.
  static void AddObserver(WindowListObserver* observer);
  static void RemoveObserver(WindowListObserver* observer);

  // Closes all windows.
  static void CloseAllWindows();

  // Destroy all windows.
  static void DestroyAllWindows();

 private:
  static WindowList* GetInstance();

  WindowList();
  ~WindowList();

  // A vector of the windows in this list, in the order they were added.
  WindowVector windows_;

  // A list of observers which will be notified of every window addition and
  // removal across all WindowLists.
  static base::LazyInstance<base::ObserverList<WindowListObserver>>::Leaky
      observers_;

  static WindowList* instance_;

  DISALLOW_COPY_AND_ASSIGN(WindowList);
};

}  // namespace atom

#endif  // ATOM_BROWSER_WINDOW_LIST_H_
