import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { Quantity, ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';
import { BoilerService } from '../boiler.service';

@Component({
  selector: 'app-boiler-form',
  templateUrl: './boiler-form.component.html',
  styleUrls: ['./boiler-form.component.css']
})
export class BoilerFormComponent implements OnInit {
  @Input()
  boilerForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  thermoOptions: Array<Quantity>;
  constructor(private steamService: SteamService, private boilerService: BoilerService) { }

  ngOnInit() {
    this.thermoOptions = ThermodynamicQuantityOptions;
  }

  focusOut() {
    this.emitChangeField.emit('default');
  }
  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.emitCalculate.emit(this.boilerForm);
  }

  getOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value == this.boilerForm.controls.thermodynamicQuantity.value });
    return selectedQuantity.display;
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }

  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.boilerForm.controls.thermodynamicQuantity.value == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (this.boilerForm.controls.thermodynamicQuantity.value == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (this.boilerForm.controls.thermodynamicQuantity.value == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (this.boilerForm.controls.thermodynamicQuantity.value == 3) {
      return displayUnit;
    }
  }

  setQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.boilerForm.controls.thermodynamicQuantity.value);
    this.boilerForm.controls.quantityValue.setValue(0);
    this.boilerForm.controls.quantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.calculate();
  }
}
