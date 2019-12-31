import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DayTypeAnalysisService, DaySummary } from '../day-type-analysis.service';
import * as _ from 'lodash';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { LogToolService } from '../../log-tool.service';
@Component({
  selector: 'app-day-type-calendar',
  templateUrl: './day-type-calendar.component.html',
  styleUrls: ['./day-type-calendar.component.css']
})
export class DayTypeCalendarComponent implements OnInit {

  model: NgbDateStruct;
  startDate: { year: number, month: number, day: number };
  numberOfMonths: number;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService, private logToolService: LogToolService) { }

  ngOnInit() {
    this.startDate = {
      year: this.logToolService.startDate.getFullYear(),
      month: this.logToolService.startDate.getMonth() + 1,
      day: this.logToolService.startDate.getDate()
    };
    this.findNumberOfMonths();
  }

  getDateBackground(date: NgbDateStruct) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testExists = _.find(this.dayTypeAnalysisService.daySummaries, (daySummary) => { return this.dayTypeAnalysisService.checkSameDay(d, daySummary.date) });
    if (testExists != undefined) {
      let daySummary: DaySummary = _.find(this.dayTypeAnalysisService.daySummaries, (daySummary) => { return this.dayTypeAnalysisService.checkSameDay(d, daySummary.date) });
      return this.dayTypeGraphService.getDateColor(daySummary);
    } else {
      return 'lightgray';
    }
  }

  onDateSelect(date: NgbDate) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    this.dayTypeAnalysisService.toggleDateType(d);
  }

  findNumberOfMonths() {
    let startMonth: number = this.logToolService.startDate.getMonth();
    let endMonth: number = this.logToolService.endDate.getMonth();
    this.numberOfMonths = endMonth - startMonth + 1;
  }
}
