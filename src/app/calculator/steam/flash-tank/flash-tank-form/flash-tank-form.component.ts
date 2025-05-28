import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ThermodynamicQuantityOptions, Quantity } from '../../../../shared/models/steam/steam-inputs';
import { FormGroup, Validators } from '../../../../../../node_modules/@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
    selector: 'app-flash-tank-form',
    templateUrl: './flash-tank-form.component.html',
    styleUrls: ['./flash-tank-form.component.css'],
    standalone: false
})
export class FlashTankFormComponent implements OnInit {
  @Input()
  flashTankForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
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
    this.emitCalculate.emit(this.flashTankForm);
  }

  getOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value === this.flashTankForm.controls.thermodynamicQuantity.value; });
    return selectedQuantity.display;
  }

  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.flashTankForm.controls.thermodynamicQuantity.value === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (this.flashTankForm.controls.thermodynamicQuantity.value === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (this.flashTankForm.controls.thermodynamicQuantity.value === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (this.flashTankForm.controls.thermodynamicQuantity.value === 3) {
      return displayUnit;
    }
  }

  setQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.flashTankForm.controls.thermodynamicQuantity.value);
    this.flashTankForm.controls.quantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.flashTankForm.controls.quantityValue.updateValueAndValidity();
    this.calculate();
  }


}
