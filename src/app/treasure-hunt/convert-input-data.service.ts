import { Injectable } from '@angular/core';
import { TreasureHunt, OpportunitySheet, EnergyUseItem, EnergyUsage, HeatCascadingTreasureHunt, AssessmentOpportunity,  } from '../shared/models/treasure-hunt';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { AirLeakTreasureHuntService } from './treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from './treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from './treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from './treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { FlueGasTreasureHuntService } from './treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from './treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from './treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from './treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { SteamReductionTreasureHuntService } from './treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from './treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { WallTreasureHuntService } from './treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from './treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { LeakageTreasureHuntService } from './treasure-hunt-calculator-services/leakage-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from './treasure-hunt-calculator-services/waste-heat-treasure-hunt.service';
import { OpeningTreasureHuntService } from './treasure-hunt-calculator-services/opening-treasure-hunt.service';
import { AirHeatingTreasureHuntService } from './treasure-hunt-calculator-services/air-heating-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from './treasure-hunt-calculator-services/heat-cascading-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from './treasure-hunt-calculator-services/water-heating-treasure-hunt.service';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';
import { CoolingTowerMakeupTreasureHuntService } from './treasure-hunt-calculator-services/cooling-tower-makeup-treasure-hunt.service';
import { ChillerStagingTreasureHuntService } from './treasure-hunt-calculator-services/chiller-staging-treasure-hunt.service';
import { ChillerPerformanceTreasureHuntService } from './treasure-hunt-calculator-services/chiller-performance-treasure-hunt.service';
import { CoolingTowerFanTreasureHuntService } from './treasure-hunt-calculator-services/cooling-tower-fan-treasure-hunt.service';
import { CoolingTowerBasinTreasureHuntService } from './treasure-hunt-calculator-services/cooling-tower-basin-treasure-hunt.service';
import { BoilerBlowdownRateTreasureHuntService } from './treasure-hunt-calculator-services/boiler-blowdown-rate-treasure-hunt.service';

@Injectable()
export class ConvertInputDataService {

  constructor(private convertUnitsService: ConvertUnitsService,
    private airLeakTreasureService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private replaceExistingTreasureService: ReplaceExistingTreasureHuntService,
    private motorDriveTreasureHuntService: MotorDriveTreasureHuntService,
    private naturalGasTreasureHuntService: NaturalGasReductionTreasureHuntService,
    private electricityReductionTreasureHuntService: ElectricityReductionTreasureHuntService,
    private compressedAirTreasureHuntService: CaReductionTreasureHuntService,
    private compressedAirPressureTreasureHuntService: CaPressureReductionTreasureHuntService,
    private waterReductionTreasureHuntService: WaterReductionTreasureHuntService,
    private steamReductionTreasureHuntService: SteamReductionTreasureHuntService,
    private wasteHeatTreasureHuntService: WasteHeatTreasureHuntService,
    private airHeatingTreasureHuntService: AirHeatingTreasureHuntService,
    private wallTreasureService: WallTreasureHuntService,
    private openingTreasureService: OpeningTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService,
    private leakageTreasureHuntService: LeakageTreasureHuntService,
    private heatCascadingTreasureHuntService: HeatCascadingTreasureHuntService,
    private waterHeatingTreasureHuntService: WaterHeatingTreasureHuntService,
    private coolingTowerMakeupTreasureHuntService: CoolingTowerMakeupTreasureHuntService,
    private chillerStagingTreasureHuntService: ChillerStagingTreasureHuntService,
    private chillerPerformanceTreasureHuntService: ChillerPerformanceTreasureHuntService,
    private coolingTowerFanTreasureHuntService: CoolingTowerFanTreasureHuntService,
    private coolingTowerBasinTreasureHuntService: CoolingTowerBasinTreasureHuntService,
    private boilerBlowdownRateTreasureHuntService: BoilerBlowdownRateTreasureHuntService
    ) { }

  convertTreasureHuntInputData(treasureHunt: TreasureHunt, oldSettings: Settings, newSettings: Settings): TreasureHunt {
    //no conversion for lighting needed..
    if (treasureHunt.opportunitySheets != undefined) {
      let opportunitySheets = this.convertCustomOpportunity(treasureHunt.opportunitySheets, oldSettings, newSettings);
      treasureHunt.opportunitySheets = opportunitySheets as OpportunitySheet[];
    }
    if (treasureHunt.assessmentOpportunities != undefined) {
      let assessmentOpportunities = this.convertCustomOpportunity(treasureHunt.assessmentOpportunities, oldSettings, newSettings);
      treasureHunt.assessmentOpportunities = assessmentOpportunities as AssessmentOpportunity[];
    }
    if (treasureHunt.replaceExistingMotors != undefined) {
      treasureHunt.replaceExistingMotors = this.replaceExistingTreasureService.convertReplaceExistingMotors(treasureHunt.replaceExistingMotors, oldSettings, newSettings);
    }
    if (treasureHunt.motorDrives != undefined) {
      treasureHunt.motorDrives = this.motorDriveTreasureHuntService.convertMotorDrives(treasureHunt.motorDrives, oldSettings, newSettings);
    }
    if (treasureHunt.naturalGasReductions != undefined) {
      treasureHunt.naturalGasReductions = this.naturalGasTreasureHuntService.convertNaturalGasReductions(treasureHunt.naturalGasReductions, oldSettings, newSettings);
    }
    if (treasureHunt.compressedAirReductions != undefined) {
      treasureHunt.compressedAirReductions = this.compressedAirTreasureHuntService.convertCompressedAirReductions(treasureHunt.compressedAirReductions, oldSettings, newSettings);
    }
    if (treasureHunt.compressedAirPressureReductions != undefined) {
      treasureHunt.compressedAirPressureReductions = this.compressedAirPressureTreasureHuntService.convertCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, oldSettings, newSettings);
    }
    if (treasureHunt.waterReductions != undefined) {
      treasureHunt.waterReductions = this.waterReductionTreasureHuntService.convertWaterReductions(treasureHunt.waterReductions, oldSettings, newSettings);
    }
    if (treasureHunt.steamReductions != undefined) {
      treasureHunt.steamReductions = this.steamReductionTreasureHuntService.convertSteamReductions(treasureHunt.steamReductions, oldSettings, newSettings);
    }
    if (treasureHunt.tankInsulationReductions != undefined) {
      treasureHunt.tankInsulationReductions = this.tankInsulationTreasureHuntService.convertTankInsulationReductions(treasureHunt.tankInsulationReductions, oldSettings, newSettings);
    }
    if (treasureHunt.flueGasLosses != undefined) {
      treasureHunt.flueGasLosses = this.flueGasTreasureHuntService.convertFlueGasLosses(treasureHunt.flueGasLosses, oldSettings, newSettings);
    }
    if (treasureHunt.wallLosses != undefined) {
      treasureHunt.wallLosses = this.wallTreasureService.convertWallLosses(treasureHunt.wallLosses, oldSettings, newSettings);
    }
    if (treasureHunt.wasteHeatReductions != undefined) {
      treasureHunt.wasteHeatReductions = this.wasteHeatTreasureHuntService.convertWasteHeatReductions(treasureHunt.wasteHeatReductions, oldSettings, newSettings);
    }
    if (treasureHunt.airHeatingOpportunities != undefined) {
      treasureHunt.airHeatingOpportunities = this.airHeatingTreasureHuntService.convertAirHeatingOpportunities(treasureHunt.airHeatingOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.openingLosses != undefined) {
      treasureHunt.openingLosses = this.openingTreasureService.convertOpeningLosses(treasureHunt.openingLosses, oldSettings, newSettings);
    }
    if (treasureHunt.airLeakSurveys != undefined) {
      treasureHunt.airLeakSurveys = this.airLeakTreasureService.convertAirLeakSurveys(treasureHunt.airLeakSurveys, oldSettings, newSettings);
    }
    if (treasureHunt.leakageLosses != undefined) {
      treasureHunt.leakageLosses = this.leakageTreasureHuntService.convertLeakageLosses(treasureHunt.leakageLosses, oldSettings, newSettings);
    }
    if (treasureHunt.heatCascadingOpportunities != undefined) {
      treasureHunt.heatCascadingOpportunities = this.heatCascadingTreasureHuntService.convertHeatCascadingOpportunities(treasureHunt.heatCascadingOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.waterHeatingOpportunities != undefined) {
      treasureHunt.waterHeatingOpportunities = this.waterHeatingTreasureHuntService.convertWaterHeatingOpportunities(treasureHunt.waterHeatingOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.coolingTowerMakeupOpportunities != undefined) {
      treasureHunt.coolingTowerMakeupOpportunities = this.coolingTowerMakeupTreasureHuntService.convertCoolingTowerMakeups(treasureHunt.coolingTowerMakeupOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.chillerStagingOpportunities != undefined) {
      treasureHunt.chillerStagingOpportunities = this.chillerStagingTreasureHuntService.convertChillerStagingOpportunities(treasureHunt.chillerStagingOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.chillerPerformanceOpportunities != undefined) {
      treasureHunt.chillerPerformanceOpportunities = this.chillerPerformanceTreasureHuntService.convertChillerPerformanceOpportunities(treasureHunt.chillerPerformanceOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.coolingTowerFanOpportunities != undefined) {
      treasureHunt.coolingTowerFanOpportunities = this.coolingTowerFanTreasureHuntService.convertCoolingTowerFanOpportunities(treasureHunt.coolingTowerFanOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.coolingTowerBasinOpportunities != undefined) {
      treasureHunt.coolingTowerBasinOpportunities = this.coolingTowerBasinTreasureHuntService.convertCoolingTowerBasinOpportunities(treasureHunt.coolingTowerBasinOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.boilerBlowdownRateOpportunities != undefined) {
      treasureHunt.boilerBlowdownRateOpportunities = this.boilerBlowdownRateTreasureHuntService.convertBoilerBlowdownRates(treasureHunt.boilerBlowdownRateOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.currentEnergyUsage != undefined) {
      treasureHunt.currentEnergyUsage = this.convertCurrentEnergyUsage(treasureHunt.currentEnergyUsage, oldSettings, newSettings);
    }
    return treasureHunt;
  }


  convertCustomOpportunity(opportunitySheets: Array<OpportunitySheet | AssessmentOpportunity>, oldSettings: Settings, newSettings: Settings): Array<OpportunitySheet | AssessmentOpportunity> {
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
      //imperial: MMBtu, metric: GJ
      energyUseItem.amount = this.convertUnitsService.convertMMBtuAndGJValue(energyUseItem.amount, oldSettings, newSettings);
      energyUseItem.amount = this.roundVal(energyUseItem.amount);
    } else if (energyUseItem.type == 'Water' || energyUseItem.type == 'WWT') {
      //imperial: gal, metric: L 
      energyUseItem.amount = this.convertUnitsService.convertGalAndLiterValue(energyUseItem.amount, oldSettings, newSettings);
      energyUseItem.amount = this.roundVal(energyUseItem.amount);
    } else if (energyUseItem.type == 'Compressed Air') {
      //imperial: scf, metric: m3
      energyUseItem.amount = this.convertUnitsService.convertFt3AndM3Value(energyUseItem.amount, oldSettings, newSettings);
      energyUseItem.amount = this.roundVal(energyUseItem.amount);
    } else if (energyUseItem.type == 'Steam') {
      //imperial: klb, metric: tonne
      energyUseItem.amount = this.convertUnitsService.convertKlbAndTonneValue(energyUseItem.amount, oldSettings, newSettings);
      energyUseItem.amount = this.roundVal(energyUseItem.amount);
    }
    return energyUseItem;
  }


  convertCurrentEnergyUsage(currentEnergyUsage: EnergyUsage, oldSettings: Settings, newSettings: Settings): EnergyUsage {
    //imperial: MMBtu/yr, metric: GJ/yr
    currentEnergyUsage.naturalGasUsage = this.convertUnitsService.convertMMBtuAndGJValue(currentEnergyUsage.naturalGasUsage, oldSettings, newSettings);
    currentEnergyUsage.naturalGasUsage = this.roundVal(currentEnergyUsage.naturalGasUsage);
    //imperial: MMBtu/yr, metric: GJ/yr
    currentEnergyUsage.otherFuelUsage = this.convertUnitsService.convertMMBtuAndGJValue(currentEnergyUsage.otherFuelUsage, oldSettings, newSettings);
    currentEnergyUsage.otherFuelUsage = this.roundVal(currentEnergyUsage.otherFuelUsage);
    //imperial: kgal/yr, metric: L/yr
    currentEnergyUsage.waterUsage = this.convertUnitsService.convertKGalAndLiterValue(currentEnergyUsage.waterUsage, oldSettings, newSettings);
    currentEnergyUsage.waterUsage = this.roundVal(currentEnergyUsage.waterUsage);
    //imperial: kgal/yr, metric: L/yr
    currentEnergyUsage.wasteWaterUsage = this.convertUnitsService.convertKGalAndLiterValue(currentEnergyUsage.wasteWaterUsage, oldSettings, newSettings);
    currentEnergyUsage.wasteWaterUsage = this.roundVal(currentEnergyUsage.wasteWaterUsage);
    //imperial: kscf/yr , metric: m3/yr
    currentEnergyUsage.compressedAirUsage = this.convertUnitsService.convertKscfAndM3Value(currentEnergyUsage.compressedAirUsage, oldSettings, newSettings);
    currentEnergyUsage.compressedAirUsage = this.roundVal(currentEnergyUsage.compressedAirUsage);
    //imperial: klb/yr, metric: tonne/yr
    currentEnergyUsage.steamUsage = this.convertUnitsService.convertKlbAndTonneValue(currentEnergyUsage.steamUsage, oldSettings, newSettings);
    currentEnergyUsage.steamUsage = this.roundVal(currentEnergyUsage.steamUsage);
    
    let oldFuelUnit: string = 'MMBtu'; 
    let newFuelUnit: string = 'GJ';
    if (oldSettings.unitsOfMeasure === 'Imperial') {
      currentEnergyUsage.waterCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.waterCO2OutputRate, 'kgal', 'L');
      currentEnergyUsage.waterCO2OutputRate = this.roundVal(currentEnergyUsage.waterCO2OutputRate);

      currentEnergyUsage.wasteWaterCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.wasteWaterCO2OutputRate, 'kgal', 'L');
      currentEnergyUsage.wasteWaterCO2OutputRate = this.roundVal(currentEnergyUsage.wasteWaterCO2OutputRate);

      currentEnergyUsage.compressedAirCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.compressedAirCO2OutputRate, 'kscf', 'm3');
      currentEnergyUsage.compressedAirCO2OutputRate = this.roundVal(currentEnergyUsage.compressedAirCO2OutputRate);

      currentEnergyUsage.steamCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.steamCO2OutputRate, 'klb', 'tonne');
      currentEnergyUsage.steamCO2OutputRate = this.roundVal(currentEnergyUsage.steamCO2OutputRate);    
    } else {
      oldFuelUnit = 'GJ';
      newFuelUnit = 'MMBtu';
      currentEnergyUsage.waterCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.waterCO2OutputRate, 'L', 'kgal');
      currentEnergyUsage.waterCO2OutputRate = this.roundVal(currentEnergyUsage.waterCO2OutputRate);

      currentEnergyUsage.wasteWaterCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.wasteWaterCO2OutputRate, 'L', 'kgal');
      currentEnergyUsage.wasteWaterCO2OutputRate = this.roundVal(currentEnergyUsage.wasteWaterCO2OutputRate);

      currentEnergyUsage.compressedAirCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.compressedAirCO2OutputRate, 'm3', 'kscf');
      currentEnergyUsage.compressedAirCO2OutputRate = this.roundVal(currentEnergyUsage.compressedAirCO2OutputRate);

      currentEnergyUsage.steamCO2OutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.steamCO2OutputRate, 'tonne', 'klb');
      currentEnergyUsage.steamCO2OutputRate = this.roundVal(currentEnergyUsage.steamCO2OutputRate);
    }

    currentEnergyUsage.naturalGasCO2SavingsData.totalEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.naturalGasCO2SavingsData.totalEmissionOutputRate, oldFuelUnit, newFuelUnit);
    currentEnergyUsage.naturalGasCO2SavingsData.totalEmissionOutputRate = this.roundVal(currentEnergyUsage.naturalGasCO2SavingsData.totalEmissionOutputRate);

    currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate, oldFuelUnit, newFuelUnit);
    currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = this.roundVal(currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate);

    if(currentEnergyUsage.otherFuelMixedCO2SavingsData && currentEnergyUsage.otherFuelMixedCO2SavingsData.length != 0){
      currentEnergyUsage.otherFuelMixedCO2SavingsData.forEach(fuel => {
        fuel.totalEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(fuel.totalEmissionOutputRate, oldFuelUnit, newFuelUnit);
        fuel.totalEmissionOutputRate = this.roundVal(fuel.totalEmissionOutputRate);

      });
    }
    

    return currentEnergyUsage;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }

}
