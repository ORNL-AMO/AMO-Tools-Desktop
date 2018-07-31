import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";
import { SaturatedPropertiesInput, SaturatedPropertiesOutput } from "../../../../shared/models/steam";
import { ConvertUnitsService } from "../../../../shared/convert-units/convert-units.service";
import { SteamService } from "../../steam.service";

@Component({
  selector: 'app-saturated-properties-form',
  templateUrl: './saturated-properties-form.component.html',
  styleUrls: ['./saturated-properties-form.component.css']
})
export class SaturatedPropertiesFormComponent implements OnInit {
  @Input()
  saturatedPropertiesForm: FormGroup;
  @Input()
  settings: Settings;
  @Output()
  emitCalculate = new EventEmitter<FormGroup>();
  @Input()
  output: SaturatedPropertiesOutput;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  constructor(private steamService: SteamService) { }

  ngOnInit() {
    this.setValidators();
  }

  setValidators(){
    let ranges: {minTemp: number, maxTemp: number, minPressure: number, maxPressure: number } = this.getRanges();
    if(this.saturatedPropertiesForm.controls.pressureOrTemperature.value == 0){
      this.saturatedPropertiesForm.controls.saturatedPressure.setValidators([Validators.required, Validators.min(ranges.minPressure), Validators.max(ranges.maxPressure)]);
      this.saturatedPropertiesForm.controls.saturatedTemperature.clearValidators()
      this.saturatedPropertiesForm.controls.saturatedTemperature.reset();
    }else if(this.saturatedPropertiesForm.controls.pressureOrTemperature.value == 1){
      this.saturatedPropertiesForm.controls.saturatedTemperature.setValidators([Validators.required, Validators.min(ranges.minTemp), Validators.max(ranges.maxTemp)]);
      this.saturatedPropertiesForm.controls.saturatedPressure.clearValidators()
      this.saturatedPropertiesForm.controls.saturatedPressure.reset();
    }
    this.calculate();
  }

  calculate() {
    if(this.saturatedPropertiesForm.status == 'INVALID'){
      this.output = {
        saturatedPressure: 0,
        saturatedTemperature: 0,
        liquidEnthalpy: 0,
        gasEnthalpy: 0,
        evaporationEnthalpy: 0,
        liquidEntropy: 0,
        gasEntropy: 0,
        evaporationEntropy: 0,
        liquidVolume: 0,
        gasVolume: 0,
        evaporationVolume: 0
      }
    }
    this.emitCalculate.emit(this.saturatedPropertiesForm);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }

  getDisplayUnit(unit: string) {
    return this.steamService.getDisplayUnit(unit);
  }


  getRanges(): { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number } {
    let minTemp: number, maxTemp: number, minPressure: number, maxPressure: number;
    if (this.settings.steamTemperatureMeasurement == 'F') {
      minTemp = 32;
      maxTemp = 705.1;
    } else {
      minTemp = 0;
      maxTemp = 373.9;
    }

    if (this.settings.steamPressureMeasurement == 'psi') {
      minPressure = 0.2;
      maxPressure = 3200.1;
    } else if (this.settings.steamPressureMeasurement == 'kPa') {
      minPressure = 1;
      maxPressure = 22064;
    } else if (this.settings.steamPressureMeasurement == 'bar') {
      minPressure = 0.01;
      maxPressure = 220.64;
    }
    return { minTemp: minTemp, maxTemp: maxTemp, minPressure: minPressure, maxPressure: maxPressure }
  }

}