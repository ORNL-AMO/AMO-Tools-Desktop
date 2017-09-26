// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "brightray/browser/linux/libnotify_notification.h"

#include <vector>

#include "base/files/file_enumerator.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "brightray/browser/notification_delegate.h"
#include "brightray/common/application_info.h"
#include "chrome/browser/ui/libgtkui/skia_utils_gtk.h"
#include "third_party/skia/include/core/SkBitmap.h"

namespace brightray {

namespace {

LibNotifyLoader libnotify_loader_;

bool HasCapability(const std::string& capability) {
  bool result = false;
  GList* capabilities = libnotify_loader_.notify_get_server_caps();

  if (g_list_find_custom(capabilities, capability.c_str(),
                         (GCompareFunc)g_strcmp0) != NULL)
    result = true;

  g_list_free_full(capabilities, g_free);

  return result;
}

bool NotifierSupportsActions() {
  if (getenv("ELECTRON_USE_UBUNTU_NOTIFIER"))
    return false;

  static bool notify_has_result = false;
  static bool notify_result = false;

  if (notify_has_result)
    return notify_result;

  notify_result = HasCapability("actions");
  return notify_result;
}

void log_and_clear_error(GError* error, const char* context) {
  LOG(ERROR) << context
             << ": domain=" << error->domain
             << " code=" << error->code
             << " message=\"" << error->message << '"';
  g_error_free(error);
}

}  // namespace

// static
bool LibnotifyNotification::Initialize() {
  if (!libnotify_loader_.Load("libnotify.so.4") &&  // most common one
      !libnotify_loader_.Load("libnotify.so.5") &&
      !libnotify_loader_.Load("libnotify.so.1") &&
      !libnotify_loader_.Load("libnotify.so")) {
    return false;
  }
  if (!libnotify_loader_.notify_is_initted() &&
      !libnotify_loader_.notify_init(GetApplicationName().c_str())) {
    return false;
  }
  return true;
}

LibnotifyNotification::LibnotifyNotification(NotificationDelegate* delegate,
                                             NotificationPresenter* presenter)
    : Notification(delegate, presenter),
      notification_(nullptr) {
}

LibnotifyNotification::~LibnotifyNotification() {
  if (notification_) {
    g_signal_handlers_disconnect_by_data(notification_, this);
    g_object_unref(notification_);
  }
}

void LibnotifyNotification::Show(const NotificationOptions& options) {
  notification_ = libnotify_loader_.notify_notification_new(
      base::UTF16ToUTF8(options.title).c_str(),
      base::UTF16ToUTF8(options.msg).c_str(),
      nullptr);

  g_signal_connect(
      notification_, "closed", G_CALLBACK(OnNotificationClosedThunk), this);

  // NB: On Unity and on any other DE using Notify-OSD, adding a notification
  // action will cause the notification to display as a modal dialog box.
  if (NotifierSupportsActions()) {
    libnotify_loader_.notify_notification_add_action(
        notification_, "default", "View", OnNotificationViewThunk, this,
        nullptr);
  }

  if (!options.icon.drawsNothing()) {
    GdkPixbuf* pixbuf = libgtkui::GdkPixbufFromSkBitmap(options.icon);
    libnotify_loader_.notify_notification_set_image_from_pixbuf(
        notification_, pixbuf);
    libnotify_loader_.notify_notification_set_timeout(
        notification_, NOTIFY_EXPIRES_DEFAULT);
    g_object_unref(pixbuf);
  }

  if (!options.tag.empty()) {
    GQuark id = g_quark_from_string(options.tag.c_str());
    g_object_set(G_OBJECT(notification_), "id", id, NULL);
  }

  // Always try to append notifications.
  // Unique tags can be used to prevent this.
  if (HasCapability("append")) {
    libnotify_loader_.notify_notification_set_hint_string(
        notification_, "append", "true");
  } else if (HasCapability("x-canonical-append")) {
    libnotify_loader_.notify_notification_set_hint_string(
        notification_, "x-canonical-append", "true");
  }

  GError* error = nullptr;
  libnotify_loader_.notify_notification_show(notification_, &error);
  if (error) {
    log_and_clear_error(error, "notify_notification_show");
    NotificationFailed();
    return;
  }

  if (delegate())
    delegate()->NotificationDisplayed();
}

void LibnotifyNotification::Dismiss() {
  if (!notification_) {
    Destroy();
    return;
  }

  GError* error = nullptr;
  libnotify_loader_.notify_notification_close(notification_, &error);
  if (error) {
    log_and_clear_error(error, "notify_notification_close");
    Destroy();
  }
}

void LibnotifyNotification::OnNotificationClosed(
    NotifyNotification* notification) {
  NotificationDismissed();
}

void LibnotifyNotification::OnNotificationView(
    NotifyNotification* notification, char* action) {
  NotificationClicked();
}

}  // namespace brightray
