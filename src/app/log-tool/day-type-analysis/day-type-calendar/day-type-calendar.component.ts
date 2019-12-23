import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import * as _ from 'lodash';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
@Component({
  selector: 'app-day-type-calendar',
  templateUrl: './day-type-calendar.component.html',
  styleUrls: ['./day-type-calendar.component.css']
})
export class DayTypeCalendarComponent implements OnInit {

  model: NgbDateStruct;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
  }

  getDateBackground(date: NgbDateStruct) {
    let d: Date = new Date(date.year, date.month - 1, date.day);
    let testExists = _.find(this.dayTypeAnalysisService.daySummaries, (day) => { return this.dayTypeAnalysisService.checkSameDay(d, day.day) });
    if (testExists != undefined) {
      return this.dayTypeGraphService.getDateColor(d);
    } else {
      return 'lightgray';
    }
  }

  onDateSelect(date: NgbDate) {
    console.log('click!!!');
    let d: Date = new Date(date.year, date.month - 1, date.day);
    this.dayTypeAnalysisService.toggleDateType(d);
  }
}
