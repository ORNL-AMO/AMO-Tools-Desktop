// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include <map>
#include <string>

#include "atom/common/crash_reporter/crash_reporter.h"
#include "atom/common/native_mate_converters/file_path_converter.h"
#include "base/bind.h"
#include "native_mate/dictionary.h"

#include "atom/common/node_includes.h"

using crash_reporter::CrashReporter;

namespace mate {

template<>
struct Converter<CrashReporter::UploadReportResult> {
  static v8::Local<v8::Value> ToV8(v8::Isolate* isolate,
      const CrashReporter::UploadReportResult& reports) {
    mate::Dictionary dict(isolate, v8::Object::New(isolate));
    dict.Set("date", v8::Date::New(isolate, reports.first*1000.0));
    dict.Set("id", reports.second);
    return dict.GetHandle();
  }
};

}  // namespace mate

namespace {

void SetExtraParameter(const std::string& key, mate::Arguments* args) {
  std::string value;
  if (args->GetNext(&value))
    CrashReporter::GetInstance()->SetExtraParameter(key, value);
  else
    CrashReporter::GetInstance()->RemoveExtraParameter(key);
}


void Initialize(v8::Local<v8::Object> exports, v8::Local<v8::Value> unused,
                v8::Local<v8::Context> context, void* priv) {
  mate::Dictionary dict(context->GetIsolate(), exports);
  auto reporter = base::Unretained(CrashReporter::GetInstance());
  dict.SetMethod("start", base::Bind(&CrashReporter::Start, reporter));
  dict.SetMethod("setExtraParameter", &SetExtraParameter);
  dict.SetMethod("getUploadedReports",
                 base::Bind(&CrashReporter::GetUploadedReports, reporter));
  dict.SetMethod("setUploadToServer",
                 base::Bind(&CrashReporter::SetUploadToServer, reporter));
  dict.SetMethod("getUploadToServer",
                 base::Bind(&CrashReporter::GetUploadToServer, reporter));
}

}  // namespace

NODE_MODULE_CONTEXT_AWARE_BUILTIN(atom_common_crash_reporter, Initialize)
