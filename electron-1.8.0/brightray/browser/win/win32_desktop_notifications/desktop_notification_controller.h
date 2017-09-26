#pragma once
#include <deque>
#include <memory>
#include <string>
#include <vector>
#include <Windows.h>

namespace brightray {

struct NotificationData;

class DesktopNotificationController {
 public:
    explicit DesktopNotificationController(unsigned maximum_toasts = 3);
    ~DesktopNotificationController();

    class Notification;
    Notification AddNotification(std::wstring caption, std::wstring body_text,
                                 HBITMAP image);
    void CloseNotification(Notification& notification);

    // Event handlers -- override to receive the events
 private:
    virtual void OnNotificationClosed(Notification& notification) {}
    virtual void OnNotificationClicked(Notification& notification) {}
    virtual void OnNotificationDismissed(Notification& notification) {}

 private:
    static HINSTANCE RegisterWndClasses();
    void StartAnimation();
    HFONT GetCaptionFont();
    HFONT GetBodyFont();

 private:
    enum TimerID {
        TimerID_Animate = 1
    };

    template<typename T>
    static constexpr T toast_margin_ = 20;

    // Wrapper around `NotificationData` which makes sure that
    // the `controller` member is cleared when the controller object
    // stops tracking the notification
    struct NotificationLink : std::shared_ptr<NotificationData> {
        explicit NotificationLink(DesktopNotificationController* controller);
        ~NotificationLink();

        NotificationLink(NotificationLink&&) = default;
        NotificationLink(const NotificationLink&) = delete;
        NotificationLink& operator=(NotificationLink&&) = default;
    };

    struct ToastInstance {
        HWND hwnd;
        NotificationLink data;
    };

    class Toast;

    static LRESULT CALLBACK WndProc(HWND hwnd, UINT message,
                                    WPARAM wparam, LPARAM lparam);
    static DesktopNotificationController* Get(HWND hwnd) {
        return reinterpret_cast<DesktopNotificationController*>(
            GetWindowLongPtr(hwnd, 0));
    }

    DesktopNotificationController(
        const DesktopNotificationController&) = delete;

    void InitializeFonts();
    void ClearAssets();
    void AnimateAll();
    void CheckQueue();
    void CreateToast(NotificationLink&& data);
    HWND GetToast(const NotificationData* data) const;
    void DestroyToast(ToastInstance& inst);

 private:
    static constexpr const TCHAR class_name_[] =
        TEXT("DesktopNotificationController");

    HWND hwnd_controller_ = NULL;
    HFONT caption_font_ = NULL, body_font_ = NULL;
    std::vector<ToastInstance> instances_;
    std::deque<NotificationLink> queue_;
    bool is_animating_ = false;
};

class DesktopNotificationController::Notification {
 public:
    Notification() = default;
    explicit Notification(const std::shared_ptr<NotificationData>& data);

    bool operator==(const Notification& other) const;

    void Close();
    void Set(std::wstring caption, std::wstring body_text, HBITMAP image);

 private:
    std::shared_ptr<NotificationData> data_;

    friend class DesktopNotificationController;
};

}   // namespace brightray
