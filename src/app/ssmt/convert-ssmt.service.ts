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
      if (ssmt.headerInput.highPressure) {
        ssmt.headerInput.highPressure = this.convertHighPressureHeader(ssmt.headerInput.highPressure, oldSettings, newSettings);
      }
      if (ssmt.headerInput.lowPressure) {
        ssmt.headerInput.lowPressure = this.convertNotHighPressureHeader(ssmt.headerInput.lowPressure, oldSettings, newSettings);
      }
      if (ssmt.headerInput.mediumPressure) {
        ssmt.headerInput.mediumPressure = this.convertNotHighPressureHeader(ssmt.headerInput.mediumPressure, oldSettings, newSettings);
      }
    }
    ssmt = this.convertOperations(ssmt, oldSettings, newSettings);
    return ssmt;
  }

  convertValue(val: number, oldUnit: string, newUnit: string): number {
    if (val) {
      let newVal: number = this.convertUnitsService.value(val).from(oldUnit).to(newUnit);
      return this.convertUnitsService.roundVal(newVal, 2);
    } else { return }
  }

  convertBoiler(boilerInput: BoilerInput, oldSettings: Settings, newSettings: Settings): BoilerInput {
    if (oldSettings.steamTemperatureMeasurement != newSettings.steamTemperatureMeasurement) {
      boilerInput.approachTemperature = this.convertValue(boilerInput.approachTemperature, oldSettings.steamTemperatureMeasurement, newSettings.steamTemperatureMeasurement);
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
        ssmt.operatingCosts.fuelCost = this.convertValue(ssmt.operatingCosts.fuelCost, oldSettings.steamEnergyMeasurement, newSettings.steamEnergyMeasurement);
      }
      if (oldSettings.steamVolumeMeasurement != newSettings.steamVolumeMeasurement) {
        ssmt.operatingCosts.makeUpWaterCost = this.convertValue(ssmt.operatingCosts.makeUpWaterCost, oldSettings.steamVolumeMeasurement, newSettings.steamVolumeMeasurement);
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
}
