import { Injectable } from '@angular/core';
import { TreasureHuntResults, TreasureHunt, OpportunitySheetResults, UtilityUsageData, OpportunitySheetResult, OpportunitySheet, OpportunitySummary, OpportunityCost, EnergyUsage } from '../../shared/models/treasure-hunt';
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
    let totalBaselineCost: number = this.getTotalBaselineCost(treasureHunt.currentEnergyUsage);

    let opportunitySummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();

    //calculate utility usages for each type of utility
    let electricityCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getElectricityUtilityUsage(treasureHunt, opportunitySummaries);
    let electricity: UtilityUsageData = electricityCalc.utilityUsageData;
    opportunitySummaries = electricityCalc.opportunitySummaries;

    let naturalGasCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getNaturalGasUtilityUsage(treasureHunt, opportunitySummaries);
    let naturalGas: UtilityUsageData = naturalGasCalc.utilityUsageData;
    opportunitySummaries = naturalGasCalc.opportunitySummaries;

    let waterCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getWaterUtilityUsage(treasureHunt, opportunitySummaries);
    let water: UtilityUsageData = waterCalc.utilityUsageData;
    opportunitySummaries = waterCalc.opportunitySummaries;

    let wasteWaterCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getWasteWaterUsage(treasureHunt, opportunitySummaries);
    let wasteWater: UtilityUsageData = wasteWaterCalc.utilityUsageData;
    opportunitySummaries = wasteWaterCalc.opportunitySummaries;

    let otherFuelCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getOtherFuelUsage(treasureHunt, opportunitySummaries);
    let otherFuel: UtilityUsageData = otherFuelCalc.utilityUsageData;
    opportunitySummaries = otherFuelCalc.opportunitySummaries;

    let compressedAirCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getCompressedAirUsage(treasureHunt, opportunitySummaries);
    let compressedAir: UtilityUsageData = compressedAirCalc.utilityUsageData;
    opportunitySummaries = compressedAirCalc.opportunitySummaries;

    let steamCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getSteamUsage(treasureHunt, opportunitySummaries);
    let steam: UtilityUsageData = steamCalc.utilityUsageData;
    opportunitySummaries = steamCalc.opportunitySummaries;

    let otherCalc: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } = this.getOtherUsage(treasureHunt, opportunitySummaries);
    let other: UtilityUsageData = otherCalc.utilityUsageData;
    opportunitySummaries = otherCalc.opportunitySummaries;

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
      opportunitySummaries: opportunitySummaries,
      totalImplementationCost: totalImplementationCost
    };
    //calculate and update results from standalone opp sheets
    thuntResults = this.getOpportunitySheetSavings(treasureHunt, settings, thuntResults);
    //final summary calculations
    thuntResults.totalModificationCost = thuntResults.totalBaselineCost - thuntResults.electricity.costSavings - thuntResults.naturalGas.costSavings - thuntResults.water.costSavings - thuntResults.wasteWater.costSavings - thuntResults.otherFuel.costSavings - thuntResults.compressedAir.costSavings - thuntResults.steam.costSavings;
    thuntResults.totalSavings = thuntResults.totalBaselineCost - thuntResults.totalModificationCost;
    thuntResults.percentSavings = (thuntResults.totalSavings / thuntResults.totalBaselineCost) * 100;
    thuntResults.paybackPeriod = thuntResults.totalImplementationCost / thuntResults.totalSavings;
    thuntResults.hasMixed = thuntResults.electricity.hasMixed || thuntResults.naturalGas.hasMixed || thuntResults.water.hasMixed || thuntResults.wasteWater.hasMixed || thuntResults.otherFuel.hasMixed || thuntResults.compressedAir.hasMixed || thuntResults.steam.hasMixed;
    return thuntResults;
  }

  getTotalBaselineCost(currentEnergyUsage: EnergyUsage) {
    return currentEnergyUsage.electricityCosts + currentEnergyUsage.naturalGasCosts + currentEnergyUsage.otherFuelCosts + currentEnergyUsage.waterCosts + currentEnergyUsage.wasteWaterCosts + currentEnergyUsage.compressedAirCosts + currentEnergyUsage.steamCosts;
  }

  getNewOpportunitySummary(opportunityName: string, utilityType: string, costSavings: number, totalEnergySavings: number, opportunityCost: OpportunityCost): OpportunitySummary {
    let totalCost: number = this.opportunitySheetService.getOppSheetImplementationCost(opportunityCost)
    return {
      opportunityName: opportunityName,
      utilityType: utilityType,
      costSavings: costSavings,
      totalCost: totalCost,
      payback: totalCost / costSavings,
      opportunityCost: opportunityCost,
      totalEnergySavings: totalEnergySavings
    }
  }


  //electricity
  //calcs: lighting replacement, replace existing motor, motor drive
  getElectricityUtilityUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let lightingResults: { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number, opportunitySummaries: Array<OpportunitySummary> } = this.getTotalLightingSavings(treasureHunt, opportunitySummaries);
    let replaceMotorResults: { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number, opportunitySummaries: Array<OpportunitySummary> } = this.getReplaceExistingMotorSavings(treasureHunt, lightingResults.opportunitySummaries);
    let motorDriveResults: { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number, opportunitySummaries: Array<OpportunitySummary> } = this.getMotorDriveSavings(treasureHunt, replaceMotorResults.opportunitySummaries);
    let totalElectricityUsageSavings: number = lightingResults.totalEnergySavings + replaceMotorResults.totalEnergySavings + motorDriveResults.totalEnergySavings;
    let totalElectricitCostSavings: number = lightingResults.totalCostSavings + replaceMotorResults.totalCostSavings + motorDriveResults.totalCostSavings;
    let totalImplementationCost: number = lightingResults.totalImplementationCost + replaceMotorResults.totalImplementationCost + motorDriveResults.totalImplementationCost;
    let paybackPeriod: number = totalImplementationCost / totalElectricitCostSavings;
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.electricityUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.electricityCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.electricityUsage - totalElectricityUsageSavings,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.electricityCosts - totalElectricitCostSavings,
        energySavings: totalElectricityUsageSavings,
        costSavings: totalElectricitCostSavings,
        percentSavings: (totalElectricitCostSavings / treasureHunt.currentEnergyUsage.electricityCosts) * 100,
        implementationCost: totalImplementationCost,
        paybackPeriod: paybackPeriod
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //Lighting Replacements
  getTotalLightingSavings(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number, opportunitySummaries: Array<OpportunitySummary> } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    let totalImplementationCost: number = 0;
    if (treasureHunt.lightingReplacements) {
      let index: number = 1;
      treasureHunt.lightingReplacements.forEach(replacement => {
        if (replacement.selected) {
          let name: string = 'Lighting Replacement #' + index;
          let results: LightingReplacementResults = this.lightingReplacementService.getResults(replacement);
          totalCostSavings = totalCostSavings + results.totalCostSavings;
          totalEnergySavings = totalEnergySavings + results.totalEnergySavings;
          let opportunityCost: OpportunityCost;
          if (replacement.opportunitySheet) {
            totalImplementationCost = totalImplementationCost + this.opportunitySheetService.getOppSheetImplementationCost(replacement.opportunitySheet.opportunityCost);
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
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings, totalImplementationCost: totalImplementationCost, opportunitySummaries: opportunitySummaries }
  }

  //Replace Existing Motor
  getReplaceExistingMotorSavings(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number, opportunitySummaries: Array<OpportunitySummary> } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    let totalImplementationCost: number = 0;
    if (treasureHunt.replaceExistingMotors) {
      let index: number = 1;
      treasureHunt.replaceExistingMotors.forEach(replacement => {
        if (replacement.selected) {
          let name: string = 'Lighting Replacement #' + index;
          let results: ReplaceExistingResults = this.replaceExistingService.getResults(replacement.replaceExistingData);
          totalCostSavings = totalCostSavings + results.costSavings;
          totalEnergySavings = totalEnergySavings + results.annualEnergySavings;
          let opportunityCost: OpportunityCost;
          if (replacement.opportunitySheet) {
            totalImplementationCost = totalImplementationCost + this.opportunitySheetService.getOppSheetImplementationCost(replacement.opportunitySheet.opportunityCost);
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
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings, totalImplementationCost: totalImplementationCost, opportunitySummaries: opportunitySummaries }
  }

  //Motor Drive
  getMotorDriveSavings(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { totalCostSavings: number, totalEnergySavings: number, totalImplementationCost: number, opportunitySummaries: Array<OpportunitySummary> } {
    let totalCostSavings: number = 0;
    let totalEnergySavings: number = 0;
    let totalImplementationCost: number = 0;
    if (treasureHunt.motorDrives) {
      let index: number = 1;
      treasureHunt.motorDrives.forEach(drive => {
        if (drive.selected) {
          let name: string = 'Motor Drive #' + index;
          let results: MotorDriveOutputs = this.motorDriveService.getResults(drive.motorDriveInputs);
          totalCostSavings = totalCostSavings + results.annualCostSavings;
          totalEnergySavings = totalEnergySavings + results.annualEnergySavings;
          let opportunityCost: OpportunityCost;
          if (drive.opportunitySheet) {
            totalImplementationCost = totalImplementationCost + this.opportunitySheetService.getOppSheetImplementationCost(drive.opportunitySheet.opportunityCost);
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
    return { totalCostSavings: totalCostSavings, totalEnergySavings: totalEnergySavings, totalImplementationCost: totalImplementationCost, opportunitySummaries: opportunitySummaries }
  }


  //natural gas
  getNaturalGasUtilityUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.naturalGasUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.naturalGasCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.naturalGasUsage,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.naturalGasCosts,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }

  //water
  getWaterUtilityUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.waterUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.waterCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.waterUsage,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.waterCosts,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //waste water
  getWasteWaterUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.wasteWaterUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.wasteWaterCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.wasteWaterUsage,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.wasteWaterCosts,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //other fuel
  getOtherFuelUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.otherFuelUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.otherFuelCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.otherFuelUsage,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.otherFuelCosts,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //compressed air
  getCompressedAirUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.compressedAirUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.compressedAirCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.compressedAirUsage,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.compressedAirCosts,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //steam
  getSteamUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: treasureHunt.currentEnergyUsage.steamUsage,
        baselineEnergyCost: treasureHunt.currentEnergyUsage.steamCosts,
        modifiedEnergyUsage: treasureHunt.currentEnergyUsage.steamUsage,
        modifiedEnergyCost: treasureHunt.currentEnergyUsage.steamCosts,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //other
  getOtherUsage(treasureHunt: TreasureHunt, opportunitySummaries: Array<OpportunitySummary>): { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } {
    let results: { utilityUsageData: UtilityUsageData, opportunitySummaries: Array<OpportunitySummary> } =
    {
      utilityUsageData: {
        baselineEnergyUsage: 0,
        baselineEnergyCost: 0,
        modifiedEnergyUsage: 0,
        modifiedEnergyCost: 0,
        energySavings: 0,
        costSavings: 0,
        percentSavings: 0,
        implementationCost: 0,
        paybackPeriod: 0
      },
      opportunitySummaries: opportunitySummaries
    }
    return results;
  }
  //Stand Alone Opportunity Sheets
  getOpportunitySheetSavings(treasureHunt: TreasureHunt, settings: Settings, thuntResults: TreasureHuntResults): TreasureHuntResults {
    if (treasureHunt.opportunitySheets) {
      treasureHunt.opportunitySheets.forEach(oppSheet => {
        if (oppSheet.selected) {
          let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
          let numEnergyTypes: number = 0;
          let energyTypeInUse: string;
          let energyTypeLabel: string;
          let totalEnergySavings: number = 0;
          let totalCostSavings: number = 0;
          for (let key in oppSheetResults) {
            if (oppSheetResults[key].baselineEnergyUse != 0 && oppSheetResults[key].baselineEnergyUse != undefined) {
              numEnergyTypes = numEnergyTypes + 1;
            }
          }

          //electricity
          if (oppSheetResults.electricityResults.baselineEnergyUse != 0) {
            thuntResults.electricity = this.addOppSheetResultProperties(thuntResults.electricity, oppSheetResults.electricityResults, numEnergyTypes);
            energyTypeInUse = 'electricity';
            energyTypeLabel = 'Electricity';
            totalCostSavings = totalCostSavings + oppSheetResults.electricityResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.electricityResults.energySavings;
          }
          //compressed air
          if (oppSheetResults.compressedAirResults.baselineEnergyUse != 0) {
            thuntResults.compressedAir = this.addOppSheetResultProperties(thuntResults.compressedAir, oppSheetResults.compressedAirResults, numEnergyTypes);
            energyTypeInUse = 'compressedAir';
            energyTypeLabel = 'Compressed Air';
            totalCostSavings = totalCostSavings + oppSheetResults.compressedAirResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.compressedAirResults.energySavings;
          }
          //natural gas
          if (oppSheetResults.gasResults.baselineEnergyUse != 0) {
            thuntResults.naturalGas = this.addOppSheetResultProperties(thuntResults.naturalGas, oppSheetResults.gasResults, numEnergyTypes);
            energyTypeInUse = 'naturalGas';
            energyTypeLabel = 'Natural Gas';
            totalCostSavings = totalCostSavings + oppSheetResults.gasResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.gasResults.energySavings;
          }
          //water
          if (oppSheetResults.waterResults.baselineEnergyUse != 0) {
            thuntResults.water = this.addOppSheetResultProperties(thuntResults.water, oppSheetResults.waterResults, numEnergyTypes);
            energyTypeInUse = 'water';
            energyTypeLabel = 'Water';
            totalCostSavings = totalCostSavings + oppSheetResults.waterResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.waterResults.energySavings;
          }
          //waste water
          if (oppSheetResults.wasteWaterResults.baselineEnergyUse != 0) {
            thuntResults.wasteWater = this.addOppSheetResultProperties(thuntResults.wasteWater, oppSheetResults.wasteWaterResults, numEnergyTypes);
            energyTypeInUse = 'wasteWater';
            energyTypeLabel = 'Waste Water';
            totalCostSavings = totalCostSavings + oppSheetResults.wasteWaterResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.wasteWaterResults.energySavings;
          }
          //steam
          if (oppSheetResults.steamResults.baselineEnergyUse != 0) {
            thuntResults.steam = this.addOppSheetResultProperties(thuntResults.steam, oppSheetResults.steamResults, numEnergyTypes);
            energyTypeInUse = 'steam';
            energyTypeLabel = 'Steam';
            totalCostSavings = totalCostSavings + oppSheetResults.steamResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.steamResults.energySavings;
          }
          //other fuel
          if (oppSheetResults.otherFuelResults.baselineEnergyUse != 0) {
            thuntResults.otherFuel = this.addOppSheetResultProperties(thuntResults.otherFuel, oppSheetResults.otherFuelResults, numEnergyTypes);
            energyTypeInUse = 'otherFuel';
            energyTypeLabel = 'Other Fuel';
            totalCostSavings = totalCostSavings + oppSheetResults.otherFuelResults.energyCostSavings;
            totalEnergySavings = totalEnergySavings + oppSheetResults.otherFuelResults.energySavings;
          }

          //if only one energy source in opp sheet
          if (numEnergyTypes == 1) {
            thuntResults[energyTypeInUse].implementationCost = thuntResults[energyTypeInUse].implementationCost + oppSheetResults.totalImplementationCost;
            thuntResults[energyTypeInUse].paybackPeriod = thuntResults[energyTypeInUse].implementationCost / thuntResults[energyTypeInUse].costSavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, energyTypeLabel, oppSheetResults.totalCostSavings, totalEnergySavings, oppSheet.opportunityCost);
            thuntResults.opportunitySummaries.push(oppSummary);
          } else if (numEnergyTypes > 1) {
            //more then one energy source in opp sheet, implemenetation cost in other
            thuntResults.other.costSavings = thuntResults.other.costSavings + totalCostSavings;
            thuntResults.other.implementationCost = thuntResults.other.implementationCost + oppSheetResults.totalImplementationCost;
            thuntResults.other.paybackPeriod = thuntResults.other.implementationCost / thuntResults.other.costSavings;
            let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(oppSheet.name, 'Mixed', oppSheetResults.totalCostSavings, oppSheetResults.totalEnergySavings, oppSheet.opportunityCost);
            thuntResults.opportunitySummaries.push(oppSummary);
          }
          //add implementation costs to total
          thuntResults.totalImplementationCost = thuntResults.totalImplementationCost + oppSheetResults.totalImplementationCost;
        }
      });
    }
    return thuntResults;
  }

  addOppSheetResultProperties(utilityUsageData: UtilityUsageData, oppSheetResult: OpportunitySheetResult, numEnergyTypes: number): UtilityUsageData {
    utilityUsageData.modifiedEnergyUsage = utilityUsageData.modifiedEnergyUsage - oppSheetResult.energySavings;
    utilityUsageData.energySavings = utilityUsageData.energySavings + oppSheetResult.energySavings;
    utilityUsageData.modifiedEnergyCost = utilityUsageData.modifiedEnergyCost - oppSheetResult.energyCostSavings;
    utilityUsageData.costSavings = utilityUsageData.costSavings + oppSheetResult.energyCostSavings;
    utilityUsageData.percentSavings = (utilityUsageData.costSavings / utilityUsageData.baselineEnergyCost) * 100;
    if (numEnergyTypes > 1) {
      utilityUsageData.hasMixed = true
    }

    return utilityUsageData;
  }

}
