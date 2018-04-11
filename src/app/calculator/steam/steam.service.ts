import { Injectable } from '@angular/core';
import { SteamPropertiesInput, SteamPropertiesOutput } from "../../shared/models/steam";
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

  constructor(private convertUnitsService: ConvertUnitsService) { }

}
