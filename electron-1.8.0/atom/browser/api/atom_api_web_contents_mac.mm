// Copyright (c) 2016 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/api/atom_api_web_contents.h"

#import <Cocoa/Cocoa.h>

namespace atom {

namespace api {

bool WebContents::IsFocused() const {
  auto view = web_contents()->GetRenderWidgetHostView();
  if (!view) return false;

  if (GetType() != BACKGROUND_PAGE) {
    auto window = [web_contents()->GetNativeView() window];
    // On Mac the render widget host view does not lose focus when the window
    // loses focus so check if the top level window is the key window.
    if (window && ![window isKeyWindow])
      return false;
  }

  return view->HasFocus();
}

}  // namespace api

}  // namespace atom
