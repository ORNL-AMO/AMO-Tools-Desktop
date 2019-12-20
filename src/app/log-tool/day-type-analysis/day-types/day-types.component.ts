import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-day-types',
  templateUrl: './day-types.component.html',
  styleUrls: ['./day-types.component.css']
})
export class DayTypesComponent implements OnInit {

  addNewDayType: boolean = false;
  newDayTypeName: string = "New Day Type";
  newDayTypeColor: string = "#6a28d7";
  dayTypes: Array<{ color: string, label: string }>;
  dayTypesSub: Subscription;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(val => {
      this.dayTypes = val;
    })
  }

  ngOnDestroy() {
    this.dayTypesSub.unsubscribe();
  }

  showAddNewDayType() {
    this.addNewDayType = true;
  }

  hideAddNewDayType() {
    this.addNewDayType = false;
  }

  submitNewDayType() {
    let dayTypes: Array<{ color: string, label: string, useDayType: boolean }> = this.dayTypeAnalysisService.dayTypes.getValue();
    dayTypes.push({
      color: this.newDayTypeColor,
      label: this.newDayTypeName,
      useDayType: true
    });
    this.dayTypeAnalysisService.dayTypes.next(dayTypes);
    this.hideAddNewDayType();
  }
}
