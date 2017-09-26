// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef BRIGHTRAY_BROWSER_ZOOM_LEVEL_DELEGATE_H_
#define BRIGHTRAY_BROWSER_ZOOM_LEVEL_DELEGATE_H_

#include <string>

#include "base/files/file_path.h"
#include "base/macros.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/host_zoom_map.h"
#include "content/public/browser/zoom_level_delegate.h"

namespace base {
class DictionaryValue;
}

class PrefRegistrySimple;

namespace brightray {

// A class to manage per-partition default and per-host zoom levels.
// It implements an interface between the content/ zoom
// levels in HostZoomMap and preference system. All changes
// to the per-partition default zoom levels flow through this
// class. Any changes to per-host levels are updated when HostZoomMap calls
// OnZoomLevelChanged.
class ZoomLevelDelegate : public content::ZoomLevelDelegate {
 public:
  static void RegisterPrefs(PrefRegistrySimple* pref_registry);

  ZoomLevelDelegate(PrefService* pref_service,
                    const base::FilePath& partition_path);
  ~ZoomLevelDelegate() override;

  void SetDefaultZoomLevelPref(double level);
  double GetDefaultZoomLevelPref() const;

  // content::ZoomLevelDelegate:
  void InitHostZoomMap(content::HostZoomMap* host_zoom_map) override;

 private:
  void ExtractPerHostZoomLevels(
      const base::DictionaryValue* host_zoom_dictionary);

  // This is a callback function that receives notifications from HostZoomMap
  // when per-host zoom levels change. It is used to update the per-host
  // zoom levels (if any) managed by this class (for its associated partition).
  void OnZoomLevelChanged(const content::HostZoomMap::ZoomLevelChange& change);

  PrefService* pref_service_;
  content::HostZoomMap* host_zoom_map_;
  std::unique_ptr<content::HostZoomMap::Subscription> zoom_subscription_;
  std::string partition_key_;

  DISALLOW_COPY_AND_ASSIGN(ZoomLevelDelegate);
};

}  // namespace brightray

#endif  // BRIGHTRAY_BROWSER_ZOOM_LEVEL_DELEGATE_H_
