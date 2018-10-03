import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";
import { SaturatedPropertiesOutput } from "../../../../shared/models/steam/steam-outputs";
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
  @Input()
  ranges: { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number };


  constructor(private steamService: SteamService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setValidators();
  }

  setValidators(){
    if(this.saturatedPropertiesForm.controls.pressureOrTemperature.value == 0){
      this.saturatedPropertiesForm.controls.saturatedPressure.setValidators([Validators.required, Validators.min(this.ranges.minPressure), Validators.max(this.ranges.maxPressure)]);
      this.saturatedPropertiesForm.controls.saturatedTemperature.clearValidators()
      this.saturatedPropertiesForm.controls.saturatedTemperature.reset(this.saturatedPropertiesForm.controls.saturatedTemperature.value);
    }else if(this.saturatedPropertiesForm.controls.pressureOrTemperature.value == 1){
      this.saturatedPropertiesForm.controls.saturatedTemperature.setValidators([Validators.required, Validators.min(this.ranges.minTemp), Validators.max(this.ranges.maxTemp)]);
      this.saturatedPropertiesForm.controls.saturatedPressure.clearValidators()
      this.saturatedPropertiesForm.controls.saturatedPressure.reset(this.saturatedPropertiesForm.controls.saturatedPressure.value);
    }
    this.cd.detectChanges();
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
}