// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/api/atom_api_session.h"

#include <map>
#include <string>
#include <vector>

#include "atom/browser/api/atom_api_cookies.h"
#include "atom/browser/api/atom_api_download_item.h"
#include "atom/browser/api/atom_api_protocol.h"
#include "atom/browser/api/atom_api_web_request.h"
#include "atom/browser/atom_browser_context.h"
#include "atom/browser/atom_browser_main_parts.h"
#include "atom/browser/atom_permission_manager.h"
#include "atom/browser/browser.h"
#include "atom/browser/net/atom_cert_verifier.h"
#include "atom/common/native_mate_converters/callback.h"
#include "atom/common/native_mate_converters/content_converter.h"
#include "atom/common/native_mate_converters/file_path_converter.h"
#include "atom/common/native_mate_converters/gurl_converter.h"
#include "atom/common/native_mate_converters/net_converter.h"
#include "atom/common/native_mate_converters/value_converter.h"
#include "atom/common/node_includes.h"
#include "base/files/file_path.h"
#include "base/guid.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/threading/thread_task_runner_handle.h"
#include "brightray/browser/media/media_device_id_salt.h"
#include "brightray/browser/net/devtools_network_conditions.h"
#include "brightray/browser/net/devtools_network_controller_handle.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/download_manager_delegate.h"
#include "content/public/browser/storage_partition.h"
#include "native_mate/dictionary.h"
#include "native_mate/object_template_builder.h"
#include "net/base/load_flags.h"
#include "net/disk_cache/disk_cache.h"
#include "net/dns/host_cache.h"
#include "net/http/http_auth_handler_factory.h"
#include "net/http/http_auth_preferences.h"
#include "net/proxy/proxy_config_service_fixed.h"
#include "net/proxy/proxy_service.h"
#include "net/url_request/static_http_user_agent_settings.h"
#include "net/url_request/url_request_context.h"
#include "net/url_request/url_request_context_getter.h"
#include "ui/base/l10n/l10n_util.h"

using atom::api::Cookies;
using content::BrowserThread;
using content::StoragePartition;

namespace {

struct ClearStorageDataOptions {
  GURL origin;
  uint32_t storage_types = StoragePartition::REMOVE_DATA_MASK_ALL;
  uint32_t quota_types = StoragePartition::QUOTA_MANAGED_STORAGE_MASK_ALL;
};

struct ClearAuthCacheOptions {
  std::string type;
  GURL origin;
  std::string realm;
  base::string16 username;
  base::string16 password;
  net::HttpAuth::Scheme auth_scheme;
};

uint32_t GetStorageMask(const std::vector<std::string>& storage_types) {
  uint32_t storage_mask = 0;
  for (const auto& it : storage_types) {
    auto type = base::ToLowerASCII(it);
    if (type == "appcache")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_APPCACHE;
    else if (type == "cookies")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_COOKIES;
    else if (type == "filesystem")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_FILE_SYSTEMS;
    else if (type == "indexdb")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_INDEXEDDB;
    else if (type == "localstorage")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_LOCAL_STORAGE;
    else if (type == "shadercache")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_SHADER_CACHE;
    else if (type == "websql")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_WEBSQL;
    else if (type == "serviceworkers")
      storage_mask |= StoragePartition::REMOVE_DATA_MASK_SERVICE_WORKERS;
  }
  return storage_mask;
}

uint32_t GetQuotaMask(const std::vector<std::string>& quota_types) {
  uint32_t quota_mask = 0;
  for (const auto& it : quota_types) {
    auto type = base::ToLowerASCII(it);
    if (type == "temporary")
      quota_mask |= StoragePartition::QUOTA_MANAGED_STORAGE_MASK_TEMPORARY;
    else if (type == "persistent")
      quota_mask |= StoragePartition::QUOTA_MANAGED_STORAGE_MASK_PERSISTENT;
    else if (type == "syncable")
      quota_mask |= StoragePartition::QUOTA_MANAGED_STORAGE_MASK_SYNCABLE;
  }
  return quota_mask;
}

net::HttpAuth::Scheme GetAuthSchemeFromString(const std::string& scheme) {
  if (scheme == "basic")
    return net::HttpAuth::AUTH_SCHEME_BASIC;
  if (scheme == "digest")
    return net::HttpAuth::AUTH_SCHEME_DIGEST;
  if (scheme == "ntlm")
    return net::HttpAuth::AUTH_SCHEME_NTLM;
  if (scheme == "negotiate")
    return net::HttpAuth::AUTH_SCHEME_NEGOTIATE;
  return net::HttpAuth::AUTH_SCHEME_MAX;
}

void SetUserAgentInIO(scoped_refptr<net::URLRequestContextGetter> getter,
                      const std::string& accept_lang,
                      const std::string& user_agent) {
  getter->GetURLRequestContext()->set_http_user_agent_settings(
      new net::StaticHttpUserAgentSettings(
          net::HttpUtil::GenerateAcceptLanguageHeader(accept_lang),
          user_agent));
}

}  // namespace

namespace mate {

template<>
struct Converter<ClearStorageDataOptions> {
  static bool FromV8(v8::Isolate* isolate,
                     v8::Local<v8::Value> val,
                     ClearStorageDataOptions* out) {
    mate::Dictionary options;
    if (!ConvertFromV8(isolate, val, &options))
      return false;
    options.Get("origin", &out->origin);
    std::vector<std::string> types;
    if (options.Get("storages", &types))
      out->storage_types = GetStorageMask(types);
    if (options.Get("quotas", &types))
      out->quota_types = GetQuotaMask(types);
    return true;
  }
};

template <>
struct Converter<ClearAuthCacheOptions> {
  static bool FromV8(v8::Isolate* isolate,
                     v8::Local<v8::Value> val,
                     ClearAuthCacheOptions* out) {
    mate::Dictionary options;
    if (!ConvertFromV8(isolate, val, &options))
      return false;
    options.Get("type", &out->type);
    options.Get("origin", &out->origin);
    options.Get("realm", &out->realm);
    options.Get("username", &out->username);
    options.Get("password", &out->password);
    std::string scheme;
    if (options.Get("scheme", &scheme))
      out->auth_scheme = GetAuthSchemeFromString(scheme);
    return true;
  }
};

template <>
struct Converter<net::ProxyConfig> {
  static bool FromV8(v8::Isolate* isolate,
                     v8::Local<v8::Value> val,
                     net::ProxyConfig* out) {
    std::string proxy_rules, proxy_bypass_rules;
    GURL pac_url;
    mate::Dictionary options;
    // Fallback to previous API when passed String.
    // https://git.io/vuhjj
    if (ConvertFromV8(isolate, val, &proxy_rules)) {
      pac_url = GURL(proxy_rules);  // Assume it is PAC script if it is URL.
    } else if (ConvertFromV8(isolate, val, &options)) {
      options.Get("pacScript", &pac_url);
      options.Get("proxyRules", &proxy_rules);
      options.Get("proxyBypassRules", &proxy_bypass_rules);
    } else {
      return false;
    }

    // pacScript takes precedence over proxyRules.
    if (!pac_url.is_empty() && pac_url.is_valid()) {
      out->set_pac_url(pac_url);
    } else {
      out->proxy_rules().ParseFromString(proxy_rules);
      out->proxy_rules().bypass_rules.ParseFromString(proxy_bypass_rules);
    }
    return true;
  }
};

template<>
struct Converter<atom::VerifyRequestParams> {
  static v8::Local<v8::Value> ToV8(v8::Isolate* isolate,
                                   atom::VerifyRequestParams val) {
    mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);
    dict.Set("hostname", val.hostname);
    dict.Set("certificate", val.certificate);
    dict.Set("verificationResult", val.default_result);
    return dict.GetHandle();
  }
};

}  // namespace mate

namespace atom {

namespace api {

namespace {

const char kPersistPrefix[] = "persist:";

// Referenced session objects.
std::map<uint32_t, v8::Global<v8::Object>> g_sessions;

class ResolveProxyHelper {
 public:
  ResolveProxyHelper(AtomBrowserContext* browser_context,
                     const GURL& url,
                     const Session::ResolveProxyCallback& callback)
      : callback_(callback),
        original_thread_(base::ThreadTaskRunnerHandle::Get()) {
    scoped_refptr<net::URLRequestContextGetter> context_getter =
        browser_context->url_request_context_getter();
    context_getter->GetNetworkTaskRunner()->PostTask(
        FROM_HERE,
        base::Bind(&ResolveProxyHelper::ResolveProxy,
                   base::Unretained(this), context_getter, url));
  }

  void OnResolveProxyCompleted(int result) {
    std::string proxy;
    if (result == net::OK)
      proxy = proxy_info_.ToPacString();
    original_thread_->PostTask(FROM_HERE,
                               base::Bind(callback_, proxy));
    delete this;
  }

 private:
  void ResolveProxy(scoped_refptr<net::URLRequestContextGetter> context_getter,
                    const GURL& url) {
    DCHECK_CURRENTLY_ON(content::BrowserThread::IO);

    net::ProxyService* proxy_service =
        context_getter->GetURLRequestContext()->proxy_service();
    net::CompletionCallback completion_callback =
        base::Bind(&ResolveProxyHelper::OnResolveProxyCompleted,
                   base::Unretained(this));

    // Start the request.
    int result = proxy_service->ResolveProxy(
        url, "GET", &proxy_info_, completion_callback, &pac_req_, nullptr,
        net::NetLogWithSource());

    // Completed synchronously.
    if (result != net::ERR_IO_PENDING)
      completion_callback.Run(result);
  }

  Session::ResolveProxyCallback callback_;
  net::ProxyInfo proxy_info_;
  net::ProxyService::PacRequest* pac_req_;
  scoped_refptr<base::SingleThreadTaskRunner> original_thread_;

  DISALLOW_COPY_AND_ASSIGN(ResolveProxyHelper);
};

// Runs the callback in UI thread.
void RunCallbackInUI(const base::Callback<void()>& callback) {
  BrowserThread::PostTask(BrowserThread::UI, FROM_HERE, callback);
}
template<typename ...T>
void RunCallbackInUI(const base::Callback<void(T...)>& callback, T... result) {
  BrowserThread::PostTask(
      BrowserThread::UI, FROM_HERE, base::Bind(callback, result...));
}

// Callback of HttpCache::GetBackend.
void OnGetBackend(disk_cache::Backend** backend_ptr,
                  Session::CacheAction action,
                  const net::CompletionCallback& callback,
                  int result) {
  if (result != net::OK) {
    RunCallbackInUI(callback, result);
  } else if (backend_ptr && *backend_ptr) {
    if (action == Session::CacheAction::CLEAR) {
      (*backend_ptr)->DoomAllEntries(base::Bind(&RunCallbackInUI<int>,
                                                callback));
    } else if (action == Session::CacheAction::STATS) {
      base::StringPairs stats;
      (*backend_ptr)->GetStats(&stats);
      for (const auto& stat : stats) {
        if (stat.first == "Current size") {
          int current_size;
          base::StringToInt(stat.second, &current_size);
          RunCallbackInUI(callback, current_size);
          break;
        }
      }
    }
  } else {
    RunCallbackInUI<int>(callback, net::ERR_FAILED);
  }
}

void DoCacheActionInIO(
    const scoped_refptr<net::URLRequestContextGetter>& context_getter,
    Session::CacheAction action,
    const net::CompletionCallback& callback) {
  auto request_context = context_getter->GetURLRequestContext();
  auto http_cache = request_context->http_transaction_factory()->GetCache();
  if (!http_cache)
    RunCallbackInUI<int>(callback, net::ERR_FAILED);

  // Call GetBackend and make the backend's ptr accessable in OnGetBackend.
  using BackendPtr = disk_cache::Backend*;
  auto* backend_ptr = new BackendPtr(nullptr);
  net::CompletionCallback on_get_backend =
      base::Bind(&OnGetBackend, base::Owned(backend_ptr), action, callback);
  int rv = http_cache->GetBackend(backend_ptr, on_get_backend);
  if (rv != net::ERR_IO_PENDING)
    on_get_backend.Run(net::OK);
}

void SetProxyInIO(net::URLRequestContextGetter* getter,
                  const net::ProxyConfig& config,
                  const base::Closure& callback) {
  auto proxy_service = getter->GetURLRequestContext()->proxy_service();
  proxy_service->ResetConfigService(base::WrapUnique(
      new net::ProxyConfigServiceFixed(config)));
  // Refetches and applies the new pac script if provided.
  proxy_service->ForceReloadProxyConfig();
  RunCallbackInUI(callback);
}

void SetCertVerifyProcInIO(
    const scoped_refptr<net::URLRequestContextGetter>& context_getter,
    const AtomCertVerifier::VerifyProc& proc) {
  auto request_context = context_getter->GetURLRequestContext();
  static_cast<AtomCertVerifier*>(request_context->cert_verifier())->
      SetVerifyProc(proc);
}

void ClearHostResolverCacheInIO(
    const scoped_refptr<net::URLRequestContextGetter>& context_getter,
    const base::Closure& callback) {
  auto request_context = context_getter->GetURLRequestContext();
  auto cache = request_context->host_resolver()->GetHostCache();
  if (cache) {
    cache->clear();
    DCHECK_EQ(0u, cache->size());
    if (!callback.is_null())
      RunCallbackInUI(callback);
  }
}

void ClearAuthCacheInIO(
    const scoped_refptr<net::URLRequestContextGetter>& context_getter,
    const ClearAuthCacheOptions& options,
    const base::Closure& callback) {
  auto request_context = context_getter->GetURLRequestContext();
  auto network_session =
      request_context->http_transaction_factory()->GetSession();
  if (network_session) {
    if (options.type == "password") {
      auto auth_cache = network_session->http_auth_cache();
      if (!options.origin.is_empty()) {
        auth_cache->Remove(
            options.origin, options.realm, options.auth_scheme,
            net::AuthCredentials(options.username, options.password));
      } else {
        auth_cache->ClearEntriesAddedWithin(base::TimeDelta::Max());
      }
    } else if (options.type == "clientCertificate") {
      auto client_auth_cache = network_session->ssl_client_auth_cache();
      client_auth_cache->Remove(net::HostPortPair::FromURL(options.origin));
    }
    network_session->CloseAllConnections();
  }
  if (!callback.is_null())
    RunCallbackInUI(callback);
}

void AllowNTLMCredentialsForDomainsInIO(
    const scoped_refptr<net::URLRequestContextGetter>& context_getter,
    const std::string& domains) {
  auto request_context = context_getter->GetURLRequestContext();
  auto auth_handler = request_context->http_auth_handler_factory();
  if (auth_handler) {
    auto auth_preferences = const_cast<net::HttpAuthPreferences*>(
        auth_handler->http_auth_preferences());
    if (auth_preferences)
      auth_preferences->set_server_whitelist(domains);
  }
}

void OnClearStorageDataDone(const base::Closure& callback) {
  if (!callback.is_null())
    callback.Run();
}

void DownloadIdCallback(content::DownloadManager* download_manager,
                        const base::FilePath& path,
                        const std::vector<GURL>& url_chain,
                        const std::string& mime_type,
                        int64_t offset,
                        int64_t length,
                        const std::string& last_modified,
                        const std::string& etag,
                        const base::Time& start_time,
                        uint32_t id) {
  download_manager->CreateDownloadItem(
      base::GenerateGUID(), id, path, path, url_chain, GURL(), GURL(), GURL(),
      GURL(), mime_type, mime_type, start_time, base::Time(), etag,
      last_modified, offset, length, std::string(),
      content::DownloadItem::INTERRUPTED,
      content::DownloadDangerType::DOWNLOAD_DANGER_TYPE_NOT_DANGEROUS,
      content::DOWNLOAD_INTERRUPT_REASON_NETWORK_TIMEOUT, false,
      base::Time(), false,
      std::vector<content::DownloadItem::ReceivedSlice>());
}

}  // namespace

Session::Session(v8::Isolate* isolate, AtomBrowserContext* browser_context)
    : devtools_network_emulation_client_id_(base::GenerateGUID()),
      browser_context_(browser_context) {
  // Observe DownloadManager to get download notifications.
  content::BrowserContext::GetDownloadManager(browser_context)->
      AddObserver(this);

  Init(isolate);
  AttachAsUserData(browser_context);
}

Session::~Session() {
  content::BrowserContext::GetDownloadManager(browser_context())->
      RemoveObserver(this);
  g_sessions.erase(weak_map_id());
}

void Session::OnDownloadCreated(content::DownloadManager* manager,
                                content::DownloadItem* item) {
  if (item->IsSavePackageDownload())
    return;

  v8::Locker locker(isolate());
  v8::HandleScope handle_scope(isolate());
  auto handle = DownloadItem::Create(isolate(), item);
  if (item->GetState() == content::DownloadItem::INTERRUPTED)
    handle->SetSavePath(item->GetTargetFilePath());
  bool prevent_default = Emit("will-download", handle, item->GetWebContents());
  if (prevent_default) {
    item->Cancel(true);
    item->Remove();
  }
}

void Session::ResolveProxy(const GURL& url, ResolveProxyCallback callback) {
  new ResolveProxyHelper(browser_context(), url, callback);
}

template<Session::CacheAction action>
void Session::DoCacheAction(const net::CompletionCallback& callback) {
  BrowserThread::PostTask(BrowserThread::IO, FROM_HERE,
      base::Bind(&DoCacheActionInIO,
                 make_scoped_refptr(browser_context_->GetRequestContext()),
                 action,
                 callback));
}

void Session::ClearStorageData(mate::Arguments* args) {
  // clearStorageData([options, callback])
  ClearStorageDataOptions options;
  base::Closure callback;
  args->GetNext(&options);
  args->GetNext(&callback);

  auto storage_partition =
      content::BrowserContext::GetStoragePartition(browser_context(), nullptr);
  if (options.storage_types & StoragePartition::REMOVE_DATA_MASK_COOKIES) {
    // Reset media device id salt when cookies are cleared.
    // https://w3c.github.io/mediacapture-main/#dom-mediadeviceinfo-deviceid
    brightray::MediaDeviceIDSalt::Reset(browser_context()->prefs());
  }
  storage_partition->ClearData(
      options.storage_types, options.quota_types, options.origin,
      content::StoragePartition::OriginMatcherFunction(),
      base::Time(), base::Time::Max(),
      base::Bind(&OnClearStorageDataDone, callback));
}

void Session::FlushStorageData() {
  auto storage_partition =
      content::BrowserContext::GetStoragePartition(browser_context(), nullptr);
  storage_partition->Flush();
}

void Session::SetProxy(const net::ProxyConfig& config,
                       const base::Closure& callback) {
  auto getter = browser_context_->GetRequestContext();
  BrowserThread::PostTask(BrowserThread::IO, FROM_HERE,
      base::Bind(&SetProxyInIO, base::Unretained(getter), config, callback));
}

void Session::SetDownloadPath(const base::FilePath& path) {
  browser_context_->prefs()->SetFilePath(
      prefs::kDownloadDefaultDirectory, path);
}

void Session::EnableNetworkEmulation(const mate::Dictionary& options) {
  std::unique_ptr<brightray::DevToolsNetworkConditions> conditions;
  bool offline = false;
  double latency = 0.0, download_throughput = 0.0, upload_throughput = 0.0;
  if (options.Get("offline", &offline) && offline) {
    conditions.reset(new brightray::DevToolsNetworkConditions(offline));
  } else {
    options.Get("latency", &latency);
    options.Get("downloadThroughput", &download_throughput);
    options.Get("uploadThroughput", &upload_throughput);
    conditions.reset(
        new brightray::DevToolsNetworkConditions(false,
                                                 latency,
                                                 download_throughput,
                                                 upload_throughput));
  }

  browser_context_->network_controller_handle()->SetNetworkState(
      devtools_network_emulation_client_id_, std::move(conditions));
  browser_context_->network_delegate()->SetDevToolsNetworkEmulationClientId(
      devtools_network_emulation_client_id_);
}

void Session::DisableNetworkEmulation() {
  std::unique_ptr<brightray::DevToolsNetworkConditions> conditions;
  browser_context_->network_controller_handle()->SetNetworkState(
      devtools_network_emulation_client_id_, std::move(conditions));
  browser_context_->network_delegate()->SetDevToolsNetworkEmulationClientId(
      std::string());
}

void Session::SetCertVerifyProc(v8::Local<v8::Value> val,
                                mate::Arguments* args) {
  AtomCertVerifier::VerifyProc proc;
  if (!(val->IsNull() || mate::ConvertFromV8(args->isolate(), val, &proc))) {
    args->ThrowError("Must pass null or function");
    return;
  }

  BrowserThread::PostTask(BrowserThread::IO, FROM_HERE,
      base::Bind(&SetCertVerifyProcInIO,
                 make_scoped_refptr(browser_context_->GetRequestContext()),
                 proc));
}

void Session::SetPermissionRequestHandler(v8::Local<v8::Value> val,
                                          mate::Arguments* args) {
  AtomPermissionManager::RequestHandler handler;
  if (!(val->IsNull() || mate::ConvertFromV8(args->isolate(), val, &handler))) {
    args->ThrowError("Must pass null or function");
    return;
  }
  auto permission_manager = static_cast<AtomPermissionManager*>(
      browser_context()->GetPermissionManager());
  permission_manager->SetPermissionRequestHandler(handler);
}

void Session::ClearHostResolverCache(mate::Arguments* args) {
  base::Closure callback;
  args->GetNext(&callback);

  BrowserThread::PostTask(BrowserThread::IO, FROM_HERE,
      base::Bind(&ClearHostResolverCacheInIO,
                 make_scoped_refptr(browser_context_->GetRequestContext()),
                 callback));
}

void Session::ClearAuthCache(mate::Arguments* args) {
  ClearAuthCacheOptions options;
  if (!args->GetNext(&options)) {
    args->ThrowError("Must specify options object");
    return;
  }
  base::Closure callback;
  args->GetNext(&callback);

  BrowserThread::PostTask(
      BrowserThread::IO, FROM_HERE,
      base::Bind(&ClearAuthCacheInIO,
                 make_scoped_refptr(browser_context_->GetRequestContext()),
                 options, callback));
}

void Session::AllowNTLMCredentialsForDomains(const std::string& domains) {
  BrowserThread::PostTask(BrowserThread::IO, FROM_HERE,
      base::Bind(&AllowNTLMCredentialsForDomainsInIO,
                 make_scoped_refptr(browser_context_->GetRequestContext()),
                 domains));
}

void Session::SetUserAgent(const std::string& user_agent,
                           mate::Arguments* args) {
  browser_context_->SetUserAgent(user_agent);

  std::string accept_lang = l10n_util::GetApplicationLocale("");
  args->GetNext(&accept_lang);

  auto getter = browser_context_->GetRequestContext();
  getter->GetNetworkTaskRunner()->PostTask(
      FROM_HERE,
      base::Bind(&SetUserAgentInIO, getter, accept_lang, user_agent));
}

std::string Session::GetUserAgent() {
  return browser_context_->GetUserAgent();
}

void Session::GetBlobData(
    const std::string& uuid,
    const AtomBlobReader::CompletionCallback& callback) {
  if (callback.is_null())
    return;

  AtomBlobReader* blob_reader =
      browser_context()->GetBlobReader();
  BrowserThread::PostTask(BrowserThread::IO, FROM_HERE,
      base::Bind(&AtomBlobReader::StartReading,
                 base::Unretained(blob_reader),
                 uuid,
                 callback));
}

void Session::CreateInterruptedDownload(const mate::Dictionary& options) {
  int64_t offset = 0, length = 0;
  double start_time = 0.0;
  std::string mime_type, last_modified, etag;
  base::FilePath path;
  std::vector<GURL> url_chain;
  options.Get("path", &path);
  options.Get("urlChain", &url_chain);
  options.Get("mimeType", &mime_type);
  options.Get("offset", &offset);
  options.Get("length", &length);
  options.Get("lastModified", &last_modified);
  options.Get("eTag", &etag);
  options.Get("startTime", &start_time);
  if (path.empty() || url_chain.empty() || length == 0) {
    isolate()->ThrowException(v8::Exception::Error(mate::StringToV8(
        isolate(), "Must pass non-empty path, urlChain and length.")));
    return;
  }
  if (offset >= length) {
    isolate()->ThrowException(v8::Exception::Error(mate::StringToV8(
        isolate(), "Must pass an offset value less than length.")));
    return;
  }
  auto download_manager =
      content::BrowserContext::GetDownloadManager(browser_context());
  download_manager->GetDelegate()->GetNextId(base::Bind(
      &DownloadIdCallback, download_manager, path, url_chain, mime_type, offset,
      length, last_modified, etag, base::Time::FromDoubleT(start_time)));
}

v8::Local<v8::Value> Session::Cookies(v8::Isolate* isolate) {
  if (cookies_.IsEmpty()) {
    auto handle = Cookies::Create(isolate, browser_context());
    cookies_.Reset(isolate, handle.ToV8());
  }
  return v8::Local<v8::Value>::New(isolate, cookies_);
}

v8::Local<v8::Value> Session::Protocol(v8::Isolate* isolate) {
  if (protocol_.IsEmpty()) {
    auto handle = atom::api::Protocol::Create(isolate, browser_context());
    protocol_.Reset(isolate, handle.ToV8());
  }
  return v8::Local<v8::Value>::New(isolate, protocol_);
}

v8::Local<v8::Value> Session::WebRequest(v8::Isolate* isolate) {
  if (web_request_.IsEmpty()) {
    auto handle = atom::api::WebRequest::Create(isolate, browser_context());
    web_request_.Reset(isolate, handle.ToV8());
  }
  return v8::Local<v8::Value>::New(isolate, web_request_);
}

// static
mate::Handle<Session> Session::CreateFrom(
    v8::Isolate* isolate, AtomBrowserContext* browser_context) {
  auto existing = TrackableObject::FromWrappedClass(isolate, browser_context);
  if (existing)
    return mate::CreateHandle(isolate, static_cast<Session*>(existing));

  auto handle = mate::CreateHandle(
      isolate, new Session(isolate, browser_context));

  // The Sessions should never be garbage collected, since the common pattern is
  // to use partition strings, instead of using the Session object directly.
  g_sessions[handle->weak_map_id()] =
      v8::Global<v8::Object>(isolate, handle.ToV8());

  return handle;
}

// static
mate::Handle<Session> Session::FromPartition(
    v8::Isolate* isolate, const std::string& partition,
    const base::DictionaryValue& options) {
  scoped_refptr<AtomBrowserContext> browser_context;
  if (partition.empty()) {
    browser_context = AtomBrowserContext::From("", false, options);
  } else if (base::StartsWith(partition, kPersistPrefix,
                              base::CompareCase::SENSITIVE)) {
    std::string name = partition.substr(8);
    browser_context = AtomBrowserContext::From(name, false, options);
  } else {
    browser_context = AtomBrowserContext::From(partition, true, options);
  }
  return CreateFrom(isolate, browser_context.get());
}

// static
void Session::BuildPrototype(v8::Isolate* isolate,
                             v8::Local<v8::FunctionTemplate> prototype) {
  prototype->SetClassName(mate::StringToV8(isolate, "Session"));
  mate::ObjectTemplateBuilder(isolate, prototype->PrototypeTemplate())
      .MakeDestroyable()
      .SetMethod("resolveProxy", &Session::ResolveProxy)
      .SetMethod("getCacheSize", &Session::DoCacheAction<CacheAction::STATS>)
      .SetMethod("clearCache", &Session::DoCacheAction<CacheAction::CLEAR>)
      .SetMethod("clearStorageData", &Session::ClearStorageData)
      .SetMethod("flushStorageData", &Session::FlushStorageData)
      .SetMethod("setProxy", &Session::SetProxy)
      .SetMethod("setDownloadPath", &Session::SetDownloadPath)
      .SetMethod("enableNetworkEmulation", &Session::EnableNetworkEmulation)
      .SetMethod("disableNetworkEmulation", &Session::DisableNetworkEmulation)
      .SetMethod("_setCertificateVerifyProc", &Session::SetCertVerifyProc)
      .SetMethod("setPermissionRequestHandler",
                 &Session::SetPermissionRequestHandler)
      .SetMethod("clearHostResolverCache", &Session::ClearHostResolverCache)
      .SetMethod("clearAuthCache", &Session::ClearAuthCache)
      .SetMethod("allowNTLMCredentialsForDomains",
                 &Session::AllowNTLMCredentialsForDomains)
      .SetMethod("setUserAgent", &Session::SetUserAgent)
      .SetMethod("getUserAgent", &Session::GetUserAgent)
      .SetMethod("getBlobData", &Session::GetBlobData)
      .SetMethod("createInterruptedDownload",
                 &Session::CreateInterruptedDownload)
      .SetProperty("cookies", &Session::Cookies)
      .SetProperty("protocol", &Session::Protocol)
      .SetProperty("webRequest", &Session::WebRequest);
}

}  // namespace api

}  // namespace atom

namespace {

using atom::api::Session;

v8::Local<v8::Value> FromPartition(
    const std::string& partition, mate::Arguments* args) {
  if (!atom::Browser::Get()->is_ready()) {
    args->ThrowError("Session can only be received when app is ready");
    return v8::Null(args->isolate());
  }
  base::DictionaryValue options;
  args->GetNext(&options);
  return Session::FromPartition(args->isolate(), partition, options).ToV8();
}

void Initialize(v8::Local<v8::Object> exports, v8::Local<v8::Value> unused,
                v8::Local<v8::Context> context, void* priv) {
  v8::Isolate* isolate = context->GetIsolate();
  mate::Dictionary dict(isolate, exports);
  dict.Set("Session", Session::GetConstructor(isolate)->GetFunction());
  dict.Set("Cookies", Cookies::GetConstructor(isolate)->GetFunction());
  dict.SetMethod("fromPartition", &FromPartition);
}

}  // namespace

NODE_MODULE_CONTEXT_AWARE_BUILTIN(atom_browser_session, Initialize)
