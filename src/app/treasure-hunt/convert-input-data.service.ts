import { Injectable } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt, EnergyUsage, EnergyUseItem, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt } from '../shared/models/treasure-hunt';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { NaturalGasReductionData, ElectricityReductionData, CompressedAirReductionData, CompressedAirPressureReductionData, WaterReductionData, SteamReductionData, TankInsulationReductionInput, AirLeakSurveyInput } from '../shared/models/standalone';

@Injectable()
export class ConvertInputDataService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertTreasureHuntInputData(treasureHunt: TreasureHunt, oldSettings: Settings, newSettings: Settings): TreasureHunt {
    //no conversion for lighting needed..
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
    if (treasureHunt.tankInsulationReductions != undefined) {
      treasureHunt.tankInsulationReductions = this.convertTankInsulationReductions(treasureHunt.tankInsulationReductions, oldSettings, newSettings);
    }
    if (treasureHunt.airLeakSurveys != undefined) {
      treasureHunt.airLeakSurveys = this.convertAirLeakSurveys(treasureHunt.airLeakSurveys, oldSettings, newSettings);
    }
    if (treasureHunt.currentEnergyUsage != undefined) {
      treasureHunt.currentEnergyUsage = this.convertCurrentEnergyUsage(treasureHunt.currentEnergyUsage, oldSettings, newSettings);
    }
    return treasureHunt;
  }

  convertSettingsUnitCosts(oldSettings: Settings, newSettings: Settings): Settings {
    //imperial: $/MMBtu, metric: $/GJ
    newSettings.fuelCost = this.convertDollarsPerMMBtuAndGJ(newSettings.fuelCost, oldSettings, newSettings);
    //imperial: $/klb, metric: $/tonne
    newSettings.steamCost = this.convertDollarsPerKlbAndTonne(newSettings.steamCost, oldSettings, newSettings);
    //imperial: $/gal, metric: $/L
    newSettings.waterCost = this.convertDollarsPerGalAndLiter(newSettings.waterCost, oldSettings, newSettings);
    //imperial: $/MMBtu, metric: $/GJ
    newSettings.otherFuelCost = this.convertDollarsPerMMBtuAndGJ(newSettings.otherFuelCost, oldSettings, newSettings);
    //imperial: $/gal, metric: $/L
    newSettings.waterWasteCost = this.convertDollarsPerGalAndLiter(newSettings.waterWasteCost, oldSettings, newSettings);
    //imperial: $/SCF, metric: $/m2
    newSettings.compressedAirCost = this.convertDollarsPerFt3AndM3(newSettings.compressedAirCost, oldSettings, newSettings);
    return newSettings;
  }

  convertOpportunitySheets(opportunitySheets: Array<OpportunitySheet>, oldSettings: Settings, newSettings: Settings): Array<OpportunitySheet> {
    opportunitySheets.forEach(sheet => {
      sheet.baselineEnergyUseItems.forEach(item => {
        item = this.convertEnergyUseItem(item, oldSettings, newSettings);
      });
      sheet.modificationEnergyUseItems.forEach(item => {
        item = this.convertEnergyUseItem(item, oldSettings, newSettings);
      });
    })
    return opportunitySheets;
  }

  convertEnergyUseItem(energyUseItem: EnergyUseItem, oldSettings: Settings, newSettings: Settings): EnergyUseItem {
    if (energyUseItem.type == 'Gas' || energyUseItem.type == 'Other Fuel') {
      //imperial: MMBtu, metric: MJ
      energyUseItem.amount = this.convertMMBtuAndGJValue(energyUseItem.amount, oldSettings, newSettings);
    } else if (energyUseItem.type == 'Water' || energyUseItem.type == 'WWT') {
      //imperial: gal, metric: L 
      energyUseItem.amount = this.convertGalAndLiterValue(energyUseItem.amount, oldSettings, newSettings);
    } else if (energyUseItem.type == 'Compressed Air') {
      //imperial: SCF, metric: m3
      energyUseItem.amount = this.convertFt3AndM3Value(energyUseItem.amount, oldSettings, newSettings);
    } else if (energyUseItem.type == 'Steam') {
      //imperial: klb, metric: tonne
      energyUseItem.amount = this.convertKlbAndTonneValue(energyUseItem.amount, oldSettings, newSettings);
    }
    return energyUseItem;
  }

  convertReplaceExistingMotors(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ReplaceExistingMotorTreasureHunt> {
    replaceExistingMotors.forEach(replaceExistingMotor => {
      //imperial: hp, metric: kW
      replaceExistingMotor.replaceExistingData.motorSize = this.convertPowerValue(replaceExistingMotor.replaceExistingData.motorSize, oldSettings, newSettings);
    });
    return replaceExistingMotors;
  }
  convertMotorDrives(motorDrives: Array<MotorDriveInputsTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<MotorDriveInputsTreasureHunt> {
    motorDrives.forEach(drive => {
      //imperial: hp, metric: kW
      drive.motorDriveInputs.motorPower = this.convertPowerValue(drive.motorDriveInputs.motorPower, oldSettings, newSettings);
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
    reduction.fuelCost = this.convertDollarsPerMMBtuAndGJ(reduction.fuelCost, oldSettings, newSettings);
    //imperial: ft3/hr, metric: m3/hr
    reduction.flowMeterMethodData.flowRate = this.convertFt3AndM3Value(reduction.flowMeterMethodData.flowRate, oldSettings, newSettings);
    //imperial: MMBtu/yr metric: GJ/yr
    reduction.otherMethodData.consumption = this.convertMMBtuAndGJValue(reduction.otherMethodData.consumption, oldSettings, newSettings);
    //imperial F, metric: C
    reduction.airMassFlowData.inletTemperature = this.convertTemperatureValue(reduction.airMassFlowData.inletTemperature, oldSettings, newSettings);
    //imperial F, metric: C
    reduction.airMassFlowData.outletTemperature = this.convertTemperatureValue(reduction.airMassFlowData.outletTemperature, oldSettings, newSettings);
    //imperial: ft2, metric: cm2
    reduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct = this.convertFt2AndCm2Value(reduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct, oldSettings, newSettings);
    //imperial: ft, metric: m
    reduction.airMassFlowData.airMassFlowMeasuredData.airVelocity = this.convertFtAndMeterValue(reduction.airMassFlowData.airMassFlowMeasuredData.airVelocity, oldSettings, newSettings);
    //imperial: ft3/min, metric: L/s
    reduction.airMassFlowData.airMassFlowNameplateData.airFlow = this.convertFt3AndLiterValue(reduction.airMassFlowData.airMassFlowNameplateData.airFlow, oldSettings, newSettings);
    //imperial: gpm, metric: L/s
    reduction.waterMassFlowData.waterFlow = this.convertGallonPerMinuteAndLiterPerSecondValue(reduction.waterMassFlowData.waterFlow, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowData.inletTemperature = this.convertTemperatureValue(reduction.waterMassFlowData.inletTemperature, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowData.outletTemperature = this.convertTemperatureValue(reduction.waterMassFlowData.outletTemperature, oldSettings, newSettings);
    return reduction;
  }
  convertElectricityReductions(electricityReductions: Array<ElectricityReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ElectricityReductionTreasureHunt> {
    electricityReductions.forEach(electricityReduction => {
      electricityReduction.baseline.forEach(reduction => {
        reduction = this.convertElectricityReduction(reduction, oldSettings, newSettings);
      });
      electricityReduction.modification.forEach(reduction => {
        reduction = this.convertElectricityReduction(reduction, oldSettings, newSettings);
      })
    });
    return electricityReductions;
  }

  convertElectricityReduction(reduction: ElectricityReductionData, oldSettings: Settings, newSettings: Settings): ElectricityReductionData {
    //imperial: hp, metric: kW
    reduction.nameplateData.ratedMotorPower = this.convertPowerValue(reduction.nameplateData.ratedMotorPower, oldSettings, newSettings);
    return reduction;
  }


  convertCompressedAirReductions(compressedAirReductions: Array<CompressedAirReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CompressedAirReductionTreasureHunt> {
    compressedAirReductions.forEach(compressedAirReduction => {
      compressedAirReduction.baseline.forEach(reduction => {
        reduction = this.convertCompressedAirReduction(reduction, oldSettings, newSettings);
      });
      compressedAirReduction.modification.forEach(reduction => {
        reduction = this.convertCompressedAirReduction(reduction, oldSettings, newSettings);
      });
    })
    return compressedAirReductions;
  }

  convertCompressedAirReduction(reduction: CompressedAirReductionData, oldSettings: Settings, newSettings: Settings): CompressedAirReductionData {
    // imperial: $/SCF, metric: $/m3
    reduction.compressedAirCost = this.convertDollarsPerFt3AndM3(reduction.compressedAirCost, oldSettings, newSettings);
    //I believe utility cost is just set before sending to calculations so it does not need a conversion,
    //will use electrity cost or compressed air cost
    // reduction.utilityCost

    //imperial: SCF/min, metric: m3/min
    reduction.flowMeterMethodData.meterReading = this.convertFt3AndM3Value(reduction.flowMeterMethodData.meterReading, oldSettings, newSettings);
    //imperial: in, metric: cm
    reduction.bagMethodData.height = this.convertInAndCmValue(reduction.bagMethodData.height, oldSettings, newSettings);
    //imperial: in, metric: cm
    reduction.bagMethodData.diameter = this.convertInAndCmValue(reduction.bagMethodData.diameter, oldSettings, newSettings);
    //imperial: psig, metric: barg
    reduction.pressureMethodData.supplyPressure = this.convertPsigAndBargValue(reduction.pressureMethodData.supplyPressure, oldSettings, newSettings);
    //imperial: kSCF/yr, metric: m3/yr
    reduction.otherMethodData.consumption = this.convertKSCFAndM3Value(reduction.otherMethodData.consumption, oldSettings, newSettings);
    //imperial: kW/SCFM, metric: kW/(m3/min)
    reduction.compressorElectricityData.compressorSpecificPower = this.convertDollarsPerFt3AndM3(reduction.compressorElectricityData.compressorSpecificPower, oldSettings, newSettings);

    return reduction;
  }


  convertCompressedAirPressureReductions(compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CompressedAirPressureReductionTreasureHunt> {
    compressedAirPressureReductions.forEach(compressedAirPressureReduction => {
      compressedAirPressureReduction.baseline.forEach(reduction => {
        reduction = this.convertCompressedAirPressureReduction(reduction, oldSettings, newSettings);
      });
      compressedAirPressureReduction.modification.forEach(reduction => {
        reduction = this.convertCompressedAirPressureReduction(reduction, oldSettings, newSettings);
      });
    });
    return compressedAirPressureReductions;
  }
  convertCompressedAirPressureReduction(reduction: CompressedAirPressureReductionData, oldSettings: Settings, newSettings: Settings): CompressedAirPressureReductionData {
    //imperial: psig, metric: barg
    reduction.pressure = this.convertPsigAndBargValue(reduction.pressure, oldSettings, newSettings);
    reduction.proposedPressure = this.convertPsigAndBargValue(reduction.proposedPressure, oldSettings, newSettings);
    return reduction;
  }


  convertWaterReductions(waterReductions: Array<WaterReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WaterReductionTreasureHunt> {
    waterReductions.forEach(waterReduction => {
      waterReduction.baseline.forEach(reduction => {
        reduction = this.convertWaterReduction(reduction, oldSettings, newSettings);
      });
      waterReduction.modification.forEach(reduction => {
        reduction = this.convertWaterReduction(reduction, oldSettings, newSettings);
      });
    })
    return waterReductions;
  }

  convertWaterReduction(reduction: WaterReductionData, oldSettings: Settings, newSettings: Settings): WaterReductionData {
    //imperial: $/gal, metric: $/L
    reduction.waterCost = this.convertDollarsPerGalAndLiter(reduction.waterCost, oldSettings, newSettings);
    //imperial: gpm, metric: L/min
    reduction.meteredFlowMethodData.meterReading = this.convertGallonPerMinuteAndLiterPerSecondValue(reduction.meteredFlowMethodData.meterReading, oldSettings, newSettings);
    reduction.volumeMeterMethodData.finalMeterReading = this.convertGallonPerMinuteAndLiterPerSecondValue(reduction.volumeMeterMethodData.finalMeterReading, oldSettings, newSettings);
    reduction.volumeMeterMethodData.initialMeterReading = this.convertGallonPerMinuteAndLiterPerSecondValue(reduction.volumeMeterMethodData.initialMeterReading, oldSettings, newSettings);
    //imperial: gal, metric: L
    reduction.bucketMethodData.bucketVolume = this.convertGalAndLiterValue(reduction.bucketMethodData.bucketVolume, oldSettings, newSettings);
    //imperial: gal/yr, metric: m3/yr
    reduction.otherMethodData.consumption = this.convertGalAndM3Value(reduction.otherMethodData.consumption, oldSettings, newSettings);
    return reduction;
  }


  convertSteamReductions(steamReductions: Array<SteamReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<SteamReductionTreasureHunt> {
    steamReductions.forEach(steamReduction => {
      steamReduction.baseline.forEach(reduction => {
        reduction = this.convertSteamReduction(reduction, oldSettings, newSettings);
      });
      steamReduction.modification.forEach(reduction => {
        reduction = this.convertSteamReduction(reduction, oldSettings, newSettings);
      })
    })
    return steamReductions;
  }

  convertSteamReduction(reduction: SteamReductionData, oldSettings: Settings, newSettings: Settings): SteamReductionData {
    //utilityType = 0: imperial: $/klb, metric: $/tonne
    //utilityType != 0: imperial: $/MMBtu, metric: $/GJ
    if (reduction.utilityType == 0) {
      reduction.utilityCost = this.convertDollarsPerKlbAndTonne(reduction.utilityCost, oldSettings, newSettings);
    } else {
      reduction.utilityCost = this.convertDollarsPerMMBtuAndGJ(reduction.utilityCost, oldSettings, newSettings);
    }

    //imperial: psig, metric: barg
    reduction.pressure = this.convertPsigAndBargValue(reduction.pressure, oldSettings, newSettings);
    //imperial: lb/hr, metric: kg/hr
    reduction.flowMeterMethodData.flowRate = this.convertLbAndKgValue(reduction.flowMeterMethodData.flowRate, oldSettings, newSettings);
    //imperial ft/min, metric: m/min
    reduction.airMassFlowMethodData.massFlowMeasuredData.airVelocity = this.convertFtAndMeterValue(reduction.airMassFlowMethodData.massFlowMeasuredData.airVelocity, oldSettings, newSettings);
    //imperial: ft2, metric: cm2
    reduction.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertFt2AndCm2Value(reduction.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.airMassFlowMethodData.inletTemperature = this.convertTemperatureValue(reduction.airMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.airMassFlowMethodData.outletTemperature = this.convertTemperatureValue(reduction.airMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: ft3/min, metric: L/s
    reduction.airMassFlowMethodData.massFlowNameplateData.flowRate = this.convertFt3AndLiterValue(reduction.airMassFlowMethodData.massFlowNameplateData.flowRate, oldSettings, newSettings);

    //imperial ft/min, metric: m/min
    reduction.waterMassFlowMethodData.massFlowMeasuredData.airVelocity = this.convertFtAndMeterValue(reduction.waterMassFlowMethodData.massFlowMeasuredData.airVelocity, oldSettings, newSettings);
    //imperial: ft2, metric: cm2
    reduction.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertFt2AndCm2Value(reduction.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowMethodData.inletTemperature = this.convertTemperatureValue(reduction.waterMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowMethodData.outletTemperature = this.convertTemperatureValue(reduction.waterMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: gpm, metric: L/s
    reduction.waterMassFlowMethodData.massFlowNameplateData.flowRate = this.convertGallonPerMinuteAndLiterPerSecondValue(reduction.waterMassFlowMethodData.massFlowNameplateData.flowRate, oldSettings, newSettings);
    return reduction;
  }

  convertTankInsulationReductions(tankReductions: Array<TankInsulationReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<TankInsulationReductionTreasureHunt> {
    tankReductions.forEach(tankReduction => {
      tankReduction.baseline = this.convertTankInsulationReduction(tankReduction.baseline, oldSettings, newSettings);
      tankReduction.modification = this.convertTankInsulationReduction(tankReduction.modification, oldSettings, newSettings);
    })
    return tankReductions;
  }

  convertTankInsulationReduction(reduction: TankInsulationReductionInput, oldSettings: Settings, newSettings: Settings): TankInsulationReductionInput {
    //utilityType imperial: $/MMBtu, metric: $/GJ
    reduction.utilityCost = this.convertDollarsPerMMBtuAndGJ(reduction.utilityCost, oldSettings, newSettings);

    //tankHeight imperial: ft, metric: m
    reduction.tankHeight = this.convertFtAndMeterValue(reduction.tankHeight, oldSettings, newSettings);
    //tankDiameter imperial: ft, metric: m
    reduction.tankDiameter = this.convertFtAndMeterValue(reduction.tankDiameter, oldSettings, newSettings);
    //tankThickness imperial: ft, metric: m
    reduction.tankThickness = this.convertFtAndMeterValue(reduction.tankThickness, oldSettings, newSettings);
    //insulationThickness imperial: ft, metric: m
    reduction.insulationThickness = this.convertFtAndMeterValue(reduction.insulationThickness, oldSettings, newSettings);
    //tankTemperature imperial: F, metric: C
    reduction.tankTemperature = this.convertTemperatureValue(reduction.tankTemperature, oldSettings, newSettings);
    //ambientTemperature imperial: F, metric: C
    reduction.ambientTemperature = this.convertTemperatureValue(reduction.ambientTemperature, oldSettings, newSettings);
    //customInsulationConductivity imperial: Btu/hr*ft*F, metric: W/mK
    reduction.customInsulationConductivity = this.convertConductivity(reduction.customInsulationConductivity, oldSettings, newSettings);
    return reduction;
  }

  convertAirLeakSurveys(airLeakSurveys: Array<AirLeakSurveyTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<AirLeakSurveyTreasureHunt> {
    airLeakSurveys.forEach(airLeakSurvey => {
      airLeakSurvey.airLeakSurveyInput = this.convertAirLeakSurveyInput(airLeakSurvey.airLeakSurveyInput, oldSettings, newSettings);
    });
    return airLeakSurveys;
  }

  convertAirLeakSurveyInput(survey: AirLeakSurveyInput, oldSettings: Settings, newSettings: Settings): AirLeakSurveyInput {
    survey.compressedAirLeakSurveyInputVec.forEach(input => {
      //cm, in
      input.bagMethodData.height = this.convertInAndCmValue(input.bagMethodData.height, oldSettings, newSettings);
      input.bagMethodData.diameter = this.convertInAndCmValue(input.bagMethodData.diameter, oldSettings, newSettings);
      //ft3 m3 
      input.estimateMethodData.leakRateEstimate = this.convertFt3AndM3Value(input.estimateMethodData.leakRateEstimate, oldSettings, newSettings);
      //psig kPag
      input.decibelsMethodData.linePressure = this.convertPsigAndKpag(input.decibelsMethodData.linePressure, oldSettings, newSettings);
      input.decibelsMethodData.pressureA = this.convertPsigAndKpag(input.decibelsMethodData.pressureA, oldSettings, newSettings);
      input.decibelsMethodData.pressureB = this.convertPsigAndKpag(input.decibelsMethodData.pressureB, oldSettings, newSettings);
      //F C
      input.orificeMethodData.compressorAirTemp = this.convertTemperatureValue(input.orificeMethodData.compressorAirTemp, oldSettings, newSettings);
      //psia kPaa
      input.orificeMethodData.atmosphericPressure = this.convertPsiaAndKpaa(input.orificeMethodData.atmosphericPressure, oldSettings, newSettings);
      //in cm
      input.orificeMethodData.orificeDiameter = this.convertInAndCmValue(input.orificeMethodData.orificeDiameter, oldSettings, newSettings);
      //psia kPaa
      input.orificeMethodData.supplyPressure = this.convertPsiaAndKpaa(input.orificeMethodData.supplyPressure, oldSettings, newSettings);
      //1/m3 1/ft3
      input.compressorElectricityData.compressorSpecificPower = this.convertDollarsPerFt3AndM3(input.compressorElectricityData.compressorSpecificPower, oldSettings, newSettings)
    })
    return survey;
  }

  convertCurrentEnergyUsage(currentEnergyUsage: EnergyUsage, oldSettings: Settings, newSettings: Settings): EnergyUsage {
    //imperial: MMBtu/yr, metric: GJ/yr
    currentEnergyUsage.naturalGasUsage = this.convertMMBtuAndGJValue(currentEnergyUsage.naturalGasUsage, oldSettings, newSettings);
    //imperial: MMBtu/yr, metric: GJ/yr
    currentEnergyUsage.otherFuelUsage = this.convertMMBtuAndGJValue(currentEnergyUsage.otherFuelUsage, oldSettings, newSettings);
    //imperial: kgal/yr, metric: L/yr
    currentEnergyUsage.waterUsage = this.convertKGalAndLiterValue(currentEnergyUsage.waterUsage, oldSettings, newSettings);
    //imperial: kgal/yr, metric: L/yr
    currentEnergyUsage.wasteWaterUsage = this.convertKGalAndLiterValue(currentEnergyUsage.wasteWaterUsage, oldSettings, newSettings);
    //imperial: kSCF/yr , metric: m3/yr
    currentEnergyUsage.compressedAirUsage = this.convertKSCFAndM3Value(currentEnergyUsage.compressedAirUsage, oldSettings, newSettings);
    //imperial: klb/yr, metric: tonne/yr
    currentEnergyUsage.steamUsage = this.convertKlbAndTonneValue(currentEnergyUsage.steamUsage, oldSettings, newSettings);
    return currentEnergyUsage;
  }


  convertFt3AndM3Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft3', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3', 'ft3');
    }
  }

  convertMMBtuAndGJValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'MMBtu', 'GJ');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'GJ', 'MMBtu');
    }
  }

  convertPowerValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'hp', 'kW');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kW', 'hp');
    }
  }

  convertTemperatureValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'F', 'C');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'C', 'F');
    }
  }

  convertFt2AndCm2Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft2', 'cm2');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'cm2', 'ft2');
    }
  }

  convertFt3AndLiterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft3', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L', 'ft3');
    }
  }

  convertFtAndMeterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft', 'm');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm', 'ft');
    }
  }

  convertGallonPerMinuteAndLiterPerSecondValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gpm', 'L/s');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L/s', 'gpm');
    }
  }

  convertInAndCmValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'in', 'cm');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'cm', 'in');
    }
  }

  convertPsigAndBargValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'psig', 'barg');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'barg', 'psig');
    }
  }

  convertGalAndLiterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gal', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L', 'gal');
    }
  }

  convertGalAndM3Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gal', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3', 'gal');
    }
  }

  convertLbAndKgValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'lb', 'kg');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kg', 'lb');
    }
  }

  convertKGalAndLiterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'kgal', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L', 'kgal');
    }
  }

  convertKSCFAndM3Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'kSCF', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3', 'kSCF');
    }
  }

  convertKlbAndTonneValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'klb', 'tonne');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'tonne', 'klb');
    }
  }

  convertDollarsPerMMBtuAndGJ(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'MMBtu', 'GJ');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'GJ', 'MMBtu');
    }
  }

  convertDollarsPerGalAndLiter(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'gal', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'L', 'gal');
    }
  }

  convertDollarsPerFt3AndM3(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'ft3', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'm3', 'ft3');
    }
  }

  convertDollarsPerKlbAndTonne(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'klb', 'tonne');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'tonne', 'klb');
    }
  }

  convertConductivity(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'Btu/hr-ft-R', 'W/mK');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'W/mK', 'Btu/hr-ft-R');
    }
  }

  convertPsiaAndKpaa(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'psia', 'kPaa');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kPaa', 'psia');
    }
  }

  convertPsigAndKpag(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'psig', 'kPag');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kPag', 'psig');
    }
  }

  convertValue(value: number, oldUnit: string, newUnit: string): number {
    value = this.convertUnitsService.value(value).from(oldUnit).to(newUnit);
    return value;
  }

  convertDollarPerValue(value: number, oldUnit: string, newUnit: string): number {
    let conversionHelper: number = this.convertUnitsService.value(1).from(oldUnit).to(newUnit);
    return value / conversionHelper;
  }
}
