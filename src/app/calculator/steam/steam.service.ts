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

  steamProperties(input: SteamPropertiesInput, settings: Settings): SteamPropertiesOutput {
    //create copy for conversions and calculations
    let inputCpy: SteamPropertiesInput = JSON.parse(JSON.stringify(input));
    //convert inputs
    inputCpy.pressure = this.convertSteamService.convertSteamPressureInput(inputCpy.pressure, settings);
    if (inputCpy.thermodynamicQuantity === 0) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 1) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.quantityValue, settings);
    } else if (inputCpy.thermodynamicQuantity === 2) {
      inputCpy.quantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.quantityValue, settings);
    }
    //call suite to calculate results
    let output: SteamPropertiesOutput = steamAddon.steamProperties(inputCpy);
    //convert results and return
    output = this.convertSteamService.convertSteamPropertiesOutput(output, settings);
    return output;
  }

  saturatedProperties(saturatedPropertiesInput: SaturatedPropertiesInput, pressureOrTemperature: number, settings: Settings): SaturatedPropertiesOutput {
    //create copy for conversions and calculations
    let inputCpy = JSON.parse(JSON.stringify(saturatedPropertiesInput));
    //convert input and call suite to calcluate results depending on input for calculator
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
    //convert results and return
    output = this.convertSteamService.convertSaturatedPropertiesOutput(output, settings);
    return output;
  }


  boiler(input: BoilerInput, settings: Settings): BoilerOutput {
    //create copy for conversions and calculations
    let inputCpy = JSON.parse(JSON.stringify(input));
    //convert inputs
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
    //call suite calculator
    let results: BoilerOutput = steamAddon.boiler(inputCpy);
    //convert results and return
    results = this.convertSteamService.convertBoilerOutput(results, settings);
    return results;
  }

  deaerator(input: DeaeratorInput, settings: Settings): DeaeratorOutput {
    //create copy for conversions and calculations
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
    //call suite calculator
    let results: DeaeratorOutput = steamAddon.deaerator(inputCpy);
    //convert results and return
    results = this.convertSteamService.convertDeaeratorOutput(results, settings);
    return results;
  }

  flashTank(input: FlashTankInput, settings: Settings): FlashTankOutput {
    //create copy for conversions and calculations
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
    //convert results and return
    results = this.convertSteamService.convertFlashTankOutput(results, settings);
    return results;
  }

  header(input: HeaderInput, settings: Settings): HeaderOutput {
    //create copy for conversions and calculations
    let inputCpy = JSON.parse(JSON.stringify(input));
    //convert inputs
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
    //call suite calculator
    let results: HeaderOutput = steamAddon.header(inputCpy);
    //convert results and return
    results = this.convertSteamService.convertHeaderOutput(results, settings);
    return results;
  }

  heatLoss(input: HeatLossInput, settings: Settings): HeatLossOutput {
    //create copy for conversions and calculations
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
    //call suite calculator
    let results: HeatLossOutput = steamAddon.heatLoss(inputCpy);
    //convert results and return
    results = this.convertSteamService.convertHeatLossOutput(results, settings);
    return results;

  }
  prvWithoutDesuperheating(input: PrvInput, settings: Settings): PrvOutput {
    //create copy for conversions and calculations
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
    //call suite calculator
    let results: PrvOutput = steamAddon.prvWithoutDesuperheating(inputCpy);
    //convert results and return
    results = this.convertSteamService.convertPrvOutput(results, settings);
    return results;
  }
  prvWithDesuperheating(input: PrvInput, settings: Settings): PrvOutput {
    //create copy for conversions and calculations
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
      inputCpy.feedwaterQuantityValue = this.convertSteamService.convertSteamTemperatureInput(inputCpy.feedwaterQuantityValue, settings);
    } else if (inputCpy.feedwaterThermodynamicQuantity === 1) {
      inputCpy.feedwaterQuantityValue = this.convertSteamService.convertSteamSpecificEnthalpyInput(inputCpy.feedwaterQuantityValue, settings);
    } else if (inputCpy.feedwaterThermodynamicQuantity === 2) {
      inputCpy.feedwaterQuantityValue = this.convertSteamService.convertSteamSpecificEntropyInput(inputCpy.feedwaterQuantityValue, settings);
    }
    //call suite calculator
    let results: PrvOutput = steamAddon.prvWithDesuperheating(inputCpy);
    //convert results and return
    results = this.convertSteamService.convertPrvOutput(results, settings);
    return results;
  }

  turbine(input: TurbineInput, settings: Settings): TurbineOutput {
    //create copy for conversions and calculations
    let inputCpy: TurbineInput = JSON.parse(JSON.stringify(input));
    //convert inputs
    inputCpy.inletPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.inletPressure, settings);
    inputCpy.outletSteamPressure = this.convertSteamService.convertSteamPressureInput(inputCpy.outletSteamPressure, settings);
    //input dependent on turbine property
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
    if (inputCpy.solveFor == 0) {
      inputCpy.isentropicEfficiency = 100
      let idealResults: TurbineOutput = steamAddon.turbine(inputCpy);
      results.outletIdealPressure = idealResults.outletPressure;
      results.outletIdealQuality = idealResults.outletQuality;
      results.outletIdealSpecificEnthalpy = idealResults.outletSpecificEnthalpy;
      results.outletIdealSpecificEntropy = idealResults.outletSpecificEntropy;
      results.outletIdealTemperature = idealResults.outletTemperature;
      results.outletIdealVolume = idealResults.outletVolume;
    } else {
      let inletSpecificEntropy = results.inletSpecificEntropy
      let idealOutletInput: SteamPropertiesInput = {
        thermodynamicQuantity: 2,
        pressure: inputCpy.outletSteamPressure,
        quantityValue: inletSpecificEntropy
      }
      let idealOutletResults: SteamPropertiesOutput = steamAddon.steamProperties(idealOutletInput);
      results.outletIdealPressure = idealOutletResults.pressure;
      results.outletIdealQuality = results.outletQuality;
      results.outletIdealSpecificEnthalpy = idealOutletResults.specificEnthalpy;
      results.outletIdealSpecificEntropy = idealOutletResults.specificEntropy;
      results.outletIdealTemperature = idealOutletResults.temperature;
      results.outletIdealVolume = idealOutletResults.specificVolume;
    }

    //convert results and return
    results = this.convertSteamService.convertTurbineOutput(results, settings);
    return results;
  }

  steamModeler(inputData: SSMTInputs, settings: Settings): SSMTOutput {
    let convertedInputData: SSMTInputs = this.convertSteamService.convertInputData(JSON.parse(JSON.stringify(inputData)), settings);
    let outputData: SSMTOutput = steamAddon.steamModeler(convertedInputData);
    outputData = this.convertSteamService.convertSsmtOutput(outputData, settings);
    return outputData;
  }
}
