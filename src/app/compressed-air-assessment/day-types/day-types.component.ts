import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { createFalse } from 'typescript';
import { ConfirmDeleteData } from '../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, CompressedAirDayType } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../inventory/inventory.service';
import { DayTypeService } from './day-type.service';

@Component({
  selector: 'app-day-types',
  templateUrl: './day-types.component.html',
  styleUrls: ['./day-types.component.css']
})
export class DayTypesComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  totalAnnualDays: number;
  totalDownDays: number;

  showConfirmDeleteModal: boolean = false;

  deleteSelectedIndex: number;
  confirmDeleteDayTypeData: ConfirmDeleteData;
  form: FormGroup;
  isFormChange: boolean = false;
  hasValidDayTypes: boolean;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private dayTypeService: DayTypeService, private router: Router,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.setTotalDays();
      this.hasValidDayTypes = this.dayTypeService.hasValidDayTypes(val.compressedAirDayTypes);
      if (this.isFormChange == false) {
        this.form = this.dayTypeService.getDayTypeForm(this.compressedAirAssessment.compressedAirDayTypes);
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  openDataExplorer() {
    this.router.navigateByUrl('/log-tool');
  }

  addDayType() {
    this.compressedAirAssessment = this.inventoryService.addNewDayType(this.compressedAirAssessment, 'Day Type');
    this.form = this.dayTypeService.getDayTypeForm(this.compressedAirAssessment.compressedAirDayTypes);
    this.save();
  }

  focusField(currentField: string) { }

  save() {
    //update modification day type names on changes
    let compressedAirDaytypes: Array<CompressedAirDayType> = this.dayTypeService.getDayTypesFromForm(this.form);
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
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
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
    let dayTypeToRemove: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes[this.deleteSelectedIndex];
    this.compressedAirAssessment.systemProfile.profileSummary = this.compressedAirAssessment.systemProfile.profileSummary.filter(summary => { return summary.dayTypeId != dayTypeToRemove.dayTypeId });
    for (let i = 0; i < this.compressedAirAssessment.modifications.length; i++) {
      this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        let dayTypeIndex: number = item.reductionData.findIndex(reductionData => { return reductionData.dayTypeId == dayTypeToRemove.dayTypeId });
        item.reductionData.splice(dayTypeIndex, 1)
      })
    }
    this.compressedAirAssessment.compressedAirDayTypes.splice(this.deleteSelectedIndex, 1);
    if (this.deleteSelectedIndex > 0) {
      this.form = this.dayTypeService.removeDayTypeInput(this.form, this.deleteSelectedIndex);
    }
    this.deleteSelectedIndex = undefined;
    this.save();
  }

  openConfirmDeleteModal(index: number) {
    let deleteDayType: CompressedAirDayType = this.dayTypeService.getDayTypesFromForm(this.form)[index]
    this.confirmDeleteDayTypeData = {
      modalTitle: 'Delete Day Type',
      confirmMessage: `Are you sure you want to delete '${deleteDayType.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedIndex = index;
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
