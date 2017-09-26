// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/api/atom_api_web_contents.h"

#include <set>
#include <string>

#include "atom/browser/api/atom_api_debugger.h"
#include "atom/browser/api/atom_api_session.h"
#include "atom/browser/api/atom_api_window.h"
#include "atom/browser/atom_browser_client.h"
#include "atom/browser/atom_browser_context.h"
#include "atom/browser/atom_browser_main_parts.h"
#include "atom/browser/atom_javascript_dialog_manager.h"
#include "atom/browser/child_web_contents_tracker.h"
#include "atom/browser/lib/bluetooth_chooser.h"
#include "atom/browser/native_window.h"
#include "atom/browser/net/atom_network_delegate.h"
#if defined(ENABLE_OSR)
#include "atom/browser/osr/osr_output_device.h"
#include "atom/browser/osr/osr_render_widget_host_view.h"
#include "atom/browser/osr/osr_web_contents_view.h"
#endif
#include "atom/browser/ui/drag_util.h"
#include "atom/browser/web_contents_permission_helper.h"
#include "atom/browser/web_contents_preferences.h"
#include "atom/browser/web_contents_zoom_controller.h"
#include "atom/browser/web_view_guest_delegate.h"
#include "atom/common/api/api_messages.h"
#include "atom/common/api/event_emitter_caller.h"
#include "atom/common/color_util.h"
#include "atom/common/mouse_util.h"
#include "atom/common/native_mate_converters/blink_converter.h"
#include "atom/common/native_mate_converters/callback.h"
#include "atom/common/native_mate_converters/content_converter.h"
#include "atom/common/native_mate_converters/file_path_converter.h"
#include "atom/common/native_mate_converters/gfx_converter.h"
#include "atom/common/native_mate_converters/gurl_converter.h"
#include "atom/common/native_mate_converters/image_converter.h"
#include "atom/common/native_mate_converters/net_converter.h"
#include "atom/common/native_mate_converters/string16_converter.h"
#include "atom/common/native_mate_converters/value_converter.h"
#include "atom/common/options_switches.h"
#include "base/process/process_handle.h"
#include "base/strings/utf_string_conversions.h"
#include "base/threading/thread_task_runner_handle.h"
#include "base/values.h"
#include "brightray/browser/inspectable_web_contents.h"
#include "brightray/browser/inspectable_web_contents_view.h"
#include "chrome/browser/printing/print_preview_message_handler.h"
#include "chrome/browser/printing/print_view_manager_basic.h"
#include "chrome/browser/ssl/security_state_tab_helper.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
#include "content/browser/renderer_host/render_widget_host_view_base.h"
#include "content/browser/web_contents/web_contents_impl.h"
#include "content/common/view_messages.h"
#include "content/public/browser/child_process_security_policy.h"
#include "content/public/browser/favicon_status.h"
#include "content/public/browser/native_web_keyboard_event.h"
#include "content/public/browser/navigation_details.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/plugin_service.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/render_view_host.h"
#include "content/public/browser/render_widget_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/resource_request_details.h"
#include "content/public/browser/service_worker_context.h"
#include "content/public/browser/site_instance.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/browser/web_contents.h"
#include "content/public/common/context_menu_params.h"
#include "native_mate/converter.h"
#include "native_mate/dictionary.h"
#include "native_mate/object_template_builder.h"
#include "net/url_request/url_request_context.h"
#include "third_party/WebKit/public/platform/WebInputEvent.h"
#include "third_party/WebKit/public/web/WebFindOptions.h"
#include "ui/display/screen.h"
#include "ui/events/base_event_utils.h"
#include "ui/latency/latency_info.h"

#if !defined(OS_MACOSX)
#include "ui/aura/window.h"
#endif

#include "atom/common/node_includes.h"

namespace {

struct PrintSettings {
  bool silent;
  bool print_background;
  base::string16 device_name;
};

}  // namespace

namespace mate {

template<>
struct Converter<atom::SetSizeParams> {
  static bool FromV8(v8::Isolate* isolate,
                     v8::Local<v8::Value> val,
                     atom::SetSizeParams* out) {
    mate::Dictionary params;
    if (!ConvertFromV8(isolate, val, &params))
      return false;
    bool autosize;
    if (params.Get("enableAutoSize", &autosize))
      out->enable_auto_size.reset(new bool(true));
    gfx::Size size;
    if (params.Get("min", &size))
      out->min_size.reset(new gfx::Size(size));
    if (params.Get("max", &size))
      out->max_size.reset(new gfx::Size(size));
    if (params.Get("normal", &size))
      out->normal_size.reset(new gfx::Size(size));
    return true;
  }
};

template<>
struct Converter<PrintSettings> {
  static bool FromV8(v8::Isolate* isolate, v8::Local<v8::Value> val,
                     PrintSettings* out) {
    mate::Dictionary dict;
    if (!ConvertFromV8(isolate, val, &dict))
      return false;
    dict.Get("silent", &(out->silent));
    dict.Get("printBackground", &(out->print_background));
    dict.Get("deviceName", &(out->device_name));
    return true;
  }
};

template<>
struct Converter<printing::PrinterBasicInfo> {
  static v8::Local<v8::Value> ToV8(v8::Isolate* isolate,
                                   const printing::PrinterBasicInfo& val) {
    mate::Dictionary dict(isolate, v8::Object::New(isolate));
    dict.Set("name", val.printer_name);
    dict.Set("description", val.printer_description);
    dict.Set("status", val.printer_status);
    dict.Set("isDefault", val.is_default ? true : false);
    dict.Set("options", val.options);
    return dict.GetHandle();
  }
};

template<>
struct Converter<WindowOpenDisposition> {
  static v8::Local<v8::Value> ToV8(v8::Isolate* isolate,
                                   WindowOpenDisposition val) {
    std::string disposition = "other";
    switch (val) {
      case WindowOpenDisposition::CURRENT_TAB:
        disposition = "default";
        break;
      case WindowOpenDisposition::NEW_FOREGROUND_TAB:
        disposition = "foreground-tab";
        break;
      case WindowOpenDisposition::NEW_BACKGROUND_TAB:
        disposition = "background-tab";
        break;
      case WindowOpenDisposition::NEW_POPUP:
      case WindowOpenDisposition::NEW_WINDOW:
        disposition = "new-window";
        break;
      case WindowOpenDisposition::SAVE_TO_DISK:
        disposition = "save-to-disk";
        break;
      default:
        break;
    }
    return mate::ConvertToV8(isolate, disposition);
  }
};

template<>
struct Converter<content::SavePageType> {
  static bool FromV8(v8::Isolate* isolate, v8::Local<v8::Value> val,
                     content::SavePageType* out) {
    std::string save_type;
    if (!ConvertFromV8(isolate, val, &save_type))
      return false;
    save_type = base::ToLowerASCII(save_type);
    if (save_type == "htmlonly") {
      *out = content::SAVE_PAGE_TYPE_AS_ONLY_HTML;
    } else if (save_type == "htmlcomplete") {
      *out = content::SAVE_PAGE_TYPE_AS_COMPLETE_HTML;
    } else if (save_type == "mhtml") {
      *out = content::SAVE_PAGE_TYPE_AS_MHTML;
    } else {
      return false;
    }
    return true;
  }
};

template<>
struct Converter<atom::api::WebContents::Type> {
  static v8::Local<v8::Value> ToV8(v8::Isolate* isolate,
                                   atom::api::WebContents::Type val) {
    using Type = atom::api::WebContents::Type;
    std::string type = "";
    switch (val) {
      case Type::BACKGROUND_PAGE: type = "backgroundPage"; break;
      case Type::BROWSER_WINDOW: type = "window"; break;
      case Type::BROWSER_VIEW: type = "browserView"; break;
      case Type::REMOTE: type = "remote"; break;
      case Type::WEB_VIEW: type = "webview"; break;
      case Type::OFF_SCREEN: type = "offscreen"; break;
      default: break;
    }
    return mate::ConvertToV8(isolate, type);
  }

  static bool FromV8(v8::Isolate* isolate, v8::Local<v8::Value> val,
                     atom::api::WebContents::Type* out) {
    using Type = atom::api::WebContents::Type;
    std::string type;
    if (!ConvertFromV8(isolate, val, &type))
      return false;
    if (type == "backgroundPage") {
      *out = Type::BACKGROUND_PAGE;
    } else if (type == "browserView") {
      *out = Type::BROWSER_VIEW;
    } else if (type == "webview") {
      *out = Type::WEB_VIEW;
#if defined(ENABLE_OSR)
    } else if (type == "offscreen") {
      *out = Type::OFF_SCREEN;
#endif
    } else {
      return false;
    }
    return true;
  }
};

}  // namespace mate


namespace atom {

namespace api {

namespace {

content::ServiceWorkerContext* GetServiceWorkerContext(
    const content::WebContents* web_contents) {
  auto context = web_contents->GetBrowserContext();
  auto site_instance = web_contents->GetSiteInstance();
  if (!context || !site_instance)
    return nullptr;

  auto storage_partition =
      content::BrowserContext::GetStoragePartition(context, site_instance);
  if (!storage_partition)
    return nullptr;

  return storage_partition->GetServiceWorkerContext();
}

// Called when CapturePage is done.
void OnCapturePageDone(const base::Callback<void(const gfx::Image&)>& callback,
                       const SkBitmap& bitmap,
                       content::ReadbackResponse response) {
  callback.Run(gfx::Image::CreateFrom1xBitmap(bitmap));
}

}  // namespace

WebContents::WebContents(v8::Isolate* isolate,
                         content::WebContents* web_contents,
                         Type type)
    : content::WebContentsObserver(web_contents),
      embedder_(nullptr),
      zoom_controller_(nullptr),
      type_(type),
      request_id_(0),
      background_throttling_(true),
      enable_devtools_(true) {
  if (type == REMOTE) {
    web_contents->SetUserAgentOverride(GetBrowserContext()->GetUserAgent());
    Init(isolate);
    AttachAsUserData(web_contents);
  } else {
    const mate::Dictionary options = mate::Dictionary::CreateEmpty(isolate);
    auto session = Session::CreateFrom(isolate, GetBrowserContext());
    session_.Reset(isolate, session.ToV8());
    InitWithSessionAndOptions(isolate, web_contents, session, options);
  }
}

WebContents::WebContents(v8::Isolate* isolate, const mate::Dictionary& options)
    : embedder_(nullptr),
      zoom_controller_(nullptr),
      type_(BROWSER_WINDOW),
      request_id_(0),
      background_throttling_(true),
      enable_devtools_(true) {
  // WebContents may need to emit events when it is garbage collected, so it
  // has to be deleted in the first gc callback.
  MarkHighMemoryUsage();

  // Read options.
  options.Get("backgroundThrottling", &background_throttling_);

  // FIXME(zcbenz): We should read "type" parameter for better design, but
  // on Windows we have encountered a compiler bug that if we read "type"
  // from |options| and then set |type_|, a memory corruption will happen
  // and Electron will soon crash.
  // Remvoe this after we upgraded to use VS 2015 Update 3.
  bool b = false;
  if (options.Get("isGuest", &b) && b)
    type_ = WEB_VIEW;
  else if (options.Get("isBackgroundPage", &b) && b)
    type_ = BACKGROUND_PAGE;
  else if (options.Get("isBrowserView", &b) && b)
    type_ = BROWSER_VIEW;
#if defined(ENABLE_OSR)
  else if (options.Get("offscreen", &b) && b)
    type_ = OFF_SCREEN;
#endif

  // Init embedder earlier
  options.Get("embedder", &embedder_);

  // Whether to enable DevTools.
  options.Get("devTools", &enable_devtools_);

  // Obtain the session.
  std::string partition;
  mate::Handle<api::Session> session;
  if (options.Get("session", &session)) {
  } else if (options.Get("partition", &partition)) {
    session = Session::FromPartition(isolate, partition);
  } else {
    // Use the default session if not specified.
    session = Session::FromPartition(isolate, "");
  }
  session_.Reset(isolate, session.ToV8());

  content::WebContents* web_contents;
  if (IsGuest()) {
    scoped_refptr<content::SiteInstance> site_instance =
        content::SiteInstance::CreateForURL(
            session->browser_context(), GURL("chrome-guest://fake-host"));
    content::WebContents::CreateParams params(
        session->browser_context(), site_instance);
    guest_delegate_.reset(new WebViewGuestDelegate);
    params.guest_delegate = guest_delegate_.get();

#if defined(ENABLE_OSR)
    if (embedder_ && embedder_->IsOffScreen()) {
      auto* view = new OffScreenWebContentsView(false,
          base::Bind(&WebContents::OnPaint, base::Unretained(this)));
      params.view = view;
      params.delegate_view = view;

      web_contents = content::WebContents::Create(params);
      view->SetWebContents(web_contents);
    } else {
#endif
      web_contents = content::WebContents::Create(params);
#if defined(ENABLE_OSR)
    }
  } else if (IsOffScreen()) {
    bool transparent = false;
    options.Get("transparent", &transparent);

    content::WebContents::CreateParams params(session->browser_context());
    auto* view = new OffScreenWebContentsView(
        transparent, base::Bind(&WebContents::OnPaint, base::Unretained(this)));
    params.view = view;
    params.delegate_view = view;

    web_contents = content::WebContents::Create(params);
    view->SetWebContents(web_contents);
#endif
  } else {
    content::WebContents::CreateParams params(session->browser_context());
    web_contents = content::WebContents::Create(params);
  }

  InitWithSessionAndOptions(isolate, web_contents, session, options);
}

void WebContents::InitWithSessionAndOptions(v8::Isolate* isolate,
                                            content::WebContents *web_contents,
                                            mate::Handle<api::Session> session,
                                            const mate::Dictionary& options) {
  Observe(web_contents);
  InitWithWebContents(web_contents, session->browser_context());

  managed_web_contents()->GetView()->SetDelegate(this);

  // Save the preferences in C++.
  new WebContentsPreferences(web_contents, options);

  // Initialize permission helper.
  WebContentsPermissionHelper::CreateForWebContents(web_contents);
  // Initialize security state client.
  SecurityStateTabHelper::CreateForWebContents(web_contents);
  // Initialize zoom controller.
  WebContentsZoomController::CreateForWebContents(web_contents);
  zoom_controller_ = WebContentsZoomController::FromWebContents(web_contents);
  double zoom_factor;
  if (options.Get(options::kZoomFactor, &zoom_factor))
    zoom_controller_->SetDefaultZoomFactor(zoom_factor);

  web_contents->SetUserAgentOverride(GetBrowserContext()->GetUserAgent());

  if (IsGuest()) {
    guest_delegate_->Initialize(this);

    NativeWindow* owner_window = nullptr;
    if (embedder_) {
      // New WebContents's owner_window is the embedder's owner_window.
      auto relay =
          NativeWindowRelay::FromWebContents(embedder_->web_contents());
      if (relay)
        owner_window = relay->window.get();
    }
    if (owner_window)
      SetOwnerWindow(owner_window);
  }

  Init(isolate);
  AttachAsUserData(web_contents);
}

WebContents::~WebContents() {
  // The destroy() is called.
  if (managed_web_contents()) {
    // For webview we need to tell content module to do some cleanup work before
    // destroying it.
    if (type_ == WEB_VIEW)
      guest_delegate_->Destroy();

    RenderViewDeleted(web_contents()->GetRenderViewHost());

    if (type_ == WEB_VIEW) {
      DestroyWebContents(false /* async */);
    } else {
      if (type_ == BROWSER_WINDOW && owner_window()) {
        owner_window()->CloseContents(nullptr);
      } else {
        DestroyWebContents(true /* async */);
      }
      // The WebContentsDestroyed will not be called automatically because we
      // destroy the webContents in the next tick. So we have to manually
      // call it here to make sure "destroyed" event is emitted.
      WebContentsDestroyed();
    }
  }
}

void WebContents::DestroyWebContents(bool async) {
  // This event is only for internal use, which is emitted when WebContents is
  // being destroyed.
  Emit("will-destroy");
  ResetManagedWebContents(async);
}

bool WebContents::DidAddMessageToConsole(content::WebContents* source,
                                         int32_t level,
                                         const base::string16& message,
                                         int32_t line_no,
                                         const base::string16& source_id) {
  if (type_ == BROWSER_WINDOW || type_ == OFF_SCREEN) {
    return false;
  } else {
    Emit("console-message", level, message, line_no, source_id);
    return true;
  }
}

void WebContents::OnCreateWindow(
    const GURL& target_url,
    const std::string& frame_name,
    WindowOpenDisposition disposition,
    const std::vector<std::string>& features,
    const scoped_refptr<content::ResourceRequestBodyImpl>& body) {
  if (type_ == BROWSER_WINDOW || type_ == OFF_SCREEN)
    Emit("-new-window", target_url, frame_name, disposition, features, body);
  else
    Emit("new-window", target_url, frame_name, disposition, features);
}

void WebContents::WebContentsCreated(content::WebContents* source_contents,
                                     int opener_render_process_id,
                                     int opener_render_frame_id,
                                     const std::string& frame_name,
                                     const GURL& target_url,
                                     content::WebContents* new_contents) {
  v8::Locker locker(isolate());
  v8::HandleScope handle_scope(isolate());
  auto api_web_contents = CreateFrom(isolate(), new_contents, BROWSER_WINDOW);
  Emit("-web-contents-created", api_web_contents, target_url, frame_name);
}

void WebContents::AddNewContents(content::WebContents* source,
                                 content::WebContents* new_contents,
                                 WindowOpenDisposition disposition,
                                 const gfx::Rect& initial_rect,
                                 bool user_gesture,
                                 bool* was_blocked) {
  new ChildWebContentsTracker(new_contents);
  v8::Locker locker(isolate());
  v8::HandleScope handle_scope(isolate());
  auto api_web_contents = CreateFrom(isolate(), new_contents);
  if (Emit("-add-new-contents", api_web_contents, disposition, user_gesture,
      initial_rect.x(), initial_rect.y(), initial_rect.width(),
      initial_rect.height())) {
    api_web_contents->DestroyWebContents(true /* async */);
  }
}

content::WebContents* WebContents::OpenURLFromTab(
    content::WebContents* source,
    const content::OpenURLParams& params) {
  if (params.disposition != WindowOpenDisposition::CURRENT_TAB) {
    if (type_ == BROWSER_WINDOW || type_ == OFF_SCREEN)
      Emit("-new-window", params.url, "", params.disposition);
    else
      Emit("new-window", params.url, "", params.disposition);
    return nullptr;
  }

  // Give user a chance to cancel navigation.
  if (Emit("will-navigate", params.url))
    return nullptr;

  // Don't load the URL if the web contents was marked as destroyed from a
  // will-navigate event listener
  if (IsDestroyed())
    return nullptr;

  return CommonWebContentsDelegate::OpenURLFromTab(source, params);
}

void WebContents::BeforeUnloadFired(content::WebContents* tab,
                                    bool proceed,
                                    bool* proceed_to_fire_unload) {
  if (type_ == BROWSER_WINDOW || type_ == OFF_SCREEN)
    *proceed_to_fire_unload = proceed;
  else
    *proceed_to_fire_unload = true;
}

void WebContents::MoveContents(content::WebContents* source,
                               const gfx::Rect& pos) {
  Emit("move", pos);
}

void WebContents::CloseContents(content::WebContents* source) {
  Emit("close");

  if ((type_ == BROWSER_WINDOW || type_ == OFF_SCREEN) && owner_window())
    owner_window()->CloseContents(source);
}

void WebContents::ActivateContents(content::WebContents* source) {
  Emit("activate");
}

void WebContents::UpdateTargetURL(content::WebContents* source,
                                  const GURL& url) {
  Emit("update-target-url", url);
}

bool WebContents::IsPopupOrPanel(const content::WebContents* source) const {
  return type_ == BROWSER_WINDOW;
}

void WebContents::HandleKeyboardEvent(
    content::WebContents* source,
    const content::NativeWebKeyboardEvent& event) {
  if (type_ == WEB_VIEW && embedder_) {
    // Send the unhandled keyboard events back to the embedder.
    embedder_->HandleKeyboardEvent(source, event);
  } else {
    // Go to the default keyboard handling.
    CommonWebContentsDelegate::HandleKeyboardEvent(source, event);
  }
}

content::KeyboardEventProcessingResult WebContents::PreHandleKeyboardEvent(
    content::WebContents* source,
    const content::NativeWebKeyboardEvent& event) {
  if (event.GetType() == blink::WebInputEvent::Type::kRawKeyDown ||
      event.GetType() == blink::WebInputEvent::Type::kKeyUp) {
    bool prevent_default = Emit("before-input-event", event);
    if (prevent_default) {
      return content::KeyboardEventProcessingResult::HANDLED;
    }
  }

  return content::KeyboardEventProcessingResult::NOT_HANDLED;
}

void WebContents::EnterFullscreenModeForTab(content::WebContents* source,
                                            const GURL& origin) {
  auto permission_helper =
      WebContentsPermissionHelper::FromWebContents(source);
  auto callback = base::Bind(&WebContents::OnEnterFullscreenModeForTab,
                             base::Unretained(this), source, origin);
  permission_helper->RequestFullscreenPermission(callback);
}

void WebContents::OnEnterFullscreenModeForTab(content::WebContents* source,
                                              const GURL& origin,
                                              bool allowed) {
  if (!allowed)
    return;
  CommonWebContentsDelegate::EnterFullscreenModeForTab(source, origin);
  Emit("enter-html-full-screen");
}

void WebContents::ExitFullscreenModeForTab(content::WebContents* source) {
  CommonWebContentsDelegate::ExitFullscreenModeForTab(source);
  Emit("leave-html-full-screen");
}

void WebContents::RendererUnresponsive(
    content::WebContents* source,
    const content::WebContentsUnresponsiveState& unresponsive_state) {
  Emit("unresponsive");
  if ((type_ == BROWSER_WINDOW || type_ == OFF_SCREEN) && owner_window())
    owner_window()->RendererUnresponsive(source);
}

void WebContents::RendererResponsive(content::WebContents* source) {
  Emit("responsive");
  if ((type_ == BROWSER_WINDOW || type_ == OFF_SCREEN) && owner_window())
    owner_window()->RendererResponsive(source);
}

bool WebContents::HandleContextMenu(const content::ContextMenuParams& params) {
  if (params.custom_context.is_pepper_menu) {
    Emit("pepper-context-menu", std::make_pair(params, web_contents()));
    web_contents()->NotifyContextMenuClosed(params.custom_context);
  } else {
    Emit("context-menu", std::make_pair(params, web_contents()));
  }

  return true;
}

bool WebContents::OnGoToEntryOffset(int offset) {
  GoToOffset(offset);
  return false;
}

void WebContents::FindReply(content::WebContents* web_contents,
                            int request_id,
                            int number_of_matches,
                            const gfx::Rect& selection_rect,
                            int active_match_ordinal,
                            bool final_update) {
  if (!final_update)
    return;

  v8::Locker locker(isolate());
  v8::HandleScope handle_scope(isolate());
  mate::Dictionary result = mate::Dictionary::CreateEmpty(isolate());
  result.Set("requestId", request_id);
  result.Set("matches", number_of_matches);
  result.Set("selectionArea", selection_rect);
  result.Set("activeMatchOrdinal", active_match_ordinal);
  result.Set("finalUpdate", final_update);  // Deprecate after 2.0
  Emit("found-in-page", result);
}

bool WebContents::CheckMediaAccessPermission(
    content::WebContents* web_contents,
    const GURL& security_origin,
    content::MediaStreamType type) {
  return true;
}

void WebContents::RequestMediaAccessPermission(
    content::WebContents* web_contents,
    const content::MediaStreamRequest& request,
    const content::MediaResponseCallback& callback) {
  auto permission_helper =
      WebContentsPermissionHelper::FromWebContents(web_contents);
  permission_helper->RequestMediaAccessPermission(request, callback);
}

void WebContents::RequestToLockMouse(
    content::WebContents* web_contents,
    bool user_gesture,
    bool last_unlocked_by_target) {
  auto permission_helper =
      WebContentsPermissionHelper::FromWebContents(web_contents);
  permission_helper->RequestPointerLockPermission(user_gesture);
}

std::unique_ptr<content::BluetoothChooser> WebContents::RunBluetoothChooser(
    content::RenderFrameHost* frame,
    const content::BluetoothChooser::EventHandler& event_handler) {
  std::unique_ptr<BluetoothChooser> bluetooth_chooser(
      new BluetoothChooser(this, event_handler));
  return std::move(bluetooth_chooser);
}

content::JavaScriptDialogManager*
WebContents::GetJavaScriptDialogManager(
    content::WebContents* source) {
  if (!dialog_manager_)
    dialog_manager_.reset(new AtomJavaScriptDialogManager(this));

  return dialog_manager_.get();
}

void WebContents::BeforeUnloadFired(const base::TimeTicks& proceed_time) {
  // Do nothing, we override this method just to avoid compilation error since
  // there are two virtual functions named BeforeUnloadFired.
}

void WebContents::RenderViewCreated(content::RenderViewHost* render_view_host) {
  const auto impl = content::RenderWidgetHostImpl::FromID(
      render_view_host->GetProcess()->GetID(),
      render_view_host->GetRoutingID());
  if (impl)
    impl->disable_hidden_ = !background_throttling_;
}

void WebContents::RenderViewDeleted(content::RenderViewHost* render_view_host) {
  Emit("render-view-deleted", render_view_host->GetProcess()->GetID());
}

void WebContents::RenderProcessGone(base::TerminationStatus status) {
  Emit("crashed", status == base::TERMINATION_STATUS_PROCESS_WAS_KILLED);
}

void WebContents::PluginCrashed(const base::FilePath& plugin_path,
                                base::ProcessId plugin_pid) {
  content::WebPluginInfo info;
  auto plugin_service = content::PluginService::GetInstance();
  plugin_service->GetPluginInfoByPath(plugin_path, &info);
  Emit("plugin-crashed", info.name, info.version);
}

void WebContents::MediaStartedPlaying(const MediaPlayerInfo& video_type,
                                      const MediaPlayerId& id) {
  Emit("media-started-playing");
}

void WebContents::MediaStoppedPlaying(const MediaPlayerInfo& video_type,
                                      const MediaPlayerId& id) {
  Emit("media-paused");
}

void WebContents::DidChangeThemeColor(SkColor theme_color) {
  Emit("did-change-theme-color", atom::ToRGBHex(theme_color));
}

void WebContents::DocumentLoadedInFrame(
    content::RenderFrameHost* render_frame_host) {
  if (!render_frame_host->GetParent())
    Emit("dom-ready");
}

void WebContents::DidFinishLoad(content::RenderFrameHost* render_frame_host,
                                const GURL& validated_url) {
  bool is_main_frame = !render_frame_host->GetParent();
  Emit("did-frame-finish-load", is_main_frame);

  if (is_main_frame)
    Emit("did-finish-load");
}

void WebContents::DidFailLoad(content::RenderFrameHost* render_frame_host,
                              const GURL& url,
                              int error_code,
                              const base::string16& error_description,
                              bool was_ignored_by_handler) {
  bool is_main_frame = !render_frame_host->GetParent();
  Emit("did-fail-load", error_code, error_description, url, is_main_frame);
}

void WebContents::DidStartLoading() {
  Emit("did-start-loading");
}

void WebContents::DidStopLoading() {
  Emit("did-stop-loading");
}

void WebContents::DidGetResourceResponseStart(
    const content::ResourceRequestDetails& details) {
  Emit("did-get-response-details",
       details.socket_address.IsEmpty(),
       details.url,
       details.original_url,
       details.http_response_code,
       details.method,
       details.referrer,
       details.headers.get(),
       ResourceTypeToString(details.resource_type));
}

void WebContents::DidGetRedirectForResourceRequest(
    const content::ResourceRedirectDetails& details) {
  Emit("did-get-redirect-request",
       details.url,
       details.new_url,
       (details.resource_type == content::RESOURCE_TYPE_MAIN_FRAME),
       details.http_response_code,
       details.method,
       details.referrer,
       details.headers.get());
}

void WebContents::DidFinishNavigation(
    content::NavigationHandle* navigation_handle) {
  bool is_main_frame = navigation_handle->IsInMainFrame();
  if (navigation_handle->HasCommitted() && !navigation_handle->IsErrorPage()) {
    auto url = navigation_handle->GetURL();
    bool is_in_page = navigation_handle->IsSameDocument();
    if (is_main_frame && !is_in_page) {
      Emit("did-navigate", url);
    } else if (is_in_page) {
      Emit("did-navigate-in-page", url, is_main_frame);
    }
  } else {
    auto url = navigation_handle->GetURL();
    int code = navigation_handle->GetNetErrorCode();
    auto description = net::ErrorToShortString(code);
    Emit("did-fail-provisional-load", code, description, url, is_main_frame);

    // Do not emit "did-fail-load" for canceled requests.
    if (code != net::ERR_ABORTED)
      Emit("did-fail-load", code, description, url, is_main_frame);
  }
}

void WebContents::TitleWasSet(content::NavigationEntry* entry,
                              bool explicit_set) {
  auto title = entry ? entry->GetTitle() : base::string16();
  Emit("page-title-updated", title, explicit_set);
}

void WebContents::DidUpdateFaviconURL(
    const std::vector<content::FaviconURL>& urls) {
  std::set<GURL> unique_urls;
  for (const auto& iter : urls) {
    if (iter.icon_type != content::FaviconURL::FAVICON)
      continue;
    const GURL& url = iter.icon_url;
    if (url.is_valid())
      unique_urls.insert(url);
  }
  Emit("page-favicon-updated", unique_urls);
}

void WebContents::DevToolsReloadPage() {
  Emit("devtools-reload-page");
}

void WebContents::DevToolsFocused() {
  Emit("devtools-focused");
}

void WebContents::DevToolsOpened() {
  v8::Locker locker(isolate());
  v8::HandleScope handle_scope(isolate());
  auto handle = WebContents::CreateFrom(
      isolate(), managed_web_contents()->GetDevToolsWebContents());
  devtools_web_contents_.Reset(isolate(), handle.ToV8());

  // Set inspected tabID.
  base::Value tab_id(ID());
  managed_web_contents()->CallClientFunction(
      "DevToolsAPI.setInspectedTabId", &tab_id, nullptr, nullptr);

  // Inherit owner window in devtools.
  if (owner_window())
    handle->SetOwnerWindow(managed_web_contents()->GetDevToolsWebContents(),
                           owner_window());

  Emit("devtools-opened");
}

void WebContents::DevToolsClosed() {
  v8::Locker locker(isolate());
  v8::HandleScope handle_scope(isolate());
  devtools_web_contents_.Reset();

  Emit("devtools-closed");
}

bool WebContents::OnMessageReceived(const IPC::Message& message) {
  bool handled = true;
  IPC_BEGIN_MESSAGE_MAP(WebContents, message)
    IPC_MESSAGE_HANDLER(AtomViewHostMsg_Message, OnRendererMessage)
    IPC_MESSAGE_HANDLER_DELAY_REPLY(AtomViewHostMsg_Message_Sync,
                                    OnRendererMessageSync)
    IPC_MESSAGE_HANDLER_DELAY_REPLY(AtomViewHostMsg_SetTemporaryZoomLevel,
                                    OnSetTemporaryZoomLevel)
    IPC_MESSAGE_HANDLER_DELAY_REPLY(AtomViewHostMsg_GetZoomLevel,
                                    OnGetZoomLevel)
    IPC_MESSAGE_HANDLER_CODE(ViewHostMsg_SetCursor, OnCursorChange,
      handled = false)
    IPC_MESSAGE_UNHANDLED(handled = false)
  IPC_END_MESSAGE_MAP()

  return handled;
}

bool WebContents::OnMessageReceived(const IPC::Message& message,
    content::RenderFrameHost* frame_host) {
  bool handled = true;
  auto relay = NativeWindowRelay::FromWebContents(web_contents());
  if (!relay)
    return false;
  IPC_BEGIN_MESSAGE_MAP_WITH_PARAM(NativeWindow, message, frame_host)
    IPC_MESSAGE_FORWARD(AtomAutofillFrameHostMsg_ShowPopup,
      relay->window.get(), NativeWindow::ShowAutofillPopup)
    IPC_MESSAGE_FORWARD(AtomAutofillFrameHostMsg_HidePopup,
      relay->window.get(), NativeWindow::HideAutofillPopup)
    IPC_MESSAGE_UNHANDLED(handled = false)
  IPC_END_MESSAGE_MAP()

  return handled;
}

// There are three ways of destroying a webContents:
// 1. call webContents.destroy();
// 2. garbage collection;
// 3. user closes the window of webContents;
// For webview only #1 will happen, for BrowserWindow both #1 and #3 may
// happen. The #2 should never happen for webContents, because webview is
// managed by GuestViewManager, and BrowserWindow's webContents is managed
// by api::Window.
// For #1, the destructor will do the cleanup work and we only need to make
// sure "destroyed" event is emitted. For #3, the content::WebContents will
// be destroyed on close, and WebContentsDestroyed would be called for it, so
// we need to make sure the api::WebContents is also deleted.
void WebContents::WebContentsDestroyed() {
  // Cleanup relationships with other parts.
  RemoveFromWeakMap();

  // We can not call Destroy here because we need to call Emit first, but we
  // also do not want any method to be used, so just mark as destroyed here.
  MarkDestroyed();

  Emit("destroyed");

  // Destroy the native class in next tick.
  base::ThreadTaskRunnerHandle::Get()->PostTask(
      FROM_HERE, GetDestroyClosure());
}

void WebContents::NavigationEntryCommitted(
    const content::LoadCommittedDetails& details) {
  Emit("navigation-entry-commited", details.entry->GetURL(),
       details.is_in_page, details.did_replace_entry);
}

int64_t WebContents::GetID() const {
  int64_t process_id = web_contents()->GetRenderProcessHost()->GetID();
  int64_t routing_id = web_contents()->GetRenderViewHost()->GetRoutingID();
  int64_t rv = (process_id << 32) + routing_id;
  return rv;
}

int WebContents::GetProcessID() const {
  return web_contents()->GetRenderProcessHost()->GetID();
}

base::ProcessId WebContents::GetOSProcessID() const {
  auto process_handle = web_contents()->GetRenderProcessHost()->GetHandle();
  return base::GetProcId(process_handle);
}

WebContents::Type WebContents::GetType() const {
  return type_;
}

bool WebContents::Equal(const WebContents* web_contents) const {
  return GetID() == web_contents->GetID();
}

void WebContents::LoadURL(const GURL& url, const mate::Dictionary& options) {
  if (!url.is_valid() || url.spec().size() > url::kMaxURLChars) {
    Emit("did-fail-load",
         static_cast<int>(net::ERR_INVALID_URL),
         net::ErrorToShortString(net::ERR_INVALID_URL),
         url.possibly_invalid_spec(),
         true);
    return;
  }

  if (guest_delegate_ && !guest_delegate_->IsAttached()) {
    return;
  }

  content::NavigationController::LoadURLParams params(url);

  GURL http_referrer;
  if (options.Get("httpReferrer", &http_referrer))
    params.referrer = content::Referrer(http_referrer.GetAsReferrer(),
                                        blink::kWebReferrerPolicyDefault);

  std::string user_agent;
  if (options.Get("userAgent", &user_agent))
    web_contents()->SetUserAgentOverride(user_agent);

  std::string extra_headers;
  if (options.Get("extraHeaders", &extra_headers))
    params.extra_headers = extra_headers;

  scoped_refptr<content::ResourceRequestBodyImpl> body;
  if (options.Get("postData", &body)) {
    params.post_data = body;
    params.load_type = content::NavigationController::LOAD_TYPE_HTTP_POST;
  }

  GURL base_url_for_data_url;
  if (options.Get("baseURLForDataURL", &base_url_for_data_url)) {
    params.base_url_for_data_url = base_url_for_data_url;
    params.load_type = content::NavigationController::LOAD_TYPE_DATA;
  }

  params.transition_type = ui::PAGE_TRANSITION_TYPED;
  params.should_clear_history_list = true;
  params.override_user_agent = content::NavigationController::UA_OVERRIDE_TRUE;
  web_contents()->GetController().LoadURLWithParams(params);

  // Set the background color of RenderWidgetHostView.
  // We have to call it right after LoadURL because the RenderViewHost is only
  // created after loading a page.
  const auto view = web_contents()->GetRenderWidgetHostView();
  if (view) {
    WebContentsPreferences* web_preferences =
        WebContentsPreferences::FromWebContents(web_contents());
    std::string color_name;
    if (web_preferences->web_preferences()->GetString(options::kBackgroundColor,
                                                      &color_name)) {
      view->SetBackgroundColor(ParseHexColor(color_name));
    } else {
      view->SetBackgroundColor(SK_ColorTRANSPARENT);
    }
  }
}

void WebContents::DownloadURL(const GURL& url) {
  auto browser_context = web_contents()->GetBrowserContext();
  auto download_manager =
    content::BrowserContext::GetDownloadManager(browser_context);

  download_manager->DownloadUrl(
      content::DownloadUrlParameters::CreateForWebContentsMainFrame(
          web_contents(), url));
}

GURL WebContents::GetURL() const {
  return web_contents()->GetURL();
}

base::string16 WebContents::GetTitle() const {
  return web_contents()->GetTitle();
}

bool WebContents::IsLoading() const {
  return web_contents()->IsLoading();
}

bool WebContents::IsLoadingMainFrame() const {
  // Comparing site instances works because Electron always creates a new site
  // instance when navigating, regardless of origin. See AtomBrowserClient.
  return (web_contents()->GetLastCommittedURL().is_empty() ||
          web_contents()->GetSiteInstance() !=
          web_contents()->GetPendingSiteInstance()) && IsLoading();
}

bool WebContents::IsWaitingForResponse() const {
  return web_contents()->IsWaitingForResponse();
}

void WebContents::Stop() {
  web_contents()->Stop();
}

void WebContents::GoBack() {
  atom::AtomBrowserClient::SuppressRendererProcessRestartForOnce();
  web_contents()->GetController().GoBack();
}

void WebContents::GoForward() {
  atom::AtomBrowserClient::SuppressRendererProcessRestartForOnce();
  web_contents()->GetController().GoForward();
}

void WebContents::GoToOffset(int offset) {
  atom::AtomBrowserClient::SuppressRendererProcessRestartForOnce();
  web_contents()->GetController().GoToOffset(offset);
}

const std::string WebContents::GetWebRTCIPHandlingPolicy() const {
  return web_contents()->
    GetMutableRendererPrefs()->webrtc_ip_handling_policy;
}

void WebContents::SetWebRTCIPHandlingPolicy(
    const std::string& webrtc_ip_handling_policy) {
  if (GetWebRTCIPHandlingPolicy() == webrtc_ip_handling_policy)
    return;
  web_contents()->GetMutableRendererPrefs()->webrtc_ip_handling_policy =
    webrtc_ip_handling_policy;

  content::RenderViewHost* host = web_contents()->GetRenderViewHost();
  if (host)
    host->SyncRendererPrefs();
}

bool WebContents::IsCrashed() const {
  return web_contents()->IsCrashed();
}

void WebContents::SetUserAgent(const std::string& user_agent,
                               mate::Arguments* args) {
  web_contents()->SetUserAgentOverride(user_agent);
}

std::string WebContents::GetUserAgent() {
  return web_contents()->GetUserAgentOverride();
}

bool WebContents::SavePage(const base::FilePath& full_file_path,
                           const content::SavePageType& save_type,
                           const SavePageHandler::SavePageCallback& callback) {
  auto handler = new SavePageHandler(web_contents(), callback);
  return handler->Handle(full_file_path, save_type);
}

void WebContents::OpenDevTools(mate::Arguments* args) {
  if (type_ == REMOTE)
    return;

  if (!enable_devtools_)
    return;

  std::string state;
  if (type_ == WEB_VIEW || !owner_window()) {
    state = "detach";
  } else if (args && args->Length() == 1) {
    bool detach = false;
    mate::Dictionary options;
    if (args->GetNext(&options)) {
      options.Get("mode", &state);

      // TODO(kevinsawicki) Remove in 2.0
      options.Get("detach", &detach);
      if (state.empty() && detach)
        state = "detach";
    }
  }
  managed_web_contents()->SetDockState(state);
  managed_web_contents()->ShowDevTools();
}

void WebContents::CloseDevTools() {
  if (type_ == REMOTE)
    return;

  managed_web_contents()->CloseDevTools();
}

bool WebContents::IsDevToolsOpened() {
  if (type_ == REMOTE)
    return false;

  return managed_web_contents()->IsDevToolsViewShowing();
}

bool WebContents::IsDevToolsFocused() {
  if (type_ == REMOTE)
    return false;

  return managed_web_contents()->GetView()->IsDevToolsViewFocused();
}

void WebContents::EnableDeviceEmulation(
    const blink::WebDeviceEmulationParams& params) {
  if (type_ == REMOTE)
    return;

  Send(new ViewMsg_EnableDeviceEmulation(routing_id(), params));
}

void WebContents::DisableDeviceEmulation() {
  if (type_ == REMOTE)
    return;

  Send(new ViewMsg_DisableDeviceEmulation(routing_id()));
}

void WebContents::ToggleDevTools() {
  if (IsDevToolsOpened())
    CloseDevTools();
  else
    OpenDevTools(nullptr);
}

void WebContents::InspectElement(int x, int y) {
  if (type_ == REMOTE)
    return;

  if (!enable_devtools_)
    return;

  if (!managed_web_contents()->GetDevToolsWebContents())
    OpenDevTools(nullptr);
  managed_web_contents()->InspectElement(x, y);
}

void WebContents::InspectServiceWorker() {
  if (type_ == REMOTE)
    return;

  if (!enable_devtools_)
    return;

  for (const auto& agent_host : content::DevToolsAgentHost::GetOrCreateAll()) {
    if (agent_host->GetType() ==
        content::DevToolsAgentHost::kTypeServiceWorker) {
      OpenDevTools(nullptr);
      managed_web_contents()->AttachTo(agent_host);
      break;
    }
  }
}

void WebContents::HasServiceWorker(
    const base::Callback<void(bool)>& callback) {
  auto context = GetServiceWorkerContext(web_contents());
  if (!context)
    return;

  struct WrappedCallback {
    base::Callback<void(bool)> callback_;
    explicit WrappedCallback(const base::Callback<void(bool)>& callback)
        : callback_(callback) {}
    void Run(content::ServiceWorkerCapability capability) {
      callback_.Run(capability !=
                    content::ServiceWorkerCapability::NO_SERVICE_WORKER);
      delete this;
    }
  };

  auto wrapped_callback = new WrappedCallback(callback);

  context->CheckHasServiceWorker(
      web_contents()->GetLastCommittedURL(), GURL::EmptyGURL(),
      base::Bind(&WrappedCallback::Run, base::Unretained(wrapped_callback)));
}

void WebContents::UnregisterServiceWorker(
    const base::Callback<void(bool)>& callback) {
  auto context = GetServiceWorkerContext(web_contents());
  if (!context)
    return;

  context->UnregisterServiceWorker(web_contents()->GetLastCommittedURL(),
                                   callback);
}

void WebContents::SetIgnoreMenuShortcuts(bool ignore) {
  set_ignore_menu_shortcuts(ignore);
}

void WebContents::SetAudioMuted(bool muted) {
  web_contents()->SetAudioMuted(muted);
}

bool WebContents::IsAudioMuted() {
  return web_contents()->IsAudioMuted();
}

void WebContents::Print(mate::Arguments* args) {
  PrintSettings settings = { false, false, base::string16() };
  if (args->Length() >= 1 && !args->GetNext(&settings)) {
    args->ThrowError();
    return;
  }
  auto print_view_manager_basic_ptr =
      printing::PrintViewManagerBasic::FromWebContents(web_contents());
  if (args->Length() == 2) {
    base::Callback<void(bool)> callback;
    if (!args->GetNext(&callback)) {
      args->ThrowError();
      return;
    }
    print_view_manager_basic_ptr->SetCallback(callback);
  }
  print_view_manager_basic_ptr->PrintNow(web_contents()->GetMainFrame(),
               settings.silent,
               settings.print_background,
               settings.device_name);
}

std::vector<printing::PrinterBasicInfo> WebContents::GetPrinterList() {
  std::vector<printing::PrinterBasicInfo> printers;
  auto print_backend = printing::PrintBackend::CreateInstance(nullptr);
  print_backend->EnumeratePrinters(&printers);
  return printers;
}

void WebContents::PrintToPDF(const base::DictionaryValue& setting,
                             const PrintToPDFCallback& callback) {
  printing::PrintPreviewMessageHandler::FromWebContents(web_contents())->
      PrintToPDF(setting, callback);
}

void WebContents::AddWorkSpace(mate::Arguments* args,
                               const base::FilePath& path) {
  if (path.empty()) {
    args->ThrowError("path cannot be empty");
    return;
  }
  DevToolsAddFileSystem(path);
}

void WebContents::RemoveWorkSpace(mate::Arguments* args,
                                  const base::FilePath& path) {
  if (path.empty()) {
    args->ThrowError("path cannot be empty");
    return;
  }
  DevToolsRemoveFileSystem(path);
}

void WebContents::Undo() {
  web_contents()->Undo();
}

void WebContents::Redo() {
  web_contents()->Redo();
}

void WebContents::Cut() {
  web_contents()->Cut();
}

void WebContents::Copy() {
  web_contents()->Copy();
}

void WebContents::Paste() {
  web_contents()->Paste();
}

void WebContents::PasteAndMatchStyle() {
  web_contents()->PasteAndMatchStyle();
}

void WebContents::Delete() {
  web_contents()->Delete();
}

void WebContents::SelectAll() {
  web_contents()->SelectAll();
}

void WebContents::Unselect() {
  web_contents()->CollapseSelection();
}

void WebContents::Replace(const base::string16& word) {
  web_contents()->Replace(word);
}

void WebContents::ReplaceMisspelling(const base::string16& word) {
  web_contents()->ReplaceMisspelling(word);
}

uint32_t WebContents::FindInPage(mate::Arguments* args) {
  uint32_t request_id = GetNextRequestId();
  base::string16 search_text;
  blink::WebFindOptions options;
  if (!args->GetNext(&search_text) || search_text.empty()) {
    args->ThrowError("Must provide a non-empty search content");
    return 0;
  }

  args->GetNext(&options);

  web_contents()->Find(request_id, search_text, options);
  return request_id;
}

void WebContents::StopFindInPage(content::StopFindAction action) {
  web_contents()->StopFinding(action);
}

void WebContents::ShowDefinitionForSelection() {
#if defined(OS_MACOSX)
  const auto view = web_contents()->GetRenderWidgetHostView();
  if (view)
    view->ShowDefinitionForSelection();
#endif
}

void WebContents::CopyImageAt(int x, int y) {
  const auto host = web_contents()->GetMainFrame();
  if (host)
    host->CopyImageAt(x, y);
}

void WebContents::Focus() {
  web_contents()->Focus();
}

#if !defined(OS_MACOSX)
bool WebContents::IsFocused() const {
  auto view = web_contents()->GetRenderWidgetHostView();
  if (!view) return false;

  if (GetType() != BACKGROUND_PAGE) {
    auto window = web_contents()->GetNativeView()->GetToplevelWindow();
    if (window && !window->IsVisible())
      return false;
  }

  return view->HasFocus();
}
#endif

void WebContents::TabTraverse(bool reverse) {
  web_contents()->FocusThroughTabTraversal(reverse);
}

bool WebContents::SendIPCMessage(bool all_frames,
                                 const base::string16& channel,
                                 const base::ListValue& args) {
  return Send(new AtomViewMsg_Message(routing_id(), all_frames, channel, args));
}

void WebContents::SendInputEvent(v8::Isolate* isolate,
                                 v8::Local<v8::Value> input_event) {
  const auto view = static_cast<content::RenderWidgetHostViewBase*>(
    web_contents()->GetRenderWidgetHostView());
  if (!view)
    return;

  int type = mate::GetWebInputEventType(isolate, input_event);
  if (blink::WebInputEvent::IsMouseEventType(type)) {
    blink::WebMouseEvent mouse_event;
    if (mate::ConvertFromV8(isolate, input_event, &mouse_event)) {
      view->ProcessMouseEvent(mouse_event, ui::LatencyInfo());
      return;
    }
  } else if (blink::WebInputEvent::IsKeyboardEventType(type)) {
    content::NativeWebKeyboardEvent keyboard_event(
        blink::WebKeyboardEvent::kRawKeyDown,
        blink::WebInputEvent::kNoModifiers,
        ui::EventTimeForNow());
    if (mate::ConvertFromV8(isolate, input_event, &keyboard_event)) {
      view->ProcessKeyboardEvent(keyboard_event);
      return;
    }
  } else if (type == blink::WebInputEvent::kMouseWheel) {
    blink::WebMouseWheelEvent mouse_wheel_event;
    if (mate::ConvertFromV8(isolate, input_event, &mouse_wheel_event)) {
      view->ProcessMouseWheelEvent(mouse_wheel_event, ui::LatencyInfo());
      return;
    }
  }

  isolate->ThrowException(v8::Exception::Error(mate::StringToV8(
      isolate, "Invalid event object")));
}

void WebContents::BeginFrameSubscription(mate::Arguments* args) {
  bool only_dirty = false;
  FrameSubscriber::FrameCaptureCallback callback;

  args->GetNext(&only_dirty);
  if (!args->GetNext(&callback)) {
    args->ThrowError();
    return;
  }

  const auto view = web_contents()->GetRenderWidgetHostView();
  if (view) {
    std::unique_ptr<FrameSubscriber> frame_subscriber(new FrameSubscriber(
        isolate(), view, callback, only_dirty));
    view->BeginFrameSubscription(std::move(frame_subscriber));
  }
}

void WebContents::EndFrameSubscription() {
  const auto view = web_contents()->GetRenderWidgetHostView();
  if (view)
    view->EndFrameSubscription();
}

void WebContents::StartDrag(const mate::Dictionary& item,
                            mate::Arguments* args) {
  base::FilePath file;
  std::vector<base::FilePath> files;
  if (!item.Get("files", &files) && item.Get("file", &file)) {
    files.push_back(file);
  }

  mate::Handle<NativeImage> icon;
  if (!item.Get("icon", &icon) && !file.empty()) {
    // TODO(zcbenz): Set default icon from file.
  }

  // Error checking.
  if (icon.IsEmpty()) {
    args->ThrowError("Must specify 'icon' option");
    return;
  }

#if defined(OS_MACOSX)
  // NSWindow.dragImage requires a non-empty NSImage
  if (icon->image().IsEmpty()) {
    args->ThrowError("Must specify non-empty 'icon' option");
    return;
  }
#endif

  // Start dragging.
  if (!files.empty()) {
    base::MessageLoop::ScopedNestableTaskAllower allow(
        base::MessageLoop::current());
    DragFileItems(files, icon->image(), web_contents()->GetNativeView());
  } else {
    args->ThrowError("Must specify either 'file' or 'files' option");
  }
}

void WebContents::CapturePage(mate::Arguments* args) {
  gfx::Rect rect;
  base::Callback<void(const gfx::Image&)> callback;

  if (!(args->Length() == 1 && args->GetNext(&callback)) &&
      !(args->Length() == 2 && args->GetNext(&rect)
                            && args->GetNext(&callback))) {
    args->ThrowError();
    return;
  }

  const auto view = web_contents()->GetRenderWidgetHostView();
  if (!view) {
    callback.Run(gfx::Image());
    return;
  }

  // Capture full page if user doesn't specify a |rect|.
  const gfx::Size view_size = rect.IsEmpty() ? view->GetViewBounds().size() :
                                               rect.size();

  // By default, the requested bitmap size is the view size in screen
  // coordinates.  However, if there's more pixel detail available on the
  // current system, increase the requested bitmap size to capture it all.
  gfx::Size bitmap_size = view_size;
  const gfx::NativeView native_view = view->GetNativeView();
  const float scale =
      display::Screen::GetScreen()->GetDisplayNearestView(native_view)
      .device_scale_factor();
  if (scale > 1.0f)
    bitmap_size = gfx::ScaleToCeiledSize(view_size, scale);

  view->CopyFromSurface(gfx::Rect(rect.origin(), view_size),
                        bitmap_size,
                        base::Bind(&OnCapturePageDone, callback),
                        kBGRA_8888_SkColorType);
}

void WebContents::OnCursorChange(const content::WebCursor& cursor) {
  content::CursorInfo info;
  cursor.GetCursorInfo(&info);

  if (cursor.IsCustom()) {
    Emit("cursor-changed", CursorTypeToString(info),
      gfx::Image::CreateFrom1xBitmap(info.custom_image),
      info.image_scale_factor,
      gfx::Size(info.custom_image.width(), info.custom_image.height()),
      info.hotspot);
  } else {
    Emit("cursor-changed", CursorTypeToString(info));
  }
}

void WebContents::SetSize(const SetSizeParams& params) {
  if (guest_delegate_)
    guest_delegate_->SetSize(params);
}

bool WebContents::IsGuest() const {
  return type_ == WEB_VIEW;
}

bool WebContents::IsOffScreen() const {
#if defined(ENABLE_OSR)
  return type_ == OFF_SCREEN;
#else
  return false;
#endif
}

bool WebContents::IsOffScreenOrEmbedderOffscreen() const {
  return IsOffScreen() || (embedder_ && embedder_->IsOffScreen());
}

void WebContents::OnPaint(const gfx::Rect& dirty_rect, const SkBitmap& bitmap) {
  Emit("paint", dirty_rect, gfx::Image::CreateFrom1xBitmap(bitmap));
}

void WebContents::StartPainting() {
  if (!IsOffScreen())
    return;

#if defined(ENABLE_OSR)
  auto* osr_rwhv = static_cast<OffScreenRenderWidgetHostView*>(
      web_contents()->GetRenderWidgetHostView());
  if (osr_rwhv)
    osr_rwhv->SetPainting(true);
#endif
}

void WebContents::StopPainting() {
  if (!IsOffScreen())
    return;

#if defined(ENABLE_OSR)
  auto* osr_rwhv = static_cast<OffScreenRenderWidgetHostView*>(
      web_contents()->GetRenderWidgetHostView());
  if (osr_rwhv)
    osr_rwhv->SetPainting(false);
#endif
}

bool WebContents::IsPainting() const {
  if (!IsOffScreen())
    return false;

#if defined(ENABLE_OSR)
  const auto* osr_rwhv = static_cast<OffScreenRenderWidgetHostView*>(
      web_contents()->GetRenderWidgetHostView());
  return osr_rwhv && osr_rwhv->IsPainting();
#else
  return false;
#endif
}

void WebContents::SetFrameRate(int frame_rate) {
  if (!IsOffScreen())
    return;

#if defined(ENABLE_OSR)
  auto* osr_rwhv = static_cast<OffScreenRenderWidgetHostView*>(
      web_contents()->GetRenderWidgetHostView());
  if (osr_rwhv)
    osr_rwhv->SetFrameRate(frame_rate);
#endif
}

int WebContents::GetFrameRate() const {
  if (!IsOffScreen())
    return 0;

#if defined(ENABLE_OSR)
  const auto* osr_rwhv = static_cast<OffScreenRenderWidgetHostView*>(
      web_contents()->GetRenderWidgetHostView());
  return osr_rwhv ? osr_rwhv->GetFrameRate() : 0;
#else
  return 0;
#endif
}

void WebContents::Invalidate() {
  if (IsOffScreen()) {
#if defined(ENABLE_OSR)
    auto* osr_rwhv = static_cast<OffScreenRenderWidgetHostView*>(
      web_contents()->GetRenderWidgetHostView());
    if (osr_rwhv)
      osr_rwhv->Invalidate();
#endif
  } else {
    const auto window = owner_window();
    if (window)
      window->Invalidate();
  }
}

gfx::Size WebContents::GetSizeForNewRenderView(
    content::WebContents* wc) const {
  if (IsOffScreen() && wc == web_contents()) {
    auto relay = NativeWindowRelay::FromWebContents(web_contents());
    if (relay) {
      return relay->window->GetSize();
    }
  }

  return gfx::Size();
}

void WebContents::SetZoomLevel(double level) {
  zoom_controller_->SetZoomLevel(level);
}

double WebContents::GetZoomLevel() {
  return zoom_controller_->GetZoomLevel();
}

void WebContents::SetZoomFactor(double factor) {
  auto level = content::ZoomFactorToZoomLevel(factor);
  SetZoomLevel(level);
}

double WebContents::GetZoomFactor() {
  auto level = GetZoomLevel();
  return content::ZoomLevelToZoomFactor(level);
}

void WebContents::OnSetTemporaryZoomLevel(double level,
                                          IPC::Message* reply_msg) {
  zoom_controller_->SetTemporaryZoomLevel(level);
  double new_level = zoom_controller_->GetZoomLevel();
  AtomViewHostMsg_SetTemporaryZoomLevel::WriteReplyParams(reply_msg, new_level);
  Send(reply_msg);
}

void WebContents::OnGetZoomLevel(IPC::Message* reply_msg) {
  AtomViewHostMsg_GetZoomLevel::WriteReplyParams(reply_msg, GetZoomLevel());
  Send(reply_msg);
}

v8::Local<v8::Value> WebContents::GetWebPreferences(v8::Isolate* isolate) {
  WebContentsPreferences* web_preferences =
      WebContentsPreferences::FromWebContents(web_contents());
  return mate::ConvertToV8(isolate, *web_preferences->web_preferences());
}

v8::Local<v8::Value> WebContents::GetOwnerBrowserWindow() {
  if (owner_window())
    return Window::From(isolate(), owner_window());
  else
    return v8::Null(isolate());
}

int32_t WebContents::ID() const {
  return weak_map_id();
}

v8::Local<v8::Value> WebContents::Session(v8::Isolate* isolate) {
  return v8::Local<v8::Value>::New(isolate, session_);
}

content::WebContents* WebContents::HostWebContents() {
  if (!embedder_)
    return nullptr;
  return embedder_->web_contents();
}

void WebContents::SetEmbedder(const WebContents* embedder) {
  if (embedder) {
    NativeWindow* owner_window = nullptr;
    auto relay = NativeWindowRelay::FromWebContents(embedder->web_contents());
    if (relay) {
      owner_window = relay->window.get();
    }
    if (owner_window)
      SetOwnerWindow(owner_window);

    content::RenderWidgetHostView* rwhv =
        web_contents()->GetRenderWidgetHostView();
    if (rwhv) {
      rwhv->Hide();
      rwhv->Show();
    }
  }
}

v8::Local<v8::Value> WebContents::GetNativeView() const {
  gfx::NativeView ptr = web_contents()->GetNativeView();
  auto buffer = node::Buffer::Copy(
      isolate(), reinterpret_cast<char*>(&ptr), sizeof(gfx::NativeView));
  if (buffer.IsEmpty())
    return v8::Null(isolate());
  else
    return buffer.ToLocalChecked();
}

v8::Local<v8::Value> WebContents::DevToolsWebContents(v8::Isolate* isolate) {
  if (devtools_web_contents_.IsEmpty())
    return v8::Null(isolate);
  else
    return v8::Local<v8::Value>::New(isolate, devtools_web_contents_);
}

v8::Local<v8::Value> WebContents::Debugger(v8::Isolate* isolate) {
  if (debugger_.IsEmpty()) {
    auto handle = atom::api::Debugger::Create(isolate, web_contents());
    debugger_.Reset(isolate, handle.ToV8());
  }
  return v8::Local<v8::Value>::New(isolate, debugger_);
}

void WebContents::GrantOriginAccess(const GURL& url) {
  content::ChildProcessSecurityPolicy::GetInstance()->GrantOrigin(
      web_contents()->GetMainFrame()->GetProcess()->GetID(),
      url::Origin(url));
}

// static
void WebContents::BuildPrototype(v8::Isolate* isolate,
                                 v8::Local<v8::FunctionTemplate> prototype) {
  prototype->SetClassName(mate::StringToV8(isolate, "WebContents"));
  mate::ObjectTemplateBuilder(isolate, prototype->PrototypeTemplate())
      .MakeDestroyable()
      .SetMethod("getId", &WebContents::GetID)
      .SetMethod("getProcessId", &WebContents::GetProcessID)
      .SetMethod("getOSProcessId", &WebContents::GetOSProcessID)
      .SetMethod("equal", &WebContents::Equal)
      .SetMethod("_loadURL", &WebContents::LoadURL)
      .SetMethod("downloadURL", &WebContents::DownloadURL)
      .SetMethod("_getURL", &WebContents::GetURL)
      .SetMethod("getTitle", &WebContents::GetTitle)
      .SetMethod("isLoading", &WebContents::IsLoading)
      .SetMethod("isLoadingMainFrame", &WebContents::IsLoadingMainFrame)
      .SetMethod("isWaitingForResponse", &WebContents::IsWaitingForResponse)
      .SetMethod("_stop", &WebContents::Stop)
      .SetMethod("_goBack", &WebContents::GoBack)
      .SetMethod("_goForward", &WebContents::GoForward)
      .SetMethod("_goToOffset", &WebContents::GoToOffset)
      .SetMethod("isCrashed", &WebContents::IsCrashed)
      .SetMethod("setUserAgent", &WebContents::SetUserAgent)
      .SetMethod("getUserAgent", &WebContents::GetUserAgent)
      .SetMethod("savePage", &WebContents::SavePage)
      .SetMethod("openDevTools", &WebContents::OpenDevTools)
      .SetMethod("closeDevTools", &WebContents::CloseDevTools)
      .SetMethod("isDevToolsOpened", &WebContents::IsDevToolsOpened)
      .SetMethod("isDevToolsFocused", &WebContents::IsDevToolsFocused)
      .SetMethod("enableDeviceEmulation", &WebContents::EnableDeviceEmulation)
      .SetMethod("disableDeviceEmulation", &WebContents::DisableDeviceEmulation)
      .SetMethod("toggleDevTools", &WebContents::ToggleDevTools)
      .SetMethod("inspectElement", &WebContents::InspectElement)
      .SetMethod("setIgnoreMenuShortcuts",
                 &WebContents::SetIgnoreMenuShortcuts)
      .SetMethod("setAudioMuted", &WebContents::SetAudioMuted)
      .SetMethod("isAudioMuted", &WebContents::IsAudioMuted)
      .SetMethod("undo", &WebContents::Undo)
      .SetMethod("redo", &WebContents::Redo)
      .SetMethod("cut", &WebContents::Cut)
      .SetMethod("copy", &WebContents::Copy)
      .SetMethod("paste", &WebContents::Paste)
      .SetMethod("pasteAndMatchStyle", &WebContents::PasteAndMatchStyle)
      .SetMethod("delete", &WebContents::Delete)
      .SetMethod("selectAll", &WebContents::SelectAll)
      .SetMethod("unselect", &WebContents::Unselect)
      .SetMethod("replace", &WebContents::Replace)
      .SetMethod("replaceMisspelling", &WebContents::ReplaceMisspelling)
      .SetMethod("findInPage", &WebContents::FindInPage)
      .SetMethod("stopFindInPage", &WebContents::StopFindInPage)
      .SetMethod("focus", &WebContents::Focus)
      .SetMethod("isFocused", &WebContents::IsFocused)
      .SetMethod("tabTraverse", &WebContents::TabTraverse)
      .SetMethod("_send", &WebContents::SendIPCMessage)
      .SetMethod("sendInputEvent", &WebContents::SendInputEvent)
      .SetMethod("beginFrameSubscription", &WebContents::BeginFrameSubscription)
      .SetMethod("endFrameSubscription", &WebContents::EndFrameSubscription)
      .SetMethod("startDrag", &WebContents::StartDrag)
      .SetMethod("setSize", &WebContents::SetSize)
      .SetMethod("isGuest", &WebContents::IsGuest)
#if defined(ENABLE_OSR)
      .SetMethod("isOffscreen", &WebContents::IsOffScreen)
#endif
      .SetMethod("startPainting", &WebContents::StartPainting)
      .SetMethod("stopPainting", &WebContents::StopPainting)
      .SetMethod("isPainting", &WebContents::IsPainting)
      .SetMethod("setFrameRate", &WebContents::SetFrameRate)
      .SetMethod("getFrameRate", &WebContents::GetFrameRate)
      .SetMethod("invalidate", &WebContents::Invalidate)
      .SetMethod("setZoomLevel", &WebContents::SetZoomLevel)
      .SetMethod("_getZoomLevel", &WebContents::GetZoomLevel)
      .SetMethod("setZoomFactor", &WebContents::SetZoomFactor)
      .SetMethod("_getZoomFactor", &WebContents::GetZoomFactor)
      .SetMethod("getType", &WebContents::GetType)
      .SetMethod("getWebPreferences", &WebContents::GetWebPreferences)
      .SetMethod("getOwnerBrowserWindow", &WebContents::GetOwnerBrowserWindow)
      .SetMethod("hasServiceWorker", &WebContents::HasServiceWorker)
      .SetMethod("unregisterServiceWorker",
                 &WebContents::UnregisterServiceWorker)
      .SetMethod("inspectServiceWorker", &WebContents::InspectServiceWorker)
      .SetMethod("print", &WebContents::Print)
      .SetMethod("getPrinters", &WebContents::GetPrinterList)
      .SetMethod("_printToPDF", &WebContents::PrintToPDF)
      .SetMethod("addWorkSpace", &WebContents::AddWorkSpace)
      .SetMethod("removeWorkSpace", &WebContents::RemoveWorkSpace)
      .SetMethod("showDefinitionForSelection",
                 &WebContents::ShowDefinitionForSelection)
      .SetMethod("copyImageAt", &WebContents::CopyImageAt)
      .SetMethod("capturePage", &WebContents::CapturePage)
      .SetMethod("setEmbedder", &WebContents::SetEmbedder)
      .SetMethod("getNativeView", &WebContents::GetNativeView)
      .SetMethod("setWebRTCIPHandlingPolicy",
                 &WebContents::SetWebRTCIPHandlingPolicy)
      .SetMethod("getWebRTCIPHandlingPolicy",
                 &WebContents::GetWebRTCIPHandlingPolicy)
      .SetMethod("_grantOriginAccess", &WebContents::GrantOriginAccess)
      .SetProperty("id", &WebContents::ID)
      .SetProperty("session", &WebContents::Session)
      .SetProperty("hostWebContents", &WebContents::HostWebContents)
      .SetProperty("devToolsWebContents", &WebContents::DevToolsWebContents)
      .SetProperty("debugger", &WebContents::Debugger);
}

AtomBrowserContext* WebContents::GetBrowserContext() const {
  return static_cast<AtomBrowserContext*>(web_contents()->GetBrowserContext());
}

void WebContents::OnRendererMessage(const base::string16& channel,
                                    const base::ListValue& args) {
  // webContents.emit(channel, new Event(), args...);
  Emit(base::UTF16ToUTF8(channel), args);
}

void WebContents::OnRendererMessageSync(const base::string16& channel,
                                        const base::ListValue& args,
                                        IPC::Message* message) {
  // webContents.emit(channel, new Event(sender, message), args...);
  EmitWithSender(base::UTF16ToUTF8(channel), web_contents(), message, args);
}

// static
mate::Handle<WebContents> WebContents::CreateFrom(
    v8::Isolate* isolate, content::WebContents* web_contents) {
  // We have an existing WebContents object in JS.
  auto existing = TrackableObject::FromWrappedClass(isolate, web_contents);
  if (existing)
    return mate::CreateHandle(isolate, static_cast<WebContents*>(existing));

  // Otherwise create a new WebContents wrapper object.
  return mate::CreateHandle(isolate, new WebContents(isolate, web_contents,
        REMOTE));
}

mate::Handle<WebContents> WebContents::CreateFrom(
    v8::Isolate* isolate, content::WebContents* web_contents, Type type) {
  // Otherwise create a new WebContents wrapper object.
  return mate::CreateHandle(isolate, new WebContents(isolate, web_contents,
        type));
}

// static
mate::Handle<WebContents> WebContents::Create(
    v8::Isolate* isolate, const mate::Dictionary& options) {
  return mate::CreateHandle(isolate, new WebContents(isolate, options));
}

}  // namespace api

}  // namespace atom

namespace {

using atom::api::WebContents;

void Initialize(v8::Local<v8::Object> exports, v8::Local<v8::Value> unused,
                v8::Local<v8::Context> context, void* priv) {
  v8::Isolate* isolate = context->GetIsolate();
  mate::Dictionary dict(isolate, exports);
  dict.Set("WebContents", WebContents::GetConstructor(isolate)->GetFunction());
  dict.SetMethod("create", &WebContents::Create);
  dict.SetMethod("fromId", &mate::TrackableObject<WebContents>::FromWeakMapID);
  dict.SetMethod("getAllWebContents",
                 &mate::TrackableObject<WebContents>::GetAll);
}

}  // namespace

NODE_MODULE_CONTEXT_AWARE_BUILTIN(atom_browser_web_contents, Initialize)
