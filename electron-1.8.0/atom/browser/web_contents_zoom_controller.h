// Copyright (c) 2017 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_WEB_CONTENTS_ZOOM_CONTROLLER_H_
#define ATOM_BROWSER_WEB_CONTENTS_ZOOM_CONTROLLER_H_

#include <map>
#include <string>

#include "content/public/browser/host_zoom_map.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"

namespace atom {

// Manages the zoom changes of WebContents.
class WebContentsZoomController
    : public content::WebContentsObserver,
      public content::WebContentsUserData<WebContentsZoomController> {
 public:
  class Observer {
   public:
    virtual void OnZoomLevelChanged(content::WebContents* web_contents,
                                    double level,
                                    bool is_temporary) {}

   protected:
    virtual ~Observer() {}
  };

  // Defines how zoom changes are handled.
  enum ZoomMode {
    // Results in default zoom behavior, i.e. zoom changes are handled
    // automatically and on a per-origin basis, meaning that other tabs
    // navigated to the same origin will also zoom.
    ZOOM_MODE_DEFAULT,
    // Results in zoom changes being handled automatically, but on a per-tab
    // basis. Tabs in this zoom mode will not be affected by zoom changes in
    // other tabs, and vice versa.
    ZOOM_MODE_ISOLATED,
    // Overrides the automatic handling of zoom changes. The |onZoomChange|
    // event will still be dispatched, but the page will not actually be zoomed.
    // These zoom changes can be handled manually by listening for the
    // |onZoomChange| event. Zooming in this mode is also on a per-tab basis.
    ZOOM_MODE_MANUAL,
    // Disables all zooming in this tab. The tab will revert to the default
    // zoom level, and all attempted zoom changes will be ignored.
    ZOOM_MODE_DISABLED,
  };

  explicit WebContentsZoomController(content::WebContents* web_contents);
  ~WebContentsZoomController() override;

  void AddObserver(Observer* observer);
  void RemoveObserver(Observer* observer);

  void SetEmbedderZoomController(WebContentsZoomController* controller);

  // Methods for managing zoom levels.
  void SetZoomLevel(double level);
  double GetZoomLevel();
  void SetDefaultZoomFactor(double factor);
  double GetDefaultZoomFactor();
  void SetTemporaryZoomLevel(double level);
  bool UsesTemporaryZoomLevel();

  // Sets the zoom mode, which defines zoom behavior (see enum ZoomMode).
  void SetZoomMode(ZoomMode zoom_mode);

  void ResetZoomModeOnNavigationIfNeeded(const GURL& url);

  ZoomMode zoom_mode() const { return zoom_mode_; }

  // Convenience method to get default zoom level. Implemented here for
  // inlining.
  double GetDefaultZoomLevel() const {
    return content::HostZoomMap::GetForWebContents(web_contents())
        ->GetDefaultZoomLevel();
  }

 protected:
  // content::WebContentsObserver:
  void DidFinishNavigation(content::NavigationHandle* handle) override;
  void WebContentsDestroyed() override;
  void RenderFrameHostChanged(content::RenderFrameHost* old_host,
                              content::RenderFrameHost* new_host) override;

 private:
  friend class content::WebContentsUserData<WebContentsZoomController>;

  // Called after a navigation has committed to set default zoom factor.
  void SetZoomFactorOnNavigationIfNeeded(const GURL& url);

  // The current zoom mode.
  ZoomMode zoom_mode_;

  // Current zoom level.
  double zoom_level_;

  // kZoomFactor.
  double default_zoom_factor_;
  double temporary_zoom_level_;

  int old_process_id_;
  int old_view_id_;

  WebContentsZoomController* embedder_zoom_controller_;

  base::ObserverList<Observer> observers_;

  content::HostZoomMap* host_zoom_map_;

  DISALLOW_COPY_AND_ASSIGN(WebContentsZoomController);
};

}  // namespace atom

#endif  // ATOM_BROWSER_WEB_CONTENTS_ZOOM_CONTROLLER_H_
