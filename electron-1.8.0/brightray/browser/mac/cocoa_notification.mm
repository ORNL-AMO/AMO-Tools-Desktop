// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "brightray/browser/mac/cocoa_notification.h"

#include "base/mac/mac_util.h"
#include "base/strings/sys_string_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "brightray/browser/notification_delegate.h"
#include "brightray/browser/notification_presenter.h"
#include "skia/ext/skia_utils_mac.h"

namespace brightray {

CocoaNotification::CocoaNotification(NotificationDelegate* delegate,
                                     NotificationPresenter* presenter)
    : Notification(delegate, presenter) {
}

CocoaNotification::~CocoaNotification() {
  if (notification_)
    [NSUserNotificationCenter.defaultUserNotificationCenter
        removeDeliveredNotification:notification_];
}

void CocoaNotification::Show(const NotificationOptions& options) {
  notification_.reset([[NSUserNotification alloc] init]);
  [notification_ setTitle:base::SysUTF16ToNSString(options.title)];
  [notification_ setSubtitle:base::SysUTF16ToNSString(options.subtitle)];
  [notification_ setInformativeText:base::SysUTF16ToNSString(options.msg)];

  if ([notification_ respondsToSelector:@selector(setContentImage:)] &&
      !options.icon.drawsNothing()) {
    NSImage* image = skia::SkBitmapToNSImageWithColorSpace(
        options.icon, base::mac::GetGenericRGBColorSpace());
    [notification_ setContentImage:image];
  }

  if (options.silent) {
    [notification_ setSoundName:nil];
  } else if (options.sound != nil) {
    [notification_ setSoundName:base::SysUTF16ToNSString(options.sound)];
  } else {
    [notification_ setSoundName:NSUserNotificationDefaultSoundName];
  }

  [notification_ setHasActionButton:false];

  int i = 0;
  for (const auto& action : options.actions) {
    if (action.type == base::ASCIIToUTF16("button")) {
      [notification_ setHasActionButton:true];
      [notification_ setActionButtonTitle:base::SysUTF16ToNSString(action.text)];
      action_index_ = i;
    }
    i++;
  }

  if (options.has_reply) {
    [notification_ setResponsePlaceholder:base::SysUTF16ToNSString(options.reply_placeholder)];
    [notification_ setHasReplyButton:true];
  }

  [NSUserNotificationCenter.defaultUserNotificationCenter
      deliverNotification:notification_];
}

void CocoaNotification::Dismiss() {
  if (notification_)
    [NSUserNotificationCenter.defaultUserNotificationCenter
        removeDeliveredNotification:notification_];
  NotificationDismissed();
}

void CocoaNotification::NotificationDisplayed() {
  if (delegate())
    delegate()->NotificationDisplayed();
}

void CocoaNotification::NotificationReplied(const std::string& reply) {
  if (delegate())
    delegate()->NotificationReplied(reply);
}

void CocoaNotification::NotificationButtonClicked() {
  if (delegate())
    delegate()->NotificationAction(action_index_);
}

}  // namespace brightray
