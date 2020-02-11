import { Injectable } from '@angular/core';
import { OpportunitySheetService } from '../calculators/standalone-opportunity-sheet/opportunity-sheet.service';
import { OpportunityCost, OpportunitySummary, TreasureHunt, ElectricityReductionTreasureHunt, MotorDriveInputsTreasureHunt, ReplaceExistingMotorTreasureHunt, LightingReplacementTreasureHunt, NaturalGasReductionTreasureHunt, OpportunitySheetResults, OpportunitySheet, CompressedAirReductionTreasureHunt, WaterReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, SteamReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementResults } from '../../shared/models/lighting';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingResults, MotorDriveOutputs } from '../../shared/models/calculators';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { ElectricityReductionService } from '../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { ElectricityReductionResults, NaturalGasReductionResults, CompressedAirReductionResults, WaterReductionResults, CompressedAirPressureReductionResults, SteamReductionResults } from '../../shared/models/standalone';
import { NaturalGasReductionService } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';
import { CompressedAirReductionService } from '../../calculator/utilities/compressed-air-reduction/compressed-air-reduction.service';
import { WaterReductionService } from '../../calculator/utilities/water-reduction/water-reduction.service';
import { CompressedAirPressureReductionService } from '../../calculator/utilities/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';
import { SteamReductionService } from '../../calculator/utilities/steam-reduction/steam-reduction.service';

@Injectable()
export class OpportunitySummaryService {

  constructor(private opportunitySheetService: OpportunitySheetService, private lightingReplacementService: LightingReplacementService,
    private replaceExistingService: ReplaceExistingService, private motorDriveService: MotorDriveService, private electricityReductionService: ElectricityReductionService,
    private naturalGasReductionService: NaturalGasReductionService, private compressedAirReductionService: CompressedAirReductionService,
    private waterReductionService: WaterReductionService, private compressedAirPressureReductionService: CompressedAirPressureReductionService,
    private steamReductionService: SteamReductionService) { }

  getOpportunitySummaries(treasureHunt: TreasureHunt, settings: Settings): Array<OpportunitySummary> {
    let opportunitySummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();
    //lighting
    opportunitySummaries = this.getLightingSummaries(treasureHunt.lightingReplacements, opportunitySummaries);
    //replace existing
    opportunitySummaries = this.getReplaceExistingSummaries(treasureHunt.replaceExistingMotors, opportunitySummaries, settings);
    //motor drive
    opportunitySummaries = this.getMotorDriveSummaries(treasureHunt.motorDrives, opportunitySummaries);
    //electricity reduction
    opportunitySummaries = this.getElectricityReductionSummaries(treasureHunt.electricityReductions, opportunitySummaries, settings);
    //natural gas reduction
    opportunitySummaries = this.getNaturalGasReductionSummaries(treasureHunt.naturalGasReductions, opportunitySummaries, settings);
    //compressed air reduction
    opportunitySummaries = this.getCompressedAirReductionSummaries(treasureHunt.compressedAirReductions, opportunitySummaries, settings);
    //compressed air pressure reduction
    opportunitySummaries = this.getCompressedAirPressureReductionSummaries(treasureHunt.compressedAirPressureReductions, opportunitySummaries, settings);
    //water reduction
    opportunitySummaries = this.getWaterReductionSummaries(treasureHunt.waterReductions, opportunitySummaries, settings);
    //steam reduction
    opportunitySummaries = this.getSteamReductionSummaries(treasureHunt.steamReductions, opportunitySummaries, settings);
    //standalone opp sheets
    opportunitySummaries = this.getOpportunitySheetSummaries(treasureHunt.opportunitySheets, opportunitySummaries, settings);


    return opportunitySummaries;
  }

  getNewOpportunitySummary(opportunityName: string, utilityType: string, costSavings: number, totalEnergySavings: number, opportunityCost: OpportunityCost, baselineCost: number, modificationCost: number, mixedIndividualResults?: Array<OpportunitySummary>): OpportunitySummary {
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
      selected: true,
      baselineCost: baselineCost,
      modificationCost: modificationCost
    }
  }

  //lighting
  getLightingSummaries(lightingReplacements: Array<LightingReplacementTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>): Array<OpportunitySummary> {
    if (lightingReplacements) {
      let index: number = 1;
      lightingReplacements.forEach(replacement => {
        if (replacement.selected) {
          let oppSummary: OpportunitySummary = this.getLightingSummary(replacement, index);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getLightingSummary(replacement: LightingReplacementTreasureHunt, index: number): OpportunitySummary {
    let name: string = 'Lighting Replacement #' + index;
    let results: LightingReplacementResults = this.lightingReplacementService.getResults(replacement);
    let opportunityCost: OpportunityCost;
    if (replacement.opportunitySheet) {
      if (replacement.opportunitySheet.name) {
        name = replacement.opportunitySheet.name;
      }
      opportunityCost = replacement.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.totalCostSavings, results.totalEnergySavings, opportunityCost, results.baselineResults.totalOperatingCosts, results.modificationResults.totalOperatingCosts);
    return oppSummary;
  }

  //Replace Existing Motor
  getReplaceExistingSummaries(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (replaceExistingMotors) {
      let index: number = 1;
      replaceExistingMotors.forEach(replacement => {
        if (replacement.selected) {
          let oppSummary: OpportunitySummary = this.getReplaceExistingSummary(replacement, index, settings);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getReplaceExistingSummary(replacement: ReplaceExistingMotorTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Replace Existing Motor #' + index;
    let results: ReplaceExistingResults = this.replaceExistingService.getResults(replacement.replaceExistingData, settings);
    let opportunityCost: OpportunityCost;
    if (replacement.opportunitySheet) {
      if (replacement.opportunitySheet.name) {
        name = replacement.opportunitySheet.name;
      }
      opportunityCost = replacement.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.costSavings, results.annualEnergySavings, opportunityCost, results.existingEnergyCost, results.newEnergyCost);
    return oppSummary;
  }

  //Motor Drive
  getMotorDriveSummaries(motorDrives: Array<MotorDriveInputsTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>): Array<OpportunitySummary> {
    if (motorDrives) {
      let index: number = 1;
      motorDrives.forEach(drive => {
        if (drive.selected) {
          let oppSummary: OpportunitySummary = this.getMotorDriveSummary(drive, index);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getMotorDriveSummary(drive: MotorDriveInputsTreasureHunt, index: number): OpportunitySummary {
    let name: string = 'Motor Drive #' + index;
    let results: MotorDriveOutputs = this.motorDriveService.getResults(drive.motorDriveInputs);
    let opportunityCost: OpportunityCost;
    if (drive.opportunitySheet) {
      if (drive.opportunitySheet.name) {
        name = drive.opportunitySheet.name;
      }
      opportunityCost = drive.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.annualCostSavings, results.annualEnergySavings, opportunityCost, results.baselineResult.energyCost, results.modificationResult.energyCost);
    return oppSummary;
  }
  //electricity reduction
  getElectricityReductionSummaries(electricityReductions: Array<ElectricityReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (electricityReductions) {
      let index: number = 1;
      electricityReductions.forEach(electricityReduction => {
        if (electricityReduction.selected) {
          let oppSummary: OpportunitySummary = this.getElectricityReductionSummary(electricityReduction, index, settings);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getElectricityReductionSummary(electricityReduction: ElectricityReductionTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Electricity Reduction #' + index;
    let results: ElectricityReductionResults = this.electricityReductionService.getResults(settings, electricityReduction.baseline, electricityReduction.modification);
    let opportunityCost: OpportunityCost;
    if (electricityReduction.opportunitySheet) {
      if (electricityReduction.opportunitySheet.name) {
        name = electricityReduction.opportunitySheet.name;
      }
      opportunityCost = electricityReduction.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.annualCostSavings, results.annualEnergySavings, opportunityCost, results.baselineResults.energyCost, results.modificationResults.energyCost);
    return oppSummary;
  }

  //natural gas reductions
  getNaturalGasReductionSummaries(naturalGasReductions: Array<NaturalGasReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (naturalGasReductions) {
      let index: number = 1;
      naturalGasReductions.forEach(ngReduction => {
        if (ngReduction.selected) {
          let oppSummary: OpportunitySummary = this.getNaturalGasReductionSummary(ngReduction, index, settings);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getNaturalGasReductionSummary(ngReduction: NaturalGasReductionTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Natural Gas Reduction #' + index;
    let results: NaturalGasReductionResults = this.naturalGasReductionService.getResults(settings, ngReduction.baseline, ngReduction.modification);
    let opportunityCost: OpportunityCost;
    if (ngReduction.opportunitySheet) {
      if (ngReduction.opportunitySheet.name) {
        name = ngReduction.opportunitySheet.name;
      }
      opportunityCost = ngReduction.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Natural Gas', results.annualCostSavings, results.annualEnergySavings, opportunityCost, results.baselineResults.energyCost, results.modificationResults.energyCost);

    return oppSummary;
  }

  //getCompressedAirReductionSummaries
  getCompressedAirReductionSummaries(compressedAirReductions: Array<CompressedAirReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (compressedAirReductions) {
      let index: number = 1;
      compressedAirReductions.forEach(compressedAirReduction => {
        if (compressedAirReduction.selected) {
          let oppSummary: OpportunitySummary = this.getCompressedAirReductionSummary(compressedAirReduction, index, settings);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getCompressedAirReductionSummary(compressedAirReduction: CompressedAirReductionTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Compressed Air Reduction #' + index;
    let results: CompressedAirReductionResults = this.compressedAirReductionService.getResults(settings, compressedAirReduction.baseline, compressedAirReduction.modification);
    let opportunityCost: OpportunityCost;
    if (compressedAirReduction.opportunitySheet) {
      if (compressedAirReduction.opportunitySheet.name) {
        name = compressedAirReduction.opportunitySheet.name;
      }
      opportunityCost = compressedAirReduction.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary;
    if (compressedAirReduction.baseline[0].utilityType == 0) {
      oppSummary = this.getNewOpportunitySummary(name, 'Compressed Air', results.annualCostSavings, results.annualEnergySavings, opportunityCost, results.baselineResults.energyCost, results.modificationResults.energyCost);
    }
    else {
      oppSummary = this.getNewOpportunitySummary(name, 'Electricity', results.annualCostSavings, results.annualEnergySavings, opportunityCost, results.baselineResults.energyCost, results.modificationResults.energyCost);
    }
    return oppSummary;
  }

  //getCompressedAirPressureReductionSummaries
  getCompressedAirPressureReductionSummaries(compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (compressedAirPressureReductions) {
      let index: number = 1;
      compressedAirPressureReductions.forEach(compressedAirPressureReduction => {
        if (compressedAirPressureReduction.selected) {
          let oppSummary: OpportunitySummary = this.getCompressedAirPressureReductionSummary(compressedAirPressureReduction, index, settings)
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getCompressedAirPressureReductionSummary(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Compressed Air Pressure Reduction #' + index;
    let results: CompressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(settings, compressedAirPressureReduction.baseline, compressedAirPressureReduction.modification);
    let opportunityCost: OpportunityCost;
    if (compressedAirPressureReduction.opportunitySheet) {
      if (compressedAirPressureReduction.opportunitySheet.name) {
        name = compressedAirPressureReduction.opportunitySheet.name;
      }
      opportunityCost = compressedAirPressureReduction.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, 'Electricity', results.annualCostSavings, results.annualEnergySavings, opportunityCost, results.baselineResults.energyCost, results.modificationResults.energyCost);
    return oppSummary;
  }

  //getWaterReductionSummaries
  getWaterReductionSummaries(waterReductions: Array<WaterReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (waterReductions) {
      let index: number = 1;
      waterReductions.forEach(waterReduction => {
        if (waterReduction.selected) {
          let oppSummary: OpportunitySummary = this.getWaterReductionSummary(waterReduction, index, settings);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getWaterReductionSummary(waterReduction: WaterReductionTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Water Reduction #' + index;
    let results: WaterReductionResults = this.waterReductionService.getResults(settings, waterReduction.baseline, waterReduction.modification);
    let opportunityCost: OpportunityCost;
    if (waterReduction.opportunitySheet) {
      if (waterReduction.opportunitySheet.name) {
        name = waterReduction.opportunitySheet.name;
      }
      opportunityCost = waterReduction.opportunitySheet.opportunityCost;
    }
    let oppSummary: OpportunitySummary;
    if (waterReduction.baseline[0].isWastewater == true) {
      oppSummary = this.getNewOpportunitySummary(name, 'Waste Water', results.annualCostSavings, results.annualWaterSavings, opportunityCost, results.baselineResults.waterCost, results.modificationResults.waterCost);
    }
    else {
      oppSummary = this.getNewOpportunitySummary(name, 'Water', results.annualCostSavings, results.annualWaterSavings, opportunityCost, results.baselineResults.waterCost, results.modificationResults.waterCost);
    }
    return oppSummary;
  }

  //getSteamReductionSummaries
  getSteamReductionSummaries(steamReductions: Array<SteamReductionTreasureHunt>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (steamReductions) {
      let index: number = 1;
      steamReductions.forEach(steamReduction => {
        if (steamReduction.selected) {
          let oppSummary: OpportunitySummary = this.getSteamReductionSummary(steamReduction, index, settings);
          opportunitySummaries.push(oppSummary);
        }
        index++;
      });
    }
    return opportunitySummaries;
  }

  getSteamReductionSummary(steamReduction: SteamReductionTreasureHunt, index: number, settings: Settings): OpportunitySummary {
    let name: string = 'Steam Reduction #' + index;
    let results: SteamReductionResults = this.steamReductionService.getResults(settings, steamReduction.baseline, steamReduction.modification);
    let opportunityCost: OpportunityCost;
    if (steamReduction.opportunitySheet) {
      if (steamReduction.opportunitySheet.name) {
        name = steamReduction.opportunitySheet.name;
      }
      opportunityCost = steamReduction.opportunitySheet.opportunityCost;
    }
    let energySavings: number = results.annualSteamSavings;
    let utilityTypeStr: string = 'Steam';
    if (steamReduction.baseline[0].utilityType == 1) {
      utilityTypeStr = 'Natural Gas';
      energySavings = results.annualEnergySavings;
    } else if (steamReduction.baseline[0].utilityType == 2) {
      utilityTypeStr = 'Other Fuel';
      energySavings = results.annualEnergySavings;
    }

    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(name, utilityTypeStr, results.annualCostSavings, energySavings, opportunityCost, results.baselineResults.energyCost, results.modificationResults.energyCost);
    return oppSummary;
  }

  //stand alone opp sheets
  getOpportunitySheetSummaries(opportunitySheets: Array<OpportunitySheet>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings, getAllResults?: boolean): Array<OpportunitySummary> {
    if (opportunitySheets) {
      opportunitySheets.forEach(oppSheet => {
        if (oppSheet.selected || getAllResults) {
          let oppSummary: OpportunitySummary = this.getOpportunitySheetSummary(oppSheet, settings);
          if (oppSummary) {
            opportunitySummaries.push(oppSummary);
          }
        }
      });
    }
    return opportunitySummaries;
  }

  getOpportunitySheetSummary(oppSheet: OpportunitySheet, settings: Settings): OpportunitySummary {
    let mixedIndividualSummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();
    let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
    let numEnergyTypes: number = 0;
    let totalEnergySavings: number = 0;
    let energyTypeLabel: string;
    for (let key in oppSheetResults) {
      if (oppSheetResults[key].baselineItems != 0 || oppSheetResults[key].modificationItems != 0 && oppSheetResults[key].baselineItems != undefined) {
        numEnergyTypes = numEnergyTypes + 1;
      }
    }
    //electricity
    if (oppSheetResults.electricityResults.baselineItems != 0 || oppSheetResults.electricityResults.modificationItems != 0) {
      energyTypeLabel = 'Electricity';
      totalEnergySavings = totalEnergySavings + oppSheetResults.electricityResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.electricityResults.energyCostSavings, oppSheetResults.electricityResults.energySavings, oppSheet.opportunityCost, oppSheetResults.electricityResults.baselineEnergyCost, oppSheetResults.electricityResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    //compressed air
    if (oppSheetResults.compressedAirResults.baselineItems != 0 || oppSheetResults.compressedAirResults.modificationItems != 0) {
      energyTypeLabel = 'Compressed Air';
      totalEnergySavings = totalEnergySavings + oppSheetResults.compressedAirResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.compressedAirResults.energyCostSavings, oppSheetResults.compressedAirResults.energySavings, oppSheet.opportunityCost, oppSheetResults.compressedAirResults.baselineEnergyCost, oppSheetResults.compressedAirResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    //natural gas
    if (oppSheetResults.gasResults.baselineItems != 0 || oppSheetResults.gasResults.modificationItems != 0) {
      energyTypeLabel = 'Natural Gas';
      totalEnergySavings = totalEnergySavings + oppSheetResults.gasResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.gasResults.energyCostSavings, oppSheetResults.gasResults.energySavings, oppSheet.opportunityCost, oppSheetResults.gasResults.baselineEnergyCost, oppSheetResults.gasResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    //water
    if (oppSheetResults.waterResults.baselineItems != 0 || oppSheetResults.waterResults.modificationItems != 0) {
      energyTypeLabel = 'Water';
      totalEnergySavings = totalEnergySavings + oppSheetResults.waterResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.waterResults.energyCostSavings, oppSheetResults.waterResults.energySavings, oppSheet.opportunityCost, oppSheetResults.waterResults.baselineEnergyCost, oppSheetResults.waterResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    //waste water
    if (oppSheetResults.wasteWaterResults.baselineItems != 0 || oppSheetResults.wasteWaterResults.modificationItems != 0) {
      energyTypeLabel = 'Waste Water';
      totalEnergySavings = totalEnergySavings + oppSheetResults.wasteWaterResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.wasteWaterResults.energyCostSavings, oppSheetResults.wasteWaterResults.energySavings, oppSheet.opportunityCost, oppSheetResults.wasteWaterResults.baselineEnergyCost, oppSheetResults.wasteWaterResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    //steam
    if (oppSheetResults.steamResults.baselineItems != 0 || oppSheetResults.steamResults.modificationItems != 0) {
      energyTypeLabel = 'Steam';
      totalEnergySavings = totalEnergySavings + oppSheetResults.steamResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.steamResults.energyCostSavings, oppSheetResults.steamResults.energySavings, oppSheet.opportunityCost, oppSheetResults.steamResults.baselineEnergyCost, oppSheetResults.steamResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    //other fuel
    if (oppSheetResults.otherFuelResults.baselineItems != 0 || oppSheetResults.otherFuelResults.modificationItems != 0) {
      energyTypeLabel = 'Other Fuel';
      totalEnergySavings = totalEnergySavings + oppSheetResults.otherFuelResults.energySavings;
      let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.otherFuelResults.energyCostSavings, oppSheetResults.otherFuelResults.energySavings, oppSheet.opportunityCost, oppSheetResults.otherFuelResults.baselineEnergyCost, oppSheetResults.otherFuelResults.modificationEnergyCost)
      mixedIndividualSummaries.push(oppSummary);
    }
    let oppSummary: OpportunitySummary;
    //if only one energy source in opp sheet
    if (numEnergyTypes == 1) {
      oppSummary = mixedIndividualSummaries[0];
    } else if (numEnergyTypes > 1) {
      //more then one energy source in opp sheet, implemenetation cost in other
      oppSummary = this.getNewOpportunitySummary(oppSheet.name, 'Mixed', oppSheetResults.totalCostSavings, oppSheetResults.totalEnergySavings, oppSheet.opportunityCost, 0, 0, mixedIndividualSummaries);
    } else {
      //no energy savings
      oppSummary = this.getNewOpportunitySummary(oppSheet.name, 'None', 0, 0, undefined, 0, 0);
    }
    return oppSummary;
  }
}