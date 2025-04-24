import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { DayType } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
@Component({
    selector: 'app-day-types',
    templateUrl: './day-types.component.html',
    styleUrls: ['./day-types.component.css'],
    standalone: false
})
export class DayTypesComponent implements OnInit {

  addNewDayType: boolean = false;
  newDayTypeName: string;
  newDayTypeColor: string;
  dayTypes: Array<DayType>;
  dayTypesSub: Subscription;
  selectedDays: Array<Date> = [];
  weekdaySelected: boolean = true;
  weekendSelected: boolean = true;
  excludedSelected: boolean = true;
  startDate: { year: number, month: number, day: number };
  numberOfMonths: number;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolDataService: LogToolDataService, 
    private dayTypeGraphService: DayTypeGraphService, private logToolDbService: LogToolDbService) { }

  ngOnInit() {
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(val => {
      this.dayTypes = val;
    });
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
    this.dayTypeAnalysisService.addNewDayTypes(this.selectedDays, this.newDayTypeColor, this.newDayTypeName);
    this.dayTypeAnalysisService.setDayTypeSummaries();
    this.dayTypeGraphService.updateIndividualDayScatterPlotDataColors();
    this.dayTypeGraphService.setDayTypeScatterPlotData();
    this.hideAddNewDayType();
  }

  getDateBackground(date: NgbDate) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testDateExists = _.find(this.logToolDataService.logToolDays, (logToolDay) => { return this.logToolDataService.checkSameDay(d, logToolDay.date) });
    if (testDateExists != undefined) {
      let testIsDateSelected = _.find(this.selectedDays, (selectedDay) => {
        return this.logToolDataService.checkSameDay(d, selectedDay)
      });
      if (testIsDateSelected == undefined) {
        return this.dayTypeGraphService.getDateColorFromDay(testDateExists);
      } else {
        return this.newDayTypeColor;
      }
    } else {
      return 'lightgray';
    }
  }

  onDateSelect(date: NgbDate) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testDateExists = _.find(this.logToolDataService.logToolDays, (logToolDay) => { return this.logToolDataService.checkSameDay(d, logToolDay.date) });
    if (testDateExists) {
      let testIsDateSelected = _.find(this.selectedDays, (selectedDay) => {
        return this.logToolDataService.checkSameDay(d, selectedDay)
      });
      if (testIsDateSelected != undefined) {
        _.remove(this.selectedDays, (selectedDay) => { return this.logToolDataService.checkSameDay(d, selectedDay) })
      } else {
        this.selectedDays.push(d);
      }
    }
  }

  removeDayType(dayType: DayType) {
    if (dayType.label != 'Excluded') {
      this.dayTypeAnalysisService.removeDayType(dayType);
      dayType.logToolDays.forEach(day => {
        this.dayTypeAnalysisService.toggleDateType(day.date);
      });
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.dayTypeGraphService.updateIndividualDayScatterPlotDataColors();
      this.dayTypeGraphService.setDayTypeScatterPlotData();
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

  resetDayTypes() {
    this.dayTypeAnalysisService.initDayTypes();
    this.dayTypeGraphService.updateIndividualDayScatterPlotDataColors();
    this.dayTypeGraphService.setDayTypeScatterPlotData();
  }
}
