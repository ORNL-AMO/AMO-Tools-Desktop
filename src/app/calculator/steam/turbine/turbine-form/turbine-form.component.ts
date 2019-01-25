import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '../../../../../../node_modules/@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { Quantity, ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-turbine-form',
  templateUrl: './turbine-form.component.html',
  styleUrls: ['./turbine-form.component.css']
})
export class TurbineFormComponent implements OnInit {
  @Input()
  turbineForm: FormGroup;
  @Input()
  settings: Settings
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  thermoOptions: Array<Quantity>;
  methodOptions: Array<{ value: number, display: string }> = [
    {
      value: 0,
      display: 'Outlet Properties'
    }, {
      value: 1,
      display: 'Isentropic Efficiency'
    }
  ];
  turbineOptions: Array<{ value: number, display: string }> = [
    {
      value: 0,
      display: 'Mass Flow'
    }, {
      value: 1,
      display: 'Power Out'
    }
  ];


  constructor(private steamService: SteamService) { }

  ngOnInit() {
    console.log(this.settings.steamPressureMeasurement);
    this.thermoOptions = ThermodynamicQuantityOptions;
    this.setValidators();
  }

  focusOut() {
    this.emitChangeField.emit('default');
  }
  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.emitCalculate.emit(this.turbineForm);
  }

  getOptionDisplay(quantityNum: number): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value == quantityNum });
    return selectedQuantity.display;
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }

  getOptionDisplayUnit(quantity: number) {
    let displayUnit: string;
    if (quantity == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (quantity == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (quantity == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (quantity == 3) {
      return displayUnit;
    }
  }

  setValidators() {
    let inletQuantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.turbineForm.controls.inletQuantity.value);
    let outletQuantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.turbineForm.controls.outletQuantity.value);
    this.turbineForm.controls.inletQuantityValue.setValidators([Validators.required, Validators.min(inletQuantityMinMax.min), Validators.max(inletQuantityMinMax.max)]);
    if (this.turbineForm.controls.solveFor.value == 1) {
      this.turbineForm.controls.outletQuantityValue.setValidators([Validators.required, Validators.min(outletQuantityMinMax.min), Validators.max(outletQuantityMinMax.max)]);
      this.turbineForm.controls.isentropicEfficiency.clearValidators();
      this.turbineForm.controls.isentropicEfficiency.reset(this.turbineForm.controls.isentropicEfficiency.value);
    } else {
      this.turbineForm.controls.outletQuantityValue.clearValidators();
      this.turbineForm.controls.outletQuantityValue.reset(this.turbineForm.controls.outletQuantityValue.value);
      this.turbineForm.controls.isentropicEfficiency.setValidators([Validators.required, Validators.min(20), Validators.max(100)])
    }
    if (!this.turbineForm.controls.inletQuantityValue.value) {
      this.turbineForm.controls.inletQuantityValue.setValue(0);
    }
    if(!this.turbineForm.controls.outletQuantityValue.value){
      this.turbineForm.controls.outletQuantityValue.setValue(0);
    }

    this.calculate();
  }
}
