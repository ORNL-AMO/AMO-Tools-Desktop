import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { createFalse } from 'typescript';
import { ConfirmDeleteData } from '../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, CompressedAirDayType } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../inventory/inventory.service';

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
  // invalidDayTypeIndex: number;
  hasValidDayTypes: boolean;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private router: Router,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.setTotalDays();
      this.hasValidDayTypes = this.inventoryService.hasValidDayTypes();
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
    this.save();
  }

  // checkValidDays(index?: number) {
  //   let summedTotalDays = this.compressedAirAssessment.compressedAirDayTypes.map(dayType => dayType.numberOfDays).reduce((yearDays, currentDayCount) => {
  //     return yearDays + currentDayCount;
  //   });
  //   if (summedTotalDays > 365) {
  //     this.invalidDayTypeIndex = index;
  //     this.invalidDayTypes = true;
  //   } else {
  //     this.invalidDayTypeIndex = undefined;
  //     this.invalidDayTypes = false;
  //   }
  //   console.log('exceeds max days index', this.invalidDayTypeIndex);
  //   debugger;
  //   // this.save();
  // }

  save() {
    //update modification day type names on changes
    this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      for (let i = 0; i < this.compressedAirAssessment.modifications.length; i++) {
        let dayTypeIndex: number = this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.reductionData.findIndex(reductionData => { return reductionData.dayTypeId == dayType.dayTypeId });
        this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.reductionData[dayTypeIndex].dayTypeName = dayType.name;
      }
    })
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
      let dayTypeIndex: number = this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.reductionData.findIndex(reductionData => { return reductionData.dayTypeId == dayTypeToRemove.dayTypeId });
      this.compressedAirAssessment.modifications[i].improveEndUseEfficiency.reductionData.splice(dayTypeIndex, 1)
    }
    this.compressedAirAssessment.compressedAirDayTypes.splice(this.deleteSelectedIndex, 1);
    this.deleteSelectedIndex = undefined;
    this.save();
  }

  openConfirmDeleteModal(index: number) {
    this.confirmDeleteDayTypeData = {
      modalTitle: 'Delete Day Type',
      confirmMessage: `Are you sure you want to delete '${this.compressedAirAssessment.compressedAirDayTypes[index].name}'?`
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
