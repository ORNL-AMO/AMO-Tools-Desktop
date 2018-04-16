import { Injectable } from '@angular/core';
import {SaturatedPropertiesInput, SaturatedPropertiesOutput, SteamPropertiesInput, SteamPropertiesOutput} from "../../shared/models/steam";
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";

declare var steamAddon: any;

@Injectable()
export class SteamService {

  convertSteamPropertiesQuantityValue(steamPropertiesInput: SteamPropertiesInput, settings: Settings, forInput: boolean, output?: SteamPropertiesOutput) {
    if (forInput === true) {
      if (steamPropertiesInput.thermodynamicQuantity === 0) { // convert temperature to kelvin
        return this.convertUnitsService.value(steamPropertiesInput.quantityValue).from(settings.temperatureMeasurement).to('C') + 273.15;
      } else if (steamPropertiesInput.thermodynamicQuantity === 1) { // convert specific Enthalpy
        return this.convertUnitsService.value(steamPropertiesInput.quantityValue).from(settings.specificEnthalpyMeasurement).to('kJkg');
      } else if (steamPropertiesInput.thermodynamicQuantity === 2) {
        return this.convertUnitsService.value(steamPropertiesInput.quantityValue).from(settings.specificEntropyMeasurement).to('kJkgK');
      } else {
        return steamPropertiesInput.quantityValue;
      }
    } else {
      if (steamPropertiesInput.thermodynamicQuantity === 0) { // convert temperature back to original user-chosen unit
        output.temperature = this.convertUnitsService.value(steamPropertiesInput.quantityValue - 273.15).from('C').to(settings.temperatureMeasurement);
      } else if (steamPropertiesInput.thermodynamicQuantity === 1) { // convert specific Enthalpy
        output.specificEnthalpy = this.convertUnitsService.value(steamPropertiesInput.quantityValue).from('kJkg').to(settings.specificEnthalpyMeasurement);
      } else if (steamPropertiesInput.thermodynamicQuantity === 2) {
        output.specificEntropy = this.convertUnitsService.value(steamPropertiesInput.quantityValue).from('kJkgK').to(settings.specificEntropyMeasurement);
      }
    }
  }

  steamProperties(steamPropertiesInput: SteamPropertiesInput, settings: Settings): SteamPropertiesOutput {
    let input = steamPropertiesInput;
    input.pressure = this.convertUnitsService.value(input.pressure).from(settings.pressureMeasurement).to('MPa');
    input.quantityValue = this.convertSteamPropertiesQuantityValue(input, settings, true);

    let output = steamAddon.steamProperties(steamPropertiesInput);
    output.pressure = this.convertUnitsService.value(output.pressure).from('MPa').to(settings.pressureMeasurement);
    this.convertSteamPropertiesQuantityValue(input, settings, false, output);
    return output;
  }

  saturatedProperties(saturatedPropertiesInput: SaturatedPropertiesInput, pressureOrTemperature: number, settings: Settings): SaturatedPropertiesOutput {
    let input = saturatedPropertiesInput;
    let output: SaturatedPropertiesOutput;

    if (pressureOrTemperature === 0) {
      input.saturatedPressure = this.convertUnitsService.value(input.saturatedPressure).from(settings.pressureMeasurement).to('MPa');
      output = steamAddon.saturatedPropertiesGivenPressure(input);
    } else {
      input.saturatedTemperature = this.convertUnitsService.value(input.saturatedTemperature).from(settings.temperatureMeasurement).to('C') + 273.15;
      output = steamAddon.saturatedPropertiesGivenTemperature(input);
    }

    // TODO may need to do both of these conversions in both cases
    if (pressureOrTemperature === 0) {
      output.saturatedPressure = this.convertUnitsService.value(output.saturatedPressure).from('MPa').to(settings.pressureMeasurement);
    } else {
      output.saturatedTemperature = this.convertUnitsService.value(output.saturatedTemperature - 273.15).from('C').to(settings.temperatureMeasurement);
    }

    return output;
  }

  constructor(private convertUnitsService: ConvertUnitsService) { }

}
