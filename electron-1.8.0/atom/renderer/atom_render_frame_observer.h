// Copyright (c) 2017 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_RENDERER_ATOM_RENDER_FRAME_OBSERVER_H_
#define ATOM_RENDERER_ATOM_RENDER_FRAME_OBSERVER_H_

#include "atom/renderer/renderer_client_base.h"
#include "content/public/renderer/render_frame_observer.h"

namespace atom {

enum World {
  MAIN_WORLD = 0,
  // Use a high number far away from 0 to not collide with any other world
  // IDs created internally by Chrome.
  ISOLATED_WORLD = 999
};

// Helper class to forward the messages to the client.
class AtomRenderFrameObserver : public content::RenderFrameObserver {
 public:
  AtomRenderFrameObserver(content::RenderFrame* frame,
                          RendererClientBase* renderer_client);

  // content::RenderFrameObserver:
  void DidClearWindowObject() override;
  void DidCreateScriptContext(v8::Handle<v8::Context> context,
                              int world_id) override;
  void WillReleaseScriptContext(v8::Local<v8::Context> context,
                                int world_id) override;
  void OnDestruct() override;

 private:
  bool ShouldNotifyClient(int world_id);
  void CreateIsolatedWorldContext();
  bool IsMainWorld(int world_id);
  bool IsIsolatedWorld(int world_id);

  content::RenderFrame* render_frame_;
  RendererClientBase* renderer_client_;

  DISALLOW_COPY_AND_ASSIGN(AtomRenderFrameObserver);
};

}  // namespace atom

#endif  // ATOM_RENDERER_ATOM_RENDER_FRAME_OBSERVER_H_
