// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE-CHROMIUM file.

#include "brightray/browser/permission_manager.h"

#include "base/callback.h"
#include "content/public/browser/child_process_security_policy.h"
#include "content/public/browser/permission_type.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"

namespace brightray {

PermissionManager::PermissionManager() {
}

PermissionManager::~PermissionManager() {
}

int PermissionManager::RequestPermission(
    content::PermissionType permission,
    content::RenderFrameHost* render_frame_host,
    const GURL& requesting_origin,
    bool user_gesture,
    const base::Callback<void(blink::mojom::PermissionStatus)>& callback) {
  if (permission == content::PermissionType::MIDI_SYSEX) {
    content::ChildProcessSecurityPolicy::GetInstance()->
        GrantSendMidiSysExMessage(render_frame_host->GetProcess()->GetID());
  }
  callback.Run(blink::mojom::PermissionStatus::GRANTED);
  return kNoPendingOperation;
}

int PermissionManager::RequestPermissions(
    const std::vector<content::PermissionType>& permissions,
    content::RenderFrameHost* render_frame_host,
    const GURL& requesting_origin,
    bool user_gesture,
    const base::Callback<void(
        const std::vector<blink::mojom::PermissionStatus>&)>& callback) {
  std::vector<blink::mojom::PermissionStatus> permissionStatuses;

  for (auto permission : permissions) {
    if (permission == content::PermissionType::MIDI_SYSEX) {
      content::ChildProcessSecurityPolicy::GetInstance()->
          GrantSendMidiSysExMessage(render_frame_host->GetProcess()->GetID());
    }

    permissionStatuses.push_back(blink::mojom::PermissionStatus::GRANTED);
  }

  callback.Run(permissionStatuses);
  return kNoPendingOperation;
}

void PermissionManager::CancelPermissionRequest(int request_id) {
}

void PermissionManager::ResetPermission(
    content::PermissionType permission,
    const GURL& requesting_origin,
    const GURL& embedding_origin) {
}

blink::mojom::PermissionStatus PermissionManager::GetPermissionStatus(
    content::PermissionType permission,
    const GURL& requesting_origin,
    const GURL& embedding_origin) {
  return blink::mojom::PermissionStatus::GRANTED;
}

int PermissionManager::SubscribePermissionStatusChange(
    content::PermissionType permission,
    const GURL& requesting_origin,
    const GURL& embedding_origin,
    const base::Callback<void(blink::mojom::PermissionStatus)>& callback) {
  return -1;
}

void PermissionManager::UnsubscribePermissionStatusChange(int subscription_id) {
}

}  // namespace brightray
