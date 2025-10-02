import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, EndUse } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { EndUsesFormService, UpdatedEndUseData } from '../end-uses-form/end-uses-form.service';

@Component({
    selector: 'app-end-use-table',
    templateUrl: './end-use-table.component.html',
    styleUrls: ['./end-use-table.component.css'],
    standalone: false
})
export class EndUseTableComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;

  selectedEndUse: EndUse;
  selectedEndUseSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  confirmDeleteData: ConfirmDeleteData;

  settings: Settings;
  hasInvalidEndUses: boolean = false;
  constructor(private endUsesFormService: EndUsesFormService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedEndUseSub = this.endUsesFormService.selectedEndUse.subscribe(val => {
      this.selectedEndUse = val;
    })
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && compressedAirAssessment.endUseData.endUses) {
        this.compressedAirAssessment = compressedAirAssessment;
        this.compressedAirAssessment.endUseData.endUses.forEach(endUse => {
          endUse.isValid = this.endUsesFormService.isEndUseValid(endUse, this.compressedAirAssessment, this.settings);
          if (!endUse.endUseName) {
            endUse.endUseName = 'End Use ' + (this.compressedAirAssessment.endUseData.endUses.indexOf(endUse) + 1).toString();
            endUse.isValid = this.endUsesFormService.isEndUseValid(endUse, this.compressedAirAssessment, this.settings);
          }
        });
        this.hasInvalidEndUses = this.compressedAirAssessment.endUseData.endUses.some(endUse => !endUse.isValid);
      }
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  selectItem(item: EndUse) {
    this.endUsesFormService.selectedEndUse.next(item);
  }

  addNewEndUse() {
    let result: UpdatedEndUseData = this.endUsesFormService.addToAssessment(this.compressedAirAssessment, this.settings);
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, true);
    this.endUsesFormService.selectedEndUse.next(result.endUse);
  }

  deleteEndUse() {
    let itemIndex: number = this.compressedAirAssessment.endUseData.endUses.findIndex(endUse => { return endUse.endUseId == this.deleteSelectedId });
    this.compressedAirAssessment.endUseData.endUses.splice(itemIndex, 1);

    this.compressedAirAssessment.modifications.forEach(modification => {
      modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(data => { return data.compressorId != this.deleteSelectedId });
      modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(data => { return data.compressorId != this.deleteSelectedId });
      modification.useAutomaticSequencer.profileSummary = modification.useAutomaticSequencer.profileSummary.filter(summary => { return summary.compressorId != this.deleteSelectedId })
    });

    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
    this.endUsesFormService.selectedEndUse.next(this.compressedAirAssessment.endUseData.endUses[0]);
  }

  openConfirmDeleteModal(endUse: EndUse) {
    this.confirmDeleteData = {
      modalTitle: 'Delete End Use',
      confirmMessage: `Are you sure you want to delete '${endUse.endUseName}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = endUse.endUseId;
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteEndUse: boolean) {
    if (deleteEndUse) {
      this.deleteEndUse();
    }
    this.showConfirmDeleteModal = false;
    this.compressedAirAssessmentService.modalOpen.next(false);
  }

  createCopy(endUse: EndUse){
    let endUseCopy: EndUse = JSON.parse(JSON.stringify(endUse));
    endUseCopy.endUseId = Math.random().toString(36).substr(2, 9);
    endUseCopy.endUseName = endUseCopy.endUseName + ' (copy)';
    let newEndUse: UpdatedEndUseData = this.endUsesFormService.addToAssessment(this.compressedAirAssessment, this.settings, endUseCopy);
    this.compressedAirAssessmentService.updateCompressedAir(newEndUse.compressedAirAssessment, true);
  }
}
