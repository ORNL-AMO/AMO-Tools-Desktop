import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";
import { SteamPropertiesInput, SteamPropertiesOutput } from "../../../../shared/models/steam";
import { SteamService } from "../../steam.service";
import { ConvertUnitsService } from "../../../../shared/convert-units/convert-units.service";

@Component({
  selector: 'app-steam-properties-form',
  templateUrl: './steam-properties-form.component.html',
  styleUrls: ['./steam-properties-form.component.css']
})
export class SteamPropertiesFormComponent implements OnInit {
  @Input()
  steamPropertiesForm: FormGroup;
  @Input()
  settings: Settings;

  steamPropertiesOutput: SteamPropertiesOutput;

  pressureError: string = null;
  quantityValueError: string = null;
  thermodynamicQuantity: number;

  // contains mins and maxes for all quality types and units that the C++ expects, indexed on thermodynamicQuantity
  checkQuantity = [
    { min: 273.2, max: 1073.1, type: 'Temperature', units: 'Kelvin' },
    { min: 50, max: 3700, type: 'Specific Enthalpy', units: 'kJ/kg' }, // specific energy
    { min: 0, max: 6.52, type: 'Specific Entropy', units: 'kJ/kg/K' }, // specific heat
    { min: 0, max: 1, type: 'Saturated Quality', units: '' }
  ];

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.steamPropertiesOutput = {
      pressure: 0, temperature: 0, quality: 0, specificEnthalpy: 0, specificEntropy: 0, specificVolume: 0
    };
    this.calculate();
  }

  calculate() {
    this.pressureError = this.quantityValueError = null;
    const input: SteamPropertiesInput = {
      thermodynamicQuantity: this.steamPropertiesForm.controls.thermodynamicQuantity.value,
      pressure: this.convertUnitsService.value(this.steamPropertiesForm.controls.pressure.value).from(this.settings.pressureMeasurement).to('MPa'),
      quantityValue: this.steamPropertiesForm.controls.quantityValue.value
    };
    this.thermodynamicQuantity = input.thermodynamicQuantity;

    if (this.steamPropertiesForm.controls.pressure.invalid || input.pressure < 0.001 || input.pressure > 100) {
      this.pressureError = 'Pressure must be between 0.001 and 100 MPa';
    }
    if (this.steamPropertiesForm.controls.quantityValue.invalid) {
      this.quantityValueError = 'Check your quantity value';
    }
    const i = input.thermodynamicQuantity;
    if (input.quantityValue < this.checkQuantity[i].min || input.quantityValue > this.checkQuantity[i].max) {
      const err = this.checkQuantity[i].min + ' and ' + this.checkQuantity[i].max + ' ' + this.checkQuantity[i].units;
      this.quantityValueError = 'Check your quantity value, ' + this.checkQuantity[i].type + ' must be between ' + err;
    }
    if (this.pressureError !== null || this.quantityValueError !== null) {
      return;
    }

    this.steamPropertiesOutput = SteamService.steamProperties(input);
  }

}
