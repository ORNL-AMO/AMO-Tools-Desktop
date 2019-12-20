import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-day-type-calendar',
  templateUrl: './day-type-calendar.component.html',
  styleUrls: ['./day-type-calendar.component.css']
})
export class DayTypeCalendarComponent implements OnInit {

  model: NgbDateStruct;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
  }

  getDateBackground(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    let testExists = _.find(this.dayTypeAnalysisService.daySummaries, (day) => { return this.dayTypeAnalysisService.checkSameDay(d, day.day) });
    if (testExists != undefined) {
      if (d.getDay() === 0 || d.getDay() === 6) {
        return 'blue';
      } else {
        return 'green'
      }
    } else {
      return 'lightgray';
    }
  }
}
