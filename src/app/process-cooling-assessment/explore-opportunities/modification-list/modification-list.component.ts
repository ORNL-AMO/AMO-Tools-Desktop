import { Component, DestroyRef, inject, Signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { ModificationService } from '../../services/modification.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-modification-list',
  standalone: false,
  templateUrl: './modification-list.component.html',
  styleUrl: './modification-list.component.css'
})
export class ModificationListComponent {
  private modificationService = inject(ModificationService);
  private dialogRef = inject(DialogRef<ModificationListComponent>);

  readonly modifications: Signal<Modification[]> = this.modificationService.modifications;
  readonly selectedModificationId$ = this.modificationService.selectedModificationId$

  selectedModificationId: string;
  deleteModificationId: string;
  renameModificationId: string;
  dropdownId: string;
  newModificationName: string;
  renameModificationName: string;

  close() {
    this.dialogRef.close();
  }

  confirmDelete() {
    this.modificationService.deleteAssessmentModification(this.deleteModificationId);
    this.deleteModificationId = undefined;
  }

  cancelDelete() {
    this.deleteModificationId = undefined;
  }

  showDropdown(modId: string) {
    if (!this.dropdownId) {
      this.dropdownId = modId;
    } else {
      this.dropdownId = undefined;
    }
  }

  selectModification(modId: string) {
    this.modificationService.setSelectedModificationId(modId);
    this.close();
  }

  addNewModification() {
    this.modificationService.addNewModificationToAssessment(this.newModificationName);
  }

  saveUpdates(modification: Modification) {
    modification.name = this.renameModificationName;
    this.modificationService.updateModification(modification);
    this.renameModificationId = undefined;
  }

  createCopy(modification: Modification) {
    this.modificationService.copyModification(modification.id);
  }

  getBadges(modification: Modification): Array<string> {
    return this.modificationService.getEEMBadges(modification);
  }

  selectDelete(modId: string) {
    this.deleteModificationId = modId;
    this.dropdownId = undefined;
  }

  selectRename(modification: Modification) {
    this.renameModificationName = modification.name;
    this.renameModificationId = modification.id;
    this.dropdownId = undefined;
  }

}
