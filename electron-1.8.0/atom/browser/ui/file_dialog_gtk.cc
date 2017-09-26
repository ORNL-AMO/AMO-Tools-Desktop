// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/ui/file_dialog.h"

#include "atom/browser/native_window_views.h"
#include "atom/browser/unresponsive_suppressor.h"
#include "base/callback.h"
#include "base/files/file_util.h"
#include "base/strings/string_util.h"
#include "chrome/browser/ui/libgtkui/gtk_signal.h"
#include "chrome/browser/ui/libgtkui/gtk_util.h"
#include "ui/views/widget/desktop_aura/x11_desktop_handler.h"

namespace file_dialog {

namespace {

// Makes sure that .jpg also shows .JPG.
gboolean FileFilterCaseInsensitive(const GtkFileFilterInfo* file_info,
                                   std::string* file_extension) {
  // Makes .* file extension matches all file types.
  if (*file_extension == ".*")
    return true;
  return base::EndsWith(
    file_info->filename,
    *file_extension, base::CompareCase::INSENSITIVE_ASCII);
}

// Deletes |data| when gtk_file_filter_add_custom() is done with it.
void OnFileFilterDataDestroyed(std::string* file_extension) {
  delete file_extension;
}

class FileChooserDialog {
 public:
  FileChooserDialog(GtkFileChooserAction action,
                    const DialogSettings& settings)
      : parent_(static_cast<atom::NativeWindowViews*>(settings.parent_window)),
        filters_(settings.filters) {
    const char* confirm_text = GTK_STOCK_OK;

    if (!settings.button_label.empty())
      confirm_text = settings.button_label.c_str();
    else if (action == GTK_FILE_CHOOSER_ACTION_SAVE)
      confirm_text = GTK_STOCK_SAVE;
    else if (action == GTK_FILE_CHOOSER_ACTION_OPEN)
      confirm_text = GTK_STOCK_OPEN;

    dialog_ = gtk_file_chooser_dialog_new(
        settings.title.c_str(),
        NULL,
        action,
        GTK_STOCK_CANCEL, GTK_RESPONSE_CANCEL,
        confirm_text, GTK_RESPONSE_ACCEPT,
        NULL);
    if (parent_) {
      parent_->SetEnabled(false);
      libgtkui::SetGtkTransientForAura(dialog_, parent_->GetNativeWindow());
      gtk_window_set_modal(GTK_WINDOW(dialog_), TRUE);
    }

    if (action == GTK_FILE_CHOOSER_ACTION_SAVE)
      gtk_file_chooser_set_do_overwrite_confirmation(GTK_FILE_CHOOSER(dialog_),
                                                     TRUE);
    if (action != GTK_FILE_CHOOSER_ACTION_OPEN)
      gtk_file_chooser_set_create_folders(GTK_FILE_CHOOSER(dialog_), TRUE);

    if (!settings.default_path.empty()) {
      if (base::DirectoryExists(settings.default_path)) {
        gtk_file_chooser_set_current_folder(GTK_FILE_CHOOSER(dialog_),
            settings.default_path.value().c_str());
      } else {
        if (settings.default_path.IsAbsolute()) {
          gtk_file_chooser_set_current_folder(
              GTK_FILE_CHOOSER(dialog_),
              settings.default_path.DirName().value().c_str());
        }

        gtk_file_chooser_set_current_name(GTK_FILE_CHOOSER(dialog_),
            settings.default_path.BaseName().value().c_str());
      }
    }

    if (!settings.filters.empty())
      AddFilters(settings.filters);
  }

  ~FileChooserDialog() {
    gtk_widget_destroy(dialog_);
    if (parent_)
      parent_->SetEnabled(true);
  }

  void SetupProperties(int properties) {
    if (properties & FILE_DIALOG_MULTI_SELECTIONS)
      gtk_file_chooser_set_select_multiple(GTK_FILE_CHOOSER(dialog()), TRUE);
    if (properties & FILE_DIALOG_SHOW_HIDDEN_FILES)
      g_object_set(dialog(), "show-hidden", TRUE, NULL);
  }

  void RunAsynchronous() {
    g_signal_connect(dialog_, "delete-event",
                     G_CALLBACK(gtk_widget_hide_on_delete), NULL);
    g_signal_connect(dialog_, "response",
                     G_CALLBACK(OnFileDialogResponseThunk), this);
    gtk_widget_show_all(dialog_);

    // We need to call gtk_window_present after making the widgets visible to
    // make sure window gets correctly raised and gets focus.
    int time = ui::X11EventSource::GetInstance()->GetTimestamp();
    gtk_window_present_with_time(GTK_WINDOW(dialog_), time);
  }

  void RunSaveAsynchronous(const SaveDialogCallback& callback) {
    save_callback_ = callback;
    RunAsynchronous();
  }

  void RunOpenAsynchronous(const OpenDialogCallback& callback) {
    open_callback_ = callback;
    RunAsynchronous();
  }

  base::FilePath GetFileName() const {
    gchar* filename = gtk_file_chooser_get_filename(GTK_FILE_CHOOSER(dialog_));
    base::FilePath path = AddExtensionForFilename(filename);
    g_free(filename);
    return path;
  }

  std::vector<base::FilePath> GetFileNames() const {
    std::vector<base::FilePath> paths;
    GSList* filenames = gtk_file_chooser_get_filenames(
        GTK_FILE_CHOOSER(dialog_));
    for (GSList* iter = filenames; iter != NULL; iter = g_slist_next(iter)) {
      base::FilePath path = AddExtensionForFilename(
          static_cast<char*>(iter->data));
      g_free(iter->data);
      paths.push_back(path);
    }
    g_slist_free(filenames);
    return paths;
  }

  CHROMEGTK_CALLBACK_1(FileChooserDialog, void, OnFileDialogResponse, int);

  GtkWidget* dialog() const { return dialog_; }

 private:
  void AddFilters(const Filters& filters);
  base::FilePath AddExtensionForFilename(const gchar* filename) const;

  atom::NativeWindowViews* parent_;
  atom::UnresponsiveSuppressor unresponsive_suppressor_;

  GtkWidget* dialog_;

  Filters filters_;
  SaveDialogCallback save_callback_;
  OpenDialogCallback open_callback_;

  DISALLOW_COPY_AND_ASSIGN(FileChooserDialog);
};

void FileChooserDialog::OnFileDialogResponse(GtkWidget* widget, int response) {
  gtk_widget_hide(dialog_);

  if (!save_callback_.is_null()) {
    if (response == GTK_RESPONSE_ACCEPT)
      save_callback_.Run(true, GetFileName());
    else
      save_callback_.Run(false, base::FilePath());
  } else if (!open_callback_.is_null()) {
    if (response == GTK_RESPONSE_ACCEPT)
      open_callback_.Run(true, GetFileNames());
    else
      open_callback_.Run(false, std::vector<base::FilePath>());
  }
  delete this;
}

void FileChooserDialog::AddFilters(const Filters& filters) {
  for (size_t i = 0; i < filters.size(); ++i) {
    const Filter& filter = filters[i];
    GtkFileFilter* gtk_filter = gtk_file_filter_new();

    for (size_t j = 0; j < filter.second.size(); ++j) {
      std::unique_ptr<std::string> file_extension(
          new std::string("." + filter.second[j]));
      gtk_file_filter_add_custom(
          gtk_filter,
          GTK_FILE_FILTER_FILENAME,
          reinterpret_cast<GtkFileFilterFunc>(FileFilterCaseInsensitive),
          file_extension.release(),
          reinterpret_cast<GDestroyNotify>(OnFileFilterDataDestroyed));
    }

    gtk_file_filter_set_name(gtk_filter, filter.first.c_str());
    gtk_file_chooser_add_filter(GTK_FILE_CHOOSER(dialog_), gtk_filter);
  }
}

base::FilePath FileChooserDialog::AddExtensionForFilename(
    const gchar* filename) const {
  base::FilePath path(filename);
  GtkFileFilter* selected_filter =
      gtk_file_chooser_get_filter(GTK_FILE_CHOOSER(dialog_));
  if (!selected_filter)
    return path;

  GSList* filters = gtk_file_chooser_list_filters(GTK_FILE_CHOOSER(dialog_));
  int i = g_slist_index(filters, selected_filter);
  g_slist_free(filters);
  if (i >= filters_.size())
    return path;

  const auto& extensions = filters_[i].second;
  for (const auto& extension : extensions) {
    if (extension == "*" ||
        base::EndsWith(path.value(), "." + extension,
                       base::CompareCase::INSENSITIVE_ASCII))
      return path;
  }

  return path.ReplaceExtension(extensions[0]);
}


}  // namespace

bool ShowOpenDialog(const DialogSettings& settings,
                    std::vector<base::FilePath>* paths) {
  GtkFileChooserAction action = GTK_FILE_CHOOSER_ACTION_OPEN;
  if (settings.properties & FILE_DIALOG_OPEN_DIRECTORY)
    action = GTK_FILE_CHOOSER_ACTION_SELECT_FOLDER;
  FileChooserDialog open_dialog(action, settings);
  open_dialog.SetupProperties(settings.properties);

  gtk_widget_show_all(open_dialog.dialog());
  int response = gtk_dialog_run(GTK_DIALOG(open_dialog.dialog()));
  if (response == GTK_RESPONSE_ACCEPT) {
    *paths = open_dialog.GetFileNames();
    return true;
  } else {
    return false;
  }
}

void ShowOpenDialog(const DialogSettings& settings,
                    const OpenDialogCallback& callback) {
  GtkFileChooserAction action = GTK_FILE_CHOOSER_ACTION_OPEN;
  if (settings.properties & FILE_DIALOG_OPEN_DIRECTORY)
    action = GTK_FILE_CHOOSER_ACTION_SELECT_FOLDER;
  FileChooserDialog* open_dialog = new FileChooserDialog(action, settings);
  open_dialog->SetupProperties(settings.properties);
  open_dialog->RunOpenAsynchronous(callback);
}

bool ShowSaveDialog(const DialogSettings& settings,
                    base::FilePath* path) {
  FileChooserDialog save_dialog(GTK_FILE_CHOOSER_ACTION_SAVE, settings);
  gtk_widget_show_all(save_dialog.dialog());
  int response = gtk_dialog_run(GTK_DIALOG(save_dialog.dialog()));
  if (response == GTK_RESPONSE_ACCEPT) {
    *path = save_dialog.GetFileName();
    return true;
  } else {
    return false;
  }
}

void ShowSaveDialog(const DialogSettings& settings,
                    const SaveDialogCallback& callback) {
  FileChooserDialog* save_dialog = new FileChooserDialog(
      GTK_FILE_CHOOSER_ACTION_SAVE, settings);
  save_dialog->RunSaveAsynchronous(callback);
}

}  // namespace file_dialog
