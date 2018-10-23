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
  @Output('emitFocusField')
  emitFocusField = new EventEmitter<string>();


  monthsPerYearError: string = null;
  daysPerMonthError: string = null;
  hoursPerDayError: string = null;
  wattsPerLampError: string = null;
  lumensPerLampError: string = null;
  lampsPerFixtureError: string = null;
  numberOfFixturesError: string = null;
  constructor() { }

  ngOnInit() {
    this.checkWarnings();
  }

  calculate() {
    this.checkWarnings();
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

  focusField(str: string){
    this.emitFocusField.emit(str);
  }

  checkWarnings(){
    if(this.data.hoursPerDay > 24){
      this.hoursPerDayError = "Hours per day can't exceed 24";
    }else if(this.data.hoursPerDay < 0){
      this.hoursPerDayError = "Hours per day must be positive";
    }else{
      this.hoursPerDayError = null;
    }

    if(this.data.daysPerMonth > 31){
      this.daysPerMonthError = "Days per month can't exceed 31";
    }else if(this.data.daysPerMonth < 0){
      this.daysPerMonthError = "Days per month must be positive";
    }else{
      this.daysPerMonthError = null;
    }

    if(this.data.monthsPerYear > 12){
      this.monthsPerYearError = "Months per year can't exceed 12";
    }else if(this.data.monthsPerYear < 0){
      this.monthsPerYearError = "Months per year must be positive";
    }else{
      this.monthsPerYearError = null;
    }

    if(this.data.wattsPerLamp < 0){
      this.wattsPerLampError = "Watts per lamp must be positive";
    }else{
      this.wattsPerLampError = null;
    }

    if(this.data.lumensPerLamp < 0){
      this.lumensPerLampError = "Lumens per lamp must be positive";
    }else{
      this.lumensPerLampError = null;
    }
    if(this.data.lampsPerFixture < 0){
      this.lampsPerFixtureError = "Lamps per fixture must be positive";
    }else{
      this.lampsPerFixtureError = null;
    }
    if(this.data.numberOfFixtures < 0){
      this.numberOfFixturesError = "Number of fixtures must be positive";
    }else{
      this.numberOfFixturesError = null;
    }
  }
}
