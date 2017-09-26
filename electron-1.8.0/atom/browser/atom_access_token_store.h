// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_ATOM_ACCESS_TOKEN_STORE_H_
#define ATOM_BROWSER_ATOM_ACCESS_TOKEN_STORE_H_

#include "device/geolocation/access_token_store.h"

namespace atom {

namespace internal {
class GeoURLRequestContextGetter;
}

class AtomAccessTokenStore : public device::AccessTokenStore {
 public:
  AtomAccessTokenStore();
  ~AtomAccessTokenStore();

  // device::AccessTokenStore:
  void LoadAccessTokens(
      const LoadAccessTokensCallback& callback) override;
  void SaveAccessToken(const GURL& server_url,
                       const base::string16& access_token) override;

 private:
  scoped_refptr<internal::GeoURLRequestContextGetter> request_context_getter_;
  DISALLOW_COPY_AND_ASSIGN(AtomAccessTokenStore);
};

}  // namespace atom

#endif  // ATOM_BROWSER_ATOM_ACCESS_TOKEN_STORE_H_
