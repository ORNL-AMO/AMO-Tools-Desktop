import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, CompressedAirDayType } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory-setup/inventory/inventory.service';
import { DayTypeService } from './day-type.service';
import { CompressedAirAssessmentValidation } from '../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { CompressedAirAssessmentValidationService } from '../../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';

@Component({
    selector: 'app-day-types',
    templateUrl: './day-types.component.html',
    styleUrls: ['./day-types.component.css'],
    standalone: false
})
export class DayTypesComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  totalAnnualDays: number;
  totalDownDays: number;

  showConfirmDeleteModal: boolean = false;

  deleteSelectedDayTypeId: string;
  confirmDeleteDayTypeData: ConfirmDeleteData;
  dayTypesFormArray: Array<UntypedFormGroup>;
  isFormChange: boolean = false;
  hasValidDayTypes: boolean;
  hasEndUses: boolean;
  hasModifications: boolean;
  hasDataExplorerData: boolean;

  validationStatus: CompressedAirAssessmentValidation;
  validationStatusSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private dayTypeService: DayTypeService, private router: Router,
    private inventoryService: InventoryService,
    private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService) { }

  ngOnInit(): void {
    this.validationStatusSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(val => {
      this.hasValidDayTypes = val.dayTypesValid;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.hasDataExplorerData = (val.logToolData != undefined);
      this.checkLockDayTypes()
      this.setTotalDays();
      if (this.isFormChange == false) {
        this.dayTypesFormArray = this.dayTypeService.getDayTypeFormArray(this.compressedAirAssessment.compressedAirDayTypes);
      } else {
        this.isFormChange = false;
      }
    });
  }

  checkLockDayTypes() {
    if (this.compressedAirAssessment.modifications && this.compressedAirAssessment.modifications.length != 0) {
      this.hasModifications = true;
    } else {
      this.hasModifications = false;
    }
    if (this.compressedAirAssessment.endUseData.endUses.length != 0) {
      this.hasEndUses = true;
    } else {
      this.hasEndUses = false;
    }
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.validationStatusSub.unsubscribe();
  }

  openDataExplorer() {
    this.router.navigateByUrl('/log-tool');
  }

  addDayType() {
    this.compressedAirAssessment = this.inventoryService.addNewDayType(this.compressedAirAssessment, 'Day Type');
    this.dayTypesFormArray = this.dayTypeService.getDayTypeFormArray(this.compressedAirAssessment.compressedAirDayTypes);
    this.save();
  }

  focusField(currentField: string) { }

  save() {
    //update modification day type names on changes
    let compressedAirDaytypes: Array<CompressedAirDayType> = this.dayTypeService.getDayTypesFromForm(this.dayTypesFormArray);
    this.compressedAirAssessment.compressedAirDayTypes = compressedAirDaytypes;
    this.setTotalDays();
    this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      for (let i = 0; i < this.compressedAirAssessment.modifications.length; i++) {
        this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
          let dayTypeIndex: number = item.reductionData.findIndex(reductionData => { return reductionData.dayTypeId == dayType.dayTypeId });
          item.reductionData[dayTypeIndex].dayTypeName = dayType.name;
        });
      }
    })
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
  }

  setTotalDays() {
    this.totalAnnualDays = 0;
    this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      this.totalAnnualDays = dayType.numberOfDays + this.totalAnnualDays;
    });
    this.totalDownDays = 0;
    if (this.totalAnnualDays < 365) {
      this.totalDownDays = 365 - this.totalAnnualDays;
    }
  }

  removeDayType() {
    this.compressedAirAssessment.systemProfile.profileSummary = this.compressedAirAssessment.systemProfile.profileSummary.filter(summary => { return summary.dayTypeId != this.deleteSelectedDayTypeId });
    for (let i = 0; i < this.compressedAirAssessment.modifications.length; i++) {
      this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        let dayTypeIndex: number = item.reductionData.findIndex(reductionData => { return reductionData.dayTypeId == this.deleteSelectedDayTypeId });
        item.reductionData.splice(dayTypeIndex, 1)
      })
    }
    let deleteSelectedIndex: number = this.compressedAirAssessment.compressedAirDayTypes.findIndex(dayType => { return dayType.dayTypeId == this.deleteSelectedDayTypeId })
    this.compressedAirAssessment.compressedAirDayTypes.splice(deleteSelectedIndex, 1);
    this.dayTypesFormArray = this.dayTypeService.getDayTypeFormArray(this.compressedAirAssessment.compressedAirDayTypes);

    this.compressedAirAssessment.systemInformation.trimSelections = this.compressedAirAssessment.systemInformation.trimSelections.filter(selection => {
      return selection.dayTypeId != this.deleteSelectedDayTypeId;
    });

    this.deleteSelectedDayTypeId = undefined;
    this.save();
  }

  openConfirmDeleteModal(dayTypeId: string) {
    let deleteDayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == dayTypeId });
    this.confirmDeleteDayTypeData = {
      modalTitle: 'Delete Day Type',
      confirmMessage: `Are you sure you want to delete '${deleteDayType.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedDayTypeId = dayTypeId;
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteDayType: boolean) {
    if (deleteDayType) {
      this.removeDayType();
    }
    this.showConfirmDeleteModal = false;
    this.compressedAirAssessmentService.modalOpen.next(false);
  }
}
