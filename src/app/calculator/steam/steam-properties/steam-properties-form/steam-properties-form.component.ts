import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";
import { SteamPropertiesOutput } from "../../../../shared/models/steam/steam-outputs";

@Component({
    selector: 'app-steam-properties-form',
    templateUrl: './steam-properties-form.component.html',
    styleUrls: ['./steam-properties-form.component.css'],
    standalone: false
})
export class SteamPropertiesFormComponent implements OnInit {
  @Input()
  steamPropertiesForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<UntypedFormGroup>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  steamPropertiesOutput: SteamPropertiesOutput;
  @Output('emitQuantityChange')
  emitQuantityChange = new EventEmitter<number>();


  constructor() {
  }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setQuantityValue() {
    this.steamPropertiesForm.controls.quantityValue.setValue('');
    this.emitQuantityChange.emit(this.steamPropertiesForm.controls.thermodynamicQuantity.value);
    this.steamPropertiesOutput = {
      pressure: 0,
      temperature: 0,
      specificEnthalpy: 0,
      specificEntropy: 0,
      quality: 0,
      specificVolume: 0
    };
  }
  calculate() {
    if (this.steamPropertiesForm.status === 'INVALID') {
      this.steamPropertiesOutput = {
        pressure: 0,
        temperature: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        quality: 0,
        specificVolume: 0
      };
    }
    this.emitCalculate.emit(this.steamPropertiesForm);
  }

  getOptionDisplayUnit(quantity: number) {
    let displayUnit: string;
    if (quantity === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (quantity === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (quantity === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (quantity === 3) {
      return displayUnit;
    }
  }

}
