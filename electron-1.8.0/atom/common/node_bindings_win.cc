// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/common/node_bindings_win.h"

#include <windows.h>

#include "base/logging.h"

extern "C" {
#include "vendor/node/deps/uv/src/win/internal.h"
}

namespace atom {

NodeBindingsWin::NodeBindingsWin(BrowserEnvironment browser_env)
    : NodeBindings(browser_env) {
}

NodeBindingsWin::~NodeBindingsWin() {
}

void NodeBindingsWin::PollEvents() {
  // If there are other kinds of events pending, uv_backend_timeout will
  // instruct us not to wait.
  DWORD bytes, timeout;
  ULONG_PTR key;
  OVERLAPPED* overlapped;

  timeout = uv_backend_timeout(uv_loop_);

  GetQueuedCompletionStatus(uv_loop_->iocp,
                            &bytes,
                            &key,
                            &overlapped,
                            timeout);

  // Give the event back so libuv can deal with it.
  if (overlapped != NULL)
    PostQueuedCompletionStatus(uv_loop_->iocp,
                               bytes,
                               key,
                               overlapped);
}

// static
NodeBindings* NodeBindings::Create(BrowserEnvironment browser_env) {
  return new NodeBindingsWin(browser_env);
}

}  // namespace atom
