import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import * as _ from 'lodash';
import { ExploreOpportunitiesService } from '../explore-opportunities/explore-opportunities.service';

@Component({
  selector: 'app-modification-list-modal',
  templateUrl: './modification-list-modal.component.html',
  styleUrls: ['./modification-list-modal.component.css']
})
export class ModificationListModalComponent implements OnInit {


  @ViewChild('modificationListModal', { static: false }) public modificationListModal: ModalDirective;
  compressedAirAssessment: CompressedAirAssessment;
  compressedAirSub: Subscription;
  selectedModificationId: string;
  selectedModificationIdSub: Subscription;

  deleteModificationId: string;
  renameModificationId: string;
  dropdownId: string;
  newModificationName: string;
  renameModificationName: string;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesServce: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentService.modalOpen.next(true);
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      this.selectedModificationId = val;
    });
    this.compressedAirSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
    });
  }

  ngOnDestroy() {
    this.compressedAirSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.modificationListModal.show();
  }

  closeModal() {
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.compressedAirAssessmentService.showModificationListModal.next(false);
    this.modificationListModal.hide();
  }

  confirmDelete() {
    let deleteModIndex: number = this.compressedAirAssessment.modifications.findIndex(modification => { return modification.modificationId == this.deleteModificationId });
    this.compressedAirAssessment.modifications.splice(deleteModIndex, 1);
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    if (this.deleteModificationId == this.selectedModificationId) {
      if (this.compressedAirAssessment.modifications.length != 0) {
        this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
      } else {
        this.compressedAirAssessmentService.selectedModificationId.next(undefined);
      }
    }
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
    this.compressedAirAssessmentService.selectedModificationId.next(modId);
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.closeModal();
  }

  saveUpdates() {
    let renameModIndex: number = this.compressedAirAssessment.modifications.findIndex(modification => { return modification.modificationId == this.renameModificationId });
    this.compressedAirAssessment.modifications[renameModIndex].name = this.renameModificationName;
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.renameModificationId = undefined;
  }

  createCopy(modification: Modification) {
    let modificationCopy: Modification = JSON.parse(JSON.stringify(modification));
    let testName = _.filter(this.compressedAirAssessment.modifications, (mod) => { return mod.name.includes(modificationCopy.name); });
    if (testName) {
      modificationCopy.name = modificationCopy.name + '(' + testName.length + ')';
    }
    modificationCopy.modificationId = Math.random().toString(36).substr(2, 9);
    this.compressedAirAssessment.modifications.push(modificationCopy);
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.compressedAirAssessmentService.selectedModificationId.next(modificationCopy.modificationId);
  }

  selectDelete(modId: string) {
    this.deleteModificationId = modId;
    this.dropdownId = undefined;
  }

  selectRename(modification: Modification) {
    this.renameModificationName = modification.name;
    this.renameModificationId = modification.modificationId;
    this.dropdownId = undefined;
  }

  addNewModification() {
    let modification: Modification = this.exploreOpportunitiesServce.getNewModification(this.compressedAirAssessment);
    modification.name = this.newModificationName ? this.newModificationName : modification.name;
    this.compressedAirAssessment.modifications.push(modification);
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.compressedAirAssessmentService.selectedModificationId.next(modification.modificationId);
    this.closeModal();
  }

  // getBadges(modificationData: WasteWaterData): Array<{ badge: string, componentStr: string }> {
  //   return this.compareService.getBadges(this.wasteWater.baselineData, modificationData);
  // }

  goToModification(modificationId: string, componentStr: string) {
    this.compressedAirAssessmentService.mainTab.next(componentStr);
    this.selectModification(modificationId);
  }
}
