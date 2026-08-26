import { ChangeDetectionStrategy, Component, inject, Injector, Signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormsModule } from '@angular/forms';
import { ModalDialogService } from '../modal-dialog.service';

export interface ModificationListItem {
  id: string;
  name: string;
  badges?: string[];
}

export interface ModificationListData {
  themeClass: string;
  title?: string;
  items: Signal<ModificationListItem[]>;
  selectedItemId: Signal<string | undefined>;
  showBadges?: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onAddNew: (name: string) => void;
}

export const DEFAULT_TITLE = 'Select Scenario';
export const DEFAULT_ADD_NEW_DESCRIPTION = 'Add a new scenario. Your data will be copied directly from your baseline.';

// Single place callers open this modal from, so the width and dialog config stay in sync across
// every caller instead of being repeated at each call site.
export function openModificationListModal(modalDialogService: ModalDialogService, injector: Injector, data: ModificationListData): void {
  modalDialogService.openModal(ModificationListComponent, { width: '1200px', data }, injector);
}

@Component({
  selector: 'app-modification-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './modification-list.component.html',
  styleUrl: './modification-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationListComponent {
  private readonly dialogRef = inject(DialogRef<void, ModificationListComponent>);
  protected readonly data = inject<ModificationListData>(DIALOG_DATA);

  protected readonly title = this.data.title ?? DEFAULT_TITLE;
  protected readonly addNewDescription = DEFAULT_ADD_NEW_DESCRIPTION;

  protected readonly items: Signal<ModificationListItem[]> = this.data.items;
  protected readonly selectedItemId: Signal<string | undefined> = this.data.selectedItemId;

  deleteItemId?: string;
  renameItemId?: string;
  dropdownId?: string;
  newItemName = '';
  renameItemName = '';

  close(): void {
    this.dialogRef.close();
  }

  selectItem(id: string): void {
    this.data.onSelect(id);
    this.close();
  }

  addNewItem(): void {
    if (!this.newItemName) return;
    this.data.onAddNew(this.newItemName);
    this.newItemName = '';
  }

  showDropdown(id: string): void {
    this.dropdownId = this.dropdownId === id ? undefined : id;
  }

  selectRename(item: ModificationListItem): void {
    this.renameItemName = item.name;
    this.renameItemId = item.id;
    this.deleteItemId = undefined;
    this.dropdownId = undefined;
  }

  saveRename(item: ModificationListItem): void {
    if (!this.renameItemName.trim()) return;
    this.data.onRename(item.id, this.renameItemName);
    this.renameItemId = undefined;
  }

  selectDelete(id: string): void {
    this.deleteItemId = id;
    this.renameItemId = undefined;
    this.dropdownId = undefined;
  }

  confirmDelete(): void {
    if (this.deleteItemId) {
      this.data.onDelete(this.deleteItemId);
    }
    this.deleteItemId = undefined;
  }

  cancelDelete(): void {
    this.deleteItemId = undefined;
  }

  createCopy(item: ModificationListItem): void {
    this.data.onCopy(item.id);
  }
}
