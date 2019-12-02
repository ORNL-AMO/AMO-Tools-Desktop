import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SSMT, SSMTInputs, TurbineInput, PressureTurbine, HeaderInput, CondensingTurbine, BoilerInput, HeaderWithHighestPressure, HeaderNotHighestPressure, OperationsInput } from '../shared/models/steam/ssmt';
import { SteamService } from '../calculator/steam/steam.service';
import { Settings } from '../shared/models/settings';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { BoilerService } from './boiler/boiler.service';
import { HeaderService } from './header/header.service';
import { TurbineService } from './turbine/turbine.service';
import { OperationsService } from './operations/operations.service';
import { ConvertSteamService } from '../calculator/steam/convert-steam.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

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
  isBaselineFocused: BehaviorSubject<boolean>;
  constructor(private steamService: SteamService, private convertSteamService: ConvertSteamService, private boilerService: BoilerService, private headerService: HeaderService,
    private turbineService: TurbineService, private operationsService: OperationsService, private convertUnitsService: ConvertUnitsService) {
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
    this.isBaselineFocused = new BehaviorSubject<boolean>(true);
  }

  calculateBaselineModel(ssmt: SSMT, settings: Settings): { inputData: SSMTInputs, outputData: SSMTOutput } {
    let ssmtCopy: SSMT = JSON.parse(JSON.stringify(ssmt));
    let boilerValid: boolean = this.boilerService.isBoilerValid(ssmtCopy.boilerInput, settings);
    let headerValid: boolean = this.headerService.isHeaderValid(ssmtCopy.headerInput, settings, ssmtCopy.boilerInput);
    let turbineValid: boolean = this.turbineService.isTurbineValid(ssmtCopy.turbineInput, ssmtCopy.headerInput, settings);
    let operationsValid: boolean = this.operationsService.getForm(ssmtCopy, settings).valid;
    let setupInputData: SSMTInputs = this.setupInputData(ssmtCopy, 0, true);
    if (turbineValid && headerValid && boilerValid && operationsValid) {
      let outputData: SSMTOutput = this.steamService.steamModeler(setupInputData, settings);
      return { inputData: setupInputData, outputData: outputData };
    } else {
      let outputData: SSMTOutput = this.getEmptyResults();
      return { inputData: setupInputData, outputData: outputData };
    }
  }

  calculateModificationModel(ssmt: SSMT, settings: Settings, baselineResults: SSMTOutput): { inputData: SSMTInputs, outputData: SSMTOutput } {
    let ssmtCopy: SSMT = JSON.parse(JSON.stringify(ssmt));
    let resultsCpy: SSMTOutput = JSON.parse(JSON.stringify(baselineResults));
    let boilerValid: boolean = this.boilerService.isBoilerValid(ssmtCopy.boilerInput, settings);
    let headerValid: boolean = this.headerService.isHeaderValid(ssmtCopy.headerInput, settings, ssmtCopy.boilerInput);
    let turbineValid: boolean = this.turbineService.isTurbineValid(ssmtCopy.turbineInput, ssmtCopy.headerInput, settings);
    let operationsValid: boolean = this.operationsService.getForm(ssmtCopy, settings).valid;
    let setupInputData: SSMTInputs = this.setupInputData(ssmtCopy, resultsCpy.operationsOutput.sitePowerDemand, false);
    if (turbineValid && headerValid && boilerValid && operationsValid) {
      let modificationOutputData: SSMTOutput = this.steamService.steamModeler(setupInputData, settings);
      if (ssmtCopy.headerInput.numberOfHeaders > 1) {
        if (ssmtCopy.headerInput.numberOfHeaders == 3) {
          if (ssmtCopy.headerInput.mediumPressureHeader.useBaselineProcessSteamUsage == true && modificationOutputData.mediumPressureProcessSteamUsage.processUsage != resultsCpy.mediumPressureProcessSteamUsage.processUsage) {
            ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage = this.calculateProcessSteamUsageFromEnergy(resultsCpy.mediumPressureProcessSteamUsage.processUsage, modificationOutputData.mediumPressureHeaderSteam.specificEnthalpy - modificationOutputData.mediumPressureCondensate.specificEnthalpy, settings);
            setupInputData = this.setupInputData(ssmtCopy, resultsCpy.operationsOutput.sitePowerDemand, false);

            modificationOutputData = this.steamService.steamModeler(setupInputData, settings);
          }
        }
        if (ssmtCopy.headerInput.lowPressureHeader.useBaselineProcessSteamUsage == true && modificationOutputData.lowPressureProcessSteamUsage.processUsage != resultsCpy.lowPressureProcessSteamUsage.processUsage) {
          ssmtCopy.headerInput.lowPressureHeader.processSteamUsage = this.calculateProcessSteamUsageFromEnergy(resultsCpy.lowPressureProcessSteamUsage.processUsage, modificationOutputData.lowPressureHeaderSteam.specificEnthalpy - modificationOutputData.lowPressureCondensate.specificEnthalpy, settings);
          setupInputData = this.setupInputData(ssmtCopy, resultsCpy.operationsOutput.sitePowerDemand, false);
          modificationOutputData = this.steamService.steamModeler(setupInputData, settings);
        }
      }
      return { inputData: setupInputData, outputData: modificationOutputData };
    } else {
      let outputData: SSMTOutput = this.getEmptyResults();
      return { inputData: setupInputData, outputData: outputData };
    }
  }

  calculateProcessSteamUsageFromEnergy(energyFlow: number, specificEnthalpy: number, settings: Settings): number {
    let convertedEnthalpy: number = this.convertSteamService.convertSteamSpecificEnthalpyInput(specificEnthalpy, settings);
    let convertedEnergy: number = this.convertSteamService.convertEnergyFlowInput(energyFlow, settings);
    let neededProcessSteamUsage: number = convertedEnergy / convertedEnthalpy;
    neededProcessSteamUsage = this.convertSteamService.convertSteamMassFlowOutput(neededProcessSteamUsage, settings);
    return neededProcessSteamUsage;
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
      combinedCondensate: undefined,
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

  calculateBaselineMarginalCosts(ssmt: SSMT, balancedResults: SSMTOutput, settings: Settings): { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number } {
    let ssmtCopy: SSMT = JSON.parse(JSON.stringify(ssmt));
    let marginalHPCost: number = 0;
    let marginalMPCost: number = 0;
    let marginalLPCost: number = 0;
    //high pressure header
    ssmtCopy.headerInput.highPressureHeader.processSteamUsage = ssmtCopy.headerInput.highPressureHeader.processSteamUsage + 100;
    let highPressureMarginalResults: SSMTOutput = this.calculateBaselineModel(ssmtCopy, settings).outputData;
    ssmtCopy.headerInput.highPressureHeader.processSteamUsage = ssmtCopy.headerInput.highPressureHeader.processSteamUsage - 100;
    marginalHPCost = this.getCostDifference(balancedResults, highPressureMarginalResults, ssmtCopy);

    if (ssmtCopy.headerInput.numberOfHeaders > 1) {
      //low pressure header
      ssmtCopy.headerInput.lowPressureHeader.processSteamUsage = ssmtCopy.headerInput.lowPressureHeader.processSteamUsage + 100;
      let lowPressureMarginalResults: SSMTOutput = this.calculateBaselineModel(ssmtCopy, settings).outputData;
      ssmtCopy.headerInput.lowPressureHeader.processSteamUsage = ssmtCopy.headerInput.lowPressureHeader.processSteamUsage - 100;
      marginalLPCost = this.getCostDifference(balancedResults, lowPressureMarginalResults, ssmtCopy);

      //medium pressure header
      if (ssmtCopy.headerInput.numberOfHeaders === 3) {
        ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage = ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage + 100;
        let mediumPressureMarginalResults: SSMTOutput = this.calculateBaselineModel(ssmtCopy, settings).outputData;
        ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage = ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage - 100;
        marginalMPCost = this.getCostDifference(balancedResults, mediumPressureMarginalResults, ssmtCopy);
      }
    }
    return { marginalHPCost: marginalHPCost, marginalMPCost: marginalMPCost, marginalLPCost: marginalLPCost };
  }


  calculateModificationMarginalCosts(ssmt: SSMT, balancedResults: SSMTOutput, baselineResults: SSMTOutput, settings: Settings): { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number } {
    let ssmtCopy: SSMT = JSON.parse(JSON.stringify(ssmt));
    let marginalHPCost: number = 0;
    let marginalMPCost: number = 0;
    let marginalLPCost: number = 0;
    if (ssmtCopy.headerInput.numberOfHeaders > 1) {
      ssmtCopy.headerInput.lowPressureHeader.useBaselineProcessSteamUsage = false;
      ssmtCopy.headerInput.lowPressureHeader.processSteamUsage = balancedResults.lowPressureProcessSteamUsage.massFlow;
      if (ssmtCopy.headerInput.numberOfHeaders == 3) {
        ssmtCopy.headerInput.mediumPressureHeader.useBaselineProcessSteamUsage = false;
        ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage = balancedResults.mediumPressureProcessSteamUsage.massFlow;
      }
    }
    //high pressure header
    ssmtCopy.headerInput.highPressureHeader.processSteamUsage = ssmtCopy.headerInput.highPressureHeader.processSteamUsage + 100;
    let highPressureMarginalResults: SSMTOutput = this.calculateModificationModel(ssmtCopy, settings, baselineResults).outputData;
    ssmtCopy.headerInput.highPressureHeader.processSteamUsage = ssmtCopy.headerInput.highPressureHeader.processSteamUsage - 100;
    marginalHPCost = this.getCostDifference(balancedResults, highPressureMarginalResults, ssmtCopy);

    if (ssmtCopy.headerInput.numberOfHeaders > 1) {
      //low pressure header
      ssmtCopy.headerInput.lowPressureHeader.processSteamUsage = ssmtCopy.headerInput.lowPressureHeader.processSteamUsage + 100;
      let lowPressureMarginalResults: SSMTOutput = this.calculateModificationModel(ssmtCopy, settings, baselineResults).outputData;
      ssmtCopy.headerInput.lowPressureHeader.processSteamUsage = ssmtCopy.headerInput.lowPressureHeader.processSteamUsage - 100;
      marginalLPCost = this.getCostDifference(balancedResults, lowPressureMarginalResults, ssmtCopy);


      //medium pressure header
      if (ssmtCopy.headerInput.numberOfHeaders === 3) {
        ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage = ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage + 100;
        let mediumPressureMarginalResults: SSMTOutput = this.calculateModificationModel(ssmtCopy, settings, baselineResults).outputData;
        ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage = ssmtCopy.headerInput.mediumPressureHeader.processSteamUsage - 100;
        marginalMPCost = this.getCostDifference(balancedResults, mediumPressureMarginalResults, ssmtCopy);
      }
    }

    return { marginalHPCost: marginalHPCost, marginalMPCost: marginalMPCost, marginalLPCost: marginalLPCost };
  }


  getCostDifference(balancedResults: SSMTOutput, adjustedResults: SSMTOutput, inputData: SSMT): number {
    let powerGenOC: number = balancedResults.operationsOutput.powerGenerated * inputData.operatingCosts.electricityCost;
    console.log('powerGenOC ' + powerGenOC);
    let adjustedPowerGenOC: number = adjustedResults.operationsOutput.powerGenerated * inputData.operatingCosts.electricityCost;
    console.log('adjustedPowerGenOC ' + adjustedPowerGenOC);
    let totalOC: number = balancedResults.operationsOutput.totalOperatingCost / inputData.operatingHours.hoursPerYear;
    console.log('totalOC ' + totalOC);
    let adjustedTotalOC: number = adjustedResults.operationsOutput.totalOperatingCost / inputData.operatingHours.hoursPerYear;
    console.log('adjustedTotalOC ' + adjustedTotalOC);
    console.log('===')
    return ((adjustedTotalOC - totalOC) + (powerGenOC - adjustedPowerGenOC)) / 100;
  }
}
