import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ThermodynamicQuantityOptions, Quantity } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-inlet-form',
    templateUrl: './inlet-form.component.html',
    styleUrls: ['./inlet-form.component.css'],
    standalone: false
})
export class InletFormComponent implements OnInit {
  @Input()
  inletForm: UntypedFormGroup;
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
    this.emitCalculate.emit(this.inletForm);
  }

  getOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value === this.inletForm.controls.thermodynamicQuantity.value; });
    return selectedQuantity.display;
  }

  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.inletForm.controls.thermodynamicQuantity.value === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (this.inletForm.controls.thermodynamicQuantity.value === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (this.inletForm.controls.thermodynamicQuantity.value === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (this.inletForm.controls.thermodynamicQuantity.value === 3) {
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
