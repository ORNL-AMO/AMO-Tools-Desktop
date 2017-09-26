// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/common/crash_reporter/crash_reporter_mac.h"

#include <memory>

#include "base/files/file_util.h"
#include "base/mac/bundle_locations.h"
#include "base/mac/mac_util.h"
#include "base/memory/singleton.h"
#include "base/strings/string_piece.h"
#include "base/strings/stringprintf.h"
#include "base/strings/sys_string_conversions.h"
#include "vendor/crashpad/client/crashpad_client.h"
#include "vendor/crashpad/client/crashpad_info.h"
#include "vendor/crashpad/client/settings.h"

namespace crash_reporter {

CrashReporterMac::CrashReporterMac() {
}

CrashReporterMac::~CrashReporterMac() {
}

void CrashReporterMac::InitBreakpad(const std::string& product_name,
                                    const std::string& version,
                                    const std::string& company_name,
                                    const std::string& submit_url,
                                    const base::FilePath& crashes_dir,
                                    bool upload_to_server,
                                    bool skip_system_crash_handler) {
  // check whether crashpad has been initialized.
  // Only need to initialize once.
  if (simple_string_dictionary_)
    return;

  if (is_browser_) {
    @autoreleasepool {
      base::FilePath framework_bundle_path = base::mac::FrameworkBundlePath();
      base::FilePath handler_path =
          framework_bundle_path.Append("Resources").Append("crashpad_handler");

      std::vector<std::string> args = {
        "--no-rate-limit",
        "--no-upload-gzip",  // not all servers accept gzip
      };

      crashpad::CrashpadClient crashpad_client;
      crashpad_client.StartHandler(handler_path, crashes_dir, crashes_dir,
                                   submit_url,
                                   StringMap(),
                                   args,
                                   true,
                                   false);
    }  // @autoreleasepool
  }

  crashpad::CrashpadInfo* crashpad_info =
      crashpad::CrashpadInfo::GetCrashpadInfo();
  if (skip_system_crash_handler) {
    crashpad_info->set_system_crash_reporter_forwarding(
        crashpad::TriState::kDisabled);
  }

  simple_string_dictionary_.reset(new crashpad::SimpleStringDictionary());
  crashpad_info->set_simple_annotations(simple_string_dictionary_.get());

  SetCrashKeyValue("prod", ATOM_PRODUCT_NAME);
  SetCrashKeyValue("process_type", is_browser_ ? "browser" : "renderer");
  SetCrashKeyValue("ver", version);

  for (const auto& upload_parameter: upload_parameters_) {
    SetCrashKeyValue(upload_parameter.first, upload_parameter.second);
  }
  if (is_browser_) {
    database_ =
        crashpad::CrashReportDatabase::Initialize(crashes_dir);
    SetUploadToServer(upload_to_server);
  }
}

bool CrashReporterMac::GetUploadToServer() {
  bool enabled = true;
  if (database_) {
    database_->GetSettings()->GetUploadsEnabled(&enabled);
  }
  return enabled;
}

void CrashReporterMac::SetUploadToServer(const bool upload_to_server) {
  if (database_) {
    database_->GetSettings()->SetUploadsEnabled(upload_to_server);
  }
}

void CrashReporterMac::SetUploadParameters() {
  upload_parameters_["platform"] = "darwin";
}

void CrashReporterMac::SetCrashKeyValue(const base::StringPiece& key,
                                        const base::StringPiece& value) {
  simple_string_dictionary_->SetKeyValue(key.data(), value.data());
}

void CrashReporterMac::SetExtraParameter(const std::string& key,
                                         const std::string& value) {
  if (simple_string_dictionary_)
    SetCrashKeyValue(key, value);
  else
    upload_parameters_[key] = value;
}

void CrashReporterMac::RemoveExtraParameter(const std::string& key) {
  if (simple_string_dictionary_)
    simple_string_dictionary_->RemoveKey(key.data());
  else
    upload_parameters_.erase(key);
}

std::vector<CrashReporter::UploadReportResult>
CrashReporterMac::GetUploadedReports(const base::FilePath& crashes_dir) {
  std::vector<CrashReporter::UploadReportResult> uploaded_reports;

  if (!base::PathExists(crashes_dir)) {
    return uploaded_reports;
  }
  // Load crashpad database.
  std::unique_ptr<crashpad::CrashReportDatabase> database =
    crashpad::CrashReportDatabase::Initialize(crashes_dir);
  DCHECK(database);

  std::vector<crashpad::CrashReportDatabase::Report> completed_reports;
  crashpad::CrashReportDatabase::OperationStatus status =
      database->GetCompletedReports(&completed_reports);
  if (status != crashpad::CrashReportDatabase::kNoError) {
    return uploaded_reports;
  }

  for (const crashpad::CrashReportDatabase::Report& completed_report :
       completed_reports) {
    if (completed_report.uploaded) {
      uploaded_reports.push_back(
          UploadReportResult(static_cast<int>(completed_report.creation_time),
                             completed_report.id));
    }
  }

  auto sort_by_time = [](const UploadReportResult& a,
      const UploadReportResult& b) {return a.first >= b.first;};
  std::sort(uploaded_reports.begin(), uploaded_reports.end(), sort_by_time);
  return uploaded_reports;
}

// static
CrashReporterMac* CrashReporterMac::GetInstance() {
  return base::Singleton<CrashReporterMac>::get();
}

// static
CrashReporter* CrashReporter::GetInstance() {
  return CrashReporterMac::GetInstance();
}

}  // namespace crash_reporter
