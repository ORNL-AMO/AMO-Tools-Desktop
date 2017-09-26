// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/common/native_mate_converters/net_converter.h"

#include <string>
#include <vector>

#include "atom/common/native_mate_converters/gurl_converter.h"
#include "atom/common/native_mate_converters/value_converter.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/values.h"
#include "native_mate/dictionary.h"
#include "net/base/upload_bytes_element_reader.h"
#include "net/base/upload_data_stream.h"
#include "net/base/upload_element_reader.h"
#include "net/base/upload_file_element_reader.h"
#include "net/cert/x509_certificate.h"
#include "net/http/http_response_headers.h"
#include "net/url_request/url_request.h"
#include "storage/browser/blob/upload_blob_element_reader.h"

#include "atom/common/node_includes.h"

namespace mate {

namespace {

bool CertFromData(const std::string& data,
    scoped_refptr<net::X509Certificate>* out) {
  auto cert_list = net::X509Certificate::CreateCertificateListFromBytes(
    data.c_str(), data.length(),
    net::X509Certificate::FORMAT_SINGLE_CERTIFICATE);
  if (cert_list.empty())
    return false;

  auto leaf_cert = cert_list.front();
  if (!leaf_cert)
    return false;

  *out = leaf_cert;

  return true;
}

}  // namespace

// static
v8::Local<v8::Value> Converter<const net::AuthChallengeInfo*>::ToV8(
    v8::Isolate* isolate, const net::AuthChallengeInfo* val) {
  mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);
  dict.Set("isProxy", val->is_proxy);
  dict.Set("scheme", val->scheme);
  dict.Set("host", val->challenger.host());
  dict.Set("port", static_cast<uint32_t>(val->challenger.port()));
  dict.Set("realm", val->realm);
  return mate::ConvertToV8(isolate, dict);
}

// static
v8::Local<v8::Value> Converter<scoped_refptr<net::X509Certificate>>::ToV8(
    v8::Isolate* isolate, const scoped_refptr<net::X509Certificate>& val) {
  mate::Dictionary dict(isolate, v8::Object::New(isolate));
  std::string encoded_data;
  net::X509Certificate::GetPEMEncoded(
      val->os_cert_handle(), &encoded_data);

  dict.Set("data", encoded_data);
  dict.Set("issuer", val->issuer());
  dict.Set("issuerName", val->issuer().GetDisplayName());
  dict.Set("subject", val->subject());
  dict.Set("subjectName", val->subject().GetDisplayName());
  dict.Set("serialNumber", base::HexEncode(val->serial_number().data(),
                                           val->serial_number().size()));
  dict.Set("validStart", val->valid_start().ToDoubleT());
  dict.Set("validExpiry", val->valid_expiry().ToDoubleT());
  dict.Set("fingerprint",
           net::HashValue(
              val->CalculateFingerprint256(val->os_cert_handle())).ToString());

  if (!val->GetIntermediateCertificates().empty()) {
    net::X509Certificate::OSCertHandles issuer_intermediates(
        val->GetIntermediateCertificates().begin() + 1,
        val->GetIntermediateCertificates().end());
    const scoped_refptr<net::X509Certificate>& issuer_cert =
        net::X509Certificate::CreateFromHandle(
            val->GetIntermediateCertificates().front(),
            issuer_intermediates);
    dict.Set("issuerCert", issuer_cert);
  }

  return dict.GetHandle();
}

bool Converter<scoped_refptr<net::X509Certificate>>::FromV8(
    v8::Isolate* isolate, v8::Local<v8::Value> val,
    scoped_refptr<net::X509Certificate>* out) {
  mate::Dictionary dict;
  if (!ConvertFromV8(isolate, val, &dict))
    return false;

  std::string data;
  dict.Get("data", &data);
  scoped_refptr<net::X509Certificate> leaf_cert;
  if (!CertFromData(data, &leaf_cert))
    return false;

  scoped_refptr<net::X509Certificate> parent;
  if (dict.Get("issuerCert", &parent)) {
    auto parents = std::vector<net::X509Certificate::OSCertHandle>(
                      parent->GetIntermediateCertificates());
    parents.insert(parents.begin(), parent->os_cert_handle());
    auto cert = net::X509Certificate::CreateFromHandle(
      leaf_cert->os_cert_handle(), parents);
    if (!cert)
      return false;

    *out = cert;
  } else {
    *out = leaf_cert;
  }

  return true;
}

// static
v8::Local<v8::Value> Converter<net::CertPrincipal>::ToV8(
    v8::Isolate* isolate, const net::CertPrincipal& val) {
  mate::Dictionary dict(isolate, v8::Object::New(isolate));

  dict.Set("commonName", val.common_name);
  dict.Set("organizations", val.organization_names);
  dict.Set("organizationUnits", val.organization_unit_names);
  dict.Set("locality", val.locality_name);
  dict.Set("state", val.state_or_province_name);
  dict.Set("country", val.country_name);

  return dict.GetHandle();
}

// static
v8::Local<v8::Value> Converter<net::HttpResponseHeaders*>::ToV8(
    v8::Isolate* isolate,
    net::HttpResponseHeaders* headers) {
  base::DictionaryValue response_headers;
  if (headers) {
    size_t iter = 0;
    std::string key;
    std::string value;
    while (headers->EnumerateHeaderLines(&iter, &key, &value)) {
      key = base::ToLowerASCII(key);
      if (response_headers.HasKey(key)) {
        base::ListValue* values = nullptr;
        if (response_headers.GetList(key, &values))
          values->AppendString(value);
      } else {
        std::unique_ptr<base::ListValue> values(new base::ListValue());
        values->AppendString(value);
        response_headers.Set(key, std::move(values));
      }
    }
  }
  return ConvertToV8(isolate, response_headers);
}

}  // namespace mate

namespace atom {

void FillRequestDetails(base::DictionaryValue* details,
                        const net::URLRequest* request) {
  details->SetString("method", request->method());
  std::string url;
  if (!request->url_chain().empty()) url = request->url().spec();
  details->SetStringWithoutPathExpansion("url", url);
  details->SetString("referrer", request->referrer());
  std::unique_ptr<base::ListValue> list(new base::ListValue);
  GetUploadData(list.get(), request);
  if (!list->empty())
    details->Set("uploadData", std::move(list));
}

void GetUploadData(base::ListValue* upload_data_list,
                   const net::URLRequest* request) {
  const net::UploadDataStream* upload_data = request->get_upload();
  if (!upload_data)
    return;
  const std::vector<std::unique_ptr<net::UploadElementReader>>* readers =
      upload_data->GetElementReaders();
  for (const auto& reader : *readers) {
    std::unique_ptr<base::DictionaryValue> upload_data_dict(
        new base::DictionaryValue);
    if (reader->AsBytesReader()) {
      const net::UploadBytesElementReader* bytes_reader =
          reader->AsBytesReader();
      std::unique_ptr<base::Value> bytes(
          base::Value::CreateWithCopiedBuffer(bytes_reader->bytes(),
                                                    bytes_reader->length()));
      upload_data_dict->Set("bytes", std::move(bytes));
    } else if (reader->AsFileReader()) {
      const net::UploadFileElementReader* file_reader =
          reader->AsFileReader();
      auto file_path = file_reader->path().AsUTF8Unsafe();
      upload_data_dict->SetStringWithoutPathExpansion("file", file_path);
    } else {
      const storage::UploadBlobElementReader* blob_reader =
          static_cast<storage::UploadBlobElementReader*>(reader.get());
      upload_data_dict->SetString("blobUUID", blob_reader->uuid());
    }
    upload_data_list->Append(std::move(upload_data_dict));
  }
}

}  // namespace atom
