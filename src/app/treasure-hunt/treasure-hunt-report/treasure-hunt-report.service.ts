import { Injectable } from '@angular/core';
import { TreasureHuntResults, TreasureHunt, OpportunitySheetResults } from '../../shared/models/treasure-hunt';
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


  calculateCostAndEnergyResults(treasureHunt: TreasureHunt, settings: Settings): TreasureHuntResults {
    let thuntResults: TreasureHuntResults = this.initResults();
    thuntResults.totalBaselineCost = treasureHunt.currentEnergyUsage.electricityCosts + treasureHunt.currentEnergyUsage.naturalGasCosts + treasureHunt.currentEnergyUsage.otherFuelCosts;
    thuntResults = this.calculateCostAndEnergyValues(treasureHunt, settings, thuntResults);
    thuntResults.totalSavings = thuntResults.totalElectricityCostSavings + thuntResults.totalNaturalGasCostSavings + thuntResults.totalOtherGasCostSavings;
    thuntResults.totalModificationCost = thuntResults.totalBaselineCost - thuntResults.totalSavings;
    thuntResults.percentSavings = (thuntResults.totalSavings / thuntResults.totalBaselineCost) * 100;
    thuntResults.percentElectricitySavings = (thuntResults.totalElectricityCostSavings / treasureHunt.currentEnergyUsage.electricityCosts) * 100;
    thuntResults.percentGasSavings = (thuntResults.totalNaturalGasCostSavings / treasureHunt.currentEnergyUsage.naturalGasCosts) * 100;
    thuntResults.percentOtherGasSavings = (thuntResults.totalOtherGasCostSavings / treasureHunt.currentEnergyUsage.otherFuelCosts) * 100;
    return thuntResults;
  }

  initResults(): TreasureHuntResults {
    return {
      totalSavings: 0,
      percentSavings: 0,
      percentGasSavings: 0,
      percentElectricitySavings: 0,
      percentOtherGasSavings: 0,
      totalBaselineCost: 0,
      totalModificationCost: 0,
      totalElectricityCostSavings: 0,
      totalElectricityEnergySavings: 0,
      totalNaturalGasCostSavings: 0,
      totalNaturalGasEnergySavings: 0,
      totalOtherGasCostSavings: 0,
      totalOtherGasEnergySavings: 0
    }
  }

  calculateCostAndEnergyValues(treasureHunt: TreasureHunt, settings: Settings, results: TreasureHuntResults): TreasureHuntResults {
    let lightingResults: { totalCostSavings: number, totalEnergySavings: number } = this.getTotalLightingSavings(treasureHunt);
    results.totalElectricityCostSavings = results.totalElectricityCostSavings + lightingResults.totalCostSavings;
    results.totalElectricityEnergySavings = results.totalElectricityEnergySavings + lightingResults.totalEnergySavings;

    let replaceMotorResults: { totalCostSavings: number, totalEnergySavings: number } = this.getReplaceExistingMotorSavings(treasureHunt);
    results.totalElectricityCostSavings = results.totalElectricityCostSavings + replaceMotorResults.totalCostSavings;
    results.totalElectricityEnergySavings = results.totalElectricityEnergySavings + replaceMotorResults.totalEnergySavings;

    let motorDriveResults: { totalCostSavings: number, totalEnergySavings: number } = this.getMotorDriveSavings(treasureHunt);
    results.totalElectricityCostSavings = results.totalElectricityCostSavings + motorDriveResults.totalCostSavings;
    results.totalElectricityEnergySavings = results.totalElectricityEnergySavings + motorDriveResults.totalEnergySavings;

    let oppSheetResults: { totalElectricityCostSavings: number, totalElectricityEnergySavings: number, totalNaturalGasCostSavings: number, totalNaturalGasEnergySavings: number, totalOtherGasCostSavings: number, totalOtherGasEnergySavings: number } = this.getOpportunitySheetSavings(treasureHunt, settings);
    results.totalElectricityCostSavings = results.totalElectricityCostSavings + oppSheetResults.totalElectricityCostSavings;
    results.totalElectricityEnergySavings = results.totalElectricityEnergySavings + oppSheetResults.totalElectricityEnergySavings;

    results.totalNaturalGasCostSavings = results.totalNaturalGasCostSavings + oppSheetResults.totalNaturalGasCostSavings;
    results.totalElectricityEnergySavings = results.totalElectricityEnergySavings + oppSheetResults.totalNaturalGasEnergySavings;

    results.totalOtherGasCostSavings = results.totalOtherGasCostSavings + oppSheetResults.totalOtherGasCostSavings;
    results.totalOtherGasEnergySavings = results.totalOtherGasEnergySavings + oppSheetResults.totalOtherGasEnergySavings;
    return results;
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

  //Stand Alone Opportunity Sheets
  getOpportunitySheetSavings(treasureHunt: TreasureHunt, settings: Settings): {
    totalElectricityCostSavings: number,
    totalElectricityEnergySavings: number,
    totalNaturalGasCostSavings: number,
    totalNaturalGasEnergySavings: number,
    totalOtherGasCostSavings: number,
    totalOtherGasEnergySavings: number
  } {
    let totalElectricityCostSavings: number = 0
    let totalElectricityEnergySavings: number = 0;
    let totalNaturalGasCostSavings: number = 0;
    let totalNaturalGasEnergySavings: number = 0;
    let totalOtherGasCostSavings: number = 0;
    let totalOtherGasEnergySavings: number = 0;
    if (treasureHunt.opportunitySheets) {
      treasureHunt.opportunitySheets.forEach(oppSheet => {
        if (oppSheet.selected) {
          let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
          //electricity
          totalElectricityCostSavings = totalElectricityCostSavings + oppSheetResults.electricityResults.energyCostSavings;
          totalElectricityEnergySavings = totalElectricityEnergySavings + oppSheetResults.electricityResults.energySavings;
          //compressed air (electricity)
          totalElectricityCostSavings = totalElectricityCostSavings + oppSheetResults.compressedAirResults.energyCostSavings;
          totalElectricityEnergySavings = totalElectricityEnergySavings + oppSheetResults.compressedAirResults.energySavings;

          //natural gas
          totalNaturalGasCostSavings = totalNaturalGasCostSavings + oppSheetResults.gasResults.energyCostSavings;
          totalNaturalGasEnergySavings = totalNaturalGasEnergySavings + oppSheetResults.gasResults.energySavings;
          //steam (natural gas)
          totalNaturalGasCostSavings = totalNaturalGasCostSavings + oppSheetResults.steamResults.energyCostSavings;
          totalNaturalGasEnergySavings = totalNaturalGasEnergySavings + oppSheetResults.steamResults.energySavings;

          //other fuel
          totalOtherGasCostSavings = totalOtherGasCostSavings + oppSheetResults.otherFuelResults.energyCostSavings;
          totalOtherGasEnergySavings = totalOtherGasEnergySavings + oppSheetResults.otherFuelResults.energySavings;
        }
      })
    }
    return {
      totalElectricityCostSavings: totalElectricityCostSavings,
      totalElectricityEnergySavings: totalElectricityEnergySavings,
      totalNaturalGasCostSavings: totalNaturalGasCostSavings,
      totalNaturalGasEnergySavings: totalNaturalGasEnergySavings,
      totalOtherGasCostSavings: totalOtherGasCostSavings,
      totalOtherGasEnergySavings: totalOtherGasEnergySavings
    }
  }
}
