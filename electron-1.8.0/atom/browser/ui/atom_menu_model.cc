// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/ui/atom_menu_model.h"

#include "base/stl_util.h"

namespace atom {

AtomMenuModel::AtomMenuModel(Delegate* delegate)
    : ui::SimpleMenuModel(delegate),
      delegate_(delegate) {
}

AtomMenuModel::~AtomMenuModel() {
}

void AtomMenuModel::SetRole(int index, const base::string16& role) {
  int command_id = GetCommandIdAt(index);
  roles_[command_id] = role;
}

base::string16 AtomMenuModel::GetRoleAt(int index) {
  int command_id = GetCommandIdAt(index);
  if (base::ContainsKey(roles_, command_id))
    return roles_[command_id];
  else
    return base::string16();
}

bool AtomMenuModel::GetAcceleratorAtWithParams(
    int index,
    bool use_default_accelerator,
    ui::Accelerator* accelerator) const {
  if (delegate_) {
    return delegate_->GetAcceleratorForCommandIdWithParams(
        GetCommandIdAt(index), use_default_accelerator, accelerator);
  }
  return false;
}

void AtomMenuModel::MenuWillClose() {
  ui::SimpleMenuModel::MenuWillClose();
  for (Observer& observer : observers_)
    observer.MenuWillClose();
}

AtomMenuModel* AtomMenuModel::GetSubmenuModelAt(int index) {
  return static_cast<AtomMenuModel*>(
      ui::SimpleMenuModel::GetSubmenuModelAt(index));
}

}  // namespace atom
