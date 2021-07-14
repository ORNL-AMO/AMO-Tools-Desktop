import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

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

  }

  addDayType() {
    this.compressedAirAssessment.compressedAirDayTypes.push({
      dayTypeId: Math.random().toString(36).substr(2, 9),
      name: 'Day Type',
      numberOfDays: 0
    });
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

  removeDayType(index: number){
    this.compressedAirAssessment.compressedAirDayTypes.splice(index, 1);
    this.save();
  }
}
