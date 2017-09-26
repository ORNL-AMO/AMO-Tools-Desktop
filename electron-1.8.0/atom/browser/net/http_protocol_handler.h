// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_NET_HTTP_PROTOCOL_HANDLER_H_
#define ATOM_BROWSER_NET_HTTP_PROTOCOL_HANDLER_H_

#include <string>

#include "net/url_request/url_request_job_factory.h"

namespace atom {

class HttpProtocolHandler : public net::URLRequestJobFactory::ProtocolHandler {
 public:
  explicit HttpProtocolHandler(const std::string&);
  virtual ~HttpProtocolHandler();

  // net::URLRequestJobFactory::ProtocolHandler:
  net::URLRequestJob* MaybeCreateJob(
      net::URLRequest* request,
      net::NetworkDelegate* network_delegate) const override;

 private:
  std::string scheme_;
};

}  // namespace atom

#endif  // ATOM_BROWSER_NET_HTTP_PROTOCOL_HANDLER_H_
