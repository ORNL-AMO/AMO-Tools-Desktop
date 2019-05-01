import { Injectable } from '@angular/core';
import { TreasureHuntResults, TreasureHunt, OpportunitySheetResults, UtilityUsageData, OpportunitySheetResult, OpportunitySheet } from '../../shared/models/treasure-hunt';
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

    let totalImplementationCost: number = electricity.implementationCost + naturalGas.implementationCost + water.implementationCost + wasteWater.implementationCost + compressedAir.implementationCost + steam.implementationCost + other.implementationCost;
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
      other: other,

      totalImplementationCost: totalImplementationCost
    };
    //calculate and update results from standalone opp sheets
    thuntResults = this.getOpportunitySheetSavings(treasureHunt, settings, thuntResults);
    //final summary calculations
    thuntResults.totalModificationCost = thuntResults.electricity.modifiedEnergyCost + thuntResults.naturalGas.modifiedEnergyCost + thuntResults.water.modifiedEnergyCost + thuntResults.wasteWater.modifiedEnergyCost + thuntResults.otherFuel.modifiedEnergyCost + thuntResults.compressedAir.modifiedEnergyCost + thuntResults.steam.modifiedEnergyCost + thuntResults.other.modifiedEnergyCost;
    thuntResults.totalSavings = thuntResults.totalBaselineCost - thuntResults.totalModificationCost;
    thuntResults.percentSavings = (thuntResults.totalSavings / thuntResults.totalBaselineCost) * 100;
    thuntResults.paybackPeriod = thuntResults.totalImplementationCost / thuntResults.totalSavings;
    return thuntResults;
  }



  //electricity
  //calcs: lighting replacement, replace existing motor, motor drive
  getElectricityUtilityUsage(treasureHunt: TreasureHunt): UtilityUsageData {
    let lightingResults: { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number } = this.getTotalLightingSavings(treasureHunt);
    let replaceMotorResults: { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number } = this.getReplaceExistingMotorSavings(treasureHunt);
    let motorDriveResults: { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number } = this.getMotorDriveSavings(treasureHunt);
    let totalElectricityUsageSavings: number = lightingResults.totalEnergySavings + replaceMotorResults.totalEnergySavings + motorDriveResults.totalEnergySavings;
    let totalElectricitCostSavings: number = lightingResults.totalCostSavings + replaceMotorResults.totalCostSavings + motorDriveResults.totalCostSavings;
    let totalImplementationCost: number = lightingResults.totalImplementationCost + replaceMotorResults.totalImplementationCost + motorDriveResults.totalImplementationCost;
    let paybackPeriod: number = totalImplementationCost / totalElectricitCostSavings;
    return {
      baselineEnergyUsage: treasureHunt.currentEnergyUsage.electricityUsage,
      baselineEnergyCost: treasureHunt.currentEnergyUsage.electricityCosts,
      modifiedEnergyUsage: treasureHunt.currentEnergyUsage.electricityUsage - totalElectricityUsageSavings,
      modifiedEnergyCost: treasureHunt.currentEnergyUsage.electricityCosts - totalElectricitCostSavings,
      energySavings: totalElectricityUsageSavings,
      costSavings: totalElectricitCostSavings,
      percentSavings: (totalElectricitCostSavings / treasureHunt.currentEnergyUsage.electricityCosts) * 100,
      implementationCost: totalImplementationCost,
      paybackPeriod: paybackPeriod
    }
  }
  //Lighting Replacements
  getTotalLightingSavings(treasureHunt: TreasureHunt): { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    let totalImplementationCost: number = 0;
    if (treasureHunt.lightingReplacements) {
      treasureHunt.lightingReplacements.forEach(replacement => {
        if (replacement.selected) {
          let results: LightingReplacementResults = this.lightingReplacementService.getResults(replacement);
          totalCostSavings = totalCostSavings + results.totalCostSavings;
          totalEnergySavings = totalEnergySavings + results.totalEnergySavings;
          if (replacement.opportunitySheet) {
            totalImplementationCost = totalImplementationCost + this.opportunitySheetService.getOppSheetImplementationCost(replacement.opportunitySheet);
          }
        }
      });
    }
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings, totalImplementationCost: totalImplementationCost }
  }

  //Replace Existing Motor
  getReplaceExistingMotorSavings(treasureHunt: TreasureHunt): { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    let totalImplementationCost: number = 0;
    if (treasureHunt.replaceExistingMotors) {
      treasureHunt.replaceExistingMotors.forEach(replacement => {
        if (replacement.selected) {
          let results: ReplaceExistingResults = this.replaceExistingService.getResults(replacement.replaceExistingData);
          totalCostSavings = totalCostSavings + results.costSavings;
          totalEnergySavings = totalEnergySavings + results.annualEnergySavings;
          if (replacement.opportunitySheet) {
            totalImplementationCost = totalImplementationCost + this.opportunitySheetService.getOppSheetImplementationCost(replacement.opportunitySheet);
          }
        }
      });
    }
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings, totalImplementationCost: totalImplementationCost }
  }

  //Motor Drive
  getMotorDriveSavings(treasureHunt: TreasureHunt): { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    let totalImplementationCost: number = 0;
    if (treasureHunt.motorDrives) {
      treasureHunt.motorDrives.forEach(drive => {
        if (drive.selected) {
          let results: MotorDriveOutputs = this.motorDriveService.getResults(drive.motorDriveInputs);
          totalCostSavings = totalCostSavings + results.annualCostSavings;
          totalEnergySavings = totalEnergySavings + results.annualEnergySavings;
          if (drive.opportunitySheet) {
            totalImplementationCost = totalImplementationCost + this.opportunitySheetService.getOppSheetImplementationCost(drive.opportunitySheet);
          }
        }
      });
    }
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings, totalImplementationCost: totalImplementationCost }
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
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
      percentSavings: 0,
      implementationCost: 0,
      paybackPeriod: 0
    }
  }
  //Stand Alone Opportunity Sheets
  getOpportunitySheetSavings(treasureHunt: TreasureHunt, settings: Settings, thuntResults: TreasureHuntResults): TreasureHuntResults {
    if (treasureHunt.opportunitySheets) {
      treasureHunt.opportunitySheets.forEach(oppSheet => {
        if (oppSheet.selected) {
          let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
          let numEnergyTypes: number = 0;
          let energyTypeInUse: string;
          //electricity
          if (oppSheetResults.electricityResults.baselineEnergyUse != 0) {
            thuntResults.electricity = this.addOppSheetResultProperties(thuntResults.electricity, oppSheetResults.electricityResults);
            numEnergyTypes = numEnergyTypes + 1;
            energyTypeInUse = 'electricity';
          }
          //compressed air
          if (oppSheetResults.compressedAirResults.baselineEnergyUse != 0) {
            thuntResults.compressedAir = this.addOppSheetResultProperties(thuntResults.compressedAir, oppSheetResults.compressedAirResults);
            numEnergyTypes = numEnergyTypes + 1;
            energyTypeInUse = 'compressedAir';
          }
          //natural gas
          if (oppSheetResults.gasResults.baselineEnergyUse != 0) {
            thuntResults.naturalGas = this.addOppSheetResultProperties(thuntResults.naturalGas, oppSheetResults.gasResults);
            numEnergyTypes = numEnergyTypes + 1;
            energyTypeInUse = 'naturalGas';
          }
          //steam
          if (oppSheetResults.steamResults.baselineEnergyUse != 0) {
            thuntResults.steam = this.addOppSheetResultProperties(thuntResults.steam, oppSheetResults.steamResults);
            numEnergyTypes = numEnergyTypes + 1;
            energyTypeInUse = 'steam';
          }
          //other fuel
          if (oppSheetResults.otherFuelResults.baselineEnergyUse != 0) {
            thuntResults.otherFuel = this.addOppSheetResultProperties(thuntResults.otherFuel, oppSheetResults.otherFuelResults);
            numEnergyTypes = numEnergyTypes + 1;
            energyTypeInUse = 'otherFuel';
          }

          //if only one energy source in opp sheet
          if (numEnergyTypes == 1) {
            thuntResults[energyTypeInUse].implementationCost = thuntResults[energyTypeInUse].implementationCost + oppSheetResults.totalImplementationCost;
            thuntResults[energyTypeInUse].paybackPeriod = thuntResults[energyTypeInUse].implementationCost / thuntResults[energyTypeInUse].costSavings;
          } else if (numEnergyTypes > 1) {
            //more then one energy source in opp sheet, implemenetation cost in other
            thuntResults.other.implementationCost = thuntResults.other.implementationCost + oppSheetResults.totalImplementationCost;
            thuntResults.other.paybackPeriod = thuntResults.other.implementationCost / thuntResults[energyTypeInUse].costSavings;
          }

          //add implementation costs to total
          thuntResults.totalImplementationCost = thuntResults.totalImplementationCost + oppSheetResults.totalImplementationCost;
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
