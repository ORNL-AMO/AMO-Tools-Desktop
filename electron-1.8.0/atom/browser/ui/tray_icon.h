// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_UI_TRAY_ICON_H_
#define ATOM_BROWSER_UI_TRAY_ICON_H_

#include <string>
#include <vector>

#include "atom/browser/ui/atom_menu_model.h"
#include "atom/browser/ui/tray_icon_observer.h"
#include "base/observer_list.h"
#include "ui/gfx/geometry/rect.h"

namespace atom {

class TrayIcon {
 public:
  static TrayIcon* Create();

#if defined(OS_WIN)
  using ImageType = HICON;
#else
  using ImageType = const gfx::Image&;
#endif

  virtual ~TrayIcon();

  // Sets the image associated with this status icon.
  virtual void SetImage(ImageType image) = 0;

  // Sets the image associated with this status icon when pressed.
  virtual void SetPressedImage(ImageType image);

  // Sets the hover text for this status icon. This is also used as the label
  // for the menu item which is created as a replacement for the status icon
  // click action on platforms that do not support custom click actions for the
  // status icon (e.g. Ubuntu Unity).
  virtual void SetToolTip(const std::string& tool_tip) = 0;

  // Sets the title displayed aside of the status icon in the status bar. This
  // only works on macOS.
  virtual void SetTitle(const std::string& title);

  // Sets the status icon highlight mode. This only works on macOS.
  enum HighlightMode {
    ALWAYS,  // Always highlight the tray icon
    NEVER,  // Never highlight the tray icon
    SELECTION  // Highlight the tray icon when clicked or the menu is opened
  };
  virtual void SetHighlightMode(HighlightMode mode);

  // Displays a notification balloon with the specified contents.
  // Depending on the platform it might not appear by the icon tray.
  virtual void DisplayBalloon(ImageType icon,
                              const base::string16& title,
                              const base::string16& contents);

  // Popups the menu.
  virtual void PopUpContextMenu(const gfx::Point& pos,
                                AtomMenuModel* menu_model);

  // Set the context menu for this icon.
  virtual void SetContextMenu(AtomMenuModel* menu_model) = 0;

  // Returns the bounds of tray icon.
  virtual gfx::Rect GetBounds();

  void AddObserver(TrayIconObserver* obs) { observers_.AddObserver(obs); }
  void RemoveObserver(TrayIconObserver* obs) { observers_.RemoveObserver(obs); }

  void NotifyClicked(const gfx::Rect& = gfx::Rect(), int modifiers = 0);
  void NotifyDoubleClicked(const gfx::Rect& = gfx::Rect(), int modifiers = 0);
  void NotifyBalloonShow();
  void NotifyBalloonClicked();
  void NotifyBalloonClosed();
  void NotifyRightClicked(const gfx::Rect& bounds = gfx::Rect(),
                          int modifiers = 0);
  void NotifyDrop();
  void NotifyDropFiles(const std::vector<std::string>& files);
  void NotifyDropText(const std::string& text);
  void NotifyDragEntered();
  void NotifyDragExited();
  void NotifyDragEnded();
  void NotifyMouseEntered(const gfx::Point& location = gfx::Point(),
                          int modifiers = 0);
  void NotifyMouseExited(const gfx::Point& location = gfx::Point(),
                         int modifiers = 0);

 protected:
  TrayIcon();

 private:
  base::ObserverList<TrayIconObserver> observers_;

  DISALLOW_COPY_AND_ASSIGN(TrayIcon);
};

}  // namespace atom

#endif  // ATOM_BROWSER_UI_TRAY_ICON_H_
