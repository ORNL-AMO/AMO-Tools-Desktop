import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { Quantity, ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';
import { HeatLossService } from '../heat-loss.service';

@Component({
  selector: 'app-heat-loss-form',
  templateUrl: './heat-loss-form.component.html',
  styleUrls: ['./heat-loss-form.component.css']
})
export class HeatLossFormComponent implements OnInit {
  @Input()
  heatLossForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  thermoOptions: Array<Quantity>;
  constructor(private steamService: SteamService, private heatLossService: HeatLossService) { }

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
    this.emitCalculate.emit(this.heatLossForm);
  }

  getOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value == this.heatLossForm.controls.thermodynamicQuantity.value });
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
    if (this.heatLossForm.controls.thermodynamicQuantity.value == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (this.heatLossForm.controls.thermodynamicQuantity.value == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (this.heatLossForm.controls.thermodynamicQuantity.value == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (this.heatLossForm.controls.thermodynamicQuantity.value == 3) {
      return displayUnit;
    }
  }

  setQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.heatLossForm.controls.thermodynamicQuantity.value);
    this.heatLossForm.controls.quantityValue.setValue(0);
    this.heatLossForm.controls.quantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.calculate();
  }
}
