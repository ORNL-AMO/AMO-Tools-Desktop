// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/net/url_request_string_job.h"

#include <string>

#include "atom/common/atom_constants.h"
#include "net/base/net_errors.h"

namespace atom {

URLRequestStringJob::URLRequestStringJob(
    net::URLRequest* request, net::NetworkDelegate* network_delegate)
    : JsAsker<net::URLRequestSimpleJob>(request, network_delegate) {
}

void URLRequestStringJob::StartAsync(std::unique_ptr<base::Value> options) {
  if (options->IsType(base::Value::Type::DICTIONARY)) {
    base::DictionaryValue* dict =
        static_cast<base::DictionaryValue*>(options.get());
    dict->GetString("mimeType", &mime_type_);
    dict->GetString("charset", &charset_);
    dict->GetString("data", &data_);
  } else if (options->IsType(base::Value::Type::STRING)) {
    options->GetAsString(&data_);
  }
  net::URLRequestSimpleJob::Start();
}

void URLRequestStringJob::GetResponseInfo(net::HttpResponseInfo* info) {
  std::string status("HTTP/1.1 200 OK");
  auto* headers = new net::HttpResponseHeaders(status);

  headers->AddHeader(kCORSHeader);

  if (!mime_type_.empty()) {
    std::string content_type_header(net::HttpRequestHeaders::kContentType);
    content_type_header.append(": ");
    content_type_header.append(mime_type_);
    headers->AddHeader(content_type_header);
  }

  info->headers = headers;
}

int URLRequestStringJob::GetData(
    std::string* mime_type,
    std::string* charset,
    std::string* data,
    const net::CompletionCallback& callback) const {
  *mime_type = mime_type_;
  *charset = charset_;
  *data = data_;
  return net::OK;
}

}  // namespace atom
