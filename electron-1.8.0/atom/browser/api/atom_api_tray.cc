// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/api/atom_api_tray.h"

#include <string>

#include "atom/browser/api/atom_api_menu.h"
#include "atom/browser/browser.h"
#include "atom/common/api/atom_api_native_image.h"
#include "atom/common/native_mate_converters/gfx_converter.h"
#include "atom/common/native_mate_converters/image_converter.h"
#include "atom/common/native_mate_converters/string16_converter.h"
#include "atom/common/node_includes.h"
#include "base/threading/thread_task_runner_handle.h"
#include "native_mate/constructor.h"
#include "native_mate/dictionary.h"
#include "ui/gfx/image/image.h"

namespace mate {

template<>
struct Converter<atom::TrayIcon::HighlightMode> {
  static bool FromV8(v8::Isolate* isolate, v8::Local<v8::Value> val,
                     atom::TrayIcon::HighlightMode* out) {
    std::string mode;
    if (ConvertFromV8(isolate, val, &mode)) {
      if (mode == "always") {
        *out = atom::TrayIcon::HighlightMode::ALWAYS;
        return true;
      }
      if (mode == "selection") {
        *out = atom::TrayIcon::HighlightMode::SELECTION;
        return true;
      }
      if (mode == "never") {
        *out = atom::TrayIcon::HighlightMode::NEVER;
        return true;
      }
    }

    // Support old boolean parameter
    // TODO(kevinsawicki): Remove in 2.0, deprecate before then with warnings
    bool highlight;
    if (ConvertFromV8(isolate, val, &highlight)) {
      if (highlight)
        *out = atom::TrayIcon::HighlightMode::SELECTION;
      else
        *out = atom::TrayIcon::HighlightMode::NEVER;
      return true;
    }

    return false;
  }
};
}  // namespace mate


namespace atom {

namespace api {

Tray::Tray(v8::Isolate* isolate, v8::Local<v8::Object> wrapper,
           mate::Handle<NativeImage> image)
    : tray_icon_(TrayIcon::Create()) {
  SetImage(isolate, image);
  tray_icon_->AddObserver(this);

  InitWith(isolate, wrapper);
}

Tray::~Tray() {
  // Destroy the native tray in next tick.
  base::ThreadTaskRunnerHandle::Get()->DeleteSoon(
      FROM_HERE, tray_icon_.release());
}

// static
mate::WrappableBase* Tray::New(mate::Handle<NativeImage> image,
                               mate::Arguments* args) {
  if (!Browser::Get()->is_ready()) {
    args->ThrowError("Cannot create Tray before app is ready");
    return nullptr;
  }
  return new Tray(args->isolate(), args->GetThis(), image);
}

void Tray::OnClicked(const gfx::Rect& bounds, int modifiers) {
  EmitWithFlags("click", modifiers, bounds);
}

void Tray::OnDoubleClicked(const gfx::Rect& bounds, int modifiers) {
  EmitWithFlags("double-click", modifiers, bounds);
}

void Tray::OnRightClicked(const gfx::Rect& bounds, int modifiers) {
  EmitWithFlags("right-click", modifiers, bounds);
}

void Tray::OnBalloonShow() {
  Emit("balloon-show");
}

void Tray::OnBalloonClicked() {
  Emit("balloon-click");
}

void Tray::OnBalloonClosed() {
  Emit("balloon-closed");
}

void Tray::OnDrop() {
  Emit("drop");
}

void Tray::OnDropFiles(const std::vector<std::string>& files) {
  Emit("drop-files", files);
}

void Tray::OnDropText(const std::string& text) {
  Emit("drop-text", text);
}

void Tray::OnMouseEntered(const gfx::Point& location, int modifiers) {
  EmitWithFlags("mouse-enter", modifiers, location);
}

void Tray::OnMouseExited(const gfx::Point& location, int modifiers) {
  EmitWithFlags("mouse-leave", modifiers, location);
}

void Tray::OnDragEntered() {
  Emit("drag-enter");
}

void Tray::OnDragExited() {
  Emit("drag-leave");
}

void Tray::OnDragEnded() {
  Emit("drag-end");
}

void Tray::SetImage(v8::Isolate* isolate, mate::Handle<NativeImage> image) {
#if defined(OS_WIN)
  tray_icon_->SetImage(image->GetHICON(GetSystemMetrics(SM_CXSMICON)));
#else
  tray_icon_->SetImage(image->image());
#endif
}

void Tray::SetPressedImage(v8::Isolate* isolate,
                           mate::Handle<NativeImage> image) {
#if defined(OS_WIN)
  tray_icon_->SetPressedImage(image->GetHICON(GetSystemMetrics(SM_CXSMICON)));
#else
  tray_icon_->SetPressedImage(image->image());
#endif
}

void Tray::SetToolTip(const std::string& tool_tip) {
  tray_icon_->SetToolTip(tool_tip);
}

void Tray::SetTitle(const std::string& title) {
  tray_icon_->SetTitle(title);
}

void Tray::SetHighlightMode(TrayIcon::HighlightMode mode) {
  tray_icon_->SetHighlightMode(mode);
}

void Tray::DisplayBalloon(mate::Arguments* args,
                          const mate::Dictionary& options) {
  mate::Handle<NativeImage> icon;
  options.Get("icon", &icon);
  base::string16 title, content;
  if (!options.Get("title", &title) ||
      !options.Get("content", &content)) {
    args->ThrowError("'title' and 'content' must be defined");
    return;
  }

#if defined(OS_WIN)
  tray_icon_->DisplayBalloon(
      icon.IsEmpty() ? NULL : icon->GetHICON(GetSystemMetrics(SM_CXSMICON)),
      title, content);
#else
  tray_icon_->DisplayBalloon(
      icon.IsEmpty() ? gfx::Image() : icon->image(), title, content);
#endif
}

void Tray::PopUpContextMenu(mate::Arguments* args) {
  mate::Handle<Menu> menu;
  args->GetNext(&menu);
  gfx::Point pos;
  args->GetNext(&pos);
  tray_icon_->PopUpContextMenu(pos, menu.IsEmpty() ? nullptr : menu->model());
}

void Tray::SetContextMenu(v8::Isolate* isolate, mate::Handle<Menu> menu) {
  menu_.Reset(isolate, menu.ToV8());
  tray_icon_->SetContextMenu(menu->model());
}

gfx::Rect Tray::GetBounds() {
  return tray_icon_->GetBounds();
}

// static
void Tray::BuildPrototype(v8::Isolate* isolate,
                          v8::Local<v8::FunctionTemplate> prototype) {
  prototype->SetClassName(mate::StringToV8(isolate, "Tray"));
  mate::ObjectTemplateBuilder(isolate, prototype->PrototypeTemplate())
      .MakeDestroyable()
      .SetMethod("setImage", &Tray::SetImage)
      .SetMethod("setPressedImage", &Tray::SetPressedImage)
      .SetMethod("setToolTip", &Tray::SetToolTip)
      .SetMethod("setTitle", &Tray::SetTitle)
      .SetMethod("setHighlightMode", &Tray::SetHighlightMode)
      .SetMethod("displayBalloon", &Tray::DisplayBalloon)
      .SetMethod("popUpContextMenu", &Tray::PopUpContextMenu)
      .SetMethod("setContextMenu", &Tray::SetContextMenu)
      .SetMethod("getBounds", &Tray::GetBounds);
}

}  // namespace api

}  // namespace atom


namespace {

using atom::api::Tray;

void Initialize(v8::Local<v8::Object> exports, v8::Local<v8::Value> unused,
                v8::Local<v8::Context> context, void* priv) {
  v8::Isolate* isolate = context->GetIsolate();
  Tray::SetConstructor(isolate, base::Bind(&Tray::New));

  mate::Dictionary dict(isolate, exports);
  dict.Set("Tray", Tray::GetConstructor(isolate)->GetFunction());
}

}  // namespace

NODE_MODULE_CONTEXT_AWARE_BUILTIN(atom_browser_tray, Initialize)
