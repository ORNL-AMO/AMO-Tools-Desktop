// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_API_EVENT_H_
#define ATOM_BROWSER_API_EVENT_H_

#include "content/public/browser/web_contents_observer.h"
#include "native_mate/handle.h"
#include "native_mate/wrappable.h"

namespace IPC {
class Message;
}

namespace mate {

class Event : public Wrappable<Event>,
              public content::WebContentsObserver {
 public:
  static Handle<Event> Create(v8::Isolate* isolate);

  static void BuildPrototype(v8::Isolate* isolate,
                             v8::Local<v8::FunctionTemplate> prototype);

  // Pass the sender and message to be replied.
  void SetSenderAndMessage(content::WebContents* sender, IPC::Message* message);

  // event.PreventDefault().
  void PreventDefault(v8::Isolate* isolate);

  // event.sendReply(json), used for replying synchronous message.
  bool SendReply(const base::string16& json);

 protected:
  explicit Event(v8::Isolate* isolate);
  ~Event() override;

  // content::WebContentsObserver implementations:
  void WebContentsDestroyed() override;

 private:
  // Replyer for the synchronous messages.
  content::WebContents* sender_;
  IPC::Message* message_;

  DISALLOW_COPY_AND_ASSIGN(Event);
};

}  // namespace mate

#endif  // ATOM_BROWSER_API_EVENT_H_
