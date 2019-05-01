import { Injectable } from '@angular/core';
import { TreasureHuntResults, TreasureHunt, OpportunitySheetResults, UtilityUsageData, OpportunitySheetResult } from '../../shared/models/treasure-hunt';
import { LightingReplacementResults } from '../../shared/models/lighting';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { ReplaceExistingResults, MotorDriveOutputs } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { OpportunitySheetService } from '../standalone-opportunity-sheet/opportunity-sheet.service';

@Injectable()
export class TreasureHuntReportService {

  constructor(private lightingReplacementService: LightingReplacementService,
    private motorDriveService: MotorDriveService,
    private replaceExistingService: ReplaceExistingService,
    private opportunitySheetService: OpportunitySheetService) { }

  calculateTreasureHuntResults(treasureHunt: TreasureHunt, settings: Settings): TreasureHuntResults {
    //total baseline set in setup
    let totalBaselineCost: number = treasureHunt.currentEnergyUsage.electricityCosts + treasureHunt.currentEnergyUsage.naturalGasCosts + treasureHunt.currentEnergyUsage.otherFuelCosts;;
    //calculate utility usages for each type of utility
    let electricity: UtilityUsageData = this.getElectricityUtilityUsage(treasureHunt);
    let naturalGas: UtilityUsageData = this.getNaturalGasUtilityUsage(treasureHunt);
    let water: UtilityUsageData = this.getWaterUtilityUsage(treasureHunt);
    let wasteWater: UtilityUsageData = this.getWasteWaterUsage(treasureHunt);
    let otherFuel: UtilityUsageData = this.getOtherFuelUsage(treasureHunt);
    let compressedAir: UtilityUsageData = this.getCompressedAirUsage(treasureHunt);
    let steam: UtilityUsageData = this.getSteamUsage(treasureHunt);
    let other: UtilityUsageData = this.getOtherUsage(treasureHunt);
    //initialize results
    let thuntResults: TreasureHuntResults = {
      totalSavings: 0,
      percentSavings: 0,
      totalBaselineCost: totalBaselineCost,
      totalModificationCost: 0,

      electricity: electricity,
      naturalGas: naturalGas,
      water: water,
      wasteWater: wasteWater,
      otherFuel: otherFuel,
      compressedAir: compressedAir,
      steam: steam,
      other: other
    };
    //calculate and update results from standalone opp sheets
    thuntResults = this.getOpportunitySheetSavings(treasureHunt, settings, thuntResults);
    //final summary calculations
    thuntResults.totalModificationCost = thuntResults.electricity.modifiedEnergyCost + thuntResults.naturalGas.modifiedEnergyCost + thuntResults.water.modifiedEnergyCost + thuntResults.wasteWater.modifiedEnergyCost + thuntResults.otherFuel.modifiedEnergyCost + thuntResults.compressedAir.modifiedEnergyCost + thuntResults.steam.modifiedEnergyCost + thuntResults.other.modifiedEnergyCost;
    thuntResults.totalSavings = thuntResults.totalBaselineCost - thuntResults.totalModificationCost;
    thuntResults.percentSavings = (thuntResults.totalSavings / thuntResults.totalBaselineCost) * 100;
    return thuntResults;
  }

  //electricity
  //calcs: lighting replacement, replace existing motor, motor drive
  getElectricityUtilityUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    let lightingResults: { totalCostSavings: number, totalEnergySavings: number } = this.getTotalLightingSavings(treasureHunt);
    let replaceMotorResults: { totalCostSavings: number, totalEnergySavings: number } = this.getReplaceExistingMotorSavings(treasureHunt);
    let motorDriveResults: { totalCostSavings: number, totalEnergySavings: number } = this.getMotorDriveSavings(treasureHunt);
    let totalElectricityUsageSavings: number = lightingResults.totalEnergySavings + replaceMotorResults.totalEnergySavings + motorDriveResults.totalEnergySavings;
    let totalElectricitCostSavings: number = lightingResults.totalCostSavings + replaceMotorResults.totalCostSavings + motorDriveResults.totalCostSavings;
    return {
      baselineEnergyUsage: treasureHunt.currentEnergyUsage.electricityUsage,
      baselineEnergyCost: treasureHunt.currentEnergyUsage.electricityCosts,
      modifiedEnergyUsage: treasureHunt.currentEnergyUsage.electricityUsage - totalElectricityUsageSavings,
      modifiedEnergyCost: treasureHunt.currentEnergyUsage.electricityCosts - totalElectricitCostSavings,
      energySavings: totalElectricityUsageSavings,
      costSavings: totalElectricitCostSavings,
      percentSavings: (totalElectricitCostSavings / treasureHunt.currentEnergyUsage.electricityCosts) * 100
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //Lighting Replacements
  getTotalLightingSavings(treasureHunt: TreasureHunt): { totalCostSavings: number, totalEnergySavings: number } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    if (treasureHunt.lightingReplacements) {
      treasureHunt.lightingReplacements.forEach(replacement => {
        if (replacement.selected) {
          let results: LightingReplacementResults = this.lightingReplacementService.getResults(replacement);
          totalCostSavings = totalCostSavings + results.totalCostSavings;
          totalEnergySavings = totalEnergySavings + results.totalEnergySavings;
        }
      });
    }
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings }
  }

  //Replace Existing Motor
  getReplaceExistingMotorSavings(treasureHunt: TreasureHunt): { totalCostSavings: number, totalEnergySavings: number } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    if (treasureHunt.replaceExistingMotors) {
      treasureHunt.replaceExistingMotors.forEach(replacement => {
        if (replacement.selected) {
          let results: ReplaceExistingResults = this.replaceExistingService.getResults(replacement.replaceExistingData);
          totalCostSavings = totalCostSavings + results.costSavings;
          totalEnergySavings = totalEnergySavings + results.annualEnergySavings;
        }
      });
    }
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings }
  }

  //Motor Drive
  getMotorDriveSavings(treasureHunt: TreasureHunt): { totalCostSavings: number, totalEnergySavings: number } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    if (treasureHunt.motorDrives) {
      treasureHunt.motorDrives.forEach(drives => {
        if (drives.selected) {
          let results: MotorDriveOutputs = this.motorDriveService.getResults(drives.motorDriveInputs);
          totalCostSavings = totalCostSavings + results.annualCostSavings;
          totalEnergySavings = totalEnergySavings + results.annualEnergySavings;
        }
      });
    }
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings }
  }


  //natural gas
  getNaturalGasUtilityUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: treasureHunt.currentEnergyUsage.naturalGasUsage,
      baselineEnergyCost: treasureHunt.currentEnergyUsage.naturalGasCosts,
      modifiedEnergyUsage: treasureHunt.currentEnergyUsage.naturalGasUsage,
      modifiedEnergyCost: treasureHunt.currentEnergyUsage.naturalGasCosts,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }

  //water
  getWaterUtilityUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: 0,
      baselineEnergyCost: 0,
      modifiedEnergyUsage: 0,
      modifiedEnergyCost: 0,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //waste water
  getWasteWaterUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: 0,
      baselineEnergyCost: 0,
      modifiedEnergyUsage: 0,
      modifiedEnergyCost: 0,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //other fuel
  getOtherFuelUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: treasureHunt.currentEnergyUsage.otherFuelUsage,
      baselineEnergyCost: treasureHunt.currentEnergyUsage.otherFuelCosts,
      modifiedEnergyUsage: treasureHunt.currentEnergyUsage.otherFuelUsage,
      modifiedEnergyCost: treasureHunt.currentEnergyUsage.otherFuelCosts,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //compressed air
  getCompressedAirUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: 0,
      baselineEnergyCost: 0,
      modifiedEnergyUsage: 0,
      modifiedEnergyCost: 0,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //steam
  getSteamUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: 0,
      baselineEnergyCost: 0,
      modifiedEnergyUsage: 0,
      modifiedEnergyCost: 0,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //other
  getOtherUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    return {
      baselineEnergyUsage: 0,
      baselineEnergyCost: 0,
      modifiedEnergyUsage: 0,
      modifiedEnergyCost: 0,
      energySavings: 0,
      costSavings: 0,
      percentSavings: 0
      // implementationCost?: number,
      // paybackPeriod?: number
    }
  }
  //Stand Alone Opportunity Sheets
  getOpportunitySheetSavings(treasureHunt: TreasureHunt, settings: Settings, thuntResults: TreasureHuntResults): TreasureHuntResults {
    if (treasureHunt.opportunitySheets) {
      treasureHunt.opportunitySheets.forEach(oppSheet => {
        if (oppSheet.selected) {
          let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
          //electricity
          thuntResults.electricity = this.addOppSheetResultProperties(thuntResults.electricity, oppSheetResults.electricityResults);
          //compressed air
          thuntResults.compressedAir = this.addOppSheetResultProperties(thuntResults.compressedAir, oppSheetResults.compressedAirResults);
          //natural gas
          thuntResults.naturalGas = this.addOppSheetResultProperties(thuntResults.naturalGas, oppSheetResults.gasResults);
          //steam
          thuntResults.steam = this.addOppSheetResultProperties(thuntResults.steam, oppSheetResults.steamResults);
          //other fuel
          thuntResults.otherFuel = this.addOppSheetResultProperties(thuntResults.otherFuel, oppSheetResults.otherFuelResults);
        }
      })
    }
    return thuntResults;
  }

  addOppSheetResultProperties(utilityUsageData: UtilityUsageData, oppSheetResult: OpportunitySheetResult): UtilityUsageData {
    utilityUsageData.modifiedEnergyUsage = utilityUsageData.modifiedEnergyUsage - oppSheetResult.energySavings;
    utilityUsageData.modifiedEnergyCost = utilityUsageData.modifiedEnergyCost - oppSheetResult.energyCostSavings;
    utilityUsageData.energySavings = utilityUsageData.energySavings + oppSheetResult.energySavings;
    utilityUsageData.costSavings = utilityUsageData.costSavings + oppSheetResult.energyCostSavings;
    utilityUsageData.percentSavings = (utilityUsageData.costSavings / utilityUsageData.baselineEnergyCost) * 100;
    return utilityUsageData;
  }

}
