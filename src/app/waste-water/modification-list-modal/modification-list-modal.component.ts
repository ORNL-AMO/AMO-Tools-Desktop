import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import * as _ from 'lodash';
import { CompareService } from '../modify-conditions/compare.service';
@Component({
  selector: 'app-modification-list-modal',
  templateUrl: './modification-list-modal.component.html',
  styleUrls: ['./modification-list-modal.component.css']
})
export class ModificationListModalComponent implements OnInit {

  @ViewChild('modificationListModal', { static: false }) public modificationListModal: ModalDirective;
  wasteWater: WasteWater;
  wasteWaterSub: Subscription;
  selectedModificationId: string;
  selectedModificationIdSub: Subscription;

  deleteModificationId: string;
  renameModificationId: string;
  dropdownId: string;
  newModificationName: string;
  renameModificationName: string;
  constructor(private wasteWaterService: WasteWaterService, private compareService: CompareService) { }

  ngOnInit(): void {
    this.wasteWaterService.isModalOpen.next(true);
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      this.selectedModificationId = val;
    });
    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.wasteWater = val;
    });
  }

  ngOnDestroy() {
    this.wasteWaterSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.modificationListModal.show();
  }

  closeModal() {
    this.wasteWaterService.isModalOpen.next(false);
    this.wasteWaterService.showModificationListModal.next(false);
    this.modificationListModal.hide();
  }

  confirmDelete() {
    let deleteModIndex: number = this.wasteWater.modifications.findIndex(modification => { return modification.id == this.deleteModificationId });
    this.wasteWater.modifications.splice(deleteModIndex, 1);
    if (this.deleteModificationId == this.selectedModificationId) {
      if (this.wasteWater.modifications.length != 0) {
        this.wasteWaterService.selectedModificationId.next(this.wasteWater.modifications[0].id);
      } else {
        this.wasteWaterService.selectedModificationId.next(undefined);
      }
    }
    this.wasteWaterService.updateWasteWater(this.wasteWater);
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
    this.wasteWaterService.selectedModificationId.next(modId);
    this.wasteWaterService.updateWasteWater(this.wasteWater);
    this.closeModal();
  }

  saveUpdates() {
    let renameModIndex: number = this.wasteWater.modifications.findIndex(modification => { return modification.id == this.renameModificationId });
    this.wasteWater.modifications[renameModIndex].name = this.renameModificationName;
    this.wasteWaterService.updateWasteWater(this.wasteWater);
    this.renameModificationId = undefined;
  }

  createCopy(wasteWaterData: WasteWaterData) {
    let modificationCopy: WasteWaterData = JSON.parse(JSON.stringify(wasteWaterData));
    let testName = _.filter(this.wasteWater.modifications, (mod) => { return mod.name.includes(modificationCopy.name); });
    if (testName) {
      modificationCopy.name = modificationCopy.name + '(' + testName.length + ')';
    }
    modificationCopy.id = Math.random().toString(36).substr(2, 9);
    this.wasteWater.modifications.push(modificationCopy);
    this.wasteWaterService.updateWasteWater(this.wasteWater);
    this.wasteWaterService.selectedModificationId.next(modificationCopy.id);
  }

  selectDelete(modId: string) {
    this.deleteModificationId = modId;
    this.dropdownId = undefined;
  }

  selectRename(wasteWaterData: WasteWaterData) {
    this.renameModificationName = wasteWaterData.name;
    this.renameModificationId = wasteWaterData.id;
    this.dropdownId = undefined;
  }

  addNewModification() {
    let modification: WasteWaterData = JSON.parse(JSON.stringify(this.wasteWater.baselineData));
    if (modification.co2SavingsData) {
      modification.co2SavingsData.userEnteredModificationEmissions = modification.co2SavingsData.userEnteredBaselineEmissions; 
    }
    modification.name = this.newModificationName;
    modification.id = Math.random().toString(36).substr(2, 9);
    this.wasteWater.modifications.push(modification);
    this.wasteWaterService.updateWasteWater(this.wasteWater);
    this.wasteWaterService.selectedModificationId.next(modification.id);
    this.closeModal();
  }

  getBadges(modificationData: WasteWaterData): Array<{ badge: string, componentStr: string }> {
    return this.compareService.getBadges(this.wasteWater.baselineData, modificationData);
  }

  goToModification(modificationId: string, componentStr: string) {
    this.wasteWaterService.modifyConditionsTab.next(componentStr);
    this.selectModification(modificationId);
  }
}
