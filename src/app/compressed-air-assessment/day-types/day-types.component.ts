import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private router: Router,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.setTotalDays();
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

  save() {
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

  removeDayType(index: number) {
    let dayTypeToRemove: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes[index];
    this.compressedAirAssessment.systemProfile.profileSummary = this.compressedAirAssessment.systemProfile.profileSummary.filter(summary => { return summary.dayTypeId != dayTypeToRemove.dayTypeId });
    this.compressedAirAssessment.compressedAirDayTypes.splice(index, 1);
    this.save();
  }
}
