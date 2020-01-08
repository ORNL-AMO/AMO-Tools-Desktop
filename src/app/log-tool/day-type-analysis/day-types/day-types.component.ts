import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService, DaySummary, DayType } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
@Component({
  selector: 'app-day-types',
  templateUrl: './day-types.component.html',
  styleUrls: ['./day-types.component.css']
})
export class DayTypesComponent implements OnInit {

  addNewDayType: boolean = false;
  newDayTypeName: string;
  newDayTypeColor: string;
  dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> };
  dayTypesSub: Subscription;
  daySummaries: Array<DaySummary>;
  selectedDays: Array<Date> = [];
  weekdaySelected: boolean = true;
  weekendSelected: boolean = true;
  excludedSelected: boolean = true;
  startDate: { year: number, month: number, day: number };
  numberOfMonths: number;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolDataService: LogToolDataService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(val => {
      this.dayTypes = val;
    });
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;

    this.startDate = this.dayTypeAnalysisService.calendarStartDate;
    this.numberOfMonths = this.dayTypeAnalysisService.numberOfMonths;
  }

  ngOnDestroy() {
    this.dayTypesSub.unsubscribe();
    this.dayTypeAnalysisService.displayDayTypeCalander.next(true);
  }

  showAddNewDayType() {
    this.newDayTypeName = "New Day Type";
    this.newDayTypeColor = this.getRandomColor();
    this.selectedDays = new Array();
    this.dayTypeAnalysisService.displayDayTypeCalander.next(false);
    this.addNewDayType = true;
  }

  hideAddNewDayType() {
    this.addNewDayType = false;
    this.dayTypeAnalysisService.displayDayTypeCalander.next(true);
  }

  submitNewDayType() {
    let dates: Array<Date> = new Array();
    this.selectedDays.forEach(date => {
      this.dayTypeAnalysisService.removeFromPrimary(new Date(date));
      dates.push(new Date(date));
    });
    let dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> } = this.dayTypeAnalysisService.dayTypes.getValue();
    dayTypes.addedDayTypes.push({
      color: this.newDayTypeColor,
      label: this.newDayTypeName,
      useDayType: true,
      dates: dates
    });
    this.dayTypeAnalysisService.dayTypes.next(dayTypes);
    this.hideAddNewDayType();
  }

  getDateBackground(date: NgbDate) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testExists = _.find(this.dayTypeAnalysisService.daySummaries, (daySummary) => { return this.logToolDataService.checkSameDay(d, daySummary.date) });
    if (testExists != undefined) {
      let testIsDateSelected = _.find(this.selectedDays, (selectedDay) => {
        return this.logToolDataService.checkSameDay(d, selectedDay)
      });
      if (testIsDateSelected == undefined) {
        return this.dayTypeGraphService.getDateColorFromDaySummary(testExists);
      } else {
        return this.newDayTypeColor;
      }
    } else {
      return undefined;
    }
  }

  onDateSelect(date: NgbDate) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testIsDateSelected = _.find(this.selectedDays, (selectedDay) => {
      return this.logToolDataService.checkSameDay(d, selectedDay)
    });
    if (testIsDateSelected != undefined) {
      _.remove(this.selectedDays, (selectedDay) => { return this.logToolDataService.checkSameDay(d, selectedDay) })
    } else {
      this.selectedDays.push(d);
    }
  }

  removeDayType(dayType: DayType) {
    let dayTypeIndex: number = _.findIndex(this.dayTypes.addedDayTypes, (addedDayType) => { return (dayType.color == addedDayType.color && dayType.label == addedDayType.label) });
    if (dayTypeIndex != -1) {
      this.dayTypes.addedDayTypes.splice(dayTypeIndex, 1);
      dayType.dates.forEach(date => {
        let primaryDayTypeStr: string = this.dayTypeAnalysisService.getPrimaryDayType(date);
        let primaryDayType: DayType = _.find(this.dayTypes.primaryDayTypes, (primaryDayType) => { return primaryDayType.label == primaryDayTypeStr });
        primaryDayType.dates.push(date);
      });
      this.dayTypeAnalysisService.dayTypes.next(this.dayTypes);
    }
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
