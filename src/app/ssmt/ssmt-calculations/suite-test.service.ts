import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { SSMTInputs, BoilerInput, HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure, OperationsInput, CondensingTurbine, PressureTurbine, TurbineInput, SSMT } from '../../shared/models/steam/ssmt';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class SuiteTestService {

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }


  calculateModel(inputData: SSMTInputs, settings: Settings) {
    // let inputCpy: SSMTInputs = JSON.parse(JSON.stringify(inputData));
    // let convertedInputData: SSMTInputs = this.convertInputData(inputCpy, settings);
    // console.log(convertedInputData);
    debugger
    // let input = this.getModelerInputs();
    let results = this.steamService.steamModeler(AT1);
    console.log(results);
  }

  test(){
    debugger
    let results = this.steamService.steamModeler(AT1);
    console.log(results);
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
      turbineInput.highToLowTurbine = this.convertPressureTurbine(turbineInput.condensingTurbine, settings);
    }
    if (turbineInput.highToMediumTurbine.useTurbine == true) {
      turbineInput.highToMediumTurbine = this.convertPressureTurbine(turbineInput.condensingTurbine, settings);
    }
    if (turbineInput.mediumToLowTurbine.useTurbine == true) {
      turbineInput.mediumToLowTurbine = this.convertPressureTurbine(turbineInput.condensingTurbine, settings);
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

  // testSuite() {
  //   let inputData = this.makeSteamModelerInput();
  //   let results = this.steamService.steamModeler(inputData);
  //   console.log(results);
  //   let str = JSON.stringify(results);
  //   console.log(str);
  // }

  //   makeSteamModelerInput(): SSMTInputs {
  //     // Values that work for SteamSystemModelerTool::regionSelect()
  //     var temperature = 594.65;

  //     var boilerInput: BoilerInput = {
  //       fuelType: 1,
  //       fuel: 1,
  //       combustionEfficiency: 1,
  //       blowdownRate: 1,
  //       //changed from 1 -> boolean
  //       blowdownFlashed: false,
  //       //changed from 1 -> boolean
  //       preheatMakeupWater: false,
  //       steamTemperature: temperature,
  //       deaeratorVentRate: 1,
  //       deaeratorPressure: 1,
  //       approachTemperature: 1,
  //     };

  //     var header1: HeaderWithHighestPressure = {
  //       pressure: 1,
  //       processSteamUsage: 1,
  //       condensationRecoveryRate: 1,
  //       heatLoss: 1,

  //       //had to hide for HeaderWithHighestPressure
  //       // flashCondensateIntoHeader: true,
  //       // desuperheatSteamIntoNextHighest: true,
  //       // desuperheatSteamTemperature: 1,

  //       condensateReturnTemperature: temperature,
  //       flashCondensateReturn: true,
  //     };
  //     var header2: HeaderNotHighestPressure = {
  //       pressure: 2,
  //       processSteamUsage: 2,
  //       condensationRecoveryRate: 2,
  //       heatLoss: 2,

  //       flashCondensateIntoHeader: true,
  //       desuperheatSteamIntoNextHighest: true,
  //       desuperheatSteamTemperature: temperature,

  //       //had to hide for HeaderNotHighestPressure
  //       // condensateReturnTemperature: null,
  //       // flashCondensateReturn: null,
  //     };
  //     var header3: HeaderNotHighestPressure = {
  //       pressure: 3,
  //       processSteamUsage: 3,
  //       condensationRecoveryRate: 3,
  //       heatLoss: 3,

  //       flashCondensateIntoHeader: true,
  //       desuperheatSteamIntoNextHighest: true,
  //       desuperheatSteamTemperature: temperature,

  //       //had to hide for HeaderNotHighestPressure
  //       // condensateReturnTemperature: null,
  //       // flashCondensateReturn: null,
  //     };
  //     var headerInput: HeaderInput = {
  //       //added numberOfHeaders?? (not in suite)
  //       numberOfHeaders: 3,
  //       //highPressureHeader (suite) => highPressure (desktop)
  //       highPressureHeader: header1,
  //       mediumPressureHeader: header2,
  //       lowPressureHeader: header3
  //     }

  //     var operationsInput: OperationsInput = {
  //       sitePowerImport: 1,
  //       makeUpWaterTemperature: temperature,
  //       operatingHoursPerYear: 1,
  //       fuelCosts: 1,
  //       electricityCosts: 1,
  //       makeUpWaterCosts: 1,
  //     };

  //     var condensingTurbine: CondensingTurbine = {
  //       isentropicEfficiency: 1,
  //       generationEfficiency: 1,
  //       condenserPressure: 1,
  //       operationType: 1,
  //       operationValue: 1,
  //       useTurbine: true,
  //     };
  //     var highToLowTurbine: PressureTurbine = {
  //       isentropicEfficiency: 2,
  //       generationEfficiency: 2,
  //       //not needed in pressure turbine
  //       // condenserPressure: 2,
  //       operationType: 2,
  //       operationValue1: 2,
  //       operationValue2: 2,
  //       useTurbine: true,
  //     };
  //     var highToMediumTurbine: PressureTurbine = {
  //       isentropicEfficiency: 3,
  //       generationEfficiency: 3,
  //       //not needed in pressure turbine
  //       //condenserPressure: 3,
  //       operationType: 3,
  //       operationValue1: 3,
  //       operationValue2: 3,
  //       useTurbine: true,
  //     };
  //     var mediumToLowTurbine: PressureTurbine = {
  //       isentropicEfficiency: 4,
  //       generationEfficiency: 4,
  //       //not needed in pressure turbine
  //       //condenserPressure: 4,
  //       operationType: 4,
  //       operationValue1: 4,
  //       operationValue2: 4,
  //       useTurbine: true,
  //     };
  //     var turbineInput: TurbineInput = {
  //       condensingTurbine: condensingTurbine,
  //       highToLowTurbine: highToLowTurbine,
  //       highToMediumTurbine: highToMediumTurbine,
  //       mediumToLowTurbine: mediumToLowTurbine,
  //     };

  //     var steamModelerInput: SSMTInputs = {
  //       //added to desktop models
  //       isBaselineCalc: true,
  //       baselinePowerDemand: 1,
  //       boilerInput: boilerInput,
  //       headerInput: headerInput,
  //       operationsInput: operationsInput,
  //       turbineInput: turbineInput,
  //     };

  //     return steamModelerInput;
  //   }


  //   //modeler inputs
  //   getModelerInputs() {
  //     var temperature = 594.65;

  //     var boilerInput = {
  //       fuelType: 1,
  //       fuel: 1,
  //       combustionEfficiency: 1,
  //       blowdownRate: 1,
  //       blowdownFlashed: 1,
  //       preheatMakeupWater: 1,
  //       steamTemperature: temperature,
  //       deaeratorVentRate: 1,
  //       deaeratorPressure: 1,
  //       approachTemperature: 1,
  //     };

  //     var header1 = {
  //       pressure: 1,
  //       processSteamUsage: 1,
  //       condensationRecoveryRate: 1,
  //       heatLoss: 1,

  //       flashCondensateIntoHeader: true,
  //       desuperheatSteamIntoNextHighest: true,
  //       desuperheatSteamTemperature: 1,

  //       condensateReturnTemperature: temperature,
  //       flashCondensateReturn: true,
  //     };
  //     var header2 = {
  //       pressure: 2,
  //       processSteamUsage: 2,
  //       condensationRecoveryRate: 2,
  //       heatLoss: 2,

  //       flashCondensateIntoHeader: true,
  //       desuperheatSteamIntoNextHighest: true,
  //       desuperheatSteamTemperature: temperature,

  //       condensateReturnTemperature: null,
  //       flashCondensateReturn: null,
  //     };
  //     var header3 = {
  //       pressure: 3,
  //       processSteamUsage: 3,
  //       condensationRecoveryRate: 3,
  //       heatLoss: 3,

  //       flashCondensateIntoHeader: true,
  //       desuperheatSteamIntoNextHighest: true,
  //       desuperheatSteamTemperature: temperature,

  //       condensateReturnTemperature: null,
  //       flashCondensateReturn: null,
  //     };
  //     var headerInput = {
  //       highPressureHeader: header1,
  //       // TODO try mediumPressureHeader: null,
  //       mediumPressureHeader: header2,
  //       lowPressureHeader: header3,
  //     }

  //     var operationsInput = {
  //       sitePowerImport: 1,
  //       makeUpWaterTemperature: temperature,
  //       operatingHoursPerYear: 1,
  //       fuelCosts: 1,
  //       electricityCosts: 1,
  //       makeUpWaterCosts: 1,
  //     };

  //     var condensingTurbine = {
  //       isentropicEfficiency: 1,
  //       generationEfficiency: 1,
  //       condenserPressure: 1,
  //       operationType: 1,
  //       operationValue: 1,
  //       useTurbine: true,
  //     };
  //     var highToLowTurbine = {
  //       isentropicEfficiency: 2,
  //       generationEfficiency: 2,
  //       condenserPressure: 2,
  //       operationType: 2,
  //       operationValue1: 2,
  //       operationValue2: 2,
  //       useTurbine: true,
  //     };
  //     var highToMediumTurbine = {
  //       isentropicEfficiency: 3,
  //       generationEfficiency: 3,
  //       condenserPressure: 3,
  //       operationType: 3,
  //       operationValue1: 3,
  //       operationValue2: 3,
  //       useTurbine: true,
  //     };
  //     var mediumToLowTurbine = {
  //       isentropicEfficiency: 4,
  //       generationEfficiency: 4,
  //       condenserPressure: 4,
  //       operationType: 4,
  //       operationValue1: 4,
  //       operationValue2: 4,
  //       useTurbine: true,
  //     };
  //     var turbineInput = {
  //       condensingTurbine: condensingTurbine,
  //       highToLowTurbine: highToLowTurbine,
  //       highToMediumTurbine: highToMediumTurbine,
  //       mediumToLowTurbine: mediumToLowTurbine,
  //     };

  //     var steamModelerInput = {
  //       isBaselineCalc: true,
  //       baselinePowerDemand: 1,
  //       boilerInput: boilerInput,
  //       headerInput: headerInput,
  //       operationsInput: operationsInput,
  //       turbineInput: turbineInput,
  //     };

  //     return steamModelerInput;
  //   }

  //   getSampleOutputData(): SSMTOutput {
  //     let returnData: SSMTOutput = {
  //       //"missing" but not needed fields from return object
  //       blowdownFlashTank: undefined,
  //       heatExchangerOutput: undefined,
  //       //===
  //       //missing and needed
  //       highPressureSteamHeatLoss: undefined,
  //       mediumPressureSteamHeatLoss: undefined,
  //       lowPressureSteamHeatLoss: undefined,
  //       highPressureCondensate: undefined,
  //       lowPressureCondensate: undefined,
  //       mediumPressureCondensate: undefined,
  //       combinedCondensate: undefined,
  //       returnCondensate: undefined,
  //       mediumPressureProcessUsage: undefined,
  //       lowPressureProcessUsage: undefined,
  //       //===

  //       operationsOutput: {
  //         powerGenerated: null,
  //         boilerFuelCost: 1400.945054970803,
  //         makeupWaterCost: null,
  //         totalOperatingCost: null,
  //         powerGenerationCost: 1,
  //         boilerFuelUsage: 1400.945054970803,
  //         sitePowerImport: null,
  //         sitePowerDemand: 1,
  //         makeupWaterVolumeFlow: null,
  //         makeupWaterVolumeFlowAnnual: null
  //       },
  //       boilerOutput: {
  //         steamPressure: 1,
  //         steamTemperature: 594.65,
  //         steamSpecificEnthalpy: 3097.591269286749,
  //         steamSpecificEntropy: 7.203311626195247,
  //         steamQuality: 1,
  //         steamVolume: 0.26858473001463523,
  //         steamMassFlow: 6,
  //         steamEnergyFlow: 18.585547615720493,
  //         blowdownPressure: 1,
  //         blowdownTemperature: 453.0356323914666,
  //         blowdownSpecificEnthalpy: 762.6828443354106,
  //         blowdownSpecificEntropy: 2.138431350899127,
  //         blowdownQuality: 0,
  //         blowdownVolume: 0.0011272337454016697,
  //         blowdownMassFlow: 0.06060606060606061,
  //         blowdownEnergyFlow: 0.046223202686994584,
  //         feedwaterPressure: 1,
  //         feedwaterTemperature: 453.0356323914666,
  //         feedwaterSpecificEnthalpy: 762.6828443354106,
  //         feedwaterSpecificEntropy: 2.138431350899127,
  //         feedwaterQuality: 0,
  //         feedwaterVolume: 0.0011272337454016697,
  //         feedwaterMassFlow: 6.0606060606060606,
  //         feedwaterEnergyFlow: 4.6223202686994584,
  //         boilerEnergy: 14.009450549708031,
  //         fuelEnergy: 1400.945054970803,
  //         blowdownRate: 1,
  //         combustionEff: 1
  //       },
  //       deaeratorOutput: {
  //         feedwaterPressure: 1,
  //         feedwaterTemperature: 453.0356323914666,
  //         feedwaterSpecificEnthalpy: 762.6828443354106,
  //         feedwaterSpecificEntropy: 2.138431350899127,
  //         feedwaterQuality: 0,
  //         feedwaterVolume: 0.0011272337454016697,
  //         feedwaterMassFlow: 6.0606060606060606,
  //         feedwaterEnergyFlow: 4.6223202686994584,
  //         inletSteamPressure: 3,
  //         inletSteamTemperature: null,
  //         inletSteamSpecificEnthalpy: null,
  //         inletSteamSpecificEntropy: null,
  //         inletSteamQuality: 1,
  //         inletSteamVolume: null,
  //         inletSteamMassFlow: null,
  //         inletSteamEnergyFlow: null,
  //         inletWaterPressure: 1,
  //         inletWaterTemperature: null,
  //         inletWaterSpecificEnthalpy: null,
  //         inletWaterSpecificEntropy: null,
  //         inletWaterQuality: 1,
  //         inletWaterVolume: null,
  //         inletWaterMassFlow: null,
  //         inletWaterEnergyFlow: null,
  //         ventedSteamPressure: 1,
  //         ventedSteamTemperature: 453.0356323914666,
  //         ventedSteamSpecificEnthalpy: 2777.119537684662,
  //         ventedSteamSpecificEntropy: 6.58497899635217,
  //         ventedSteamQuality: 1,
  //         ventedSteamVolume: 0.1943488843273919,
  //         ventedSteamMassFlow: 0.06060606060606061,
  //         ventedSteamEnergyFlow: 0.16831027501119167
  //       },

  //       //highPressureHeaderSteam (suite) = highPressureHeader (desktop)
  //       highPressureHeaderSteam: {
  //         pressure: 1,
  //         temperature: 580.1234225018829,
  //         specificEnthalpy: 3066.6153565938807,
  //         specificEntropy: 7.15057345079214,
  //         quality: 1,
  //         specificVolume: 0.2614316289018167,
  //         massFlow: 6,
  //         energyFlow: 18.39969213956329
  //       },
  //       makeupWater: {
  //         pressure: 0.101325,
  //         temperature: 594.65,
  //         specificEnthalpy: 3117.892094706779,
  //         specificEntropy: 8.28531521009353,
  //         quality: 1,
  //         specificVolume: 2.70283810748784,
  //         massFlow: null,
  //         energyFlow: null
  //       },
  //       //makeupWaterAndCondensate (suite) = makeupWaterAndCondensateHeader (desktop)
  //       makeupWaterAndCondensate: {
  //         pressure: 1,
  //         temperature: null,
  //         specificEnthalpy: null,
  //         specificEntropy: null,
  //         quality: 1,
  //         specificVolume: null,
  //         massFlow: null,
  //         energyFlow: null
  //       },
  //       //highPressureProcessSteamUsage (suite) = highPressureProcessUsage (desktop)
  //       highPressureProcessSteamUsage: {
  //         energyFlow: 3.0666153565938807,
  //         massFlow: 1,
  //         temperature: 580.1234225018829,
  //         pressure: 1,
  //         processUsage: 2303.93251225847
  //       },
  //       condensingTurbine: {
  //         energyOut: 100,
  //         generatorEfficiency: 1,
  //         inletEnergyFlow: null,
  //         inletPressure: 1,
  //         inletQuality: 1,
  //         inletVolume: 0.2614316289018166,
  //         inletSpecificEnthalpy: 3066.6153565938803,
  //         inletSpecificEntropy: 7.150573450792138,
  //         inletTemperature: 580.1234225018827,
  //         isentropicEfficiency: 1,
  //         massFlow: null,
  //         outletEnergyFlow: null,
  //         outletPressure: 1,
  //         outletQuality: 1,
  //         outletVolume: 0.2614316289018164,
  //         outletSpecificEnthalpy: 3066.6153565938794,
  //         outletSpecificEntropy: 7.150573450792138,
  //         outletTemperature: 580.1234225018824,
  //         powerOut: 1,
  //         outletIdealPressure: 0,
  //         outletIdealTemperature: 0,
  //         outletIdealSpecificEnthalpy: 0,
  //         outletIdealSpecificEntropy: 0,
  //         outletIdealQuality: 0,
  //         outletIdealVolume: 0
  //       },
  //       highPressureToMediumPressureTurbine: {
  //         energyOut: null,
  //         generatorEfficiency: 3,
  //         inletEnergyFlow: null,
  //         inletPressure: 1,
  //         inletQuality: 1,
  //         inletVolume: 0.2614316289018166,
  //         inletSpecificEnthalpy: 3066.6153565938803,
  //         inletSpecificEntropy: 7.150573450792138,
  //         inletTemperature: 580.1234225018827,
  //         isentropicEfficiency: 3,
  //         massFlow: null,
  //         outletEnergyFlow: null,
  //         outletPressure: 2,
  //         outletQuality: 1,
  //         outletVolume: 0.13108703537186225,
  //         outletSpecificEnthalpy: 3072.5022984189923,
  //         outletSpecificEntropy: 6.8511973594768545,
  //         outletTemperature: 594.1826776440801,
  //         powerOut: null,
  //         outletIdealPressure: 0,
  //         outletIdealTemperature: 0,
  //         outletIdealSpecificEnthalpy: 0,
  //         outletIdealSpecificEntropy: 0,
  //         outletIdealQuality: 0,
  //         outletIdealVolume: 0,
  //       },
  //       //highPressureToLowPressureTurbine (suite) = highToLowPressureTurbine (desktop)
  //       highPressureToLowPressureTurbine: {
  //         energyOut: null,
  //         generatorEfficiency: 2,
  //         inletEnergyFlow: null,
  //         inletPressure: 1,
  //         inletQuality: 1,
  //         inletVolume: 0.2614316289018166,
  //         inletSpecificEnthalpy: 3066.6153565938803,
  //         inletSpecificEntropy: 7.150573450792138,
  //         inletTemperature: 580.1234225018827,
  //         isentropicEfficiency: 2,
  //         massFlow: null,
  //         outletEnergyFlow: null,
  //         outletPressure: 3,
  //         outletQuality: 1,
  //         outletVolume: 0.08725170058188136,
  //         outletSpecificEnthalpy: 3073.1337776939336,
  //         outletSpecificEntropy: 6.675009627348627,
  //         outletTemperature: 605.0927309640643,
  //         powerOut: null,
  //         outletIdealPressure: 0,
  //         outletIdealTemperature: 0,
  //         outletIdealSpecificEnthalpy: 0,
  //         outletIdealSpecificEntropy: 0,
  //         outletIdealQuality: 0,
  //         outletIdealVolume: 0
  //       },
  //       //mediumPressureHeaderSteam (suite) = mediumPressureHeader (desktop)
  //       mediumPressureHeaderSteam: {
  //         pressure: 2,
  //         temperature: null,
  //         specificEnthalpy: null,
  //         specificEntropy: null,
  //         quality: 1,
  //         specificVolume: null,
  //         massFlow: null,
  //         energyFlow: null,
  //       },
  //       //mediumPressureToLowPressureTurbine (suite) = mediumToLowPressureTurbine (desktop)
  //       mediumPressureToLowPressureTurbine: {
  //         energyOut: null,
  //         generatorEfficiency: 4,
  //         inletEnergyFlow: null,
  //         inletPressure: 2,
  //         inletQuality: 1,
  //         inletVolume: null,
  //         inletSpecificEnthalpy: null,
  //         inletSpecificEntropy: null,
  //         inletTemperature: null,
  //         isentropicEfficiency: 4,
  //         massFlow: null,
  //         outletEnergyFlow: null,
  //         outletPressure: 3,
  //         outletQuality: 1,
  //         outletVolume: null,
  //         outletSpecificEnthalpy: null,
  //         outletSpecificEntropy: null,
  //         outletTemperature: null,
  //         powerOut: null,
  //         outletIdealPressure: 0,
  //         outletIdealTemperature: 0,
  //         outletIdealSpecificEnthalpy: 0,
  //         outletIdealSpecificEntropy: 0,
  //         outletIdealQuality: 0,
  //         outletIdealVolume: 0
  //       },
  //       //highPressureToMediumPressurePrv (suite) = highToMediumPressurePRV (desktop)
  //       highPressureToMediumPressurePrv: {
  //         feedwaterEnergyFlow: 0,
  //         feedwaterMassFlow: 0,
  //         feedwaterPressure: 0,
  //         feedwaterQuality: 0,
  //         feedwaterVolume: 0,
  //         feedwaterSpecificEnthalpy: 0,
  //         feedwaterSpecificEntropy: 0,
  //         feedwaterTemperature: 0,
  //         inletEnergyFlow: 0,
  //         inletMassFlow: 0,
  //         inletPressure: 0,
  //         inletQuality: 0,
  //         inletVolume: 0,
  //         inletSpecificEnthalpy: 0,
  //         inletSpecificEntropy: 0,
  //         inletTemperature: 0,
  //         outletEnergyFlow: 0,
  //         outletMassFlow: 0,
  //         outletPressure: 0,
  //         outletQuality: 0,
  //         outletVolume: 0,
  //         outletSpecificEnthalpy: 0,
  //         outletSpecificEntropy: 0,
  //         outletTemperature: 0
  //       },
  //       // blowdownFlashTank: {
  //       // },
  //       condensateFlashTank: {
  //         inletWaterPressure: 3,
  //         inletWaterTemperature: 594.6499999999997,
  //         inletWaterSpecificEnthalpy: 3047.848275216436,
  //         inletWaterSpecificEntropy: 6.632856088780828,
  //         inletWaterQuality: 1,
  //         inletWaterVolume: 0.08530239456844556,
  //         inletWaterMassFlow: 0.14,
  //         inletWaterEnergyFlow: 0.42669875853030104,
  //         outletGasPressure: 1,
  //         outletGasTemperature: 453.0356323914666,
  //         outletGasSpecificEnthalpy: 2777.119537684662,
  //         outletGasSpecificEntropy: 6.58497899635217,
  //         outletGasQuality: 1,
  //         outletGasVolume: 0.1943488843273919,
  //         outletGasMassFlow: 0.14,
  //         outletGasEnergyFlow: 0.3887967352758528,
  //         outletLiquidPressure: 1,
  //         outletLiquidTemperature: 453.0356323914666,
  //         outletLiquidSpecificEnthalpy: 762.6828443354106,
  //         outletLiquidSpecificEntropy: 2.138431350899127,
  //         outletLiquidQuality: 0,
  //         outletLiquidVolume: 0.0011272337454016697,
  //         outletLiquidMassFlow: 0,
  //         outletLiquidEnergyFlow: 0
  //       },
  //       highPressureCondensateFlashTank: {
  //         inletWaterPressure: 1,
  //         inletWaterTemperature: 453.0356323914666,
  //         inletWaterSpecificEnthalpy: 762.6828443354106,
  //         inletWaterSpecificEntropy: 2.138431350899127,
  //         inletWaterQuality: 0,
  //         inletWaterVolume: 0.0011272337454016697,
  //         inletWaterMassFlow: 0.01,
  //         inletWaterEnergyFlow: 0.0076268284433541065,
  //         outletGasPressure: 2,
  //         outletGasTemperature: 485.5345353184905,
  //         outletGasSpecificEnthalpy: 2798.384140241516,
  //         outletGasSpecificEntropy: 6.339164377128661,
  //         outletGasQuality: 1,
  //         outletGasVolume: 0.09958054416889665,
  //         outletGasMassFlow: 0,
  //         outletGasEnergyFlow: 0,
  //         outletLiquidPressure: 1,
  //         outletLiquidTemperature: 453.0356323914666,
  //         outletLiquidSpecificEnthalpy: 762.6828443354106,
  //         outletLiquidSpecificEntropy: 2.138431350899127,
  //         outletLiquidQuality: 0,
  //         outletLiquidVolume: 0.0011272337454016697,
  //         outletLiquidMassFlow: 0.01,
  //         outletLiquidEnergyFlow: 0.0076268284433541065,
  //       },
  //       mediumPressureCondensateFlashTank: {
  //         inletWaterPressure: 3,
  //         inletWaterTemperature: 479.0276501729469,
  //         inletWaterSpecificEnthalpy: 879.434049776248,
  //         inletWaterSpecificEntropy: 2.3840762829025266,
  //         inletWaterQuality: 0,
  //         inletWaterVolume: 0.0011645473179549442,
  //         inletWaterMassFlow: 0.05,
  //         inletWaterEnergyFlow: 0.0439717024888124,
  //         outletGasPressure: 3,
  //         outletGasTemperature: 507.0084450062522,
  //         outletGasSpecificEnthalpy: 2803.2647389701606,
  //         outletGasSpecificEntropy: 6.185787810829954,
  //         outletGasQuality: 1,
  //         outletGasVolume: 0.06666407913357607,
  //         outletGasMassFlow: 0,
  //         outletGasEnergyFlow: 0,
  //         outletLiquidPressure: 3,
  //         outletLiquidTemperature: 479.0276501729469,
  //         outletLiquidSpecificEnthalpy: 879.434049776248,
  //         outletLiquidSpecificEntropy: 2.3840762829025266,
  //         outletLiquidQuality: 0,
  //         outletLiquidVolume: 0.0011645473179549442,
  //         outletLiquidMassFlow: 0.05,
  //         outletLiquidEnergyFlow: 0.0439717024888124,
  //       },
  //       //lowPressureHeaderSteam (suite) = lowPressureHeader (desktop)
  //       lowPressureHeaderSteam: {
  //         pressure: 3,
  //         temperature: null,
  //         specificEnthalpy: null,
  //         specificEntropy: null,
  //         quality: 1,
  //         specificVolume: null,
  //         massFlow: null,
  //         energyFlow: null
  //       },
  //       //mediumPressureToLowPressurePrv (suite) = lowPressurePRV (desktop)
  //       //what is used for 2 header systems?
  //       mediumPressureToLowPressurePrv: {
  //         feedwaterEnergyFlow: 0,
  //         feedwaterMassFlow: 0,
  //         feedwaterPressure: 0,
  //         feedwaterQuality: 0,
  //         feedwaterVolume: 0,
  //         feedwaterSpecificEnthalpy: 0,
  //         feedwaterSpecificEntropy: 0,
  //         feedwaterTemperature: 0,
  //         inletEnergyFlow: 0,
  //         inletMassFlow: 0,
  //         inletPressure: 0,
  //         inletQuality: 0,
  //         inletVolume: 0,
  //         inletSpecificEnthalpy: 0,
  //         inletSpecificEntropy: 0,
  //         inletTemperature: 0,
  //         outletEnergyFlow: 0,
  //         outletMassFlow: 0,
  //         outletPressure: 0,
  //         outletQuality: 0,
  //         outletVolume: 0,
  //         outletSpecificEnthalpy: 0,
  //         outletSpecificEntropy: 0,
  //         outletTemperature: 0
  //       },
  //       //lowPressureVentedSteam (suite) = ventedLowPressureSteam (desktop)
  //       lowPressureVentedSteam: undefined
  //     }
  //     return returnData;
  //   }
  // }

  // //existing in suite
  // export const Data = {
  //   operationsOutput: {
  //     powerGenerated: null,
  //     boilerFuelCost: 1400.945054970803,
  //     makeupWaterCost: null,
  //     totalOperatingCost: null,
  //     powerGenerationCost: 1,
  //     boilerFuelUsage: 1400.945054970803,
  //     sitePowerImport: null,
  //     sitePowerDemand: 1,
  //     makeupWaterVolumeFlow: null,
  //     makeupWaterVolumeFlowAnnual: null
  //   },
  //   boilerOutput: {
  //     steamPressure: 1,
  //     steamTemperature: 594.65,
  //     steamSpecificEnthalpy: 3097.591269286749,
  //     steamSpecificEntropy: 7.203311626195247,
  //     steamQuality: 1,
  //     steamVolume: 0.26858473001463523,
  //     steamMassFlow: 6,
  //     steamEnergyFlow: 18.585547615720493,
  //     blowdownPressure: 1,
  //     blowdownTemperature: 453.0356323914666,
  //     blowdownSpecificEnthalpy: 762.6828443354106,
  //     blowdownSpecificEntropy: 2.138431350899127,
  //     blowdownQuality: 0,
  //     blowdownVolume: 0.0011272337454016697,
  //     blowdownMassFlow: 0.06060606060606061,
  //     blowdownEnergyFlow: 0.046223202686994584,
  //     feedwaterPressure: 1,
  //     feedwaterTemperature: 453.0356323914666,
  //     feedwaterSpecificEnthalpy: 762.6828443354106,
  //     feedwaterSpecificEntropy: 2.138431350899127,
  //     feedwaterQuality: 0,
  //     feedwaterVolume: 0.0011272337454016697,
  //     feedwaterMassFlow: 6.0606060606060606,
  //     feedwaterEnergyFlow: 4.6223202686994584,
  //     boilerEnergy: 14.009450549708031,
  //     fuelEnergy: 1400.945054970803,
  //     blowdownRate: 1,
  //     combustionEff: 1
  //   },
  //   deaeratorOutput: {
  //     feedwaterPressure: 1,
  //     feedwaterTemperature: 453.0356323914666,
  //     feedwaterSpecificEnthalpy: 762.6828443354106,
  //     feedwaterSpecificEntropy: 2.138431350899127,
  //     feedwaterQuality: 0,
  //     feedwaterVolume: 0.0011272337454016697,
  //     feedwaterMassFlow: 6.0606060606060606,
  //     feedwaterEnergyFlow: 4.6223202686994584,
  //     inletSteamPressure: 3,
  //     inletSteamTemperature: null,
  //     inletSteamSpecificEnthalpy: null,
  //     inletSteamSpecificEntropy: null,
  //     inletSteamQuality: 1,
  //     inletSteamVolume: null,
  //     inletSteamMassFlow: null,
  //     inletSteamEnergyFlow: null,
  //     inletWaterPressure: 1,
  //     inletWaterTemperature: null,
  //     inletWaterSpecificEnthalpy: null,
  //     inletWaterSpecificEntropy: null,
  //     inletWaterQuality: 1,
  //     inletWaterVolume: null,
  //     inletWaterMassFlow: null,
  //     inletWaterEnergyFlow: null,
  //     ventedSteamPressure: 1,
  //     ventedSteamTemperature: 453.0356323914666,
  //     ventedSteamSpecificEnthalpy: 2777.119537684662,
  //     ventedSteamSpecificEntropy: 6.58497899635217,
  //     ventedSteamQuality: 1,
  //     ventedSteamVolume: 0.1943488843273919,
  //     ventedSteamMassFlow: 0.06060606060606061,
  //     ventedSteamEnergyFlow: 0.16831027501119167
  //   },
  //   highPressureHeaderSteam: {
  //     pressure: 1,
  //     temperature: 580.1234225018829,
  //     specificEnthalpy: 3066.6153565938807,
  //     specificEntropy: 7.15057345079214,
  //     quality: 1,
  //     specificVolume: 0.2614316289018167,
  //     massFlow: 6,
  //     energyFlow: 18.39969213956329
  //   },
  //   makeupWater: {
  //     pressure: 0.101325,
  //     temperature: 594.65,
  //     specificEnthalpy: 3117.892094706779,
  //     specificEntropy: 8.28531521009353,
  //     quality: 1,
  //     specificVolume: 2.70283810748784,
  //     massFlow: null,
  //     energyFlow: null
  //   },
  //   makeupWaterAndCondensate: {
  //     pressure: 1,
  //     temperature: null,
  //     specificEnthalpy: null,
  //     specificEntropy: null,
  //     quality: 1,
  //     specificVolume: null,
  //     massFlow: null,
  //     energyFlow: null
  //   },
  //   highPressureProcessSteamUsage: {
  //     energyFlow: 3.0666153565938807,
  //     massFlow: 1,
  //     temperature: 580.1234225018829,
  //     pressure: 1,
  //     processUsage: 2303.93251225847
  //   },
  //   condensingTurbine: {
  //     energyOut: 100,
  //     generatorEfficiency: 1,
  //     inletEnergyFlow: null,
  //     inletPressure: 1,
  //     inletQuality: 1,
  //     inletVolume: 0.2614316289018166,
  //     inletSpecificEnthalpy: 3066.6153565938803,
  //     inletSpecificEntropy: 7.150573450792138,
  //     inletTemperature: 580.1234225018827,
  //     isentropicEfficiency: 1,
  //     massFlow: null,
  //     outletEnergyFlow: null,
  //     outletPressure: 1,
  //     outletQuality: 1,
  //     outletVolume: 0.2614316289018164,
  //     outletSpecificEnthalpy: 3066.6153565938794,
  //     outletSpecificEntropy: 7.150573450792138,
  //     outletTemperature: 580.1234225018824,
  //     powerOut: 1,
  //     outletIdealPressure: 0,
  //     outletIdealTemperature: 0,
  //     outletIdealSpecificEnthalpy: 0,
  //     outletIdealSpecificEntropy: 0,
  //     outletIdealQuality: 0,
  //     outletIdealVolume: 0
  //   },
  //   highPressureToMediumPressureTurbine: {
  //     energyOut: null,
  //     generatorEfficiency: 3,
  //     inletEnergyFlow: null,
  //     inletPressure: 1,
  //     inletQuality: 1,
  //     inletVolume: 0.2614316289018166,
  //     inletSpecificEnthalpy: 3066.6153565938803,
  //     inletSpecificEntropy: 7.150573450792138,
  //     inletTemperature: 580.1234225018827,
  //     isentropicEfficiency: 3,
  //     massFlow: null,
  //     outletEnergyFlow: null,
  //     outletPressure: 2,
  //     outletQuality: 1,
  //     outletVolume: 0.13108703537186225,
  //     outletSpecificEnthalpy: 3072.5022984189923,
  //     outletSpecificEntropy: 6.8511973594768545,
  //     outletTemperature: 594.1826776440801,
  //     powerOut: null,
  //     outletIdealPressure: 0,
  //     outletIdealTemperature: 0,
  //     outletIdealSpecificEnthalpy: 0,
  //     outletIdealSpecificEntropy: 0,
  //     outletIdealQuality: 0,
  //     outletIdealVolume: 0,
  //   },
  //   highPressureToLowPressureTurbine: {
  //     energyOut: null,
  //     generatorEfficiency: 2,
  //     inletEnergyFlow: null,
  //     inletPressure: 1,
  //     inletQuality: 1,
  //     inletVolume: 0.2614316289018166,
  //     inletSpecificEnthalpy: 3066.6153565938803,
  //     inletSpecificEntropy: 7.150573450792138,
  //     inletTemperature: 580.1234225018827,
  //     isentropicEfficiency: 2,
  //     massFlow: null,
  //     outletEnergyFlow: null,
  //     outletPressure: 3,
  //     outletQuality: 1,
  //     outletVolume: 0.08725170058188136,
  //     outletSpecificEnthalpy: 3073.1337776939336,
  //     outletSpecificEntropy: 6.675009627348627,
  //     outletTemperature: 605.0927309640643,
  //     powerOut: null,
  //     outletIdealPressure: 0,
  //     outletIdealTemperature: 0,
  //     outletIdealSpecificEnthalpy: 0,
  //     outletIdealSpecificEntropy: 0,
  //     outletIdealQuality: 0,
  //     outletIdealVolume: 0
  //   },
  //   mediumPressureHeaderSteam: {
  //     pressure: 2,
  //     temperature: null,
  //     specificEnthalpy: null,
  //     specificEntropy: null,
  //     quality: 1,
  //     specificVolume: null,
  //     massFlow: null,
  //     energyFlow: null,
  //   },
  //   mediumPressureToLowPressureTurbine: {
  //     energyOut: null,
  //     generatorEfficiency: 4,
  //     inletEnergyFlow: null,
  //     inletPressure: 2,
  //     inletQuality: 1,
  //     inletVolume: null,
  //     inletSpecificEnthalpy: null,
  //     inletSpecificEntropy: null,
  //     inletTemperature: null,
  //     isentropicEfficiency: 4,
  //     massFlow: null,
  //     outletEnergyFlow: null,
  //     outletPressure: 3,
  //     outletQuality: 1,
  //     outletVolume: null,
  //     outletSpecificEnthalpy: null,
  //     outletSpecificEntropy: null,
  //     outletTemperature: null,
  //     powerOut: null,
  //     outletIdealPressure: 0,
  //     outletIdealTemperature: 0,
  //     outletIdealSpecificEnthalpy: 0,
  //     outletIdealSpecificEntropy: 0,
  //     outletIdealQuality: 0,
  //     outletIdealVolume: 0
  //   },
  //   highPressureToMediumPressurePrv: {
  //     feedwaterEnergyFlow: 0,
  //     feedwaterMassFlow: 0,
  //     feedwaterPressure: 0,
  //     feedwaterQuality: 0,
  //     feedwaterVolume: 0,
  //     feedwaterSpecificEnthalpy: 0,
  //     feedwaterSpecificEntropy: 0,
  //     feedwaterTemperature: 0,
  //     inletEnergyFlow: 0,
  //     inletMassFlow: 0,
  //     inletPressure: 0,
  //     inletQuality: 0,
  //     inletVolume: 0,
  //     inletSpecificEnthalpy: 0,
  //     inletSpecificEntropy: 0,
  //     inletTemperature: 0,
  //     outletEnergyFlow: 0,
  //     outletMassFlow: 0,
  //     outletPressure: 0,
  //     outletQuality: 0,
  //     outletVolume: 0,
  //     outletSpecificEnthalpy: 0,
  //     outletSpecificEntropy: 0,
  //     outletTemperature: 0
  //   },
  //   // blowdownFlashTank: {
  //   // },
  //   condensateFlashTank: {
  //     inletWaterPressure: 3,
  //     inletWaterTemperature: 594.6499999999997,
  //     inletWaterSpecificEnthalpy: 3047.848275216436,
  //     inletWaterSpecificEntropy: 6.632856088780828,
  //     inletWaterQuality: 1,
  //     inletWaterVolume: 0.08530239456844556,
  //     inletWaterMassFlow: 0.14,
  //     inletWaterEnergyFlow: 0.42669875853030104,
  //     outletGasPressure: 1,
  //     outletGasTemperature: 453.0356323914666,
  //     outletGasSpecificEnthalpy: 2777.119537684662,
  //     outletGasSpecificEntropy: 6.58497899635217,
  //     outletGasQuality: 1,
  //     outletGasVolume: 0.1943488843273919,
  //     outletGasMassFlow: 0.14,
  //     outletGasEnergyFlow: 0.3887967352758528,
  //     outletLiquidPressure: 1,
  //     outletLiquidTemperature: 453.0356323914666,
  //     outletLiquidSpecificEnthalpy: 762.6828443354106,
  //     outletLiquidSpecificEntropy: 2.138431350899127,
  //     outletLiquidQuality: 0,
  //     outletLiquidVolume: 0.0011272337454016697,
  //     outletLiquidMassFlow: 0,
  //     outletLiquidEnergyFlow: 0
  //   },
  //   highPressureCondensateFlashTank: {
  //     inletWaterPressure: 1,
  //     inletWaterTemperature: 453.0356323914666,
  //     inletWaterSpecificEnthalpy: 762.6828443354106,
  //     inletWaterSpecificEntropy: 2.138431350899127,
  //     inletWaterQuality: 0,
  //     inletWaterVolume: 0.0011272337454016697,
  //     inletWaterMassFlow: 0.01,
  //     inletWaterEnergyFlow: 0.0076268284433541065,
  //     outletGasPressure: 2,
  //     outletGasTemperature: 485.5345353184905,
  //     outletGasSpecificEnthalpy: 2798.384140241516,
  //     outletGasSpecificEntropy: 6.339164377128661,
  //     outletGasQuality: 1,
  //     outletGasVolume: 0.09958054416889665,
  //     outletGasMassFlow: 0,
  //     outletGasEnergyFlow: 0,
  //     outletLiquidPressure: 1,
  //     outletLiquidTemperature: 453.0356323914666,
  //     outletLiquidSpecificEnthalpy: 762.6828443354106,
  //     outletLiquidSpecificEntropy: 2.138431350899127,
  //     outletLiquidQuality: 0,
  //     outletLiquidVolume: 0.0011272337454016697,
  //     outletLiquidMassFlow: 0.01,
  //     outletLiquidEnergyFlow: 0.0076268284433541065,
  //   },
  //   mediumPressureCondensateFlashTank: {
  //     inletWaterPressure: 3,
  //     inletWaterTemperature: 479.0276501729469,
  //     inletWaterSpecificEnthalpy: 879.434049776248,
  //     inletWaterSpecificEntropy: 2.3840762829025266,
  //     inletWaterQuality: 0,
  //     inletWaterVolume: 0.0011645473179549442,
  //     inletWaterMassFlow: 0.05,
  //     inletWaterEnergyFlow: 0.0439717024888124,
  //     outletGasPressure: 3,
  //     outletGasTemperature: 507.0084450062522,
  //     outletGasSpecificEnthalpy: 2803.2647389701606,
  //     outletGasSpecificEntropy: 6.185787810829954,
  //     outletGasQuality: 1,
  //     outletGasVolume: 0.06666407913357607,
  //     outletGasMassFlow: 0,
  //     outletGasEnergyFlow: 0,
  //     outletLiquidPressure: 3,
  //     outletLiquidTemperature: 479.0276501729469,
  //     outletLiquidSpecificEnthalpy: 879.434049776248,
  //     outletLiquidSpecificEntropy: 2.3840762829025266,
  //     outletLiquidQuality: 0,
  //     outletLiquidVolume: 0.0011645473179549442,
  //     outletLiquidMassFlow: 0.05,
  //     outletLiquidEnergyFlow: 0.0439717024888124,
  //   },
  //   lowPressureHeaderSteam: {
  //     pressure: 3,
  //     temperature: null,
  //     specificEnthalpy: null,
  //     specificEntropy: null,
  //     quality: 1,
  //     specificVolume: null,
  //     massFlow: null,
  //     energyFlow: null
  //   },
  //   mediumPressureToLowPressurePrv: {
  //     feedwaterEnergyFlow: 0,
  //     feedwaterMassFlow: 0,
  //     feedwaterPressure: 0,
  //     feedwaterQuality: 0,
  //     feedwaterVolume: 0,
  //     feedwaterSpecificEnthalpy: 0,
  //     feedwaterSpecificEntropy: 0,
  //     feedwaterTemperature: 0,
  //     inletEnergyFlow: 0,
  //     inletMassFlow: 0,
  //     inletPressure: 0,
  //     inletQuality: 0,
  //     inletVolume: 0,
  //     inletSpecificEnthalpy: 0,
  //     inletSpecificEntropy: 0,
  //     inletTemperature: 0,
  //     outletEnergyFlow: 0,
  //     outletMassFlow: 0,
  //     outletPressure: 0,
  //     outletQuality: 0,
  //     outletVolume: 0,
  //     outletSpecificEnthalpy: 0,
  //     outletSpecificEntropy: 0,
  //     outletTemperature: 0
  //   },
  //   lowPressureVentedSteam: {}
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
    "mediumPressureHeader": {
      "pressure": null,
      "processSteamUsage": null,
      "condensationRecoveryRate": null,
      "heatLoss": null,
      "flashCondensateIntoHeader": "",
      "desuperheatSteamIntoNextHighest": "",
      "desuperheatSteamTemperature": null,
      "flashCondensateReturn": null
    },
    "lowPressureHeader": {
      "pressure": null,
      "processSteamUsage": null,
      "condensationRecoveryRate": null,
      "heatLoss": null,
      "flashCondensateIntoHeader": "",
      "desuperheatSteamTemperature": null,
      "flashCondensateReturn": null
    }
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

