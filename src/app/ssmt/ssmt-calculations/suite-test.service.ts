import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { SSMTInputs, BoilerInput, HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure } from '../../shared/models/steam/ssmt';

@Injectable()
export class SuiteTestService {

  constructor(private steamService: SteamService) { }

  testSuite() {
    let inputData = this.makeSteamModelerInput();
    let results = this.steamService.steamModeler(inputData);
    console.log(results);
  }

  makeSteamModelerInput(): SSMTInputs {
    // Values that work for SteamSystemModelerTool::regionSelect()
    var temperature = 594.65;

    var boilerInput: BoilerInput = {
      fuelType: 1,
      fuel: 1,
      combustionEfficiency: 1,
      blowdownRate: 1,
      //changed from 1 -> boolean
      blowdownFlashed: false,
      //changed from 1 -> boolean
      preheatMakeupWater: false,
      steamTemperature: temperature,
      deaeratorVentRate: 1,
      deaeratorPressure: 1,
      approachTemperature: 1,
    };

    var header1: HeaderWithHighestPressure = {
      pressure: 1,
      processSteamUsage: 1,
      condensationRecoveryRate: 1,
      heatLoss: 1,

      //had to hide for "HeaderWithHighestPressure"
      // flashCondensateIntoHeader: true,
      // desuperheatSteamIntoNextHighest: true,
      // desuperheatSteamTemperature: 1,

      condensateReturnTemperature: temperature,
      flashCondensateReturn: true,
    };
    var header2 = {
      pressure: 2,
      processSteamUsage: 2,
      condensationRecoveryRate: 2,
      heatLoss: 2,

      flashCondensateIntoHeader: true,
      desuperheatSteamIntoNextHighest: true,
      desuperheatSteamTemperature: temperature,

      condensateReturnTemperature: null,
      flashCondensateReturn: null,
    };
    var header3: HeaderNotHighestPressure = {
      pressure: 3,
      processSteamUsage: 3,
      condensationRecoveryRate: 3,
      heatLoss: 3,

      flashCondensateIntoHeader: true,
      desuperheatSteamIntoNextHighest: true,
      desuperheatSteamTemperature: temperature,

      //had to hide for "HeaderNotHighestPressure"
      // condensateReturnTemperature: null,
      // flashCondensateReturn: null,
    };
    var headerInput: HeaderInput = {
      //added numberOfHeaders?? 
      numberOfHeaders: 3,
      //highPressureHeader => highPressure
      highPressureHeader: header1,
      // TODO try mediumPressureHeader: null,
      mediumPressureHeader: header2,
      lowPressureHeader: header3,
    }

    var operationsInput = {
      sitePowerImport: 1,
      makeUpWaterTemperature: temperature,
      operatingHoursPerYear: 1,
      fuelCosts: 1,
      electricityCosts: 1,
      makeUpWaterCosts: 1,
    };

    var condensingTurbine = {
      isentropicEfficiency: 1,
      generationEfficiency: 1,
      condenserPressure: 1,
      operationType: 1,
      operationValue: 1,
      useTurbine: true,
    };
    var highToLowTurbine = {
      isentropicEfficiency: 2,
      generationEfficiency: 2,
      condenserPressure: 2,
      operationType: 2,
      operationValue1: 2,
      operationValue2: 2,
      useTurbine: true,
    };
    var highToMediumTurbine = {
      isentropicEfficiency: 3,
      generationEfficiency: 3,
      condenserPressure: 3,
      operationType: 3,
      operationValue1: 3,
      operationValue2: 3,
      useTurbine: true,
    };
    var mediumToLowTurbine = {
      isentropicEfficiency: 4,
      generationEfficiency: 4,
      condenserPressure: 4,
      operationType: 4,
      operationValue1: 4,
      operationValue2: 4,
      useTurbine: true,
    };
    var turbineInput = {
      condensingTurbine: condensingTurbine,
      highToLowTurbine: highToLowTurbine,
      highToMediumTurbine: highToMediumTurbine,
      mediumToLowTurbine: mediumToLowTurbine,
    };

    var steamModelerInput: SSMTInputs = {
      isBaselineCalc: true,
      baselinePowerDemand: 1,
      boilerInput: boilerInput,
      headerInput: headerInput,
      operationsInput: operationsInput,
      turbineInput: turbineInput,
    };

    return steamModelerInput;
  }
}
