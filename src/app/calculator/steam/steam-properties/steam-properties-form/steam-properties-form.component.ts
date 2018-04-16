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
  quantityValueUnits: string = null;

  // contains mins and maxes for all quality types, indexed into using thermodynamicQuantity
  readonly checkQuantity: Array<TemperatureProperties | SpecificEnthalpyProperties | SpecificEntropyProperties | Properties> = [
    {
      'F': {
        min: 32, max: 1472, type: 'Temperature', displayUnits: 'Fahrenheit'
      },
      'C': {
        min: 0, max: 800, type: 'Temperature', displayUnits: 'Celsius'
      }
    },
    {
      'btuLb': {
        min: 21.5, max: 1590.7, type: 'Specific Enthalpy', displayUnits: 'Btu/lb'
      },
      'kJkg': {
        min: 50, max: 3700, type: 'Specific Enthalpy', displayUnits: 'kJ/kg'
      }
    },
    {
      'btulbF': {
        min: 0, max: 1.557, type: 'Specific Entropy', displayUnits: 'Btu/lb-F'
      },
      'kJkgK': {
        min: 0, max: 6.52, type: 'Specific Entropy', displayUnits: 'kJ/kg/K'
      }
    },
    {
      min: 0, max: 1, type: 'Saturated Quality', displayUnits: ''
    },
  ];

  readonly pressureCheck: PressureProperties = {
    'psi': {
      min: 0.2, max: 14503.7, displayUnits: 'psi'
    },
    'kPa': {
      min: 1, max: 100000, displayUnits: 'kPa'
    },
    'bar': {
      min: 0.01, max: 1000, displayUnits: 'Bar'
    }
  };

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.steamPropertiesOutput = {
      pressure: 0, temperature: 0, quality: 0, specificEnthalpy: 0, specificEntropy: 0, specificVolume: 0
    };
    this.quantityValueUnits = this.settings.temperatureMeasurement;
    this.calculate();
  }

  calculate() {
    this.pressureError = this.quantityValueError = null;
    const input: SteamPropertiesInput = {
      thermodynamicQuantity: this.steamPropertiesForm.controls.thermodynamicQuantity.value,
      pressure: this.steamPropertiesForm.controls.pressure.value,
      quantityValue: this.steamPropertiesForm.controls.quantityValue.value
    };

    const pressureObj = this.pressureCheck[this.settings.pressureMeasurement];
    let quantityObj = this.checkQuantity[0]['F'];

    if (input.thermodynamicQuantity === 0) {
      quantityObj = this.checkQuantity[input.thermodynamicQuantity][this.settings.temperatureMeasurement];
    } else if (input.thermodynamicQuantity === 1) {
      quantityObj = this.checkQuantity[input.thermodynamicQuantity][this.settings.specificEnthalpyMeasurement];
    } else if (input.thermodynamicQuantity === 2) {
      quantityObj = this.checkQuantity[input.thermodynamicQuantity][this.settings.specificEntropyMeasurement];
    } else {
      quantityObj = this.checkQuantity[input.thermodynamicQuantity];
    }
    this.quantityValueUnits = quantityObj.displayUnits;


    if (this.steamPropertiesForm.controls.pressure.invalid || input.pressure < pressureObj.min || input.pressure > pressureObj.max) {
      const err = pressureObj.min + ' and ' + pressureObj.max + ' ' + this.settings.pressureMeasurement;
      this.pressureError = 'Pressure must be between ' + err;
    }


    if (input.quantityValue < quantityObj.min || input.quantityValue > quantityObj.max) {
      const err = quantityObj.min + ' and ' + quantityObj.max + ' ' + quantityObj.displayUnits;
      this.quantityValueError = quantityObj.type + ' must be between ' + err;
    }
    if (this.pressureError !== null || this.quantityValueError !== null) {
      return;
    }

    this.steamPropertiesOutput = this.steamService.steamProperties(input, this.settings);
  }

}

interface Properties {
  min: number;
  max: number;
  displayUnits: string;
  type?: string;
}

interface TemperatureProperties {
  F: Properties;
  C: Properties;
}

interface SpecificEnthalpyProperties {
  btuLb: Properties;
  kJkg: Properties;
}

interface SpecificEntropyProperties {
  btulbF: Properties;
  kJkgK: Properties;
}

interface PressureProperties {
  psi: Properties;
  kPa: Properties;
  bar: Properties;
}
