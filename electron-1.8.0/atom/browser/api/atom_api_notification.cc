// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/api/atom_api_notification.h"

#include "atom/browser/api/atom_api_menu.h"
#include "atom/browser/browser.h"
#include "atom/common/native_mate_converters/gfx_converter.h"
#include "atom/common/native_mate_converters/image_converter.h"
#include "atom/common/native_mate_converters/string16_converter.h"
#include "atom/common/node_includes.h"
#include "base/strings/utf_string_conversions.h"
#include "brightray/browser/browser_client.h"
#include "native_mate/constructor.h"
#include "native_mate/dictionary.h"
#include "native_mate/object_template_builder.h"
#include "url/gurl.h"

namespace mate {
template<>
struct Converter<brightray::NotificationAction> {
  static bool FromV8(v8::Isolate* isolate, v8::Local<v8::Value> val,
                      brightray::NotificationAction* out) {
    mate::Dictionary dict;
    if (!ConvertFromV8(isolate, val, &dict))
      return false;

    if (!dict.Get("type", &(out->type))) {
      return false;
    }
    dict.Get("text", &(out->text));
    return true;
  }

  static v8::Local<v8::Value> ToV8(v8::Isolate* isolate,
                                    brightray::NotificationAction val) {
    mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);
    dict.Set("text", val.text);
    dict.Set("type", val.type);
    return dict.GetHandle();
  }
};
}  // namespace mate

namespace atom {

namespace api {

Notification::Notification(v8::Isolate* isolate,
                           v8::Local<v8::Object> wrapper,
                           mate::Arguments* args) {
  InitWith(isolate, wrapper);

  presenter_ = brightray::BrowserClient::Get()->GetNotificationPresenter();

  mate::Dictionary opts;
  if (args->GetNext(&opts)) {
    opts.Get("title", &title_);
    opts.Get("subtitle", &subtitle_);
    opts.Get("body", &body_);
    has_icon_ = opts.Get("icon", &icon_);
    if (has_icon_) {
      opts.Get("icon", &icon_path_);
    }
    opts.Get("silent", &silent_);
    opts.Get("replyPlaceholder", &reply_placeholder_);
    opts.Get("hasReply", &has_reply_);
    opts.Get("actions", &actions_);
    opts.Get("sound", &sound_);
  }
}

Notification::~Notification() {
  if (notification_)
    notification_->set_delegate(nullptr);
}

// static
mate::WrappableBase* Notification::New(mate::Arguments* args) {
  if (!Browser::Get()->is_ready()) {
    args->ThrowError("Cannot create Notification before app is ready");
    return nullptr;
  }
  return new Notification(args->isolate(), args->GetThis(), args);
}

// Getters
base::string16 Notification::GetTitle() const {
  return title_;
}

base::string16 Notification::GetSubtitle() const {
  return subtitle_;
}

base::string16 Notification::GetBody() const {
  return body_;
}

bool Notification::GetSilent() const {
  return silent_;
}

base::string16 Notification::GetReplyPlaceholder() const {
  return reply_placeholder_;
}

bool Notification::GetHasReply() const {
  return has_reply_;
}

std::vector<brightray::NotificationAction> Notification::GetActions() const {
  return actions_;
}

base::string16 Notification::GetSound() const {
  return sound_;
}

// Setters
void Notification::SetTitle(const base::string16& new_title) {
  title_ = new_title;
}

void Notification::SetSubtitle(const base::string16& new_subtitle) {
  subtitle_ = new_subtitle;
}

void Notification::SetBody(const base::string16& new_body) {
  body_ = new_body;
}

void Notification::SetSilent(bool new_silent) {
  silent_ = new_silent;
}

void Notification::SetReplyPlaceholder(const base::string16& new_placeholder) {
  reply_placeholder_ = new_placeholder;
}

void Notification::SetHasReply(bool new_has_reply) {
  has_reply_ = new_has_reply;
}

void Notification::SetActions(
  const std::vector<brightray::NotificationAction>& actions) {
  actions_ = actions;
}

void Notification::SetSound(const base::string16& new_sound) {
  sound_ = new_sound;
}

void Notification::NotificationAction(int index) {
  Emit("action", index);
}

void Notification::NotificationClick() {
  Emit("click");
}

void Notification::NotificationReplied(const std::string& reply) {
  Emit("reply", reply);
}

void Notification::NotificationDisplayed() {
  Emit("show");
}

void Notification::NotificationDestroyed() {
  Emit("close");
}

void Notification::NotificationClosed() {
}

// Showing notifications
void Notification::Show() {
  if (presenter_) {
    notification_ = presenter_->CreateNotification(this);
    if (notification_) {
      brightray::NotificationOptions options;
      options.title = title_;
      options.subtitle = subtitle_;
      options.msg = body_;
      options.icon_url = GURL();
      options.icon = icon_.AsBitmap();
      options.silent = silent_;
      options.has_reply = has_reply_;
      options.reply_placeholder = reply_placeholder_;
      options.actions = actions_;
      options.sound = sound_;
      notification_->Show(options);
    }
  }
}

bool Notification::IsSupported() {
  return !!brightray::BrowserClient::Get()->GetNotificationPresenter();
}

// static
void Notification::BuildPrototype(v8::Isolate* isolate,
                                  v8::Local<v8::FunctionTemplate> prototype) {
  prototype->SetClassName(mate::StringToV8(isolate, "Notification"));
  mate::ObjectTemplateBuilder(isolate, prototype->PrototypeTemplate())
      .MakeDestroyable()
      .SetMethod("show", &Notification::Show)
      .SetProperty("title", &Notification::GetTitle, &Notification::SetTitle)
      .SetProperty("subtitle", &Notification::GetSubtitle,
                   &Notification::SetSubtitle)
      .SetProperty("body", &Notification::GetBody, &Notification::SetBody)
      .SetProperty("silent", &Notification::GetSilent, &Notification::SetSilent)
      .SetProperty("replyPlaceholder", &Notification::GetReplyPlaceholder,
                   &Notification::SetReplyPlaceholder)
      .SetProperty("hasReply", &Notification::GetHasReply,
                   &Notification::SetHasReply)
      .SetProperty("actions", &Notification::GetActions,
                   &Notification::SetActions)
      .SetProperty("sound", &Notification::GetSound,
                   &Notification::SetSound);
}

}  // namespace api

}  // namespace atom

namespace {

using atom::api::Notification;

void Initialize(v8::Local<v8::Object> exports,
                v8::Local<v8::Value> unused,
                v8::Local<v8::Context> context,
                void* priv) {
  v8::Isolate* isolate = context->GetIsolate();
  Notification::SetConstructor(isolate, base::Bind(&Notification::New));

  mate::Dictionary dict(isolate, exports);
  dict.Set("Notification",
           Notification::GetConstructor(isolate)->GetFunction());

  dict.SetMethod("isSupported", &Notification::IsSupported);
}

}  // namespace

NODE_MODULE_CONTEXT_AWARE_BUILTIN(atom_common_notification, Initialize)
