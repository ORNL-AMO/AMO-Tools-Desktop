import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LightingReplacementData } from '../lighting-replacement.service';

@Component({
  selector: 'app-lighting-replacement-form',
  templateUrl: './lighting-replacement-form.component.html',
  styleUrls: ['./lighting-replacement-form.component.css']
})
export class LightingReplacementFormComponent implements OnInit {
  @Input()
  data: LightingReplacementData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  index: number;

  constructor() { }

  ngOnInit() {
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  addHourPerDay() {
    this.data.hoursPerDay++;
    this.calculate();
  }
  subtractHourPerDay() {
    this.data.hoursPerDay--;
    this.calculate();
  }
  subtractDayPerMonth() {
    this.data.daysPerMonth--;
    this.calculate();
  }
  addDayPerMonth() {
    this.data.daysPerMonth++;
    this.calculate();
  }
  subtractMonthPerYear() {
    this.data.monthsPerYear--;
    this.calculate();
  }
  addMonthPerYear() {
    this.data.monthsPerYear++;
    this.calculate();
  }
}
