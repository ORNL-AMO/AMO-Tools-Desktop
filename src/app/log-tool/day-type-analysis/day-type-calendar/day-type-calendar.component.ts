import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import * as _ from 'lodash';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { LogToolDataService } from '../../log-tool-data.service';
@Component({
    selector: 'app-day-type-calendar',
    templateUrl: './day-type-calendar.component.html',
    styleUrls: ['./day-type-calendar.component.css'],
    standalone: false
})
export class DayTypeCalendarComponent implements OnInit {

  model: NgbDateStruct;
  startDate: { year: number, month: number, day: number };
  numberOfMonths: number;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService, private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.startDate = this.dayTypeAnalysisService.calendarStartDate;
    this.numberOfMonths = this.dayTypeAnalysisService.numberOfMonths;
  }

  getDateBackground(date: NgbDateStruct) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testDateExists = _.find(this.logToolDataService.logToolDays, (logToolDay) => { return this.logToolDataService.checkSameDay(d, logToolDay.date) });
    if (testDateExists != undefined) {
      return this.dayTypeGraphService.getDateColorFromDay(testDateExists);
    } else {
      return 'lightgray';
    }
  }

  onDateSelect(date: NgbDate) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testDateExists = _.find(this.logToolDataService.logToolDays, (logToolDay) => { return this.logToolDataService.checkSameDay(d, logToolDay.date) });
    if (testDateExists != undefined) {
      let d: Date = new Date(date.year, date.month - 1, date.day);
      this.dayTypeAnalysisService.toggleDateType(d);
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.dayTypeGraphService.updateIndividualDayScatterPlotDataColors();
      this.dayTypeGraphService.setDayTypeScatterPlotData();
    }
  }
}
