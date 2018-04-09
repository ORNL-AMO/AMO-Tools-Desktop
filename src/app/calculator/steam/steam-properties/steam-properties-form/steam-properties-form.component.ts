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

  // contains mins and maxes for all quality types, indexed into using thermodynamicQuantity
  checkQuantity = [
    {
      Imperial: {
        min: 32, max: 1472, type: 'Temperature', units: 'Fahrenheit'
      },
      Metric: {
        min: 0, max: 800, type: 'Temperature', units: 'Celsius'
      }
    },
    {
      Imperial: {
        min: 50, max: 5000, type: 'Specific Enthalpy', units: 'Btu/lb'
      },
      Metric: {
        min: 50, max: 3700, type: 'Specific Enthalpy', units: 'kJ/kg'
      }
    },
    {
      Imperial: {
        min: 0, max: 12.25, type: 'Specific Entropy', units: 'Btu/lb-F'
      },
      Metric: {
        min: 0, max: 6.52, type: 'Specific Entropy', units: 'kJ/kg/K'
      }
    },
    {
      Imperial: {
        min: 0, max: 1, type: 'Saturated Quality', units: ''
      },
      Metric: {
        min: 0, max: 1, type: 'Saturated Quality', units: ''
      }
    },
    {
      Imperial: {
        min: 0.2, max: 14503.7, type: 'Pressure', units: 'psi'
      },
      Metric: {
        min: 1, max: 100000, type: 'Pressure', units: 'kPa'
      }
    }
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
    const unit = this.settings.unitsOfMeasure;

    if (this.steamPropertiesForm.controls.pressure.invalid || input.pressure < 0.001 || input.pressure > 100) {
      const err = this.checkQuantity[4][unit].min + ' and ' + this.checkQuantity[4][unit].max + ' ' + this.checkQuantity[4][unit].units;
      this.pressureError = 'Pressure must be between ' + err;
    }

    // if (this.steamPropertiesForm.controls.quantityValue.invalid) {
    //   this.quantityValueError = 'Check your quantity value';
    // }

    const i = input.thermodynamicQuantity;

    if (input.quantityValue < this.checkQuantity[i][unit].min || input.quantityValue > this.checkQuantity[i][unit].max) {
      const err = this.checkQuantity[i][unit].min + ' and ' + this.checkQuantity[i][unit].max + ' ' + this.checkQuantity[i][unit].units;
      this.quantityValueError = this.checkQuantity[i][unit].type + ' must be between ' + err;
    }
    if (this.pressureError !== null || this.quantityValueError !== null) {
      return;
    }

    if (i === 0) { // convert temperature to Kelvin
      input.quantityValue = this.convertUnitsService.value(input.quantityValue).from(this.settings.temperatureMeasurement).to('C') + 273.15;
    }

    this.steamPropertiesOutput = SteamService.steamProperties(input);

    this.steamPropertiesOutput.pressure = this.convertUnitsService.value(this.steamPropertiesOutput.pressure).from('MPa').to(this.settings.pressureMeasurement);
    this.steamPropertiesOutput.temperature = this.convertUnitsService.value(this.steamPropertiesOutput.temperature - 273.15).from('C').to(this.settings.temperatureMeasurement);
  }

}
