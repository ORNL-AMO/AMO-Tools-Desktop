#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include "brightray/browser/win/win32_desktop_notifications/desktop_notification_controller.h"
#include <windowsx.h>
#include <algorithm>
#include <vector>
#include "brightray/browser/win/win32_desktop_notifications/common.h"
#include "brightray/browser/win/win32_desktop_notifications/toast.h"

using std::make_shared;
using std::shared_ptr;

namespace brightray {

HBITMAP CopyBitmap(HBITMAP bitmap) {
    HBITMAP ret = NULL;

    BITMAP bm;
    if (bitmap && GetObject(bitmap, sizeof(bm), &bm)) {
        HDC hdc_screen = GetDC(NULL);
        ret = CreateCompatibleBitmap(hdc_screen, bm.bmWidth, bm.bmHeight);
        ReleaseDC(NULL, hdc_screen);

        if (ret) {
            HDC hdc_src = CreateCompatibleDC(NULL);
            HDC hdc_dst = CreateCompatibleDC(NULL);
            SelectBitmap(hdc_src, bitmap);
            SelectBitmap(hdc_dst, ret);
            BitBlt(hdc_dst, 0, 0, bm.bmWidth, bm.bmHeight,
                   hdc_src, 0, 0, SRCCOPY);
            DeleteDC(hdc_dst);
            DeleteDC(hdc_src);
        }
    }

    return ret;
}

HINSTANCE DesktopNotificationController::RegisterWndClasses() {
    // We keep a static `module` variable which serves a dual purpose:
    // 1. Stores the HINSTANCE where the window classes are registered,
    //    which can be passed to `CreateWindow`
    // 2. Indicates whether we already attempted the registration so that
    //    we don't do it twice (we don't retry even if registration fails,
    //    as there is no point).
    static HMODULE module = NULL;

    if (!module) {
        if (GetModuleHandleEx(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS |
                             GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
                             reinterpret_cast<LPCWSTR>(&RegisterWndClasses),
                             &module)) {
            Toast::Register(module);

            WNDCLASSEX wc = { sizeof(wc) };
            wc.lpfnWndProc = &WndProc;
            wc.lpszClassName = class_name_;
            wc.cbWndExtra = sizeof(DesktopNotificationController*);
            wc.hInstance = module;

            RegisterClassEx(&wc);
        }
    }

    return module;
}

DesktopNotificationController::DesktopNotificationController(
    unsigned maximum_toasts) {
    instances_.reserve(maximum_toasts);
}

DesktopNotificationController::~DesktopNotificationController() {
    for (auto&& inst : instances_) DestroyToast(inst);
    if (hwnd_controller_) DestroyWindow(hwnd_controller_);
    ClearAssets();
}

LRESULT CALLBACK DesktopNotificationController::WndProc(
    HWND hwnd, UINT message, WPARAM wparam, LPARAM lparam) {
    switch (message) {
    case WM_CREATE:
        {
            auto& cs = reinterpret_cast<const CREATESTRUCT*&>(lparam);
            SetWindowLongPtr(hwnd, 0, (LONG_PTR)cs->lpCreateParams);
        }
        break;

    case WM_TIMER:
        if (wparam == TimerID_Animate) {
            Get(hwnd)->AnimateAll();
        }
        return 0;

    case WM_DISPLAYCHANGE:
        {
            auto inst = Get(hwnd);
            inst->ClearAssets();
            inst->AnimateAll();
        }
        break;

    case WM_SETTINGCHANGE:
        if (wparam == SPI_SETWORKAREA) {
            Get(hwnd)->AnimateAll();
        }
        break;
    }

    return DefWindowProc(hwnd, message, wparam, lparam);
}

void DesktopNotificationController::StartAnimation() {
    _ASSERT(hwnd_controller_);

    if (!is_animating_ && hwnd_controller_) {
        // NOTE: 15ms is shorter than what we'd need for 60 fps, but since
        //       the timer is not accurate we must request a higher frame rate
        //       to get at least 60

        SetTimer(hwnd_controller_, TimerID_Animate, 15, nullptr);
        is_animating_ = true;
    }
}

HFONT DesktopNotificationController::GetCaptionFont() {
    InitializeFonts();
    return caption_font_;
}

HFONT DesktopNotificationController::GetBodyFont() {
    InitializeFonts();
    return body_font_;
}

void DesktopNotificationController::InitializeFonts() {
    if (!body_font_) {
        NONCLIENTMETRICS metrics = { sizeof(metrics) };
        if (SystemParametersInfo(SPI_GETNONCLIENTMETRICS, 0, &metrics, 0)) {
            auto baseHeight = metrics.lfMessageFont.lfHeight;

            HDC hdc = GetDC(NULL);
            auto dpi_y = GetDeviceCaps(hdc, LOGPIXELSY);
            ReleaseDC(NULL, hdc);

            metrics.lfMessageFont.lfHeight =
                (LONG)ScaleForDpi(baseHeight * 1.1f, dpi_y);
            body_font_ = CreateFontIndirect(&metrics.lfMessageFont);

            if (caption_font_) DeleteFont(caption_font_);
            metrics.lfMessageFont.lfHeight =
                (LONG)ScaleForDpi(baseHeight * 1.4f, dpi_y);
            caption_font_ = CreateFontIndirect(&metrics.lfMessageFont);
        }
    }
}

void DesktopNotificationController::ClearAssets() {
    if (caption_font_) { DeleteFont(caption_font_); caption_font_ = NULL; }
    if (body_font_) { DeleteFont(body_font_); body_font_ = NULL; }
}

void DesktopNotificationController::AnimateAll() {
    // NOTE: This function refreshes position and size of all toasts according
    // to all current conditions. Animation time is only one of the variables
    // influencing them. Screen resolution is another.

    bool keep_animating = false;

    if (!instances_.empty()) {
        RECT work_area;
        if (SystemParametersInfo(SPI_GETWORKAREA, 0, &work_area, 0)) {
            ScreenMetrics metrics;
            POINT origin = { work_area.right,
                             work_area.bottom - metrics.Y(toast_margin_<int>) };

            auto hdwp =
                BeginDeferWindowPos(static_cast<int>(instances_.size()));

            for (auto&& inst : instances_) {
                if (!inst.hwnd) continue;

                auto notification = Toast::Get(inst.hwnd);
                hdwp = notification->Animate(hdwp, origin);
                if (!hdwp) break;
                keep_animating |= notification->IsAnimationActive();
            }

            if (hdwp) EndDeferWindowPos(hdwp);
        }
    }

    if (!keep_animating) {
        _ASSERT(hwnd_controller_);
        if (hwnd_controller_) KillTimer(hwnd_controller_, TimerID_Animate);
        is_animating_ = false;
    }

    // Purge dismissed notifications and collapse the stack between
    // items which are highlighted
    if (!instances_.empty()) {
        auto is_alive = [](ToastInstance& inst) {
            return inst.hwnd && IsWindowVisible(inst.hwnd);
        };

        auto is_highlighted = [](ToastInstance& inst) {
            return inst.hwnd && Toast::Get(inst.hwnd)->IsHighlighted();
        };

        for (auto it = instances_.begin();; ++it) {
            // find next highlighted item
            auto it2 = find_if(it, instances_.end(), is_highlighted);

            // collapse the stack in front of the highlighted item
            it = stable_partition(it, it2, is_alive);

            // purge the dead items
            for_each(it, it2, [this](auto&& inst) { DestroyToast(inst); });

            if (it2 == instances_.end()) {
                instances_.erase(it, it2);
                break;
            }

            it = move(it2);
        }
    }

    // Set new toast positions
    if (!instances_.empty()) {
        ScreenMetrics metrics;
        auto margin = metrics.Y(toast_margin_<int>);

        int target_pos = 0;
        for (auto&& inst : instances_) {
            if (inst.hwnd) {
                auto toast = Toast::Get(inst.hwnd);

                if (toast->IsHighlighted())
                    target_pos = toast->GetVerticalPosition();
                else
                    toast->SetVerticalPosition(target_pos);

                target_pos += toast->GetHeight() + margin;
            }
        }
    }

    // Create new toasts from the queue
    CheckQueue();
}

DesktopNotificationController::Notification
    DesktopNotificationController::AddNotification(
    std::wstring caption, std::wstring body_text, HBITMAP image) {
    NotificationLink data(this);

    data->caption = move(caption);
    data->body_text = move(body_text);
    data->image = CopyBitmap(image);

    // Enqueue new notification
    Notification ret { *queue_.insert(queue_.end(), move(data)) };
    CheckQueue();
    return ret;
}

void DesktopNotificationController::CloseNotification(
    Notification& notification) {
    // Remove it from the queue
    auto it = find(queue_.begin(), queue_.end(), notification.data_);
    if (it != queue_.end()) {
        queue_.erase(it);
        this->OnNotificationClosed(notification);
        return;
    }

    // Dismiss active toast
    auto hwnd = GetToast(notification.data_.get());
    if (hwnd) {
        auto toast = Toast::Get(hwnd);
        toast->Dismiss();
    }
}

void DesktopNotificationController::CheckQueue() {
    while (instances_.size() < instances_.capacity() && !queue_.empty()) {
        CreateToast(move(queue_.front()));
        queue_.pop_front();
    }
}

void DesktopNotificationController::CreateToast(NotificationLink&& data) {
    auto hinstance = RegisterWndClasses();
    auto hwnd = Toast::Create(hinstance, data);
    if (hwnd) {
        int toast_pos = 0;
        if (!instances_.empty()) {
            auto& item = instances_.back();
            _ASSERT(item.hwnd);

            ScreenMetrics scr;
            auto toast = Toast::Get(item.hwnd);
            toast_pos = toast->GetVerticalPosition() +
                        toast->GetHeight() +
                        scr.Y(toast_margin_<int>);
        }

        instances_.push_back({ hwnd, move(data) });

        if (!hwnd_controller_) {
            // NOTE: We cannot use a message-only window because we need to
            //       receive system notifications
            hwnd_controller_ = CreateWindow(class_name_, nullptr, 0,
                                            0, 0, 0, 0,
                                            NULL, NULL, hinstance, this);
        }

        auto toast = Toast::Get(hwnd);
        toast->PopUp(toast_pos);
    }
}

HWND DesktopNotificationController::GetToast(
    const NotificationData* data) const {
    auto it = find_if(instances_.cbegin(), instances_.cend(),
        [data](auto&& inst) {
            auto toast = Toast::Get(inst.hwnd);
            return data == toast->GetNotification().get();
        });

    return (it != instances_.cend()) ? it->hwnd : NULL;
}

void DesktopNotificationController::DestroyToast(ToastInstance& inst) {
    if (inst.hwnd) {
        auto data = Toast::Get(inst.hwnd)->GetNotification();

        DestroyWindow(inst.hwnd);
        inst.hwnd = NULL;

        Notification notification(data);
        OnNotificationClosed(notification);
    }
}

DesktopNotificationController::Notification::Notification(
    const shared_ptr<NotificationData>& data) :
    data_(data) {
    _ASSERT(data != nullptr);
}

bool DesktopNotificationController::Notification::operator==(
    const Notification& other) const {
    return data_ == other.data_;
}

void DesktopNotificationController::Notification::Close() {
    // No business calling this when not pointing to a valid instance
    _ASSERT(data_);

    if (data_->controller)
        data_->controller->CloseNotification(*this);
}

void DesktopNotificationController::Notification::Set(
    std::wstring caption, std::wstring body_text, HBITMAP image) {
    // No business calling this when not pointing to a valid instance
    _ASSERT(data_);

    // Do nothing when the notification has been closed
    if (!data_->controller)
        return;

    if (data_->image) DeleteBitmap(data_->image);

    data_->caption = move(caption);
    data_->body_text = move(body_text);
    data_->image = CopyBitmap(image);

    auto hwnd = data_->controller->GetToast(data_.get());
    if (hwnd) {
        auto toast = Toast::Get(hwnd);
        toast->ResetContents();
    }

    // Change of contents can affect size and position of all toasts
    data_->controller->StartAnimation();
}

DesktopNotificationController::NotificationLink::NotificationLink(
    DesktopNotificationController* controller) :
    shared_ptr(make_shared<NotificationData>()) {
    get()->controller = controller;
}

DesktopNotificationController::NotificationLink::~NotificationLink() {
    auto p = get();
    if (p) p->controller = nullptr;
}

}   // namespace brightray
