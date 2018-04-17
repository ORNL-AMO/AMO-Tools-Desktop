import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";
import { SaturatedPropertiesInput, SaturatedPropertiesOutput } from "../../../../shared/models/steam";
import { ConvertUnitsService } from "../../../../shared/convert-units/convert-units.service";
import { SteamService } from "../../steam.service";

@Component({
  selector: 'app-saturated-properties-form',
  templateUrl: './saturated-properties-form.component.html',
  styleUrls: ['./saturated-properties-form.component.css']
})
export class SaturatedPropertiesFormComponent implements OnInit {
  @Input()
  saturatedPropertiesForm: FormGroup;
  @Input()
  settings: Settings;

  readonly pressureCheck: PressureProperties = {
    'psi': {
      min: 0.2, max: 3200.1, displayUnits: 'psi'
    },
    'kPa': {
      min: 1, max: 22064, displayUnits: 'kPa'
    },
    'bar': {
      min: 0.01, max: 220.64, displayUnits: 'Bar'
    }
  };

  readonly temperatureCheck: TemperatureProperties = {
    'F': {
      min: 32, max: 705.1, displayUnits: 'Degrees F'
    },
    'C': {
      min: 0, max: 373.9, displayUnits: 'Degrees C'
    }
  };

  temperatureError: string = null;
  pressureError: string = null;

  input: SaturatedPropertiesInput;
  output: SaturatedPropertiesOutput;

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.input = {
      saturatedPressure: 0
    };
    this.output = {
      saturatedPressure: 0,
      saturatedTemperature: 0,
      liquidEnthalpy: 0,
      gasEnthalpy: 0,
      evaporationEnthalpy: 0,
      liquidEntropy: 0,
      gasEntropy: 0,
      evaporationEntropy: 0,
      liquidVolume: 0,
      gasVolume: 0,
      evaporationVolume: 0
    };
    this.calculate();
  }

  calculate() {
    this.temperatureError = this.pressureError = null;

    if (this.saturatedPropertiesForm.controls.pressureOrTemperature.value === 0) {
      const pressure = this.saturatedPropertiesForm.controls.saturatedPressure.value;
      const properties = this.pressureCheck[this.settings.pressureMeasurement];
      if (pressure < properties.min || pressure > properties.max) {
        this.pressureError = 'Pressure must be between ' + properties.min + ' and ' + properties.max + ' ' + properties.displayUnits;
        return;
      }
      this.input.saturatedPressure = pressure;
    } else {
      const temperature = this.saturatedPropertiesForm.controls.saturatedTemperature.value;
      const properties = this.temperatureCheck[this.settings.temperatureMeasurement];
      if (temperature < properties.min || temperature > properties.max) {
        this.temperatureError = 'Temperature must be between ' + properties.min + ' and ' + properties.max + ' ' + properties.displayUnits;
        return;
      }
      this.input.saturatedTemperature = temperature;
    }
    // pressure min 0.001 max 22.064 MPa
    // temp min 273.2 max 657 K
    this.output = this.steamService.saturatedProperties(this.input, this.saturatedPropertiesForm.controls.pressureOrTemperature.value, this.settings);
    console.log(this.output);

    return 0;
  }

}


interface Properties {
  readonly min: number;
  readonly max: number;
  readonly displayUnits: string;
  readonly type?: string;
}

interface TemperatureProperties {
  readonly F: Properties;
  readonly C: Properties;
}

interface PressureProperties {
  readonly psi: Properties;
  readonly kPa: Properties;
  readonly bar: Properties;
}
