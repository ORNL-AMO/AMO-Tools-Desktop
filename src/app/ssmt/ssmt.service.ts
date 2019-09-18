import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SSMT, SSMTInputs, TurbineInput, PressureTurbine, HeaderInput, CondensingTurbine, BoilerInput, HeaderWithHighestPressure, HeaderNotHighestPressure, OperationsInput } from '../shared/models/steam/ssmt';
import { SteamService } from '../calculator/steam/steam.service';
import { Settings } from '../shared/models/settings';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { BoilerService } from './boiler/boiler.service';
import { HeaderService } from './header/header.service';
import { TurbineService } from './turbine/turbine.service';
import { OperationsService } from './operations/operations.service';

@Injectable()
export class SsmtService {
  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  steamModelTab: BehaviorSubject<string>;
  currentField: BehaviorSubject<string>;
  openNewModificationModal: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  openModificationSelectModal: BehaviorSubject<boolean>;
  updateData: BehaviorSubject<boolean>;
  turbineOperationHelp: BehaviorSubject<string>;
  turbineOperationValue: BehaviorSubject<number>;
  headerPressureLevelHelp: BehaviorSubject<string>;
  numberOfHeadersHelp: BehaviorSubject<number>;
  calcTab: BehaviorSubject<string>;
  saveSSMT: BehaviorSubject<SSMT>;
  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService, private boilerService: BoilerService, private headerService: HeaderService,
    private turbineService: TurbineService, private operationsService: OperationsService) {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.steamModelTab = new BehaviorSubject<string>('operations');
    this.currentField = new BehaviorSubject<string>('default');
    this.openNewModificationModal = new BehaviorSubject<boolean>(false);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.openModificationSelectModal = new BehaviorSubject<boolean>(false);
    this.updateData = new BehaviorSubject<boolean>(false);
    this.turbineOperationHelp = new BehaviorSubject<string>('condensing');
    this.turbineOperationValue = new BehaviorSubject<number>(1);
    this.headerPressureLevelHelp = new BehaviorSubject<string>('highPressure');
    this.numberOfHeadersHelp = new BehaviorSubject<number>(1);
    this.calcTab = new BehaviorSubject<string>('boiler');
    this.saveSSMT = new BehaviorSubject<SSMT>(undefined);
  }

  calculateModel(ssmt: SSMT, settings: Settings, isBaselineCalculation: boolean, baselinePowerDemand: number): { inputData: SSMTInputs, outputData: SSMTOutput } {
    let ssmtCopy: SSMT = JSON.parse(JSON.stringify(ssmt));
    let boilerValid: boolean = this.boilerService.isBoilerValid(ssmtCopy.boilerInput, settings);
    let headerValid: boolean = this.headerService.isHeaderValid(ssmtCopy.headerInput, settings, ssmtCopy.boilerInput);
    let turbineValid: boolean = this.turbineService.isTurbineValid(ssmtCopy.turbineInput, ssmtCopy.headerInput, settings);
    let operationsValid: boolean = this.operationsService.getForm(ssmtCopy, settings).valid;
    let setupInputData: SSMTInputs = this.setupInputData(ssmtCopy, baselinePowerDemand, isBaselineCalculation);
    if (turbineValid && headerValid && boilerValid && operationsValid) {
      let convertedInputData: SSMTInputs = this.convertInputData(JSON.parse(JSON.stringify(setupInputData)), settings);
      let outputData: SSMTOutput = this.steamService.steamModeler(convertedInputData, settings);
      return { inputData: setupInputData, outputData: outputData };
    } else {
      let outputData: SSMTOutput = this.getEmptyResults();
      return { inputData: setupInputData, outputData: outputData };
    }
  }

  setupInputData(ssmt: SSMT, baselinePowerDemand: number, isBaselineCalculation: boolean): SSMTInputs {
    let inputData: SSMTInputs = {
      operationsInput: {
        sitePowerImport: ssmt.generalSteamOperations.sitePowerImport,
        makeUpWaterTemperature: ssmt.generalSteamOperations.makeUpWaterTemperature,
        operatingHoursPerYear: ssmt.operatingHours.hoursPerYear,
        fuelCosts: ssmt.operatingCosts.fuelCost,
        electricityCosts: ssmt.operatingCosts.electricityCost,
        makeUpWaterCosts: ssmt.operatingCosts.makeUpWaterCost,
      },
      boilerInput: ssmt.boilerInput,
      headerInput: ssmt.headerInput,
      turbineInput: ssmt.turbineInput,
      //added to match suite call (not used in this calculation)
      baselinePowerDemand: baselinePowerDemand,
      isBaselineCalc: isBaselineCalculation
    };

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
    //convert unit costs
    let electricityCostHelper: number = this.convertUnitsService.value(1).from('kW').to('kJh');
    operationsInput.electricityCosts = operationsInput.electricityCosts / electricityCostHelper;
    // debugger
    let volumeCostHelper: number = this.convertUnitsService.value(1).from(settings.steamVolumeMeasurement).to('m3');
    operationsInput.makeUpWaterCosts = operationsInput.makeUpWaterCosts / volumeCostHelper;
    let fuelCostHelper: number = this.convertUnitsService.value(1).from(settings.steamEnergyMeasurement).to('kJ');
    operationsInput.fuelCosts = operationsInput.fuelCosts / fuelCostHelper;
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

  getEmptyResults(): SSMTOutput {
    return {
      boilerOutput: undefined,

      highPressureHeaderSteam: undefined,
      highPressureSteamHeatLoss: undefined,

      mediumPressureToLowPressurePrv: undefined,
      highPressureToMediumPressurePrv: undefined,

      highPressureToLowPressureTurbine: undefined,
      highPressureToMediumPressureTurbine: undefined,
      highPressureCondensateFlashTank: undefined,

      lowPressureHeaderSteam: undefined,
      lowPressureSteamHeatLoss: undefined,

      mediumPressureToLowPressureTurbine: undefined,
      mediumPressureCondensateFlashTank: undefined,

      mediumPressureHeaderSteam: undefined,
      mediumPressureSteamHeatLoss: undefined,

      blowdownFlashTank: undefined,

      highPressureCondensate: undefined,
      lowPressureCondensate: undefined,
      mediumPressureCondensate: undefined,
      combinedCondensateHeader: undefined,
      returnCondensate: undefined,
      condensateFlashTank: undefined,

      makeupWater: undefined,
      makeupWaterAndCondensate: undefined,

      condensingTurbine: undefined,
      deaeratorOutput: undefined,

      highPressureProcessSteamUsage: undefined,
      mediumPressureProcessSteamUsage: undefined,
      lowPressureProcessSteamUsage: undefined,
      lowPressureVentedSteam: undefined,
      heatExchanger: undefined,
      operationsOutput: undefined
    }
  }

  calculateMarginalCosts(ssmt: SSMT, balancedResults: SSMTOutput, settings: Settings): { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number } {
    let setupInputData: SSMTInputs = this.setupInputData(JSON.parse(JSON.stringify(ssmt)), 0, true);
    let convertedInputData: SSMTInputs = this.convertInputData(JSON.parse(JSON.stringify(setupInputData)), settings);
    let marginalHPCost: number = 0;
    let marginalMPCost: number = 0;
    let marginalLPCost: number = 0;

    setupInputData.headerInput.highPressureHeader.processSteamUsage = setupInputData.headerInput.highPressureHeader.processSteamUsage + 100;
    convertedInputData = this.convertInputData(JSON.parse(JSON.stringify(setupInputData)), settings);

    let highPressureMarginalResults: SSMTOutput = this.steamService.steamModeler(convertedInputData, settings);

    setupInputData.headerInput.highPressureHeader.processSteamUsage = setupInputData.headerInput.highPressureHeader.processSteamUsage - 100;
    marginalHPCost = this.getCostDifference(balancedResults, highPressureMarginalResults, setupInputData);

    if (setupInputData.headerInput.numberOfHeaders > 1) {
      setupInputData.headerInput.lowPressureHeader.processSteamUsage = setupInputData.headerInput.lowPressureHeader.processSteamUsage + 100;
      convertedInputData = this.convertInputData(JSON.parse(JSON.stringify(setupInputData)), settings);
      let lowPressureMarginalResults: SSMTOutput = this.steamService.steamModeler(convertedInputData, settings);
      setupInputData.headerInput.lowPressureHeader.processSteamUsage = setupInputData.headerInput.lowPressureHeader.processSteamUsage - 100;
      marginalLPCost = this.getCostDifference(balancedResults, lowPressureMarginalResults, setupInputData);

      if (setupInputData.headerInput.numberOfHeaders === 3) {
        setupInputData.headerInput.mediumPressureHeader.processSteamUsage = setupInputData.headerInput.mediumPressureHeader.processSteamUsage + 100;
        convertedInputData = this.convertInputData(JSON.parse(JSON.stringify(setupInputData)), settings);

        let mediumPressureMarginalResults: SSMTOutput = this.steamService.steamModeler(convertedInputData, settings);
        setupInputData.headerInput.mediumPressureHeader.processSteamUsage = setupInputData.headerInput.mediumPressureHeader.processSteamUsage - 100;
        marginalMPCost = this.getCostDifference(balancedResults, mediumPressureMarginalResults, setupInputData);
      }
    }
    return { marginalHPCost: marginalHPCost, marginalMPCost: marginalMPCost, marginalLPCost: marginalLPCost };
  }

  getCostDifference(balancedResults: SSMTOutput, adjustedResults: SSMTOutput, inputData: SSMTInputs): number {
    let powerGenOC: number = balancedResults.operationsOutput.powerGenerated * inputData.operationsInput.electricityCosts;
    let adjustedPowerGenOC: number = adjustedResults.operationsOutput.powerGenerated * inputData.operationsInput.electricityCosts;
    let totalOC: number = balancedResults.operationsOutput.totalOperatingCost / inputData.operationsInput.operatingHoursPerYear;
    let adjustedTotalOC: number = adjustedResults.operationsOutput.totalOperatingCost / inputData.operationsInput.operatingHoursPerYear;
    return ((adjustedTotalOC - totalOC) + (powerGenOC - adjustedPowerGenOC)) / 100;
  }
}
