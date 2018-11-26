import { Injectable } from '@angular/core';
import { SSMTInputs, SSMT, CondensingTurbine, PressureTurbine } from '../../shared/models/steam/ssmt';

import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput, TurbineOutput } from '../../shared/models/steam/steam-outputs';
import { InitializePropertiesService } from './initialize-properties.service';
import { RunModelService } from './run-model.service';


@Injectable()
export class SteamModelCalculationService {
  //idk what this is used for..
  energyUsageFixed: boolean;
  setSetEnergyUsageHP: number;
  //globals
  settings: Settings;
  inputData: SSMTInputs;
  //models
  ssmtOutputData: SSMTOutput;
  additionalSteamFlow: number;
  steamToDeaerator: number;
  //may be added to output
  powerGenerated: number;
  initialGenerated: number;
  totalEnergyUse: number;
  constructor(private runModelService: RunModelService, private initializePropertiesService: InitializePropertiesService) { }

  getInputDataFromSSMT(_ssmt: SSMT): SSMTInputs {
    let inputData: SSMTInputs = {
      operationsInput: {
        sitePowerImport: _ssmt.generalSteamOperations.sitePowerImport,
        makeUpWaterTemperature: _ssmt.generalSteamOperations.makeUpWaterTemperature,
        operatingHoursPerYear: _ssmt.operatingHours.hoursPerYear,
        fuelCosts: _ssmt.operatingCosts.fuelCost,
        electricityCosts: _ssmt.operatingCosts.electricityCost,
        makeUpWaterCosts: _ssmt.operatingCosts.makeUpWaterCost,
      },
      boilerInput: _ssmt.boilerInput,
      headerInput: _ssmt.headerInput,
      turbineInput: _ssmt.turbineInput
    }
    return inputData;
  }

  calculate(_ssmt: SSMT, _settings: Settings): SSMTOutput {
    this.inputData = this.getInputDataFromSSMT(_ssmt);
    this.settings = _settings;
    //1. initialize output data models and calcualtion constants
    this.ssmtOutputData = this.initializePropertiesService.initializeSteamProperties(this.ssmtOutputData, this.inputData, this.settings);
    //2. run model
    this.additionalSteamFlow = this.iterateModel();
    //3. finalize model
    this.ssmtOutputData = this.finalizeModel(this.ssmtOutputData, this.inputData);
    //php checks warnings here

    //4. Calculate energy use
    //this may need to be added to outputData
    let energyUsageHP: number = this.inputData.headerInput.highPressure.processSteamUsage * (this.ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy - this.ssmtOutputData.highPressureSaturatedLiquidEnthalpy) / 1000;
    let energyUsageMP: number = this.inputData.headerInput.mediumPressure.processSteamUsage * (this.ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy - this.ssmtOutputData.mediumPressureSaturatedLiquidEnthalpy) / 1000;
    let energyUsageLP: number = this.inputData.headerInput.lowPressure.processSteamUsage * (this.ssmtOutputData.lowPressureHeader.remainingSteam.specificEnthalpy - this.ssmtOutputData.lowPressureSaturatedLiquidEnthalpy) / 1000;
    return this.ssmtOutputData;
  }

  iterateModel(): number {
    let additionalSteamFlow: number = this.steamToDeaerator;
    if (additionalSteamFlow == 0 || !additionalSteamFlow) {
      additionalSteamFlow = 1;
    }
    if (this.additionalSteamFlow) {
      additionalSteamFlow = this.additionalSteamFlow;
    }
    let adjustment: number = this.convergeAdjustment(additionalSteamFlow, .01);
    let cc: number = 0;
    while (Math.abs(adjustment) > 1e-5 && cc++ < 50) {
      adjustment = this.convergeAdjustment(additionalSteamFlow);
      let y1, y2, yNew, x1, x2, xNew: number;
      let lastSlope: number;
      switch (cc) {
        case 1: {
          y1 = additionalSteamFlow;
          x1 = adjustment;
          break;
        }
        case 2: {
          y2 = additionalSteamFlow;
          x2 = adjustment;
          break;
        }
        default: {
          //set new test point
          yNew = additionalSteamFlow;
          xNew = adjustment;
          //select closest old test point
          let y1Diff: number = Math.abs(y1 - yNew);
          let y2Diff: number = Math.abs(y2 - yNew);
          if (y1Diff < y2Diff) {
            y2 = yNew;
            x2 = xNew;
          } else {
            y2 = y1;
            x2 = x1;
            y1 = yNew;
            x1 = xNew;
          }
          break;
        }
      }

      //use linear interpolation to determin new adjustment
      if (y1 && y2) {
        if (x2 == x1) {
          additionalSteamFlow = additionalSteamFlow + adjustment;
          adjustment == this.convergeAdjustment(additionalSteamFlow);
          break;
        }
        let slope: number = (y2 - y1) / (x2 - x1);
        let yIntercept: number = y2 - (x2 * slope);

        if (
          (cc > 10 && (cc % 5) == 0) ||
          (lastSlope && (slope == 0 || lastSlope / slope < 0))
        ) {
          additionalSteamFlow = additionalSteamFlow + adjustment;
        } else {
          additionalSteamFlow = yIntercept;
        }
        lastSlope = slope;
      } else {
        additionalSteamFlow = additionalSteamFlow + adjustment;
      }
      if (isNaN(adjustment)) {
        break;
      }
    }
    //php has a check warnings function and then convergeAdjustment if warnings exist here..
    //if(this.checkWarnings() > 0) adjustment = this.convergeAdjustment(additionalSteamFlow)
    return additionalSteamFlow;
  }

  convergeAdjustment(additionalSteamFlow: number, requiredVal?: number): number {
    let requirement: number = .5;
    if (requiredVal) {
      requirement = requiredVal;
    }
    let adjustment: number = 1;
    let adjustmentLast: number = 0;
    let cc: number = 0;
    while (
      adjustment != 0 &&
      (Math.abs(adjustment - adjustmentLast / adjustment) > requirement) &&
      cc++ < 15 &&
      Math.abs(adjustment) != Math.abs(adjustmentLast)
    ) {
      adjustmentLast = adjustment;
      let results:  { adjustment: number, outputData: SSMTOutput } = this.runModelService.runModel(additionalSteamFlow, this.inputData, this.ssmtOutputData, this.settings);
      this.ssmtOutputData = results.outputData;
      adjustment = results.adjustment;
      if (isNaN(adjustment)) {
        break
      }
    }
    return adjustment;
  }


  finalizeModel(_ssmtOutputData: SSMTOutput, _inputData: SSMTInputs): SSMTOutput {
    //high pressure to medium pressure prv
    let prvCheck: boolean = this.checkPRVMassFlow(_ssmtOutputData.highPressureToMediumPressurePrv.inletMassFlow);
    if (prvCheck) {
      _ssmtOutputData.highPressureToMediumPressurePrv.inletMassFlow = 0;
    }
    //medium pressure to low pressure prv
    prvCheck = this.checkPRVMassFlow(_ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow);
    if (prvCheck) {
      _ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow = 0;
    }
    //high to low pressure turbine
    let turbineCheck: boolean = this.checkTurbineMassFlow(_ssmtOutputData.highPressureToLowPressureTurbine.massFlow);
    if (turbineCheck) {
      _ssmtOutputData.highPressureToLowPressureTurbine.massFlow = 0;
    }
    _ssmtOutputData.highPressureToLowPressureTurbine = this.calculateTurbinePowerOut(_ssmtOutputData.highPressureToLowPressureTurbine);
    //high to medium pressure turbine
    turbineCheck = this.checkTurbineMassFlow(_ssmtOutputData.highPressureToMediumPressureTurbine.massFlow);
    if (turbineCheck) {
      _ssmtOutputData.highPressureToMediumPressureTurbine.massFlow = 0;
    }
    _ssmtOutputData.highPressureToMediumPressureTurbine = this.calculateTurbinePowerOut(_ssmtOutputData.highPressureToMediumPressureTurbine);

    //medium to low pressure turbine
    turbineCheck = this.checkTurbineMassFlow(_ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow);
    if (turbineCheck) {
      _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow = 0;
    }
    _ssmtOutputData.mediumPressureToLowPressureTurbine = this.calculateTurbinePowerOut(_ssmtOutputData.mediumPressureToLowPressureTurbine);

    _ssmtOutputData.condensingTurbine = this.calculateTurbinePowerOut(_ssmtOutputData.condensingTurbine);

    this.powerGenerated = (_ssmtOutputData.condensingTurbine.powerOut
      + _ssmtOutputData.highPressureToLowPressureTurbine.powerOut
      + _ssmtOutputData.highPressureToMediumPressureTurbine.powerOut
      + _ssmtOutputData.mediumPressureToLowPressureTurbine.powerOut
    )

    let increasedGeneration: number = 0;
    if (this.initialGenerated != -999999.999) {
      increasedGeneration = this.powerGenerated - this.initialGenerated;
    }

    let newSitePowerImport: number = _inputData.operationsInput.sitePowerImport - increasedGeneration;
    let boilerFuelCosts: number = _ssmtOutputData.boilerOutput.fuelEnergy * _inputData.operationsInput.operatingHoursPerYear * _inputData.operationsInput.fuelCosts;
    //makeupWater.massFlow = volumeFlow? (php uses volume flow)
    let makeupWaterTotalCost: number = _inputData.operationsInput.makeUpWaterCosts * _ssmtOutputData.makeupWater.massFlow * _inputData.operationsInput.operatingHoursPerYear;
    this.totalEnergyUse = (newSitePowerImport * 3.1 + _ssmtOutputData.boilerOutput.fuelEnergy) * _inputData.operationsInput.operatingHoursPerYear;

    //next co2Emissions are calculated. the function uses a lookup for Fuel.php
    //TODO: Calculate
    return _ssmtOutputData;
  }

  checkPRVMassFlow(_massFlow: number): boolean {
    if (Math.abs(_massFlow) < 1e-2) {
      return true;
    } else {
      return false;
    }
  }

  checkTurbineMassFlow(_massFlow: number): boolean {
    if (Math.abs(_massFlow) < 1e-4) {
      return true;
    } else {
      return false;
    }
  }

  calculateTurbinePowerOut(_turbine: TurbineOutput): TurbineOutput {
    let energyFlowPerMassOut: number = _turbine.inletEnergyFlow - _turbine.outletEnergyFlow;
    _turbine.energyOut = _turbine.massFlow * energyFlowPerMassOut;
    _turbine.powerOut = _turbine.energyOut * _turbine.generatorEfficiency;
    return _turbine;
  }
}