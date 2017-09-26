// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_NET_JS_ASKER_H_
#define ATOM_BROWSER_NET_JS_ASKER_H_

#include "atom/common/native_mate_converters/net_converter.h"
#include "base/callback.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "content/public/browser/browser_thread.h"
#include "net/base/net_errors.h"
#include "net/http/http_response_headers.h"
#include "net/http/http_status_code.h"
#include "net/url_request/url_request_context_getter.h"
#include "net/url_request/url_request_job.h"
#include "v8/include/v8.h"

namespace atom {

using JavaScriptHandler =
    base::Callback<void(const base::DictionaryValue&, v8::Local<v8::Value>)>;

namespace internal {

using BeforeStartCallback =
    base::Callback<void(v8::Isolate*, v8::Local<v8::Value>)>;
using ResponseCallback =
    base::Callback<void(bool, std::unique_ptr<base::Value> options)>;

// Ask handler for options in UI thread.
void AskForOptions(v8::Isolate* isolate,
                   const JavaScriptHandler& handler,
                   std::unique_ptr<base::DictionaryValue> request_details,
                   const BeforeStartCallback& before_start,
                   const ResponseCallback& callback);

// Test whether the |options| means an error.
bool IsErrorOptions(base::Value* value, int* error);

}  // namespace internal

template<typename RequestJob>
class JsAsker : public RequestJob {
 public:
  JsAsker(net::URLRequest* request, net::NetworkDelegate* network_delegate)
      : RequestJob(request, network_delegate), weak_factory_(this) {}

  // Called by |CustomProtocolHandler| to store handler related information.
  void SetHandlerInfo(
      v8::Isolate* isolate,
      net::URLRequestContextGetter* request_context_getter,
      const JavaScriptHandler& handler) {
    isolate_ = isolate;
    request_context_getter_ = request_context_getter;
    handler_ = handler;
  }

  // Subclass should do initailze work here.
  virtual void BeforeStartInUI(v8::Isolate*, v8::Local<v8::Value>) {}
  virtual void StartAsync(std::unique_ptr<base::Value> options) = 0;

  net::URLRequestContextGetter* request_context_getter() const {
    return request_context_getter_;
  }

 private:
  // RequestJob:
  void Start() override {
    std::unique_ptr<base::DictionaryValue> request_details(
        new base::DictionaryValue);
    FillRequestDetails(request_details.get(), RequestJob::request());
    content::BrowserThread::PostTask(
        content::BrowserThread::UI, FROM_HERE,
        base::Bind(&internal::AskForOptions,
                   isolate_,
                   handler_,
                   base::Passed(&request_details),
                   base::Bind(&JsAsker::BeforeStartInUI,
                              weak_factory_.GetWeakPtr()),
                   base::Bind(&JsAsker::OnResponse,
                              weak_factory_.GetWeakPtr())));
  }

  int GetResponseCode() const override { return net::HTTP_OK; }

  void GetResponseInfo(net::HttpResponseInfo* info) override {
    info->headers = new net::HttpResponseHeaders("");
  }

  // Called when the JS handler has sent the response, we need to decide whether
  // to start, or fail the job.
  void OnResponse(bool success, std::unique_ptr<base::Value> value) {
    int error = net::ERR_NOT_IMPLEMENTED;
    if (success && value && !internal::IsErrorOptions(value.get(), &error)) {
      StartAsync(std::move(value));
    } else {
      RequestJob::NotifyStartError(
          net::URLRequestStatus(net::URLRequestStatus::FAILED, error));
    }
  }

  v8::Isolate* isolate_;
  net::URLRequestContextGetter* request_context_getter_;
  JavaScriptHandler handler_;

  base::WeakPtrFactory<JsAsker> weak_factory_;

  DISALLOW_COPY_AND_ASSIGN(JsAsker);
};

}  // namespace atom

#endif  // ATOM_BROWSER_NET_JS_ASKER_H_
