import { Injectable } from '@angular/core';
import { OpportunitySheetService } from '../standalone-opportunity-sheet/opportunity-sheet.service';
import { OpportunityCost, OpportunitySummary, TreasureHunt, ElectricityReductionTreasureHunt, MotorDriveInputsTreasureHunt, ReplaceExistingMotorTreasureHunt, LightingReplacementTreasureHunt, NaturalGasReductionTreasureHunt, OpportunitySheetResults, OpportunitySheet } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementResults } from '../../shared/models/lighting';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingResults, MotorDriveOutputs } from '../../shared/models/calculators';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { ElectricityReductionService } from '../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { ElectricityReductionResults, NaturalGasReductionResults } from '../../shared/models/standalone';
import { NaturalGasReductionService } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';

@Injectable()
export class OpportunitySummaryService {

  constructor(private opportunitySheetService: OpportunitySheetService, private lightingReplacementService: LightingReplacementService,
    private replaceExistingService: ReplaceExistingService, private motorDriveService: MotorDriveService, private electricityReductionService: ElectricityReductionService,
    private naturalGasReductionService: NaturalGasReductionService) { }

  getOpportunitySummaries(treasureHunt: TreasureHunt, settings: Settings): Array<OpportunitySummary> {
    let opportunitySummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();
    //lighting
    opportunitySummaries = this.getLightingSummaries(treasureHunt.lightingReplacements, opportunitySummaries);
    //replace existing
    opportunitySummaries = this.getReplaceExistingSummaries(treasureHunt.replaceExistingMotors, opportunitySummaries);
    //motor drive
    opportunitySummaries = this.getMotorDriveSummaries(treasureHunt.motorDrives, opportunitySummaries);
    //electricity reduction
    opportunitySummaries = this.getElectricityReductionSummaries(treasureHunt.electricityReductions, opportunitySummaries, settings);
    //natural gas reduction
    opportunitySummaries = this.getNaturalGasReductionSummaries(treasureHunt.naturalGasReductions, opportunitySummaries, settings);
    //standalone opp sheets
    opportunitySummaries = this.getOpportunitySheetSummaries(treasureHunt.opportunitySheets, opportunitySummaries, settings)

    return opportunitySummaries;
  }

  getNewOpportunitySummary(opportunityName: string, utilityType: string, costSavings: number, totalEnergySavings: number, opportunityCost: OpportunityCost, mixedIndividualResults?: Array<OpportunitySummary>): OpportunitySummary {
    let totalCost: number = this.opportunitySheetService.getOppSheetImplementationCost(opportunityCost)
    return {
      opportunityName: opportunityName,
      utilityType: utilityType,
      costSavings: costSavings,
      totalCost: totalCost,
      payback: totalCost / costSavings,
      opportunityCost: opportunityCost,
      totalEnergySavings: totalEnergySavings,
      mixedIndividualResults: mixedIndividualResults,
      selected: true
    }
  }

  //lighting
  getLightingSummaries(lightingReplacements: Array<LightingReplacementTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>): Array<OpportunitySummary> {
    if (lightingReplacements) {
      let index: number = 1;
      lightingReplacements.forEach(replacement => {
        if (replacement.selected) {
          let name: string = 'Lighting Replacement #' + index;
          let results: LightingReplacementResults = this.lightingReplacementService.getResults(replacement);
          let opportunityCost: OpportunityCost;
          if (replacement.opportunitySheet) {
            if (replacement.opportunitySheet.name) {
              name = replacement.opportunitySheet.name;
            }
            opportunityCost = replacement.opportunitySheet.opportunityCost;
          }
          let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.totalCostSavings, results.totalEnergySavings, opportunityCost);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  //Replace Existing Motor
  getReplaceExistingSummaries(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>): Array<OpportunitySummary> {
    if (replaceExistingMotors) {
      let index: number = 1;
      replaceExistingMotors.forEach(replacement => {
        if (replacement.selected) {
          let name: string = 'Lighting Replacement #' + index;
          let results: ReplaceExistingResults = this.replaceExistingService.getResults(replacement.replaceExistingData);
          let opportunityCost: OpportunityCost;
          if (replacement.opportunitySheet) {
            if (replacement.opportunitySheet.name) {
              name = replacement.opportunitySheet.name;
            }
            opportunityCost = replacement.opportunitySheet.opportunityCost;
          }
          let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.costSavings, results.annualEnergySavings, opportunityCost);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  //Motor Drive
  getMotorDriveSummaries(motorDrives: Array<MotorDriveInputsTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>): Array<OpportunitySummary> {
    if (motorDrives) {
      let index: number = 1;
      motorDrives.forEach(drive => {
        if (drive.selected) {
          let name: string = 'Motor Drive #' + index;
          let results: MotorDriveOutputs = this.motorDriveService.getResults(drive.motorDriveInputs);
          let opportunityCost: OpportunityCost;
          if (drive.opportunitySheet) {
            if (drive.opportunitySheet.name) {
              name = drive.opportunitySheet.name;
            }
            opportunityCost = drive.opportunitySheet.opportunityCost;
          }
          let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.annualCostSavings, results.annualEnergySavings, opportunityCost);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  //electricity reduction
  getElectricityReductionSummaries(electricityReductions: Array<ElectricityReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (electricityReductions) {
      let index: number = 1;
      electricityReductions.forEach(electricityReduction => {
        if (electricityReduction.selected) {
          let name: string = 'Electricity Reduction #' + index;
          let results: ElectricityReductionResults = this.electricityReductionService.getResults(settings, electricityReduction.baseline, electricityReduction.modification);
          let opportunityCost: OpportunityCost;
          if (electricityReduction.opportunitySheet) {
            if (electricityReduction.opportunitySheet.name) {
              name = electricityReduction.opportunitySheet.name;
            }
            opportunityCost = electricityReduction.opportunitySheet.opportunityCost;
          }
          let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.annualCostSavings, results.annualEnergySavings, opportunityCost);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  //natural gas reductions
  getNaturalGasReductionSummaries(naturalGasReductions: Array<NaturalGasReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (naturalGasReductions) {
      let index: number = 1;
      naturalGasReductions.forEach(ngReduction => {
        if (ngReduction.selected) {
          let name: string = 'Natural Gas Reduction #' + index;
          let results: NaturalGasReductionResults = this.naturalGasReductionService.getResults(settings, ngReduction.baseline, ngReduction.modification);
          let opportunityCost: OpportunityCost;
          if (ngReduction.opportunitySheet) {
            if (ngReduction.opportunitySheet.name) {
              name = ngReduction.opportunitySheet.name;
            }
            opportunityCost = ngReduction.opportunitySheet.opportunityCost;
          }
          let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Natural Gas', results.annualCostSavings, results.annualEnergySavings, opportunityCost);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  //stand alone opp sheets
  getOpportunitySheetSummaries(opportunitySheets: Array<OpportunitySheet>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (opportunitySheets) {
      opportunitySheets.forEach(oppSheet => {
        if (oppSheet.selected) {
          let mixedIndividualSummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();
          let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
          let numEnergyTypes: number = 0;
          let totalEnergySavings: number = 0;
          let energyTypeLabel: string;
          for (let key in oppSheetResults) {
            if (oppSheetResults[key].baselineEnergyUse != 0 && oppSheetResults[key].baselineEnergyUse != undefined) {
              numEnergyTypes = numEnergyTypes + 1;
            }
          }
          //electricity
          if (oppSheetResults.electricityResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Electricity';
            totalEnergySavings = totalEnergySavings + oppSheetResults.electricityResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.electricityResults.energyCostSavings, oppSheetResults.electricityResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          //compressed air
          if (oppSheetResults.compressedAirResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Compressed Air';
            totalEnergySavings = totalEnergySavings + oppSheetResults.compressedAirResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.compressedAirResults.energyCostSavings, oppSheetResults.compressedAirResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          //natural gas
          if (oppSheetResults.gasResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Natural Gas';
            totalEnergySavings = totalEnergySavings + oppSheetResults.gasResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.gasResults.energyCostSavings, oppSheetResults.gasResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          //water
          if (oppSheetResults.waterResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Water';
            totalEnergySavings = totalEnergySavings + oppSheetResults.waterResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.waterResults.energyCostSavings, oppSheetResults.waterResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          //waste water
          if (oppSheetResults.wasteWaterResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Waste Water';
            totalEnergySavings = totalEnergySavings + oppSheetResults.wasteWaterResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.wasteWaterResults.energyCostSavings, oppSheetResults.wasteWaterResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          //steam
          if (oppSheetResults.steamResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Steam';
            totalEnergySavings = totalEnergySavings + oppSheetResults.steamResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.steamResults.energyCostSavings, oppSheetResults.steamResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          //other fuel
          if (oppSheetResults.otherFuelResults.baselineEnergyUse != 0) {
            energyTypeLabel = 'Other Fuel';
            totalEnergySavings = totalEnergySavings + oppSheetResults.otherFuelResults.energySavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.otherFuelResults.energyCostSavings, oppSheetResults.otherFuelResults.energySavings, oppSheet.opportunityCost)
            mixedIndividualSummaries.push(oppSummary);
          }
          let oppSummary: OpportunitySummary;
          //if only one energy source in opp sheet
          if (numEnergyTypes == 1) {
            oppSummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.totalCostSavings, totalEnergySavings, oppSheet.opportunityCost);
          } else if (numEnergyTypes > 1) {
            //more then one energy source in opp sheet, implemenetation cost in other
            oppSummary = this.getNewOpportunitySummary(oppSheet.name, 'Mixed', oppSheetResults.totalCostSavings, oppSheetResults.totalEnergySavings, oppSheet.opportunityCost, mixedIndividualSummaries);
          }
          if (oppSummary) {
            opportunitySummaries.push(oppSummary);
          }
        }
      });
    }
    return opportunitySummaries;
  }
}