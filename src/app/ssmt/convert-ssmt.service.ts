import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { SSMT, BoilerInput, PressureTurbine, CondensingTurbine, HeaderWithHighestPressure, HeaderNotHighestPressure } from '../shared/models/steam/ssmt';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class ConvertSsmtService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertAllInputData(ssmt: SSMT, oldSettings: Settings, newSettings: Settings): SSMT {
    if (ssmt.boilerInput) {
      ssmt.boilerInput = this.convertBoiler(ssmt.boilerInput, oldSettings, newSettings);
    }
    if (ssmt.turbineInput) {
      ssmt.turbineInput.condensingTurbine = this.convertCondensingTurbine(ssmt.turbineInput.condensingTurbine, oldSettings, newSettings);
      ssmt.turbineInput.highToLowTurbine = this.convertPressureTurbine(ssmt.turbineInput.highToLowTurbine, oldSettings, newSettings);
      ssmt.turbineInput.highToMediumTurbine = this.convertPressureTurbine(ssmt.turbineInput.highToMediumTurbine, oldSettings, newSettings);
      ssmt.turbineInput.mediumToLowTurbine = this.convertPressureTurbine(ssmt.turbineInput.mediumToLowTurbine, oldSettings, newSettings);
    }
    if (ssmt.headerInput) {
      if (ssmt.headerInput.highPressureHeader) {
        ssmt.headerInput.highPressureHeader = this.convertHighPressureHeader(ssmt.headerInput.highPressureHeader, oldSettings, newSettings);
      }
      if (ssmt.headerInput.lowPressureHeader) {
        ssmt.headerInput.lowPressureHeader = this.convertNotHighPressureHeader(ssmt.headerInput.lowPressureHeader, oldSettings, newSettings);
      }
      if (ssmt.headerInput.mediumPressureHeader) {
        ssmt.headerInput.mediumPressureHeader = this.convertNotHighPressureHeader(ssmt.headerInput.mediumPressureHeader, oldSettings, newSettings);
      }
    }
    ssmt = this.convertOperations(ssmt, oldSettings, newSettings);
    return ssmt;
  }

  convertValue(val: number, oldUnit: string, newUnit: string): number {
    if (val) {
      let newVal: number = this.convertUnitsService.value(val).from(oldUnit).to(newUnit);
      return this.convertUnitsService.roundVal(newVal, 4);
    } else { return }
  }

  convertBoiler(boilerInput: BoilerInput, oldSettings: Settings, newSettings: Settings): BoilerInput {
    if (oldSettings.steamTemperatureMeasurement != newSettings.steamTemperatureMeasurement) {
      let approachTempUnitValOld: string = 'R';
      let approachTempUnitValNew: string = 'R';
      if (oldSettings.steamTemperatureMeasurement == 'C' || oldSettings.steamTemperatureMeasurement == 'K') {
        approachTempUnitValOld = 'K';
      }
      if (newSettings.steamTemperatureMeasurement == 'C' || newSettings.steamTemperatureMeasurement == 'K') {
        approachTempUnitValNew = 'K';
      }

      boilerInput.approachTemperature = this.convertValue(boilerInput.approachTemperature, approachTempUnitValOld, approachTempUnitValNew);
      boilerInput.steamTemperature = this.convertValue(boilerInput.steamTemperature, oldSettings.steamTemperatureMeasurement, newSettings.steamTemperatureMeasurement);
    }
    if (oldSettings.steamPressureMeasurement != newSettings.steamPressureMeasurement) {
      boilerInput.deaeratorPressure = this.convertValue(boilerInput.deaeratorPressure, oldSettings.steamPressureMeasurement, newSettings.steamPressureMeasurement);
    }
    return boilerInput;
  }

  convertPressureTurbine(turbine: PressureTurbine, oldSettings: Settings, newSettings: Settings): PressureTurbine {
    //flow
    if (turbine.operationType == 0 || turbine.operationType == 4 && (oldSettings.steamMassFlowMeasurement != newSettings.steamMassFlowMeasurement)) {
      turbine.operationValue1 = this.convertValue(turbine.operationValue1, oldSettings.steamMassFlowMeasurement, newSettings.steamMassFlowMeasurement);
      turbine.operationValue2 = this.convertValue(turbine.operationValue2, oldSettings.steamMassFlowMeasurement, newSettings.steamMassFlowMeasurement);
    }
    if(turbine.operationValue1 == undefined){
      turbine.operationValue1 = null;
    }
    if(turbine.operationValue2 == undefined){
      turbine.operationValue2 = null;
    }
    return turbine;
  }

  convertCondensingTurbine(turbine: CondensingTurbine, oldSettings: Settings, newSettings: Settings): CondensingTurbine {
    if (oldSettings.steamVacuumPressure != newSettings.steamVacuumPressure) {
      turbine.condenserPressure = this.convertValue(turbine.condenserPressure, oldSettings.steamVacuumPressure, newSettings.steamVacuumPressure);
    }
    if (turbine.operationType == 0 && (oldSettings.steamMassFlowMeasurement != newSettings.steamMassFlowMeasurement)) {
      turbine.operationValue = this.convertValue(turbine.operationValue, oldSettings.steamMassFlowMeasurement, newSettings.steamMassFlowMeasurement);
    }
    return turbine;
  }

  convertOperations(ssmt: SSMT, oldSettings: Settings, newSettings: Settings): SSMT {
    if (ssmt.generalSteamOperations) {
      if (oldSettings.steamTemperatureMeasurement != newSettings.steamTemperatureMeasurement) {
        ssmt.generalSteamOperations.makeUpWaterTemperature = this.convertValue(ssmt.generalSteamOperations.makeUpWaterTemperature, oldSettings.steamTemperatureMeasurement, newSettings.steamTemperatureMeasurement);
      }
      if (oldSettings.steamPowerMeasurement != newSettings.steamPowerMeasurement) {
        ssmt.generalSteamOperations.sitePowerImport = this.convertValue(ssmt.generalSteamOperations.sitePowerImport, oldSettings.steamPowerMeasurement, newSettings.steamPowerMeasurement);
      }
    }

    if (ssmt.operatingCosts) {
      if (oldSettings.steamEnergyMeasurement != newSettings.steamEnergyMeasurement) {
        let convertOne: number = this.convertUnitsService.value(1).from(oldSettings.steamEnergyMeasurement).to(newSettings.steamEnergyMeasurement);
        ssmt.operatingCosts.fuelCost = this.convertUnitsService.roundVal(ssmt.operatingCosts.fuelCost / convertOne, 4);
        //ssmt.operatingCosts.fuelCost = this.convertValue(1 / ssmt.operatingCosts.fuelCost, oldSettings.steamEnergyMeasurement, newSettings.steamEnergyMeasurement);
      }
      if (oldSettings.steamVolumeMeasurement != newSettings.steamVolumeMeasurement) {
        let convertOne: number = this.convertUnitsService.value(1).from(oldSettings.steamVolumeMeasurement).to(newSettings.steamVolumeMeasurement);
        ssmt.operatingCosts.makeUpWaterCost = ssmt.operatingCosts.makeUpWaterCost / convertOne
      }
    }
    return ssmt;
  }

  convertHighPressureHeader(header: HeaderWithHighestPressure, oldSettings: Settings, newSettings: Settings): HeaderWithHighestPressure {
    if (oldSettings.steamTemperatureMeasurement != newSettings.steamTemperatureMeasurement) {
      header.condensateReturnTemperature = this.convertValue(header.condensateReturnTemperature, oldSettings.steamTemperatureMeasurement, newSettings.steamTemperatureMeasurement)
    }
    if (oldSettings.steamPressureMeasurement != newSettings.steamPressureMeasurement) {
      header.pressure = this.convertValue(header.pressure, oldSettings.steamPressureMeasurement, newSettings.steamPressureMeasurement)

    }
    if (oldSettings.steamMassFlowMeasurement != newSettings.steamMassFlowMeasurement) {
      header.processSteamUsage = this.convertValue(header.processSteamUsage, oldSettings.steamMassFlowMeasurement, newSettings.steamMassFlowMeasurement)
    }
    return header;
  }

  convertNotHighPressureHeader(header: HeaderNotHighestPressure, oldSettings: Settings, newSettings: Settings): HeaderNotHighestPressure {
    if (oldSettings.steamTemperatureMeasurement != newSettings.steamTemperatureMeasurement) {
      header.desuperheatSteamTemperature = this.convertValue(header.desuperheatSteamTemperature, oldSettings.steamTemperatureMeasurement, newSettings.steamTemperatureMeasurement)
    }
    if (oldSettings.steamPressureMeasurement != newSettings.steamPressureMeasurement) {
      header.pressure = this.convertValue(header.pressure, oldSettings.steamPressureMeasurement, newSettings.steamPressureMeasurement)

    }
    if (oldSettings.steamMassFlowMeasurement != newSettings.steamMassFlowMeasurement) {
      header.processSteamUsage = this.convertValue(header.processSteamUsage, oldSettings.steamMassFlowMeasurement, newSettings.steamMassFlowMeasurement)
    }
    return header;
  }

  convertExistingData(ssmt: SSMT , oldSettings: Settings, settings: Settings): SSMT {
    ssmt = this.convertAllInputData(ssmt, oldSettings, settings);
    if(ssmt.modifications){
      ssmt.modifications.forEach(mod => {
        mod.ssmt = this.convertAllInputData(mod.ssmt, oldSettings, settings);
      })
    }
    return ssmt;
  }
}
