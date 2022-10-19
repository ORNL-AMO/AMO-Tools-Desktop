import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ThermodynamicQuantityOptions, Quantity } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-feedwater-form',
  templateUrl: './feedwater-form.component.html',
  styleUrls: ['./feedwater-form.component.css']
})
export class FeedwaterFormComponent implements OnInit {
  @Input()
  feedwaterForm: UntypedFormGroup;
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
    this.emitCalculate.emit(this.feedwaterForm);
  }

  getOptionDisplay(): string {
    let selectedQuantity: Quantity = this.thermoOptions.find((option) => { return option.value === this.feedwaterForm.controls.feedwaterThermodynamicQuantity.value; });
    return selectedQuantity.display;
  }


  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.feedwaterForm.controls.feedwaterThermodynamicQuantity.value === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (this.feedwaterForm.controls.feedwaterThermodynamicQuantity.value === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (this.feedwaterForm.controls.feedwaterThermodynamicQuantity.value === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (this.feedwaterForm.controls.feedwaterThermodynamicQuantity.value === 3) {
      return displayUnit;
    }
  }

  setQuantityRanges() {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, this.feedwaterForm.controls.feedwaterThermodynamicQuantity.value);
    this.feedwaterForm.controls.feedwaterQuantityValue.setValue(0);
    this.feedwaterForm.controls.feedwaterQuantityValue.setValidators([Validators.required, Validators.min(quantityMinMax.min), Validators.max(quantityMinMax.max)]);
    this.calculate();
  }
}
