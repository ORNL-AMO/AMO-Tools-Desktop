import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LightingReplacementData } from '../../../../shared/models/lighting';

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


  hoursPerYearError: string = null;
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

  focusField(str: string){
    this.emitFocusField.emit(str);
  }

  checkWarnings(){
    if(this.data.hoursPerYear > 8760){
      this.hoursPerYearError = "Hours per year cannot exceed ";
    }else if(this.data.hoursPerYear < 0){
      this.hoursPerYearError = "Hours per day must be positive";
    }else{
      this.hoursPerYearError = null;
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
