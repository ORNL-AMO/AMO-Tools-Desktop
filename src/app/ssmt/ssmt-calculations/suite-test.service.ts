import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { SSMTInputs, BoilerInput, HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure, OperationsInput, CondensingTurbine, PressureTurbine, TurbineInput, SSMT } from '../../shared/models/steam/ssmt';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class SuiteTestService {

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  calculateModel(inputData: SSMTInputs, settings: Settings): SSMTOutput {
    console.log('CALCULATE RESULTSSSS')
    let inputCpy: SSMTInputs = JSON.parse(JSON.stringify(inputData));
    let convertedInputData: SSMTInputs = this.convertInputData(inputCpy, settings);
    let setupInputData: SSMTInputs = this.setupInputData(convertedInputData);
    let results = this.steamService.steamModeler(setupInputData, settings);
    return results;
  }

  test() {
    // let results = this.steamService.steamModeler(AT1);
    // console.log(results);
    return;
  }

  setupInputData(inputData: SSMTInputs): SSMTInputs {
    inputData.turbineInput = this.setupTurbineInput(inputData.turbineInput);
    inputData.headerInput = this.setupHeaderInput(inputData.headerInput);
    return inputData;
  }

  setupTurbineInput(turbineInput: TurbineInput): TurbineInput {
    if (turbineInput.condensingTurbine.useTurbine == false) {
      turbineInput.condensingTurbine = {
        isentropicEfficiency: null,
        generationEfficiency: null,
        condenserPressure: null,
        operationType: null,
        operationValue: null,
        useTurbine: false
      }
    }
    turbineInput.highToLowTurbine = this.setupPressureTurbine(turbineInput.highToLowTurbine);
    turbineInput.highToMediumTurbine = this.setupPressureTurbine(turbineInput.highToMediumTurbine);
    turbineInput.mediumToLowTurbine = this.setupPressureTurbine(turbineInput.mediumToLowTurbine);
    return turbineInput;
  }

  setupPressureTurbine(turbine: PressureTurbine): PressureTurbine {
    if (turbine.useTurbine == false) {
      turbine = {
        isentropicEfficiency: null,
        generationEfficiency: null,
        operationType: null,
        operationValue1: null,
        operationValue2: null,
        useTurbine: false
      }
    }
    return turbine;
  }

  setupHeaderInput(headerInput: HeaderInput): HeaderInput {
    if (headerInput.numberOfHeaders == 1) {
      headerInput.mediumPressureHeader = null;
      headerInput.lowPressureHeader = null;
    } else if (headerInput.numberOfHeaders == 2) {
      headerInput.mediumPressureHeader = null;
    }
    return headerInput;
  }

  convertInputData(inputData: SSMTInputs, settings: Settings): SSMTInputs {
    inputData.turbineInput = this.convertTurbineInputData(inputData.turbineInput, settings);
    inputData.boilerInput = this.convertBoilerInputData(inputData.boilerInput, settings);
    inputData.headerInput = this.convertHeaderInputData(inputData.headerInput, settings);
    inputData.operationsInput = this.convertOperationsData(inputData.operationsInput, settings);
    return inputData;
  }

  convertTurbineInputData(turbineInput: TurbineInput, settings: Settings): TurbineInput {
    if (turbineInput.condensingTurbine.useTurbine == true) {
      turbineInput.condensingTurbine = this.convertCondensingTurbine(turbineInput.condensingTurbine, settings);
    }
    if (turbineInput.highToLowTurbine.useTurbine == true) {
      turbineInput.highToLowTurbine = this.convertPressureTurbine(turbineInput.highToLowTurbine, settings);
    }
    if (turbineInput.highToMediumTurbine.useTurbine == true) {
      turbineInput.highToMediumTurbine = this.convertPressureTurbine(turbineInput.highToMediumTurbine, settings);
    }
    if (turbineInput.mediumToLowTurbine.useTurbine == true) {
      turbineInput.mediumToLowTurbine = this.convertPressureTurbine(turbineInput.mediumToLowTurbine, settings);
    }
    return turbineInput;
  }

  convertPressureTurbine(turbine: PressureTurbine, settings: Settings): PressureTurbine {
    //2 = balance header no conversion
    if (turbine.operationType == 0) {
      //steam flow (mass flow)
      turbine.operationValue1 = this.convertSteamMassFlowInput(turbine.operationValue1, settings);
    } else if (turbine.operationType == 1) {
      //power generation (power)
      turbine.operationValue1 = this.convertSteamPowerInput(turbine.operationValue1, settings);
    } else if (turbine.operationType == 3) {
      //power range (power)
      turbine.operationValue1 = this.convertSteamPowerInput(turbine.operationValue1, settings);
      turbine.operationValue2 = this.convertSteamPowerInput(turbine.operationValue2, settings);

    } else if (turbine.operationType == 4) {
      //flow range (mass flow)
      turbine.operationValue1 = this.convertSteamMassFlowInput(turbine.operationValue1, settings);
      turbine.operationValue2 = this.convertSteamMassFlowInput(turbine.operationValue2, settings);
    }
    return turbine;
  }

  convertCondensingTurbine(turbine: CondensingTurbine, settings: Settings): CondensingTurbine {
    turbine.condenserPressure = this.convertUnitsService.value(turbine.condenserPressure).from(settings.steamVacuumPressure).to('MPaa');
    if (turbine.operationType == 0) {
      //steam flow (mass flow)
      turbine.operationValue = this.convertSteamMassFlowInput(turbine.operationValue, settings);
    } else if (turbine.operationType == 1) {
      //power generation (power)
      turbine.operationValue = this.convertSteamPowerInput(turbine.operationValue, settings);
    }
    return turbine;
  }

  convertBoilerInputData(boilerInput: BoilerInput, settings: Settings): BoilerInput {
    boilerInput.steamTemperature = this.convertSteamTemperatureInput(boilerInput.steamTemperature, settings);
    boilerInput.deaeratorPressure = this.convertSteamPressureInput(boilerInput.deaeratorPressure, settings);
    boilerInput.approachTemperature = this.convertSteamTemperatureInput(boilerInput.approachTemperature, settings);
    return boilerInput;
  }

  convertHeaderInputData(headerInput: HeaderInput, settings: Settings): HeaderInput {
    headerInput.highPressureHeader = this.convertWithHighPressureHeader(headerInput.highPressureHeader, settings);
    if (headerInput.numberOfHeaders > 1) {
      headerInput.lowPressureHeader = this.convertNotHighestPressureHeader(headerInput.lowPressureHeader, settings);
    }
    if (headerInput.numberOfHeaders == 3) {
      headerInput.mediumPressureHeader = this.convertNotHighestPressureHeader(headerInput.mediumPressureHeader, settings);
    }
    return headerInput;
  }

  convertWithHighPressureHeader(header: HeaderWithHighestPressure, settings: Settings): HeaderWithHighestPressure {
    header.pressure = this.convertSteamPressureInput(header.pressure, settings);
    header.processSteamUsage = this.convertSteamMassFlowInput(header.processSteamUsage, settings);
    header.condensateReturnTemperature = this.convertSteamTemperatureInput(header.condensateReturnTemperature, settings);
    return header;
  }

  convertNotHighestPressureHeader(header: HeaderNotHighestPressure, settings: Settings): HeaderNotHighestPressure {
    header.pressure = this.convertSteamPressureInput(header.pressure, settings);
    header.processSteamUsage = this.convertSteamMassFlowInput(header.processSteamUsage, settings);
    header.desuperheatSteamTemperature = this.convertSteamTemperatureInput(header.desuperheatSteamTemperature, settings);
    return header;
  }

  convertOperationsData(operationsInput: OperationsInput, settings: Settings): OperationsInput {
    operationsInput.makeUpWaterTemperature = this.convertSteamTemperatureInput(operationsInput.makeUpWaterTemperature, settings);
    operationsInput.sitePowerImport = this.convertSteamPowerInput(operationsInput.sitePowerImport, settings);
    return operationsInput;
  }
  //PRESSURE
  convertSteamPressureInput(val: number, settings: Settings): number {
    let tmpPressure: number = this.convertUnitsService.value(val).from(settings.steamPressureMeasurement).to('MPaa');
    return tmpPressure;
  }
  //TEMPERATURE
  convertSteamTemperatureInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamTemperatureMeasurement).to('C') + 273.15;
  }
  //MASS FLOW
  convertSteamMassFlowInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamMassFlowMeasurement).to('kg');
  }
  //POWER
  convertSteamPowerInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamPowerMeasurement).to('kJh');
  }
}

export const AT1 = {
  "isBaselineCalc": "TRUE",
  "baselinePowerDemand": "1",
  "boilerInput": {
    "fuelType": null,
    "fuel": null,
    "combustionEfficiency": 85,
    "blowdownRate": 2,
    "blowdownFlashed": "No",
    "preheatMakeupWater": "No",
    "steamTemperature": 514.2,
    "deaeratorVentRate": 0.1,
    "deaeratorPressure": 0.204747,
    "approachTemperature": 10
  },
  "headerInput": {
    "highPressureHeader": {
      "pressure": 1.136,
      "processSteamUsage": 22680,
      "condensationRecoveryRate": 50,
      "heatLoss": 0.1,
      "desuperheatSteamIntoNextHighest": "",
      "desuperheatSteamTemperature": null,
      "condensateReturnTemperature": 338.7,
      "flashCondensateReturn": "FALSE"
    },
    "mediumPressureHeader": null,
    "lowPressureHeader": null
  },
  "operationsInput": {
    "sitePowerImport": 18000000,
    "makeUpWaterTemperature": 283.15,
    "operatingHoursPerYear": 8000,
    "fuelCosts": 0.000005478,
    "electricityCosts": 0.0000139,
    "makeUpWaterCosts": 0.66
  },
  "turbineInput": {
    "highToLowTurbine": {
      "isentropicEfficiency": null,
      "generationEfficiency": null,
      "operationType": null,
      "operationValue1": null,
      "operationValue2": null,
      "useTurbine": ""
    },
    "highToMediumTurbine": {
      "isentropicEfficiency": null,
      "generationEfficiency": null,
      "operationType": null,
      "operationValue1": null,
      "operationValue2": null,
      "useTurbine": ""
    },
    "mediumToLowTurbine": {
      "isentropicEfficiency": null,
      "generationEfficiency": null,
      "operationType": null,
      "operationValue1": null,
      "operationValue2": null,
      "useTurbine": ""
    },
    "condensingTurbine": {
      "isentropicEfficiency": null,
      "generationEfficiency": null,
      "condenserPressure": null,
      "operationType": null,
      "operationValue": null,
      "useTurbine": ""
    }
  }
}


//everything on with tweaks
// {
//   "isBaselineCalc": "TRUE",
//   "baselinePowerDemand": "1",
//   "boilerInput": {
//     "fuelType": null,
//     "fuel": null,
//     "combustionEfficiency": 85,
//     "blowdownRate": 2,
//     "blowdownFlashed": "Yes",
//     "preheatMakeupWater": "Yes",
//     "steamTemperature": 644,
//     "deaeratorVentRate": 0.1,
//     "deaeratorPressure": 0.07,
//     "approachTemperature": 10
//   },
//   "headerInput": {
//     "highPressureHeader": {
//       "pressure": 2.2,
//       "processSteamUsage": 2270000,
//       "condensationRecoveryRate": 10,
//       "heatLoss": 0.1,
//       "desuperheatSteamIntoNextHighest": "TRUE",
//       "desuperheatSteamTemperature": 483.15,
//       "condensateReturnTemperature": 363,
//       "flashCondensateReturn": "TRUE"
//     },
//     "mediumPressureHeader": {
//       "pressure": 1.8,
//       "processSteamUsage": 2270000,
//       "condensationRecoveryRate": 10,
//       "heatLoss": 0.1,
//       "flashCondensateIntoHeader": "TRUE",
//       "desuperheatSteamIntoNextHighest": "TRUE",
//       "desuperheatSteamTemperature": 483.15,
//       "flashCondensateReturn": null
//     },
//     "lowPressureHeader": {
//       "pressure": 1.5,
//       "processSteamUsage": 2270000,
//       "condensationRecoveryRate": 10,
//       "heatLoss": 0.1,
//       "flashCondensateIntoHeader": "TRUE",
//       "desuperheatSteamIntoNextHighest": "TRUE",
//       "desuperheatSteamTemperature": 472,
//       "flashCondensateReturn": null
//     }
//   },
//   "operationsInput": {
//     "sitePowerImport": 3600000,
//     "makeUpWaterTemperature": 283.15,
//     "operatingHoursPerYear": 8000,
//     "fuelCosts": 0.0000028,
//     "electricityCosts": 0.0000139,
//     "makeUpWaterCosts": 132
//   },
//   "turbineInput": {
//     "highToLowTurbine": {
//       "isentropicEfficiency": 65,
//       "generationEfficiency": 98,
//       "operationType": 0,
//       "operationValue1": 45000,
//       "operationValue2": null,
//       "useTurbine": "TRUE"
//     },
//     "highToMediumTurbine": {
//       "isentropicEfficiency": 65,
//       "generationEfficiency": 98,
//       "operationType": 3,
//       "operationValue1": 800,
//       "operationValue2": 900,
//       "useTurbine": "TRUE"
//     },
//     "mediumToLowTurbine": {
//       "isentropicEfficiency": 30,
//       "generationEfficiency": 98,
//       "operationType": 4,
//       "operationValue1": 40000,
//       "operationValue2": 46000,
//       "useTurbine": "TRUE"
//     },
//     "condensingTurbine": {
//       "isentropicEfficiency": 65,
//       "generationEfficiency": 98,
//       "condenserPressure": 0.1,
//       "operationType": 1,
//       "operationValue": 5100,
//       "useTurbine": "TRUE"
//     }
//   }
// }

































    // {
//   "isBaselineCalc": "TRUE",
//   "baselinePowerDemand": "1",
//   "boilerInput": {
//     "fuelType": null,
//     "fuel": null,
//     "combustionEfficiency": 85,
//     "blowdownRate": 2,
//     "blowdownFlashed": "No",
//     "preheatMakeupWater": "No",
//     "steamTemperature": 514.2,
//     "deaeratorVentRate": 0.1,
//     "deaeratorPressure": 0.204747,
//     "approachTemperature": 10
//   },
//   "headerInput": {
//     "highPressureHeader": {
//       "pressure": 1.136,
//       "processSteamUsage": 22680,
//       "condensationRecoveryRate": 50,
//       "heatLoss": 0.1,
//       "desuperheatSteamIntoNextHighest": "",
//       "desuperheatSteamTemperature": null,
//       "condensateReturnTemperature": 338.7,
//       "flashCondensateReturn": "FALSE"
//     },
//     "mediumPressureHeader": null,
//     "lowPressureHeader": null
//   },
//   "operationsInput": {
//     "sitePowerImport": 18000000,
//     "makeUpWaterTemperature": 283.15,
//     "operatingHoursPerYear": 8000,
//     "fuelCosts": 0.000005478,
//     "electricityCosts": 0.0000139,
//     "makeUpWaterCosts": 0.66
//   },
//   "turbineInput": {
//     "highToLowTurbine": {
//       "isentropicEfficiency": null,
//       "generationEfficiency": null,
//       "operationType": null,
//       "operationValue1": null,
//       "operationValue2": null,
//       "useTurbine": "FALSE"
//     },
//     "highToMediumTurbine": {
//       "isentropicEfficiency": null,
//       "generationEfficiency": null,
//       "operationType": null,
//       "operationValue1": null,
//       "operationValue2": null,
//       "useTurbine": "FALSE"
//     },
//     "mediumToLowTurbine": {
//       "isentropicEfficiency": null,
//       "generationEfficiency": null,
//       "operationType": null,
//       "operationValue1": null,
//       "operationValue2": null,
//       "useTurbine": "FALSE"
//     },
//     "condensingTurbine": {
//       "isentropicEfficiency": null,
//       "generationEfficiency": null,
//       "condenserPressure": null,
//       "operationType": null,
//       "operationValue": null,
//       "useTurbine": "FALSE"
//     }
//   }
// }

