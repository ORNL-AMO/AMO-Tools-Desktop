import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Quantity, ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';
import { DeaeratorService } from '../deaerator.service';
import { SteamService } from '../../steam.service';
import { FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-deaerator-form',
  templateUrl: './deaerator-form.component.html',
  styleUrls: ['./deaerator-form.component.css']
})
export class DeaeratorFormComponent implements OnInit {
  @Input()
  deaeratorForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  thermoOptions: Array<Quantity>;
  constructor(private steamService: SteamService, private deaeratorService: DeaeratorService) { }

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
    this.emitCalculate.emit(this.deaeratorForm);
  }

  getWaterOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value == this.deaeratorForm.controls.waterThermodynamicQuantity.value });
    return selectedQuantity.display;
  }
  getSteamOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value == this.deaeratorForm.controls.steamThermodynamicQuantity.value });
    return selectedQuantity.display;
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }

  getOptionDisplayUnit(quantityVal: number) {
    let displayUnit: string;
    if (quantityVal == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (quantityVal == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (quantityVal == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (quantityVal == 3) {
      return displayUnit;
    }
  }

  setWaterQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.deaeratorForm.controls.waterThermodynamicQuantity.value);
    this.deaeratorForm.controls.waterQuantityValue.setValue(0);
    this.deaeratorForm.controls.waterQuantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.calculate();
  }

  setSteamQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.deaeratorForm.controls.steamThermodynamicQuantity.value);
    this.deaeratorForm.controls.steamQuantityValue.setValue(0);
    this.deaeratorForm.controls.steamQuantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.calculate();
  }
}

