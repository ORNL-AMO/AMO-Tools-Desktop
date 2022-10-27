
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { Quantity, ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-heat-loss-form',
  templateUrl: './heat-loss-form.component.html',
  styleUrls: ['./heat-loss-form.component.css']
})
export class HeatLossFormComponent implements OnInit {
  @Input()
  heatLossForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<UntypedFormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  thermoOptions: Array<Quantity>;
  constructor(private steamService: SteamService) { }

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
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value === this.heatLossForm.controls.thermodynamicQuantity.value; });
    return selectedQuantity.display;
  }

  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.heatLossForm.controls.thermodynamicQuantity.value === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (this.heatLossForm.controls.thermodynamicQuantity.value === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (this.heatLossForm.controls.thermodynamicQuantity.value === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (this.heatLossForm.controls.thermodynamicQuantity.value === 3) {
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
