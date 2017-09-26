// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE-CHROMIUM file.

#ifndef BRIGHTRAY_BROWSER_BROWSER_CONTEXT_H_
#define BRIGHTRAY_BROWSER_BROWSER_CONTEXT_H_

#include <map>
#include <string>

#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "brightray/browser/net/devtools_network_controller_handle.h"
#include "brightray/browser/permission_manager.h"
#include "brightray/browser/url_request_context_getter.h"
#include "content/public/browser/browser_context.h"

class PrefRegistrySimple;
class PrefService;

namespace storage {
class SpecialStoragePolicy;
}

namespace brightray {

class MediaDeviceIDSalt;
class PermissionManager;

class BrowserContext : public base::RefCounted<BrowserContext>,
                       public content::BrowserContext,
                       public brightray::URLRequestContextGetter::Delegate {
 public:
  // Get the BrowserContext according to its |partition| and |in_memory|,
  // empty pointer when be returned when there is no matching BrowserContext.
  static scoped_refptr<BrowserContext> Get(
      const std::string& partition, bool in_memory);

  base::WeakPtr<BrowserContext> GetWeakPtr() {
    return weak_factory_.GetWeakPtr();
  }

  // Get the request context, if there is no one, create it.
  URLRequestContextGetter* GetRequestContext();

  // content::BrowserContext:
  std::unique_ptr<content::ZoomLevelDelegate> CreateZoomLevelDelegate(
      const base::FilePath& partition_path) override;
  bool IsOffTheRecord() const override;
  content::ResourceContext* GetResourceContext() override;
  content::DownloadManagerDelegate* GetDownloadManagerDelegate() override;
  content::BrowserPluginGuestManager* GetGuestManager() override;
  storage::SpecialStoragePolicy* GetSpecialStoragePolicy() override;
  content::PushMessagingService* GetPushMessagingService() override;
  content::SSLHostStateDelegate* GetSSLHostStateDelegate() override;
  content::PermissionManager* GetPermissionManager() override;
  content::BackgroundSyncController* GetBackgroundSyncController() override;
  net::URLRequestContextGetter* CreateRequestContext(
      content::ProtocolHandlerMap* protocol_handlers,
      content::URLRequestInterceptorScopedVector request_interceptors) override;
  net::URLRequestContextGetter* CreateRequestContextForStoragePartition(
      const base::FilePath& partition_path,
      bool in_memory,
      content::ProtocolHandlerMap* protocol_handlers,
      content::URLRequestInterceptorScopedVector request_interceptors) override;
  net::URLRequestContextGetter* CreateMediaRequestContext() override;
  net::URLRequestContextGetter* CreateMediaRequestContextForStoragePartition(
      const base::FilePath& partition_path,
      bool in_memory) override;

  URLRequestContextGetter* url_request_context_getter() const {
    return url_request_getter_.get();
  }

  DevToolsNetworkControllerHandle* network_controller_handle() {
    return &network_controller_handle_;
  }

  void InitPrefs();
  PrefService* prefs() { return prefs_.get(); }

 protected:
  BrowserContext(const std::string& partition, bool in_memory);
  ~BrowserContext() override;

  // Subclasses should override this to register custom preferences.
  virtual void RegisterPrefs(PrefRegistrySimple* pref_registry) {}

  // URLRequestContextGetter::Delegate:
  net::NetworkDelegate* CreateNetworkDelegate() override;
  MediaDeviceIDSalt* GetMediaDeviceIDSalt() override;

  base::FilePath GetPath() const override;

 private:
  friend class base::RefCounted<BrowserContext>;
  class ResourceContext;

  void RegisterInternalPrefs(PrefRegistrySimple* pref_registry);

  // partition_id => browser_context
  struct PartitionKey {
    std::string partition;
    bool in_memory;

    PartitionKey(const std::string& partition, bool in_memory)
        : partition(partition), in_memory(in_memory) {}

    bool operator<(const PartitionKey& other) const {
      if (partition == other.partition)
        return in_memory < other.in_memory;
      return partition < other.partition;
    }

    bool operator==(const PartitionKey& other) const {
      return (partition == other.partition) && (in_memory == other.in_memory);
    }
  };
  using BrowserContextMap =
      std::map<PartitionKey, base::WeakPtr<brightray::BrowserContext>>;
  static BrowserContextMap browser_context_map_;

  base::FilePath path_;
  bool in_memory_;

  DevToolsNetworkControllerHandle network_controller_handle_;

  std::unique_ptr<ResourceContext> resource_context_;
  scoped_refptr<URLRequestContextGetter> url_request_getter_;
  scoped_refptr<storage::SpecialStoragePolicy> storage_policy_;
  std::unique_ptr<PrefService> prefs_;
  std::unique_ptr<PermissionManager> permission_manager_;
  std::unique_ptr<MediaDeviceIDSalt> media_device_id_salt_;

  base::WeakPtrFactory<BrowserContext> weak_factory_;

  DISALLOW_COPY_AND_ASSIGN(BrowserContext);
};

}  // namespace brightray

#endif  // BRIGHTRAY_BROWSER_BROWSER_CONTEXT_H_
