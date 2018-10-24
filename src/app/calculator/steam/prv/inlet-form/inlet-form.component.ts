import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ThermodynamicQuantityOptions, Quantity } from '../../../../shared/models/steam/steam-inputs';
import { PrvService } from '../prv.service';
import { SteamService } from '../../steam.service';
import { FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-inlet-form',
  templateUrl: './inlet-form.component.html',
  styleUrls: ['./inlet-form.component.css']
})
export class InletFormComponent implements OnInit {
  @Input()
  inletForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  thermoOptions: Array<Quantity>;
  constructor(private steamService: SteamService, private prvService: PrvService) { }

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
    this.emitCalculate.emit(this.inletForm);
  }

  getOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value == this.inletForm.controls.thermodynamicQuantity.value });
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
    if (this.inletForm.controls.thermodynamicQuantity.value == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (this.inletForm.controls.thermodynamicQuantity.value == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (this.inletForm.controls.thermodynamicQuantity.value == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (this.inletForm.controls.thermodynamicQuantity.value == 3) {
      return displayUnit;
    }
  }

  setQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.inletForm.controls.thermodynamicQuantity.value);
    this.inletForm.controls.quantityValue.setValue(0);
    this.inletForm.controls.quantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.calculate();
  }

}
