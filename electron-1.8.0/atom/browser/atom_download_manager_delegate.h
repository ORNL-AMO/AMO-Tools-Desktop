// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_ATOM_DOWNLOAD_MANAGER_DELEGATE_H_
#define ATOM_BROWSER_ATOM_DOWNLOAD_MANAGER_DELEGATE_H_

#include <string>

#include "base/memory/weak_ptr.h"
#include "content/public/browser/download_manager_delegate.h"

namespace content {
class DownloadManager;
}

namespace atom {

class AtomDownloadManagerDelegate : public content::DownloadManagerDelegate {
 public:
  using CreateDownloadPathCallback =
      base::Callback<void(const base::FilePath&)>;

  explicit AtomDownloadManagerDelegate(content::DownloadManager* manager);
  virtual ~AtomDownloadManagerDelegate();

  // Generate default file path to save the download.
  void CreateDownloadPath(const GURL& url,
                          const std::string& suggested_filename,
                          const std::string& content_disposition,
                          const std::string& mime_type,
                          const base::FilePath& path,
                          const CreateDownloadPathCallback& callback);
  void OnDownloadPathGenerated(uint32_t download_id,
                               const content::DownloadTargetCallback& callback,
                               const base::FilePath& default_path);

  // content::DownloadManagerDelegate:
  void Shutdown() override;
  bool DetermineDownloadTarget(
      content::DownloadItem* download,
      const content::DownloadTargetCallback& callback) override;
  bool ShouldOpenDownload(
      content::DownloadItem* download,
      const content::DownloadOpenDelayedCallback& callback) override;
  void GetNextId(const content::DownloadIdCallback& callback) override;

 private:
  // Get the save path set on the associated api::DownloadItem object
  void GetItemSavePath(content::DownloadItem* item, base::FilePath* path);

  content::DownloadManager* download_manager_;
  base::WeakPtrFactory<AtomDownloadManagerDelegate> weak_ptr_factory_;

  DISALLOW_COPY_AND_ASSIGN(AtomDownloadManagerDelegate);
};

}  // namespace atom

#endif  // ATOM_BROWSER_ATOM_DOWNLOAD_MANAGER_DELEGATE_H_
