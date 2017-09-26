// Copyright (c) 2016 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_LIB_BLUETOOTH_CHOOSER_H_
#define ATOM_BROWSER_LIB_BLUETOOTH_CHOOSER_H_

#include <string>
#include <vector>

#include "atom/browser/api/atom_api_web_contents.h"
#include "content/public/browser/bluetooth_chooser.h"

namespace atom {

class BluetoothChooser : public content::BluetoothChooser {
 public:
  struct DeviceInfo {
    std::string device_id;
    base::string16 device_name;
  };

  explicit BluetoothChooser(api::WebContents* contents,
                            const EventHandler& handler);
  ~BluetoothChooser() override;

  // content::BluetoothChooser:
  void SetAdapterPresence(AdapterPresence presence) override;
  void ShowDiscoveryState(DiscoveryState state) override;
  void AddOrUpdateDevice(const std::string& device_id,
                         bool should_update_name,
                         const base::string16& device_name,
                         bool is_gatt_connected,
                         bool is_paired,
                         int signal_strength_level) override;
  void RemoveDevice(const std::string& device_id);

 private:
  std::vector<DeviceInfo> device_list_;
  api::WebContents* api_web_contents_;
  EventHandler event_handler_;
  int num_retries_;

  DISALLOW_COPY_AND_ASSIGN(BluetoothChooser);
};

}  // namespace atom

#endif  // ATOM_BROWSER_LIB_BLUETOOTH_CHOOSER_H_
