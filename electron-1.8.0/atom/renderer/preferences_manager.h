// Copyright (c) 2016 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_RENDERER_PREFERENCES_MANAGER_H_
#define ATOM_RENDERER_PREFERENCES_MANAGER_H_

#include <memory>

#include "base/values.h"
#include "content/public/renderer/render_thread_observer.h"

namespace atom {

class PreferencesManager : public content::RenderThreadObserver {
 public:
  PreferencesManager();
  ~PreferencesManager() override;

  const base::ListValue* preferences() const { return preferences_.get(); }

 private:
  // content::RenderThreadObserver:
  bool OnControlMessageReceived(const IPC::Message& message) override;

  void OnUpdatePreferences(const base::ListValue& preferences);

  std::unique_ptr<base::ListValue> preferences_;

  DISALLOW_COPY_AND_ASSIGN(PreferencesManager);
};

}  // namespace atom

#endif  // ATOM_RENDERER_PREFERENCES_MANAGER_H_
