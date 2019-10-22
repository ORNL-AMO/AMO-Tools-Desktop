import { Injectable } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt, EnergyUsage } from '../shared/models/treasure-hunt';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { NaturalGasReductionData } from '../shared/models/standalone';

@Injectable()
export class ConvertInputDataService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertTreasureHuntInputData(treasureHunt: TreasureHunt, oldSettings: Settings, newSettings: Settings): TreasureHunt {
    //no conversion for lighting needed..
    // if (treasureHunt.lightingReplacements != undefined) {
    //   treasureHunt.lightingReplacements = this.convertLightingReplacements(treasureHunt.lightingReplacements, oldSettings, newSettings);
    // }
    if (treasureHunt.opportunitySheets != undefined) {
      treasureHunt.opportunitySheets = this.convertOpportunitySheets(treasureHunt.opportunitySheets, oldSettings, newSettings);
    }
    if (treasureHunt.replaceExistingMotors != undefined) {
      treasureHunt.replaceExistingMotors = this.convertReplaceExistingMotors(treasureHunt.replaceExistingMotors, oldSettings, newSettings);
    }
    if (treasureHunt.motorDrives != undefined) {
      treasureHunt.motorDrives = this.convertMotorDrives(treasureHunt.motorDrives, oldSettings, newSettings);
    }
    if (treasureHunt.naturalGasReductions != undefined) {
      treasureHunt.naturalGasReductions = this.convertNaturalGasReductions(treasureHunt.naturalGasReductions, oldSettings, newSettings);
    }
    if (treasureHunt.electricityReductions != undefined) {
      treasureHunt.electricityReductions = this.convertElectricityReductions(treasureHunt.electricityReductions, oldSettings, newSettings);
    }
    if (treasureHunt.compressedAirReductions != undefined) {
      treasureHunt.compressedAirReductions = this.convertCompressedAirReductions(treasureHunt.compressedAirReductions, oldSettings, newSettings);
    }
    if (treasureHunt.compressedAirPressureReductions != undefined) {
      treasureHunt.compressedAirPressureReductions = this.convertCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, oldSettings, newSettings);
    }
    if (treasureHunt.waterReductions != undefined) {
      treasureHunt.waterReductions = this.convertWaterReductions(treasureHunt.waterReductions, oldSettings, newSettings);
    }
    if (treasureHunt.steamReductions != undefined) {
      treasureHunt.steamReductions = this.convertSteamReductions(treasureHunt.steamReductions, oldSettings, newSettings);
    }
    if (treasureHunt.currentEnergyUsage != undefined) {
      treasureHunt.currentEnergyUsage = this.convertCurrentEnergyUsage(treasureHunt.currentEnergyUsage, oldSettings, newSettings);
    }

    return treasureHunt;
  }

  //no conversion for lighting needed..
  // convertLightingReplacements(lightingReplacements: Array<LightingReplacementTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<LightingReplacementTreasureHunt> {

  //   return lightingReplacements;
  // }
  convertOpportunitySheets(opportunitySheets: Array<OpportunitySheet>, oldSettings: Settings, newSettings: Settings): Array<OpportunitySheet> {

    return opportunitySheets;
  }
  convertReplaceExistingMotors(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ReplaceExistingMotorTreasureHunt> {
    replaceExistingMotors.forEach(replaceExistingMotor => {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        replaceExistingMotor.replaceExistingData.motorSize = this.convertValue(replaceExistingMotor.replaceExistingData.motorSize, 'hp', 'kW');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        replaceExistingMotor.replaceExistingData.motorSize = this.convertValue(replaceExistingMotor.replaceExistingData.motorSize, 'kW', 'hp');
      }
    });
    return replaceExistingMotors;
  }
  convertMotorDrives(motorDrives: Array<MotorDriveInputsTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<MotorDriveInputsTreasureHunt> {
    motorDrives.forEach(drive => {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        drive.motorDriveInputs.motorPower = this.convertValue(drive.motorDriveInputs.motorPower, 'hp', 'kW');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        drive.motorDriveInputs.motorPower = this.convertValue(drive.motorDriveInputs.motorPower, 'kW', 'hp');
      }
    });
    return motorDrives;
  }
  convertNaturalGasReductions(naturalGasReductions: Array<NaturalGasReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<NaturalGasReductionTreasureHunt> {
    naturalGasReductions.forEach(reductionThItem => {
      reductionThItem.baseline.forEach(reduction => {
        reduction = this.convertNaturalGasReduction(reduction, oldSettings, newSettings);
      });
      reductionThItem.modification.forEach(reduction => {
        reduction = this.convertNaturalGasReduction(reduction, oldSettings, newSettings);
      })
    });
    return naturalGasReductions;
  }

  convertNaturalGasReduction(reduction: NaturalGasReductionData, oldSettings: Settings, newSettings: Settings): NaturalGasReductionData {
    //imperial: $/MMBtu, metric: $/GJ
    reduction.fuelCost
    //imperial: ft3/hr, metric: m3/hr
    reduction.flowMeterMethodData.flowRate
    //imperial: MMBtu/yr metric: GJ/yr
    reduction.otherMethodData.consumption
    //imperial F, metric: C
    reduction.airMassFlowData.inletTemperature
    //imperial F, metric: C
    reduction.airMassFlowData.outletTemperature
    //imperial: ft2, metric: cm2
    reduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct
    //imperial: ft, metric: m
    reduction.airMassFlowData.airMassFlowMeasuredData.airVelocity
    //imperial: ft3/min, metric: L/s
    reduction.airMassFlowData.airMassFlowNameplateData.airFlow
    //imperial: gpm, metric: L/s
    reduction.waterMassFlowData.waterFlow
    //imperial: ft, metric: m
    reduction.waterMassFlowData.inletTemperature
    //imperial: ft, metric: m
    reduction.waterMassFlowData.outletTemperature
    return reduction;
  }
  convertElectricityReductions(electricityReductions: Array<ElectricityReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ElectricityReductionTreasureHunt> {
    return electricityReductions;
  }
  convertCompressedAirReductions(compressedAirReductions: Array<CompressedAirReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CompressedAirReductionTreasureHunt> {

    return compressedAirReductions;
  }
  convertCompressedAirPressureReductions(compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CompressedAirPressureReductionTreasureHunt> {

    return compressedAirPressureReductions;
  }
  convertWaterReductions(waterReductions: Array<WaterReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WaterReductionTreasureHunt> {
    return waterReductions;
  }
  convertSteamReductions(steamReductions: Array<SteamReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<SteamReductionTreasureHunt> {

    return steamReductions;
  }
  convertCurrentEnergyUsage(currentEnergyUsage: EnergyUsage, oldSettings: Settings, newSettings: Settings): EnergyUsage {

    return currentEnergyUsage;
  }


  convertValue(value: number, oldUnit: string, newUnit: string): number {
    value = this.convertUnitsService.value(value).from(oldUnit).to(newUnit);
    return value;
  }
}
