import { Injectable } from '@angular/core';
import { SaturatedPropertiesInput,  SteamPropertiesInput, BoilerInput,  DeaeratorInput,  FlashTankInput, HeaderInput, HeatLossInput, TurbineInput, PrvInput } from "../../shared/models/steam/steam-inputs";
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";
import { BoilerOutput, SaturatedPropertiesOutput, SteamPropertiesOutput, DeaeratorOutput, FlashTankOutput, HeaderOutput, HeatLossOutput, TurbineOutput, PrvOutput } from '../../shared/models/steam/steam-outputs';

declare var steamAddon: any;

@Injectable()
export class SteamService {

  saturatedPropertiesInputs: {
    inputs: SaturatedPropertiesInput,
    pressureOrTemperature: number
  }
  steamPropertiesInput:SteamPropertiesInput;
  saturatedPropertiesData: Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>;
  steamPropertiesData:  Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number }>;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  test() {
    console.log(steamAddon);
  }

  getQuantityRange(settings: Settings, thermodynamicQuantity: number): { min: number, max: number } {
    let _min: number = 0;
    let _max: number = 1;
    //temp
    if (thermodynamicQuantity == 0) {
      _min = Number(this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement).toFixed(0));
    }
    //enthalpy
    else if (thermodynamicQuantity == 1) {
      _min = Number(this.convertUnitsService.value(50).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(3700).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
    }
    //entropy
    else if (thermodynamicQuantity == 2) {
      _min = Number(this.convertUnitsService.value(0).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(6.52).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
    }
    return { min: _min, max: _max };
  }

  convertSteamPropertiesQuantityValue(steamPropertiesInput: SteamPropertiesInput, settings: Settings, forInput: boolean, output?: SteamPropertiesOutput) {
    if (forInput === true) {
      if (steamPropertiesInput.thermodynamicQuantity === 0) { // convert temperature to kelvin
        return this.convertUnitsService.value(steamPropertiesInput.quantityValue).from(settings.steamTemperatureMeasurement).to('C') + 273.15;
      } else if (steamPropertiesInput.thermodynamicQuantity === 1) { // convert specific Enthalpy
        return this.convertUnitsService.value(steamPropertiesInput.quantityValue).from(settings.steamSpecificEnthalpyMeasurement).to('kJkg');
      } else if (steamPropertiesInput.thermodynamicQuantity === 2) { // convert specific Entropy
        return this.convertUnitsService.value(steamPropertiesInput.quantityValue).from(settings.steamSpecificEntropyMeasurement).to('kJkgK');
      } else {
        return steamPropertiesInput.quantityValue;
      }
    }
    else {
      if (steamPropertiesInput.thermodynamicQuantity === 0) { // convert temperature back to original user-chosen unit
        output.temperature = this.convertUnitsService.value(output.temperature - 273.15).from('C').to(settings.steamTemperatureMeasurement);
        output.specificEntropy = this.convertUnitsService.value(output.specificEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
        output.specificEnthalpy = this.convertUnitsService.value(output.specificEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
      } else if (steamPropertiesInput.thermodynamicQuantity === 1) { // convert specific Enthalpy
        output.specificEnthalpy = this.convertUnitsService.value(output.specificEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
        output.specificEntropy = this.convertUnitsService.value(output.specificEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
        output.temperature = this.convertUnitsService.value(output.temperature - 273.15).from('C').to(settings.steamTemperatureMeasurement);
      } else if (steamPropertiesInput.thermodynamicQuantity === 2) {
        output.specificEntropy = this.convertUnitsService.value(output.specificEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
        output.temperature = this.convertUnitsService.value(output.temperature - 273.15).from('C').to(settings.steamTemperatureMeasurement);
        output.specificEnthalpy = this.convertUnitsService.value(output.specificEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
      } else {
        output.temperature = this.convertUnitsService.value(output.temperature - 273.15).from('C').to(settings.steamTemperatureMeasurement);
      }
    }
  }

  steamProperties(input: SteamPropertiesInput, settings: Settings): SteamPropertiesOutput {
    let inputCpy: SteamPropertiesInput = JSON.parse(JSON.stringify(input));
    inputCpy.pressure = this.convertUnitsService.value(inputCpy.pressure).from(settings.steamPressureMeasurement).to('MPa');
    if (inputCpy.thermodynamicQuantity == 0) {
      inputCpy.quantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 1) {
      inputCpy.quantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 2) {
      inputCpy.quantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    let output: SteamPropertiesOutput = steamAddon.steamProperties(inputCpy);
    output.pressure = this.convertUnitsService.value(output.pressure).from('MPa').to(settings.steamPressureMeasurement);
    output.specificVolume = this.convertUnitsService.value(output.specificVolume).from('m3kg').to(settings.steamSpecificVolumeMeasurement);
    output.temperature = this.convertUnitsService.value(output.temperature - 273.15).from('C').to(settings.steamTemperatureMeasurement);
    output.specificEntropy = this.convertUnitsService.value(output.specificEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
    output.specificEnthalpy = this.convertUnitsService.value(output.specificEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
    return output;
  }

  saturatedProperties(saturatedPropertiesInput: SaturatedPropertiesInput, pressureOrTemperature: number, settings: Settings): SaturatedPropertiesOutput {
    let inputCpy = JSON.parse(JSON.stringify(saturatedPropertiesInput));
    let output: SaturatedPropertiesOutput;

    if (pressureOrTemperature === 0) {
      inputCpy.saturatedPressure = this.convertUnitsService.value(inputCpy.saturatedPressure).from(settings.steamPressureMeasurement).to('MPa');
      output = steamAddon.saturatedPropertiesGivenPressure(inputCpy);
    } else {
      inputCpy.saturatedTemperature = this.convertUnitsService.value(inputCpy.saturatedTemperature).from(settings.steamTemperatureMeasurement).to('C') + 273.15;
      output = steamAddon.saturatedPropertiesGivenTemperature(inputCpy);
    }

    output.gasEntropy = this.convertUnitsService.value(output.gasEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
    output.liquidEntropy = this.convertUnitsService.value(output.liquidEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
    output.evaporationEntropy = this.convertUnitsService.value(output.evaporationEntropy).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);

    output.evaporationEnthalpy = this.convertUnitsService.value(output.evaporationEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
    output.gasEnthalpy = this.convertUnitsService.value(output.gasEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
    output.liquidEnthalpy = this.convertUnitsService.value(output.liquidEnthalpy).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);

    output.saturatedPressure = this.convertUnitsService.value(output.saturatedPressure).from('MPa').to(settings.steamPressureMeasurement);

    output.saturatedTemperature = this.convertUnitsService.value(output.saturatedTemperature - 273.15).from('C').to(settings.steamTemperatureMeasurement);

    output.evaporationVolume = this.convertUnitsService.value(output.evaporationVolume).from('m3kg').to(settings.steamSpecificVolumeMeasurement);
    output.gasVolume = this.convertUnitsService.value(output.gasVolume).from('m3kg').to(settings.steamSpecificVolumeMeasurement);
    output.liquidVolume = this.convertUnitsService.value(output.liquidVolume).from('m3kg').to(settings.steamSpecificVolumeMeasurement);

    return output;
  }

  //ENTROPY
  convertSteamSpecificEntropyOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
  }
  convertSteamSpecificEntropyInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamSpecificEntropyMeasurement).to('kJkgK');
  }
  //ENTHALPY
  convertSteamSpecificEnthalpyOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
  }
  convertSteamSpecificEnthalpyInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamSpecificEnthalpyMeasurement).to('kJkg');
  }
  //PRESSURE
  convertSteamPressureInput(val: number, settings: Settings): number {
    let tmpPressure: number = this.convertUnitsService.value(val).from(settings.steamPressureMeasurement).to('MPaa');
    // if(tmpPressure < 0){
    //   tmpPressure = 0;
    // }
    return tmpPressure;
  }
  convertSteamPressureOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('MPaa').to(settings.steamPressureMeasurement);
  }
  //TEMPERATURE
  convertSteamTemperatureInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamTemperatureMeasurement).to('C') + 273.15;
  }
  convertSteamTemperatureOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val - 273.15).from('C').to(settings.steamTemperatureMeasurement);
  }
  //SPECIFIC VOLUME
  convertSteamSpecificVolumeMeasurementInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamSpecificVolumeMeasurement).to('m3kg');
  }
  convertSteamSpecificVolumeMeasurementOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('m3kg').to(settings.steamSpecificVolumeMeasurement);
  }
  //MASS FLOW
  convertSteamMassFlowInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamMassFlowMeasurement).to('kg');
  }
  convertSteamMassFlowOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kg').to(settings.steamMassFlowMeasurement);
  }
  //Energy
  convertEnergyFlowInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamEnergyMeasurement).to('MJ')
  }
  convertEnergyFlowOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('MJ').to(settings.steamEnergyMeasurement);
  }

  boiler(input: BoilerInput, settings: Settings): BoilerOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));
    inputCpy.steamMassFlow = this.convertSteamMassFlowInput(inputCpy.steamMassFlow, settings);
    inputCpy.deaeratorPressure = this.convertSteamPressureInput(inputCpy.deaeratorPressure, settings);
    inputCpy.steamPressure = this.convertSteamPressureInput(inputCpy.steamPressure, settings);

    if (inputCpy.thermodynamicQuantity == 0) {
      inputCpy.quantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (input.thermodynamicQuantity == 1) {
      inputCpy.quantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (input.thermodynamicQuantity == 2) {
      inputCpy.quantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //send to suite
    let results: BoilerOutput = steamAddon.boiler(inputCpy);
    //Convert Output
    //pressure
    results.steamPressure = this.convertSteamPressureOutput(results.steamPressure, settings);
    results.blowdownPressure = this.convertSteamPressureOutput(results.blowdownPressure, settings);
    results.feedwaterPressure = this.convertSteamPressureOutput(results.feedwaterPressure, settings);
    //temp
    results.steamTemperature = this.convertSteamTemperatureOutput(results.steamTemperature, settings);
    results.blowdownTemperature = this.convertSteamTemperatureOutput(results.blowdownTemperature, settings);
    results.feedwaterTemperature = this.convertSteamTemperatureOutput(results.feedwaterTemperature, settings);
    //enthalpy
    results.steamSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.steamSpecificEnthalpy, settings);
    results.blowdownSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.blowdownSpecificEnthalpy, settings);
    results.feedwaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.feedwaterSpecificEnthalpy, settings);
    //entropy
    results.steamSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.steamSpecificEntropy, settings);
    results.blowdownSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.blowdownSpecificEntropy, settings);
    results.feedwaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.feedwaterSpecificEntropy, settings);
    //massFlow
    results.steamMassFlow = this.convertSteamMassFlowOutput(results.steamMassFlow, settings);
    results.blowdownMassFlow = this.convertSteamMassFlowOutput(results.blowdownMassFlow, settings);
    results.feedwaterMassFlow = this.convertSteamMassFlowOutput(results.feedwaterMassFlow, settings);
    //energy
    results.steamEnergyFlow = this.convertEnergyFlowOutput(results.steamEnergyFlow, settings);
    results.blowdownEnergyFlow = this.convertEnergyFlowOutput(results.blowdownEnergyFlow, settings);
    results.feedwaterEnergyFlow = this.convertEnergyFlowOutput(results.feedwaterEnergyFlow, settings);
    results.boilerEnergy = this.convertEnergyFlowOutput(results.boilerEnergy, settings);
    results.fuelEnergy = this.convertEnergyFlowOutput(results.fuelEnergy, settings);
    return results;
  }

  deaerator(input: DeaeratorInput, settings: Settings): DeaeratorOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));
    //convert inputs
    inputCpy.deaeratorPressure = this.convertSteamPressureInput(inputCpy.deaeratorPressure, settings);
    inputCpy.waterPressure = this.convertSteamPressureInput(inputCpy.waterPressure, settings);
    inputCpy.steamPressure = this.convertSteamPressureInput(inputCpy.steamPressure, settings);
    inputCpy.feedwaterMassFlow = this.convertSteamMassFlowInput(inputCpy.feedwaterMassFlow, settings);
    if (inputCpy.waterThermodynamicQuantity == 0) {
      inputCpy.waterQuantityValue = this.convertSteamTemperatureInput(inputCpy.waterQuantityValue, settings);
    } else if (input.waterThermodynamicQuantity == 1) {
      inputCpy.waterQuantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.waterQuantityValue, settings);
    } else if (inputCpy.waterThermodynamicQuantity == 2) {
      inputCpy.waterQuantityValue = this.convertSteamSpecificEntropyInput(inputCpy.waterQuantityValue, settings);
    }
    if (inputCpy.steamThermodynamicQuantity == 0) {
      inputCpy.steamQuantityValue = this.convertSteamTemperatureInput(inputCpy.steamQuantityValue, settings);
    } else if (input.steamThermodynamicQuantity == 1) {
      inputCpy.steamQuantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.steamQuantityValue, settings);
    } else if (input.steamThermodynamicQuantity == 2) {
      inputCpy.steamQuantityValue = this.convertSteamSpecificEntropyInput(inputCpy.steamQuantityValue, settings);
    }

    //calc
    let results: DeaeratorOutput = steamAddon.deaerator(inputCpy);
    //convert outputs
    //energy flow
    results.feedwaterEnergyFlow = this.convertEnergyFlowOutput(results.feedwaterEnergyFlow, settings);
    results.inletSteamEnergyFlow = this.convertEnergyFlowOutput(results.inletSteamEnergyFlow, settings);
    results.inletWaterEnergyFlow = this.convertEnergyFlowOutput(results.inletWaterEnergyFlow, settings);
    results.ventedSteamEnergyFlow = this.convertEnergyFlowOutput(results.ventedSteamEnergyFlow, settings);
    //mass flow
    results.feedwaterMassFlow = this.convertSteamMassFlowOutput(results.feedwaterMassFlow, settings);
    results.inletSteamMassFlow = this.convertSteamMassFlowOutput(results.inletSteamMassFlow, settings);
    results.inletWaterMassFlow = this.convertSteamMassFlowOutput(results.inletWaterMassFlow, settings);
    results.ventedSteamMassFlow = this.convertSteamMassFlowOutput(results.ventedSteamMassFlow, settings);
    //pressure
    results.feedwaterPressure = this.convertSteamPressureOutput(results.feedwaterPressure, settings);
    results.inletSteamPressure = this.convertSteamPressureOutput(results.inletSteamPressure, settings);
    results.inletWaterPressure = this.convertSteamPressureOutput(results.inletWaterPressure, settings);
    results.ventedSteamPressure = this.convertSteamPressureOutput(results.ventedSteamPressure, settings);
    //specific enthalpy
    results.feedwaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.feedwaterSpecificEnthalpy, settings);
    results.inletSteamSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletSteamSpecificEnthalpy, settings);
    results.inletWaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletWaterSpecificEnthalpy, settings);
    results.ventedSteamSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.ventedSteamSpecificEnthalpy, settings);
    //specific entropy
    results.feedwaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.feedwaterSpecificEntropy, settings);
    results.inletSteamSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletSteamSpecificEntropy, settings);
    results.inletWaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletWaterSpecificEntropy, settings);
    results.ventedSteamSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.ventedSteamSpecificEntropy, settings);
    //feedwater temp
    results.feedwaterTemperature = this.convertSteamTemperatureOutput(results.feedwaterTemperature, settings);
    results.inletSteamTemperature = this.convertSteamTemperatureOutput(results.inletSteamTemperature, settings);
    results.inletWaterTemperature = this.convertSteamTemperatureOutput(results.inletWaterTemperature, settings);
    results.ventedSteamTemperature = this.convertSteamTemperatureOutput(results.ventedSteamTemperature, settings);
    return results;
  }

  flashTank(input: FlashTankInput, settings: Settings): FlashTankOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convert inputs
    inputCpy.inletWaterPressure = this.convertSteamPressureInput(inputCpy.inletWaterPressure, settings);
    inputCpy.inletWaterMassFlow = this.convertSteamMassFlowInput(inputCpy.inletWaterMassFlow, settings);
    inputCpy.tankPressure = this.convertSteamPressureInput(inputCpy.tankPressure, settings);
    if (inputCpy.thermodynamicQuantity == 0) {
      inputCpy.quantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 1) {
      inputCpy.quantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 2) {
      inputCpy.quantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //get results w/ converted inputs
    let results: FlashTankOutput = steamAddon.flashTank(inputCpy);
    //convert outputs
    //flow
    results.inletWaterMassFlow = this.convertSteamMassFlowOutput(results.inletWaterMassFlow, settings);
    results.outletGasMassFlow = this.convertSteamMassFlowOutput(results.outletGasMassFlow, settings);
    results.outletLiquidMassFlow = this.convertSteamMassFlowOutput(results.outletLiquidMassFlow, settings);
    //pressure
    results.inletWaterPressure = this.convertSteamPressureOutput(results.inletWaterPressure, settings);
    results.outletGasPressure = this.convertSteamPressureOutput(results.outletGasPressure, settings);
    results.outletLiquidPressure = this.convertSteamPressureOutput(results.outletLiquidPressure, settings);
    //enthalpy
    results.inletWaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletWaterSpecificEnthalpy, settings);
    results.outletGasSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.outletGasSpecificEnthalpy, settings);
    results.outletLiquidSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.outletLiquidSpecificEnthalpy, settings);
    //entropy
    results.inletWaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletWaterSpecificEntropy, settings);
    results.outletGasSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.outletGasSpecificEntropy, settings);
    results.outletLiquidSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.outletLiquidSpecificEntropy, settings);
    //temp
    results.inletWaterTemperature = this.convertSteamTemperatureOutput(results.inletWaterTemperature, settings);
    results.outletGasTemperature = this.convertSteamTemperatureOutput(results.outletGasTemperature, settings);
    results.outletLiquidTemperature = this.convertSteamTemperatureOutput(results.outletLiquidTemperature, settings);
    return results;
  }

  header(input: HeaderInput, settings: Settings): HeaderOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convertInputs
    inputCpy.headerPressure = this.convertSteamPressureInput(inputCpy.headerPressure, settings);
    inputCpy.inlets.forEach(inlet => {
      inlet.pressure = this.convertSteamPressureInput(inlet.pressure, settings);
      inlet.massFlow = this.convertSteamMassFlowInput(inlet.massFlow, settings);
      if (inlet.thermodynamicQuantity == 0) {
        inlet.quantityValue = this.convertSteamTemperatureInput(inlet.quantityValue, settings);
      } else if (inlet.thermodynamicQuantity == 1) {
        inlet.quantityValue = this.convertSteamSpecificEnthalpyInput(inlet.quantityValue, settings);
      } else if (inlet.thermodynamicQuantity == 2) {
        inlet.quantityValue = this.convertSteamSpecificEntropyInput(inlet.quantityValue, settings);
      }
    })
    let results: HeaderOutput = steamAddon.header(inputCpy);
    //converOutput
    for (var key in results) {
      results[key].energyFlow = this.convertEnergyFlowOutput(results[key].energyFlow, settings) / 1000;
      results[key].massFlow = this.convertSteamMassFlowOutput(results[key].massFlow, settings);
      results[key].pressure = this.convertSteamPressureOutput(results[key].pressure, settings);
      results[key].specificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results[key].specificEnthalpy, settings);
      results[key].specificEntropy = this.convertSteamSpecificEntropyOutput(results[key].specificEntropy, settings);
      results[key].temperature = this.convertSteamTemperatureOutput(results[key].temperature, settings);
    }
    return results;
  }

  heatLoss(input: HeatLossInput, settings: Settings): HeatLossOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convert inputs
    inputCpy.inletMassFlow = this.convertSteamMassFlowInput(inputCpy.inletMassFlow, settings);
    inputCpy.inletPressure = this.convertSteamPressureInput(inputCpy.inletPressure, settings);
    if (inputCpy.thermodynamicQuantity == 0) {
      inputCpy.quantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 1) {
      inputCpy.quantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 2) {
      inputCpy.quantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //get results
    let results: HeatLossOutput = steamAddon.heatLoss(inputCpy);
    //convert outputs
    //flow
    results.inletMassFlow = this.convertSteamMassFlowOutput(results.inletMassFlow, settings);
    results.outletMassFlow = this.convertSteamMassFlowOutput(results.outletMassFlow, settings);
    //pressure
    results.inletPressure = this.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletPressure = this.convertSteamPressureOutput(results.outletPressure, settings);
    //enthalpy
    results.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    //entropy
    results.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    //temp
    results.inletTemperature = this.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletTemperature = this.convertSteamTemperatureOutput(results.outletTemperature, settings);
    //energy flow
    results.inletEnergyFlow = this.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.outletEnergyFlow = this.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    results.heatLoss = this.convertEnergyFlowOutput(results.heatLoss, settings);
    return results;

  }
  prvWithoutDesuperheating(input: PrvInput, settings: Settings): PrvOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convert inputs
    inputCpy.inletPressure = this.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.inletMassFlow = this.convertSteamMassFlowInput(inputCpy.inletMassFlow, settings);
    inputCpy.outletPressure = this.convertSteamPressureInput(inputCpy.outletPressure, settings);
    if (inputCpy.thermodynamicQuantity == 0) {
      inputCpy.quantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 1) {
      inputCpy.quantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 2) {
      inputCpy.quantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //calc results
    let results: PrvOutput = steamAddon.prvWithoutDesuperheating(inputCpy);
    //convert results
    //flow
    results.inletMassFlow = this.convertSteamMassFlowOutput(results.inletMassFlow, settings);
    results.outletMassFlow = this.convertSteamMassFlowOutput(results.outletMassFlow, settings);
    //pressure
    results.inletPressure = this.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletPressure = this.convertSteamPressureOutput(results.outletPressure, settings);
    //enthalpy
    results.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    //entropy
    results.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    //temp
    results.inletTemperature = this.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletTemperature = this.convertSteamTemperatureOutput(results.outletTemperature, settings);
    //energyFlow
    results.inletEnergyFlow = this.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.outletEnergyFlow = this.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    return results;
  }
  prvWithDesuperheating(input: PrvInput, settings: Settings): PrvOutput {
    let inputCpy: PrvInput = JSON.parse(JSON.stringify(input));
    //convert inputs
    inputCpy.inletPressure = this.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.inletMassFlow = this.convertSteamMassFlowInput(inputCpy.inletMassFlow, settings);
    inputCpy.outletPressure = this.convertSteamPressureInput(inputCpy.outletPressure, settings);
    inputCpy.feedwaterPressure = this.convertSteamPressureInput(inputCpy.feedwaterPressure, settings);
    inputCpy.desuperheatingTemp = this.convertSteamTemperatureInput(inputCpy.desuperheatingTemp, settings);
    if (inputCpy.thermodynamicQuantity == 0) {
      inputCpy.quantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 1) {
      inputCpy.quantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity == 2) {
      inputCpy.quantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    if (inputCpy.feedwaterThermodynamicQuantity == 0) {
      inputCpy.feedwaterQuantityValue = this.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.feedwaterThermodynamicQuantity == 1) {
      inputCpy.feedwaterQuantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.feedwaterThermodynamicQuantity == 2) {
      inputCpy.feedwaterQuantityValue = this.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //calc results
    let results: PrvOutput = steamAddon.prvWithDesuperheating(inputCpy);
    //convert results
    //flow
    results.inletMassFlow = this.convertSteamMassFlowOutput(results.inletMassFlow, settings);
    results.outletMassFlow = this.convertSteamMassFlowOutput(results.outletMassFlow, settings);
    results.feedwaterMassFlow = this.convertSteamMassFlowOutput(results.feedwaterMassFlow, settings);
    //pressure
    results.inletPressure = this.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletPressure = this.convertSteamPressureOutput(results.outletPressure, settings);
    results.feedwaterPressure = this.convertSteamPressureOutput(results.feedwaterPressure, settings);
    //enthalpy
    results.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    results.feedwaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.feedwaterSpecificEnthalpy, settings);
    //entropy
    results.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    results.feedwaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.feedwaterSpecificEntropy, settings);
    //temp
    results.inletTemperature = this.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletTemperature = this.convertSteamTemperatureOutput(results.outletTemperature, settings);
    results.feedwaterTemperature = this.convertSteamTemperatureOutput(results.feedwaterTemperature, settings);
    //energyFlow
    results.inletEnergyFlow = this.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.outletEnergyFlow = this.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    results.feedwaterEnergyFlow = this.convertEnergyFlowOutput(results.feedwaterEnergyFlow, settings);
    return results;
  }

  turbine(input: TurbineInput, settings: Settings): TurbineOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    inputCpy.inletPressure = this.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.outletSteamPressure = this.convertSteamPressureInput(inputCpy.outletSteamPressure, settings);
    if (inputCpy.turbineProperty == 0) {
      //mass flow
      inputCpy.massFlowOrPowerOut = this.convertUnitsService.value(inputCpy.massFlowOrPowerOut).from(settings.steamMassFlowMeasurement).to('tonne');
    }else{
      //power out
      inputCpy.massFlowOrPowerOut = this.convertUnitsService.value(inputCpy.massFlowOrPowerOut).from('kW').to('MJh');
    }
    if (inputCpy.inletQuantity == 0) {
      inputCpy.inletQuantityValue = this.convertSteamTemperatureInput(inputCpy.inletQuantityValue, settings);
    } else if (inputCpy.inletQuantity == 1) {
      inputCpy.inletQuantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.inletQuantityValue, settings);
    } else if (inputCpy.inletQuantity == 2) {
      inputCpy.inletQuantityValue = this.convertSteamSpecificEntropyInput(inputCpy.inletQuantityValue, settings);
    }
    if (inputCpy.solveFor == 1) {
      if (inputCpy.outletQuantity == 0) {
        inputCpy.outletQuantityValue = this.convertSteamTemperatureInput(inputCpy.outletQuantityValue, settings);
      } else if (inputCpy.outletQuantity == 1) {
        inputCpy.outletQuantityValue = this.convertSteamSpecificEnthalpyInput(inputCpy.outletQuantityValue, settings);
      } else if (inputCpy.outletQuantity == 2) {
        inputCpy.outletQuantityValue = this.convertSteamSpecificEntropyInput(inputCpy.outletQuantityValue, settings);
      }
    }
    let results: TurbineOutput = steamAddon.turbine(inputCpy);
    //comes back as tonnes
    
    if (inputCpy.turbineProperty == 0) {
      //mass flow
      results.massFlow = this.convertUnitsService.value(results.massFlow).from('tonne').to(settings.steamMassFlowMeasurement)*1000;
      results.outletEnergyFlow = this.convertUnitsService.value(results.outletEnergyFlow).from('kJ').to(settings.steamEnergyMeasurement)*1000000;
      results.inletEnergyFlow = this.convertUnitsService.value(results.inletEnergyFlow).from('kJ').to(settings.steamEnergyMeasurement)*1000000;
      results.energyOut = this.convertUnitsService.value(results.energyOut).from('kJ').to(settings.steamEnergyMeasurement)*1000000;
      results.powerOut = this.convertUnitsService.value(results.powerOut).from('kJh').to(settings.steamPowerMeasurement)*1000000;
    }else{
      //power out
      results.massFlow = this.convertUnitsService.value(results.massFlow).from('kg').to(settings.steamMassFlowMeasurement)*1000;
      results.outletEnergyFlow = this.convertUnitsService.value(results.outletEnergyFlow).from('MJ').to(settings.steamEnergyMeasurement);
      results.inletEnergyFlow = this.convertUnitsService.value(results.inletEnergyFlow).from('MJ').to(settings.steamEnergyMeasurement);
      results.energyOut = this.convertUnitsService.value(results.energyOut).from('MJ').to(settings.steamEnergyMeasurement);
      results.powerOut = this.convertUnitsService.value(results.powerOut).from('MJh').to(settings.steamPowerMeasurement);
    }

    results.outletPressure = this.convertSteamPressureOutput(results.outletPressure, settings);
    results.inletPressure = this.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    results.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    results.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletTemperature = this.convertSteamTemperatureOutput(results.outletTemperature, settings);
    results.inletTemperature = this.convertSteamTemperatureOutput(results.inletTemperature, settings);

    return results;
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

}
