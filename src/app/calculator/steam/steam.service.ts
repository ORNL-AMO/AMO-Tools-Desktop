import { Injectable } from '@angular/core';
import { SaturatedPropertiesInput, SteamPropertiesInput, BoilerInput, DeaeratorInput, FlashTankInput, HeaderInput, HeatLossInput, TurbineInput, PrvInput, HeatExchangerInput } from "../../shared/models/steam/steam-inputs";
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";
import { BoilerOutput, SaturatedPropertiesOutput, SteamPropertiesOutput, DeaeratorOutput, FlashTankOutput, HeaderOutput, HeatLossOutput, TurbineOutput, PrvOutput, HeatExchangerOutput, SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { ConvertSteamService } from './convert-steam.service';

declare var steamAddon: any;

@Injectable()
export class SteamService {

  saturatedPropertiesInputs: {
    inputs: SaturatedPropertiesInput,
    pressureOrTemperature: number
  };

  steamPropertiesInput: SteamPropertiesInput;
  saturatedPropertiesData: Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>;
  steamPropertiesData: Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number, quality: number }>;
  constructor(private convertUnitsService: ConvertUnitsService, private convertSteamService: ConvertSteamService) { }

  test() {
    console.log(steamAddon);
  }

  getQuantityRange(settings: Settings, thermodynamicQuantity: number): { min: number, max: number } {
    let _min: number = 0;
    let _max: number = 1;
    //temp
    if (thermodynamicQuantity === 0) {
      _min = Number(this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement).toFixed(3));
      _max = Number(this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement).toFixed(3));
    }
    //enthalpy
    else if (thermodynamicQuantity === 1) {
      _min = Number(this.convertUnitsService.value(50).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(3700).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
    }
    //entropy
    else if (thermodynamicQuantity === 2) {
      _min = Number(this.convertUnitsService.value(0).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(6.52).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
    }
    return { min: _min, max: _max };
  }

  convertSteamPropertiesQuantityValue(steamPropertiesInput: SteamPropertiesInput, settings: Settings, forInput: boolean, output?: SteamPropertiesOutput) {
    if (forInput === true) {
      if (steamPropertiesInput.thermodynamicQuantity === 0) { // convert temperature to kelvin
        return this.convertSteamService.convertSteamTemperatureInput(steamPropertiesInput.quantityValue, settings);
      } else if (steamPropertiesInput.thermodynamicQuantity === 1) { // convert specific Enthalpy
        return this.convertSteamService.convertSteamSpecificEnthalpyInput(steamPropertiesInput.quantityValue, settings);
      } else if (steamPropertiesInput.thermodynamicQuantity === 2) { // convert specific Entropy
        return this.convertSteamService.convertSteamSpecificEntropyInput(steamPropertiesInput.quantityValue, settings);
      } else {
        return steamPropertiesInput.quantityValue;
      }
    }
    else {
      if (steamPropertiesInput.thermodynamicQuantity === 0 || steamPropertiesInput.thermodynamicQuantity === 1 || steamPropertiesInput.thermodynamicQuantity === 2) { // convert temperature back to original user-chosen unit
        output.temperature = this.convertSteamService.convertSteamTemperatureOutput(output.temperature, settings);
        output.specificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(output.specificEntropy, settings);
        output.specificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(output.specificEnthalpy, settings);
      } else {
        output.temperature = this.convertSteamService.convertSteamTemperatureOutput(output.temperature, settings);
      }
    }
  }

  steamProperties(input: SteamPropertiesInput, settings: Settings): SteamPropertiesOutput {
    let inputCpy: SteamPropertiesInput = JSON.parse(JSON.stringify(input));
    inputCpy.pressure = this.convertSteamService.convertSteamPressureInput(inputCpy.pressure, settings);
    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    let output: SteamPropertiesOutput = steamAddon.steamProperties(inputCpy);
    output.pressure = this.convertSteamService.convertSteamPressureOutput(output.pressure, settings);
    output.specificVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementOutput(output.specificVolume, settings);
    output.temperature = this.convertSteamService.convertSteamTemperatureOutput(output.temperature, settings);
    output.specificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(output.specificEntropy, settings);
    output.specificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(output.specificEnthalpy, settings);
    return output;
  }

  saturatedProperties(saturatedPropertiesInput: SaturatedPropertiesInput, pressureOrTemperature: number, settings: Settings): SaturatedPropertiesOutput {
    let inputCpy = JSON.parse(JSON.stringify(saturatedPropertiesInput));
    let output: SaturatedPropertiesOutput;
    //0 = pressure
    if (pressureOrTemperature === 0) {
      inputCpy.saturatedPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.saturatedPressure, settings);
      output = steamAddon.saturatedPropertiesGivenPressure(inputCpy);
    } else {
      //temperature
      inputCpy.saturatedTemperature = this.convertSteamService.convertSteamTemperatureInput(inputCpy.saturatedTemperature, settings);
      output = steamAddon.saturatedPropertiesGivenTemperature(inputCpy);
    }

    output.gasEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(output.gasEntropy, settings);
    output.liquidEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(output.liquidEntropy, settings);
    output.evaporationEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(output.evaporationEntropy, settings);

    output.evaporationEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(output.evaporationEnthalpy, settings);
    output.gasEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(output.gasEnthalpy, settings);
    output.liquidEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(output.liquidEnthalpy, settings);

    output.saturatedPressure = this.convertSteamService.convertSteamPressureOutput(output.saturatedPressure, settings);

    output.saturatedTemperature = this.convertSteamService.convertSteamTemperatureOutput(output.saturatedTemperature, settings);

    output.evaporationVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementOutput(output.evaporationVolume, settings);
    output.gasVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementOutput(output.gasVolume, settings);
    output.liquidVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementOutput(output.liquidVolume, settings);

    return output;
  }


  boiler(input: BoilerInput, settings: Settings): BoilerOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));
    inputCpy.steamMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.steamMassFlow, settings);
    inputCpy.deaeratorPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.deaeratorPressure, settings);
    inputCpy.steamPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.steamPressure, settings);

    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (input.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (input.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //send to suite
    let results: BoilerOutput = steamAddon.boiler(inputCpy);
    //Convert Output
    //pressure
    results.steamPressure = this.convertSteamService.convertSteamPressureOutput(results.steamPressure, settings);
    results.blowdownPressure = this.convertSteamService.convertSteamPressureOutput(results.blowdownPressure, settings);
    results.feedwaterPressure = this.convertSteamService.convertSteamPressureOutput(results.feedwaterPressure, settings);
    //temp
    results.steamTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.steamTemperature, settings);
    results.blowdownTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.blowdownTemperature, settings);
    results.feedwaterTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.feedwaterTemperature, settings);
    //enthalpy
    results.steamSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.steamSpecificEnthalpy, settings);
    results.blowdownSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.blowdownSpecificEnthalpy, settings);
    results.feedwaterSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.feedwaterSpecificEnthalpy, settings);
    //entropy
    results.steamSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.steamSpecificEntropy, settings);
    results.blowdownSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.blowdownSpecificEntropy, settings);
    results.feedwaterSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.feedwaterSpecificEntropy, settings);
    //massFlow
    results.steamMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.steamMassFlow, settings);
    results.blowdownMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.blowdownMassFlow, settings);
    results.feedwaterMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.feedwaterMassFlow, settings);
    //energy
    results.steamEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.steamEnergyFlow, settings);
    results.blowdownEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.blowdownEnergyFlow, settings);
    results.feedwaterEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.feedwaterEnergyFlow, settings);
    results.boilerEnergy = this.convertSteamService.convertEnergyFlowOutput(results.boilerEnergy, settings);
    results.fuelEnergy = this.convertSteamService.convertEnergyFlowOutput(results.fuelEnergy, settings);
    return results;
  }

  deaerator(input: DeaeratorInput, settings: Settings): DeaeratorOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));
    //convert inputs
    inputCpy.deaeratorPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.deaeratorPressure, settings);
    inputCpy.waterPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.waterPressure, settings);
    inputCpy.steamPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.steamPressure, settings);
    inputCpy.feedwaterMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.feedwaterMassFlow, settings);
    if (inputCpy.waterThermodynamicQuantity === 0) {
      inputCpy.waterQuantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.waterQuantityValue, settings);
    } else if (input.waterThermodynamicQuantity === 1) {
      inputCpy.waterQuantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.waterQuantityValue, settings);
    } else if (inputCpy.waterThermodynamicQuantity === 2) {
      inputCpy.waterQuantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.waterQuantityValue, settings);
    }
    if (inputCpy.steamThermodynamicQuantity === 0) {
      inputCpy.steamQuantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.steamQuantityValue, settings);
    } else if (input.steamThermodynamicQuantity === 1) {
      inputCpy.steamQuantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.steamQuantityValue, settings);
    } else if (input.steamThermodynamicQuantity === 2) {
      inputCpy.steamQuantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.steamQuantityValue, settings);
    }

    //calc
    let results: DeaeratorOutput = steamAddon.deaerator(inputCpy);
    //convert outputs
    //energy flow
    results.feedwaterEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.feedwaterEnergyFlow, settings);
    results.inletSteamEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletSteamEnergyFlow, settings);
    results.inletWaterEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletWaterEnergyFlow, settings);
    results.ventedSteamEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.ventedSteamEnergyFlow, settings);
    //mass flow
    results.feedwaterMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.feedwaterMassFlow, settings);
    results.inletSteamMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.inletSteamMassFlow, settings);
    results.inletWaterMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.inletWaterMassFlow, settings);
    results.ventedSteamMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.ventedSteamMassFlow, settings);
    //pressure
    results.feedwaterPressure = this.convertSteamService.convertSteamPressureOutput(results.feedwaterPressure, settings);
    results.inletSteamPressure = this.convertSteamService.convertSteamPressureOutput(results.inletSteamPressure, settings);
    results.inletWaterPressure = this.convertSteamService.convertSteamPressureOutput(results.inletWaterPressure, settings);
    results.ventedSteamPressure = this.convertSteamService.convertSteamPressureOutput(results.ventedSteamPressure, settings);
    //specific enthalpy
    results.feedwaterSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.feedwaterSpecificEnthalpy, settings);
    results.inletSteamSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletSteamSpecificEnthalpy, settings);
    results.inletWaterSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletWaterSpecificEnthalpy, settings);
    results.ventedSteamSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.ventedSteamSpecificEnthalpy, settings);
    //specific entropy
    results.feedwaterSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.feedwaterSpecificEntropy, settings);
    results.inletSteamSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletSteamSpecificEntropy, settings);
    results.inletWaterSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletWaterSpecificEntropy, settings);
    results.ventedSteamSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.ventedSteamSpecificEntropy, settings);
    //feedwater temp
    results.feedwaterTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.feedwaterTemperature, settings);
    results.inletSteamTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletSteamTemperature, settings);
    results.inletWaterTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletWaterTemperature, settings);
    results.ventedSteamTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.ventedSteamTemperature, settings);
    return results;
  }

  flashTank(input: FlashTankInput, settings: Settings): FlashTankOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convert inputs
    inputCpy.inletWaterPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.inletWaterPressure, settings);
    inputCpy.inletWaterMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.inletWaterMassFlow, settings);
    inputCpy.tankPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.tankPressure, settings);
    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //get results w/ converted inputs
    let results: FlashTankOutput = steamAddon.flashTank(inputCpy);
    //convert outputs
    //flow
    results.inletWaterMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.inletWaterMassFlow, settings);
    results.outletGasMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.outletGasMassFlow, settings);
    results.outletLiquidMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.outletLiquidMassFlow, settings);
    //pressure
    results.inletWaterPressure = this.convertSteamService.convertSteamPressureOutput(results.inletWaterPressure, settings);
    results.outletGasPressure = this.convertSteamService.convertSteamPressureOutput(results.outletGasPressure, settings);
    results.outletLiquidPressure = this.convertSteamService.convertSteamPressureOutput(results.outletLiquidPressure, settings);
    //enthalpy
    results.inletWaterSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletWaterSpecificEnthalpy, settings);
    results.outletGasSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletGasSpecificEnthalpy, settings);
    results.outletLiquidSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletLiquidSpecificEnthalpy, settings);
    //entropy
    results.inletWaterSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletWaterSpecificEntropy, settings);
    results.outletGasSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletGasSpecificEntropy, settings);
    results.outletLiquidSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletLiquidSpecificEntropy, settings);
    //temp
    results.inletWaterTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletWaterTemperature, settings);
    results.outletGasTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletGasTemperature, settings);
    results.outletLiquidTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletLiquidTemperature, settings);
    //energy flow    
    results.inletWaterEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletWaterEnergyFlow, settings);
    results.outletGasEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.outletGasEnergyFlow, settings);
    results.outletLiquidEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.outletLiquidEnergyFlow, settings);
    if (results.outletGasMassFlow < 0) {
      results.outletGasMassFlow = 0;
      results.outletGasEnergyFlow = 0;
      results.outletLiquidEnergyFlow = results.inletWaterEnergyFlow;
      results.outletLiquidMassFlow = results.inletWaterMassFlow;
      results.outletLiquidPressure = results.inletWaterPressure;
      results.outletLiquidQuality = results.inletWaterQuality;
      results.outletLiquidSpecificEnthalpy = results.inletWaterSpecificEnthalpy;
      results.outletLiquidSpecificEntropy = results.inletWaterSpecificEntropy;
      results.outletLiquidTemperature = results.inletWaterTemperature;
    }
    return results;
  }

  header(input: HeaderInput, settings: Settings): HeaderOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convertInputs
    inputCpy.headerPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.headerPressure, settings);
    inputCpy.inlets.forEach(inlet => {
      inlet.pressure = this.convertSteamService.convertSteamPressureInput(inlet.pressure, settings);
      inlet.massFlow = this.convertSteamService.convertSteamMassFlowInput(inlet.massFlow, settings);
      if (inlet.thermodynamicQuantity === 0) {
        inlet.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inlet.quantityValue, settings);
      } else if (inlet.thermodynamicQuantity === 1) {
        inlet.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inlet.quantityValue, settings);
      } else if (inlet.thermodynamicQuantity === 2) {
        inlet.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inlet.quantityValue, settings);
      }
    });
    let results: HeaderOutput = steamAddon.header(inputCpy);
    //converOutput
    for (var key in results) {
      results[key].energyFlow = this.convertSteamService.convertEnergyFlowOutput(results[key].energyFlow, settings);
      results[key].massFlow = this.convertSteamService.convertSteamMassFlowOutput(results[key].massFlow, settings);
      results[key].pressure = this.convertSteamService.convertSteamPressureOutput(results[key].pressure, settings);
      results[key].specificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results[key].specificEnthalpy, settings);
      results[key].specificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results[key].specificEntropy, settings);
      results[key].temperature = this.convertSteamService.convertSteamTemperatureOutput(results[key].temperature, settings);
    }
    return results;
  }

  heatLoss(input: HeatLossInput, settings: Settings): HeatLossOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convert inputs
    inputCpy.inletMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.inletMassFlow, settings);
    inputCpy.inletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.inletPressure, settings);
    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //get results
    let results: HeatLossOutput = steamAddon.heatLoss(inputCpy);
    //convert outputs
    //flow
    results.inletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.inletMassFlow, settings);
    results.outletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.outletMassFlow, settings);
    //pressure
    results.inletPressure = this.convertSteamService.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletPressure = this.convertSteamService.convertSteamPressureOutput(results.outletPressure, settings);
    //enthalpy
    results.inletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    //entropy
    results.inletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    //temp
    results.inletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletTemperature, settings);
    //energy flow
    results.inletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.outletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    results.heatLoss = this.convertSteamService.convertEnergyFlowOutput(results.heatLoss, settings);
    return results;

  }
  prvWithoutDesuperheating(input: PrvInput, settings: Settings): PrvOutput {
    let inputCpy = JSON.parse(JSON.stringify(input));

    //convert inputs
    inputCpy.inletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.inletMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.inletMassFlow, settings);
    inputCpy.outletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.outletPressure, settings);
    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //calc results
    let results: PrvOutput = steamAddon.prvWithoutDesuperheating(inputCpy);
    //convert results
    //flow
    results.inletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.inletMassFlow, settings);
    results.outletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.outletMassFlow, settings);
    //pressure
    results.inletPressure = this.convertSteamService.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletPressure = this.convertSteamService.convertSteamPressureOutput(results.outletPressure, settings);
    //enthalpy
    results.inletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    //entropy
    results.inletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    //temp
    results.inletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletTemperature, settings);
    //energyFlow
    results.inletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.outletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    return results;
  }
  prvWithDesuperheating(input: PrvInput, settings: Settings): PrvOutput {
    let inputCpy: PrvInput = JSON.parse(JSON.stringify(input));
    //convert inputs
    inputCpy.inletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.inletMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.inletMassFlow, settings);
    inputCpy.outletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.outletPressure, settings);
    inputCpy.feedwaterPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.feedwaterPressure, settings);
    inputCpy.desuperheatingTemp = this.convertSteamService.convertSteamTemperatureInput(inputCpy.desuperheatingTemp, settings);
    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    if (inputCpy.feedwaterThermodynamicQuantity === 0) {
      inputCpy.feedwaterQuantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.feedwaterThermodynamicQuantity === 1) {
      inputCpy.feedwaterQuantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.feedwaterThermodynamicQuantity === 2) {
      inputCpy.feedwaterQuantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //calc results
    let results: PrvOutput = steamAddon.prvWithDesuperheating(inputCpy);
    //convert results
    //flow
    results.inletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.inletMassFlow, settings);
    results.outletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.outletMassFlow, settings);
    results.feedwaterMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.feedwaterMassFlow, settings);
    //pressure
    results.inletPressure = this.convertSteamService.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletPressure = this.convertSteamService.convertSteamPressureOutput(results.outletPressure, settings);
    results.feedwaterPressure = this.convertSteamService.convertSteamPressureOutput(results.feedwaterPressure, settings);
    //enthalpy
    results.inletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    results.feedwaterSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.feedwaterSpecificEnthalpy, settings);
    //entropy
    results.inletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    results.feedwaterSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.feedwaterSpecificEntropy, settings);
    //temp
    results.inletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletTemperature, settings);
    results.feedwaterTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.feedwaterTemperature, settings);
    //energyFlow
    results.inletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.outletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    results.feedwaterEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.feedwaterEnergyFlow, settings);
    return results;
  }

  turbine(input: TurbineInput, settings: Settings): TurbineOutput {
    let inputCpy: TurbineInput = JSON.parse(JSON.stringify(input));

    inputCpy.inletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.outletSteamPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.outletSteamPressure, settings);
    if (inputCpy.turbineProperty === 0) {
      //mass flow
      inputCpy.massFlowOrPowerOut = this.convertSteamService.convertSteamMassFlowInput(inputCpy.massFlowOrPowerOut, settings);
    } else {
      //power out
      inputCpy.massFlowOrPowerOut = this.convertUnitsService.value(inputCpy.massFlowOrPowerOut).from(settings.steamPowerMeasurement).to('kJh');
    }
    if (inputCpy.inletQuantity === 0) {
      inputCpy.inletQuantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.inletQuantityValue, settings);
    } else if (inputCpy.inletQuantity === 1) {
      inputCpy.inletQuantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.inletQuantityValue, settings);
    } else if (inputCpy.inletQuantity === 2) {
      inputCpy.inletQuantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.inletQuantityValue, settings);
    }
    if (inputCpy.solveFor === 1) {
      if (inputCpy.outletQuantity === 0) {
        inputCpy.outletQuantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.outletQuantityValue, settings);
      } else if (inputCpy.outletQuantity === 1) {
        inputCpy.outletQuantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.outletQuantityValue, settings);
      } else if (inputCpy.outletQuantity === 2) {
        inputCpy.outletQuantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.outletQuantityValue, settings);
      }
    }
    let results: TurbineOutput = steamAddon.turbine(inputCpy);
    inputCpy.isentropicEfficiency = 100
    let idealResults: TurbineOutput = steamAddon.turbine(inputCpy);
    results.outletIdealPressure = idealResults.outletPressure;
    results.outletIdealQuality = idealResults.outletQuality;
    results.outletIdealSpecificEnthalpy = idealResults.outletSpecificEnthalpy;
    results.outletIdealSpecificEntropy = idealResults.outletSpecificEntropy;
    results.outletIdealTemperature = idealResults.outletTemperature;
    results.outletIdealVolume = idealResults.outletVolume;
    results.massFlow = this.convertSteamService.convertSteamMassFlowOutput(results.massFlow, settings);
    results.outletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.outletEnergyFlow, settings);
    results.inletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.inletEnergyFlow, settings);
    results.energyOut = this.convertSteamService.convertEnergyFlowOutput(results.energyOut, settings);
    results.powerOut = this.convertUnitsService.value(results.powerOut).from('kJh').to(settings.steamPowerMeasurement);

    results.outletPressure = this.convertSteamService.convertSteamPressureOutput(results.outletPressure, settings);
    results.inletPressure = this.convertSteamService.convertSteamPressureOutput(results.inletPressure, settings);
    results.outletIdealPressure = this.convertSteamService.convertSteamPressureOutput(results.outletIdealPressure, settings);
    results.outletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletSpecificEnthalpy, settings);
    results.inletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.inletSpecificEnthalpy, settings);
    results.outletIdealSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.outletIdealSpecificEnthalpy, settings);
    results.outletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletSpecificEntropy, settings);
    results.inletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.inletSpecificEntropy, settings);
    results.outletIdealSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.outletIdealSpecificEntropy, settings);
    results.outletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletTemperature, settings);
    results.inletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.inletTemperature, settings);
    results.outletIdealTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.outletIdealTemperature, settings);
    return results;
  }

  heatExchanger(input: HeatExchangerInput, settings: Settings): HeatExchangerOutput {
    let inputCpy: HeatExchangerInput = JSON.parse(JSON.stringify(input));
    inputCpy.hotInletMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.hotInletMassFlow, settings);
    inputCpy.hotInletEnergyFlow = this.convertSteamService.convertEnergyFlowInput(inputCpy.hotInletEnergyFlow, settings);
    inputCpy.hotInletTemperature = this.convertSteamService.convertSteamTemperatureInput(inputCpy.hotInletTemperature, settings);
    inputCpy.hotInletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.hotInletPressure, settings);
    inputCpy.hotInletSpecificVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementInput(inputCpy.hotInletSpecificVolume, settings);
    inputCpy.hotInletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.hotInletSpecificEnthalpy, settings);
    inputCpy.hotInletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.hotInletSpecificEntropy, settings);
    inputCpy.coldInletMassFlow = this.convertSteamService.convertSteamMassFlowInput(inputCpy.coldInletMassFlow, settings);
    inputCpy.coldInletEnergyFlow = this.convertSteamService.convertEnergyFlowInput(inputCpy.coldInletEnergyFlow, settings);
    inputCpy.coldInletTemperature = this.convertSteamService.convertSteamTemperatureInput(inputCpy.coldInletTemperature, settings);
    inputCpy.coldInletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.coldInletPressure, settings);
    inputCpy.coldInletSpecificVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementInput(inputCpy.coldInletSpecificVolume, settings);
    inputCpy.coldInletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.coldInletSpecificEnthalpy, settings);
    inputCpy.coldInletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.coldInletSpecificEntropy, settings);
    inputCpy.approachTemp = this.convertSteamService.convertSteamTemperatureInput(inputCpy.approachTemp, settings);

    let results: HeatExchangerOutput = steamAddon.heatExchanger(inputCpy);

    results.hotOutletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.hotOutletMassFlow, settings);
    results.hotOutletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.hotOutletEnergyFlow, settings);
    results.hotOutletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.hotOutletTemperature, settings);
    results.hotOutletPressure = this.convertSteamService.convertSteamPressureOutput(results.hotOutletPressure, settings);
    results.hotOutletSpecificVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementOutput(results.hotOutletSpecificVolume, settings);
    results.hotOutletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.hotOutletSpecificEnthalpy, settings);
    results.hotOutletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.hotOutletSpecificEntropy, settings);
    results.coldOutletMassFlow = this.convertSteamService.convertSteamMassFlowOutput(results.coldOutletMassFlow, settings);
    results.coldOutletEnergyFlow = this.convertSteamService.convertEnergyFlowOutput(results.coldOutletEnergyFlow, settings);
    results.coldOutletTemperature = this.convertSteamService.convertSteamTemperatureOutput(results.coldOutletTemperature, settings);
    results.coldOutletPressure = this.convertSteamService.convertSteamPressureOutput(results.coldOutletPressure, settings);
    results.coldOutletSpecificVolume = this.convertSteamService.convertSteamSpecificVolumeMeasurementOutput(results.coldOutletSpecificVolume, settings);
    results.coldOutletSpecificEnthalpy = this.convertSteamService.convertSteamSpecificEnthalpyOutput(results.coldOutletSpecificEnthalpy, settings);
    results.coldOutletSpecificEntropy = this.convertSteamService.convertSteamSpecificEntropyOutput(results.coldOutletSpecificEntropy, settings);
    return results;

  }

  steamModeler(inputData: SSMTInputs): SSMTOutput {
    // debugger
    console.log(inputData);
    let outputData: SSMTOutput = steamAddon.steamModeler(inputData);
    //convert output 
    return outputData;
  }
}
