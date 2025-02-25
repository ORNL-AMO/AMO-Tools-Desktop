import { Injectable } from '@angular/core';
import { TreasureHuntResults, UtilityUsageData, OpportunitySummary, EnergyUsage, TreasureHunt, TreasureHuntCo2EmissionsResults, EnergyUseItem, UtilityTypeTreasureHuntEmissions, AssessmentOpportunity } from '../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { OpportunitySummaryService } from './opportunity-summary.service';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';

@Injectable()
export class TreasureHuntReportService {

  constructor(private opportunitySummaryService: OpportunitySummaryService, private treasureChestMenuService: TreasureChestMenuService, private convertUnitsService: ConvertUnitsService) {
  }

  calculateTreasureHuntResults(treasureHunt: TreasureHunt, settings: Settings): TreasureHuntResults {
    let opportunitySummaries: Array<OpportunitySummary> = this.opportunitySummaryService.getOpportunitySummaries(treasureHunt, settings);
    let results: TreasureHuntResults = this.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, treasureHunt, settings);
    return results;
  }

  calculateTreasureHuntResultsFromSummaries(opportunitySummaries: Array<OpportunitySummary>, treasureHunt: TreasureHunt, settings: Settings): TreasureHuntResults {
    let thuntResults: TreasureHuntResults = this.setTreasureHuntResults(opportunitySummaries, treasureHunt);

    let selectedAssesmentOpps: AssessmentOpportunity[] = [];
    if (treasureHunt.assessmentOpportunities) {
      selectedAssesmentOpps = treasureHunt.assessmentOpportunities.filter(opp => opp.selected);
    }
    
    if (selectedAssesmentOpps.length > 0) {
      // Important - thuntResults utility type energy properties (calculated above) should still include assessment opps
      let isolatedTHSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => !summary.isAssessmentOpportunity);
      let isolatedTHResults: TreasureHuntResults = this.setTreasureHuntResults(isolatedTHSummaries, treasureHunt);
      
      // We need to calculate Co2 without assessment opps -> assessment opp co2 added in calculateCO2Results
      thuntResults.co2EmissionsResults = this.getCO2EmissionsResults(treasureHunt, isolatedTHResults, settings, selectedAssesmentOpps);
    } else {
      thuntResults.co2EmissionsResults = this.getCO2EmissionsResults(treasureHunt, thuntResults, settings);
    }
      
    this.setCostResults(thuntResults, settings);
    return thuntResults;
  }

  setTreasureHuntResults(opportunitySummaries: Array<OpportunitySummary>, treasureHunt: TreasureHunt): TreasureHuntResults {
    let totalBaselineCost: number = this.getTotalBaselineCost(treasureHunt.currentEnergyUsage);

    let totalAdditionalSavings: number = _.sumBy(opportunitySummaries, (summary) => {
      if (summary.opportunityCost && summary.opportunityCost.additionalAnnualSavings && summary.opportunityCost.additionalAnnualSavings.cost) {
        return summary.opportunityCost.additionalAnnualSavings.cost;
      } else {
        return 0;
      }
    })

    let mixedSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Mixed' && summary.selected == true });
    let mixedUtilityUsage: UtilityUsageData = this.getUtilityUsageData(mixedSummaries, 'Mixed', 0, 0);
    //Electricity
    let electricitySummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Electricity' && summary.selected == true });
    let electricityUtilityUsage: UtilityUsageData = this.getUtilityUsageData(electricitySummaries, 'Electricity', treasureHunt.currentEnergyUsage.electricityUsage, treasureHunt.currentEnergyUsage.electricityCosts, mixedSummaries); 
    //Compresssed Air
    let compressedAirSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Compressed Air' && summary.selected == true });
    let compressedAirUtilityUsage: UtilityUsageData = this.getUtilityUsageData(compressedAirSummaries, 'Compressed Air', treasureHunt.currentEnergyUsage.compressedAirUsage, treasureHunt.currentEnergyUsage.compressedAirCosts, mixedSummaries)
    //Natural Gas
    let naturalGasSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Natural Gas' && summary.selected == true });
    let naturalGasUtilityUsage: UtilityUsageData = this.getUtilityUsageData(naturalGasSummaries, 'Natural Gas', treasureHunt.currentEnergyUsage.naturalGasUsage, treasureHunt.currentEnergyUsage.naturalGasCosts, mixedSummaries)
    //Water
    let waterSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Water' && summary.selected == true });
    let waterUtilityUsage: UtilityUsageData = this.getUtilityUsageData(waterSummaries, 'Water', treasureHunt.currentEnergyUsage.waterUsage, treasureHunt.currentEnergyUsage.waterCosts, mixedSummaries)
    //Waste Water
    let wasteWaterSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Waste Water' && summary.selected == true });
    let wasteWaterUtilityUsage: UtilityUsageData = this.getUtilityUsageData(wasteWaterSummaries, 'Waste Water', treasureHunt.currentEnergyUsage.wasteWaterUsage, treasureHunt.currentEnergyUsage.wasteWaterCosts, mixedSummaries)
    //Steam
    let steamSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Steam' && summary.selected == true });
    let steamUtilityUsage: UtilityUsageData = this.getUtilityUsageData(steamSummaries, 'Steam', treasureHunt.currentEnergyUsage.steamUsage, treasureHunt.currentEnergyUsage.steamCosts, mixedSummaries)

    //Other Fuel
    let otherFuelSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Other Fuel' && summary.selected == true });
    let otherFuelUtilityUsage: UtilityUsageData = this.getUtilityUsageData(otherFuelSummaries, 'Other Fuel', treasureHunt.currentEnergyUsage.otherFuelUsage, treasureHunt.currentEnergyUsage.otherFuelCosts, mixedSummaries)

    //Other Additional
    let otherAdditionalSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Other' && summary.selected == true });
    let otherAdditionalUtilityUsage: UtilityUsageData = this.getUtilityUsageData(otherAdditionalSummaries, 'Other', 0, 0)


    let utilityArr: Array<UtilityUsageData> = [electricityUtilityUsage, compressedAirUtilityUsage, naturalGasUtilityUsage, waterUtilityUsage, wasteWaterUtilityUsage, steamUtilityUsage, otherFuelUtilityUsage];
    let totalImplementationCost: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.implementationCost }) + mixedUtilityUsage.implementationCost;
    let totalCostSavings: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.costSavings }) + totalAdditionalSavings;

    let hasMixed: boolean = electricityUtilityUsage.hasMixed || naturalGasUtilityUsage.hasMixed || waterUtilityUsage.hasMixed || wasteWaterUtilityUsage.hasMixed || otherFuelUtilityUsage.hasMixed || compressedAirUtilityUsage.hasMixed || steamUtilityUsage.hasMixed;

    let totalAdditionalPayback: number = _.sumBy(otherAdditionalSummaries, (summary: OpportunitySummary) => { return summary.payback });

    let thuntResults: TreasureHuntResults = {
      totalSavings: totalCostSavings,
      percentSavings: (totalCostSavings / totalBaselineCost) * 100,
      totalBaselineCost: totalBaselineCost,
      totalModificationCost: totalBaselineCost - totalCostSavings,
      paybackPeriod: totalImplementationCost / totalCostSavings,
      opportunitySummaries: opportunitySummaries,
      electricity: electricityUtilityUsage,
      naturalGas: naturalGasUtilityUsage,
      water: waterUtilityUsage,
      wasteWater: wasteWaterUtilityUsage,
      otherFuel: otherFuelUtilityUsage,
      compressedAir: compressedAirUtilityUsage,
      steam: steamUtilityUsage,
      other: mixedUtilityUsage,
      totalAdditionalSavings: totalAdditionalSavings,
      totalAdditionalImplementationCost: otherAdditionalUtilityUsage.implementationCost,
      totalAdditionalPayback: totalAdditionalPayback,
      totalImplementationCost: totalImplementationCost,
      hasMixed: hasMixed,
    };
    return thuntResults;
  }

  setCostResults(thuntResults: TreasureHuntResults, settings) {
    if (settings.currency !== "$") {
      thuntResults.totalSavings = this.convertUnitsService.value(thuntResults.totalSavings).from("$").to(settings.currency);
      thuntResults.totalBaselineCost = this.convertUnitsService.value(thuntResults.totalBaselineCost).from("$").to(settings.currency);
      thuntResults.totalModificationCost = this.convertUnitsService.value(thuntResults.totalModificationCost).from("$").to(settings.currency);
      thuntResults.totalImplementationCost = this.convertUnitsService.value(thuntResults.totalImplementationCost).from("$").to(settings.currency);
      thuntResults.electricity.baselineEnergyCost = this.convertUnitsService.value(thuntResults.electricity.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.electricity.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.electricity.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.electricity.costSavings = this.convertUnitsService.value(thuntResults.electricity.costSavings).from("$").to(settings.currency);
      thuntResults.electricity.implementationCost = this.convertUnitsService.value(thuntResults.electricity.implementationCost).from("$").to(settings.currency);
      thuntResults.naturalGas.baselineEnergyCost = this.convertUnitsService.value(thuntResults.naturalGas.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.naturalGas.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.naturalGas.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.naturalGas.costSavings = this.convertUnitsService.value(thuntResults.naturalGas.costSavings).from("$").to(settings.currency);
      thuntResults.naturalGas.implementationCost = this.convertUnitsService.value(thuntResults.naturalGas.implementationCost).from("$").to(settings.currency);
      thuntResults.wasteWater.baselineEnergyCost = this.convertUnitsService.value(thuntResults.wasteWater.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.wasteWater.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.wasteWater.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.wasteWater.costSavings = this.convertUnitsService.value(thuntResults.wasteWater.costSavings).from("$").to(settings.currency);
      thuntResults.wasteWater.implementationCost = this.convertUnitsService.value(thuntResults.wasteWater.implementationCost).from("$").to(settings.currency);
      thuntResults.otherFuel.baselineEnergyCost = this.convertUnitsService.value(thuntResults.otherFuel.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.otherFuel.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.otherFuel.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.otherFuel.costSavings = this.convertUnitsService.value(thuntResults.otherFuel.costSavings).from("$").to(settings.currency);
      thuntResults.otherFuel.implementationCost = this.convertUnitsService.value(thuntResults.otherFuel.implementationCost).from("$").to(settings.currency);
      thuntResults.compressedAir.baselineEnergyCost = this.convertUnitsService.value(thuntResults.compressedAir.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.compressedAir.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.compressedAir.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.compressedAir.costSavings = this.convertUnitsService.value(thuntResults.compressedAir.costSavings).from("$").to(settings.currency);
      thuntResults.compressedAir.implementationCost = this.convertUnitsService.value(thuntResults.compressedAir.implementationCost).from("$").to(settings.currency);
      thuntResults.steam.baselineEnergyCost = this.convertUnitsService.value(thuntResults.steam.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.steam.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.steam.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.steam.costSavings = this.convertUnitsService.value(thuntResults.steam.costSavings).from("$").to(settings.currency);
      thuntResults.steam.implementationCost = this.convertUnitsService.value(thuntResults.steam.implementationCost).from("$").to(settings.currency);
      thuntResults.other.baselineEnergyCost = this.convertUnitsService.value(thuntResults.other.baselineEnergyCost).from("$").to(settings.currency);
      thuntResults.other.modifiedEnergyCost = this.convertUnitsService.value(thuntResults.other.modifiedEnergyCost).from("$").to(settings.currency);
      thuntResults.other.costSavings = this.convertUnitsService.value(thuntResults.other.costSavings).from("$").to(settings.currency);
      thuntResults.other.implementationCost = this.convertUnitsService.value(thuntResults.other.implementationCost).from("$").to(settings.currency);
      thuntResults.opportunitySummaries.forEach((element) => {
        element.costSavings = this.convertUnitsService.value(element.costSavings).from("$").to(settings.currency);
        element.totalCost = this.convertUnitsService.value(element.totalCost).from("$").to(settings.currency);
        element.opportunityCost = this.convertUnitsService.value(element.opportunityCost).from("$").to(settings.currency);
        element.baselineCost = this.convertUnitsService.value(element.baselineCost).from("$").to(settings.currency);
        element.modificationCost = this.convertUnitsService.value(element.modificationCost).from("$").to(settings.currency);
      });
    }
  }

  getUtilityUsageData(opportunitySummaries: Array<OpportunitySummary>, utilityType: string, currentEnergyUsage: number, currentEnergyCost: number, mixedSummaries?: Array<OpportunitySummary>): UtilityUsageData {
    let totalUsageSavings: number = _.sumBy(opportunitySummaries, (summary: OpportunitySummary) => { return summary.totalEnergySavings });
    let totalCostSavings: number = _.sumBy(opportunitySummaries, (summary: OpportunitySummary) => { return summary.costSavings });
    let totalImplementationCost: number = _.sumBy(opportunitySummaries, (summary: OpportunitySummary) => { return summary.totalCost });
    let hasMixed: boolean = false;
    if (mixedSummaries) {
      mixedSummaries.forEach(summary => {
        let utilitySummaries: Array<OpportunitySummary> = summary.mixedIndividualResults.filter(summary => { return summary.utilityType == utilityType });
        if (utilitySummaries.length != 0) {
          hasMixed = true;
        }
        let tmpUsageSavings: number = _.sumBy(utilitySummaries, (summary: OpportunitySummary) => { return summary.totalEnergySavings });
        let tmpCostSavings: number = _.sumBy(utilitySummaries, (summary: OpportunitySummary) => { return summary.costSavings });
        totalUsageSavings = totalUsageSavings + tmpUsageSavings;
        totalCostSavings = totalCostSavings + tmpCostSavings;
      })
    }

    let utilityUsageData: UtilityUsageData = {
      baselineEnergyUsage: currentEnergyUsage,
      baselineEnergyCost: currentEnergyCost,
      modifiedEnergyUsage: currentEnergyUsage - totalUsageSavings,
      modifiedEnergyCost: currentEnergyCost - totalCostSavings,
      energySavings: totalUsageSavings,
      costSavings: totalCostSavings,
      percentSavings: (totalCostSavings / currentEnergyCost) * 100,
      implementationCost: totalImplementationCost,
      paybackPeriod: totalImplementationCost / totalCostSavings,
      hasMixed: hasMixed
    }

    return utilityUsageData;
  }

  getTotalBaselineCost(currentEnergyUsage: EnergyUsage) {
    return currentEnergyUsage.electricityCosts + currentEnergyUsage.naturalGasCosts + currentEnergyUsage.otherFuelCosts + currentEnergyUsage.waterCosts + currentEnergyUsage.wasteWaterCosts + currentEnergyUsage.compressedAirCosts + currentEnergyUsage.steamCosts;
  }

  getTeamData(opportunityCardsData: Array<OpportunityCardData>): Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }> {
    let teams: Array<string> = this.treasureChestMenuService.getAllTeams(opportunityCardsData);
    let teamData = new Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>();
    teams.forEach(team => {
      let teamOpps: Array<OpportunityCardData> = opportunityCardsData.filter(cardData => { return cardData.teamName == team && cardData.selected == true });
      let teamName: string = team;
      let totalAdditionalSavings: number = this.getAdditionalCostSavings(teamOpps);
      let costSavings: number = _.sumBy(teamOpps, 'annualCostSavings') + totalAdditionalSavings;
      let implementationCost: number = _.sumBy(teamOpps, 'implementationCost');
      let paybackPeriod: number = implementationCost / costSavings;
      teamData.push({
        team: teamName,
        costSavings: costSavings,
        implementationCost: implementationCost,
        paybackPeriod: paybackPeriod
      });
    });
    teamData = _.orderBy(teamData, 'costSavings', 'desc');
    return teamData;
  }

  getAdditionalCostSavings(teamOpps: Array<OpportunityCardData>): number {
    let additionalCostSavings: number = _.sumBy(teamOpps, (teamOpp) => {
      if (teamOpp.opportunitySheet && teamOpp.opportunitySheet.opportunityCost && teamOpp.opportunitySheet.opportunityCost.additionalAnnualSavings && teamOpp.opportunitySheet.opportunityCost.additionalAnnualSavings.cost) {
        return teamOpp.opportunitySheet.opportunityCost.additionalAnnualSavings.cost
      } else {
        return 0;
      }
    });
    return additionalCostSavings;
  }

  getCO2EmissionsResults(treasureHunt: TreasureHunt, treasureHuntResults: TreasureHuntResults, settings: Settings, selectedAssesmentOpps?: AssessmentOpportunity[]): TreasureHuntCo2EmissionsResults {
    let carbonResults: TreasureHuntCo2EmissionsResults;
    carbonResults = this.calculateCO2Results(treasureHunt, treasureHuntResults, settings);

    if (selectedAssesmentOpps) {
      this.addAssessmentOppCo2Results(selectedAssesmentOpps, carbonResults);
    }

    carbonResults.totalCO2CurrentUse = this.calculateTotalCurrentCarbonEmissions(treasureHunt.currentEnergyUsage, carbonResults);
    carbonResults.totalCO2ProjectedUse = this.calculateTotalProjectedCarbonEmissions(treasureHunt.currentEnergyUsage, carbonResults);
    carbonResults.totalCO2Savings = carbonResults.totalCO2CurrentUse - carbonResults.totalCO2ProjectedUse;

    return carbonResults;
  }

  calculateCO2Results(treasureHunt: TreasureHunt, treasureHuntResults: TreasureHuntResults, settings: Settings): TreasureHuntCo2EmissionsResults {
    let electricityCO2CurrentUse: number = this.getCo2EmissionsResultFromObj(treasureHunt.currentEnergyUsage.electricityCO2SavingsData, treasureHuntResults.electricity.baselineEnergyUsage, settings);
    let electricityCO2ProjectedUse: number = this.getCo2EmissionsResultFromObj(treasureHunt.currentEnergyUsage.electricityCO2SavingsData, treasureHuntResults.electricity.modifiedEnergyUsage, settings);
    let naturalGasCO2CurrentUse: number = this.getCo2EmissionsResultFromObj(treasureHunt.currentEnergyUsage.naturalGasCO2SavingsData, treasureHuntResults.naturalGas.baselineEnergyUsage, settings);
    let naturalGasCO2ProjectedUse: number = this.getCo2EmissionsResultFromObj(treasureHunt.currentEnergyUsage.naturalGasCO2SavingsData, treasureHuntResults.naturalGas.modifiedEnergyUsage, settings);
    let otherFuelCO2CurrentUse: number = this.getCo2EmissionsResultFromObj(treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData, treasureHuntResults.otherFuel.baselineEnergyUsage, settings);
    let otherFuelCO2ProjectedUse: number = this.getCo2EmissionsResultFromObj(treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData, treasureHuntResults.otherFuel.modifiedEnergyUsage, settings);
    let waterCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.waterCO2OutputRate, treasureHuntResults.water.baselineEnergyUsage, settings);
    let waterCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.waterCO2OutputRate, treasureHuntResults.water.modifiedEnergyUsage, settings);
    let wasteWaterCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.wasteWaterCO2OutputRate, treasureHuntResults.wasteWater.baselineEnergyUsage, settings);
    let wasteWaterCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.wasteWaterCO2OutputRate, treasureHuntResults.wasteWater.modifiedEnergyUsage, settings);
    let compressedAirCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.compressedAirCO2OutputRate, treasureHuntResults.compressedAir.baselineEnergyUsage, settings);
    let compressedAirCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.compressedAirCO2OutputRate, treasureHuntResults.compressedAir.modifiedEnergyUsage, settings);
    let steamCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.steamCO2OutputRate, treasureHuntResults.steam.baselineEnergyUsage, settings);
    let steamCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(treasureHunt.currentEnergyUsage.steamCO2OutputRate, treasureHuntResults.steam.modifiedEnergyUsage, settings);
    let carbonResults: TreasureHuntCo2EmissionsResults = {
      electricityCO2CurrentUse: electricityCO2CurrentUse,
      electricityCO2ProjectedUse: electricityCO2ProjectedUse,
      electricityCO2Savings: electricityCO2CurrentUse - electricityCO2ProjectedUse,
      naturalGasCO2CurrentUse: naturalGasCO2CurrentUse,
      naturalGasCO2ProjectedUse: naturalGasCO2ProjectedUse,
      naturalGasCO2Savings: naturalGasCO2CurrentUse - naturalGasCO2ProjectedUse,
      otherFuelCO2CurrentUse: otherFuelCO2CurrentUse,
      otherFuelCO2ProjectedUse: otherFuelCO2ProjectedUse,
      otherFuelCO2Savings: otherFuelCO2CurrentUse - otherFuelCO2ProjectedUse,
      waterCO2CurrentUse: waterCO2CurrentUse,
      waterCO2ProjectedUse: waterCO2ProjectedUse,
      waterCO2Savings: waterCO2CurrentUse - waterCO2ProjectedUse,
      wasteWaterCO2CurrentUse: wasteWaterCO2CurrentUse,
      wasteWaterCO2ProjectedUse: wasteWaterCO2ProjectedUse,
      wasteWaterCO2Savings: wasteWaterCO2CurrentUse - wasteWaterCO2ProjectedUse,
      compressedAirCO2CurrentUse: compressedAirCO2CurrentUse,
      compressedAirCO2ProjectedUse: compressedAirCO2ProjectedUse,
      compressedAirCO2Savings: compressedAirCO2CurrentUse - compressedAirCO2ProjectedUse,
      steamCO2CurrentUse: steamCO2CurrentUse,
      steamCO2ProjectedUse: steamCO2ProjectedUse,
      steamCO2Savings: steamCO2CurrentUse - steamCO2ProjectedUse
    }
    
    return carbonResults;
  }

  addAssessmentOppCo2Results(selectedAssesmentOpps: AssessmentOpportunity[], carbonResults: TreasureHuntCo2EmissionsResults) {
    selectedAssesmentOpps.forEach(opp => {
      let baselineEmissions: UtilityTypeTreasureHuntEmissions = this.setIntegratedEnergyUseItemEmissions(opp.baselineEnergyUseItems);
      let modificationEmissions: UtilityTypeTreasureHuntEmissions = this.setIntegratedEnergyUseItemEmissions(opp.modificationEnergyUseItems);

      carbonResults.electricityCO2CurrentUse += baselineEmissions.electricityEmissions,
      carbonResults.electricityCO2ProjectedUse += modificationEmissions.electricityEmissions,
      carbonResults.electricityCO2Savings += baselineEmissions.electricityEmissions - modificationEmissions.electricityEmissions,
      carbonResults.naturalGasCO2CurrentUse += baselineEmissions.naturalGasEmissions;
      carbonResults.naturalGasCO2ProjectedUse += modificationEmissions.naturalGasEmissions;
      carbonResults.naturalGasCO2Savings += baselineEmissions.naturalGasEmissions - modificationEmissions.naturalGasEmissions;
      carbonResults.otherFuelCO2CurrentUse += baselineEmissions.otherFuelEmissions;
      carbonResults.otherFuelCO2ProjectedUse += modificationEmissions.otherFuelEmissions;
      carbonResults.otherFuelCO2Savings += baselineEmissions.otherFuelEmissions - modificationEmissions.otherFuelEmissions;
      carbonResults.waterCO2CurrentUse += baselineEmissions.waterEmissions;
      carbonResults.waterCO2ProjectedUse += modificationEmissions.waterEmissions;
      carbonResults.waterCO2Savings += baselineEmissions.waterEmissions - modificationEmissions.waterEmissions;
      carbonResults.wasteWaterCO2CurrentUse += baselineEmissions.wasteWaterEmissions;
      carbonResults.wasteWaterCO2ProjectedUse += modificationEmissions.wasteWaterEmissions;
      carbonResults.wasteWaterCO2Savings += baselineEmissions.wasteWaterEmissions - modificationEmissions.wasteWaterEmissions;
      carbonResults.compressedAirCO2CurrentUse += baselineEmissions.compressedAirEmissions;
      carbonResults.compressedAirCO2ProjectedUse += modificationEmissions.compressedAirEmissions;
      carbonResults.compressedAirCO2Savings += baselineEmissions.compressedAirEmissions - modificationEmissions.compressedAirEmissions;
      carbonResults.steamCO2CurrentUse += baselineEmissions.steamEmissions;
      carbonResults.steamCO2ProjectedUse += modificationEmissions.steamEmissions;
      carbonResults.steamCO2Savings += baselineEmissions.steamEmissions - modificationEmissions.steamEmissions;
    });

  }

  setIntegratedEnergyUseItemEmissions(energyUseItems: EnergyUseItem[]): UtilityTypeTreasureHuntEmissions {
    let treasureHuntEmissions: UtilityTypeTreasureHuntEmissions = {
      electricityEmissions: 0,
      naturalGasEmissions: 0,
      otherFuelEmissions: 0,
      waterEmissions: 0,
      wasteWaterEmissions: 0,
      compressedAirEmissions: 0,
      steamEmissions: 0,
    }
    energyUseItems.forEach(item => {
      let integratedEmissions: number = item.integratedEmissionRate !== undefined ? item.integratedEmissionRate : 0;
      if (item.type === 'Electricity') {
        treasureHuntEmissions.electricityEmissions += integratedEmissions;
      } else if (item.type === 'Gas') {
        treasureHuntEmissions.naturalGasEmissions += integratedEmissions;
      } else if (item.type === 'Other Fuel') {
        treasureHuntEmissions.otherFuelEmissions += integratedEmissions;
      } else if (item.type === 'Steam') {
        treasureHuntEmissions.steamEmissions += integratedEmissions;
      } else if (item.type === 'Compressed Air') {
        treasureHuntEmissions.compressedAirEmissions += integratedEmissions;
      } else if (item.type === 'Water') {
        treasureHuntEmissions.waterEmissions += integratedEmissions;

      } else if (item.type === 'Waste Water') {
        treasureHuntEmissions.wasteWaterEmissions += integratedEmissions;
      }
    });

    return treasureHuntEmissions;
  }

  getCo2EmissionsResultFromObj(data: Co2SavingsData, electricityUsed: number, settings: Settings): number {
    //use copy for conversion data
    let totalEmissionsResult: number = 0;
    if (data) {
      let dataCpy: Co2SavingsData = JSON.parse(JSON.stringify(data));
      if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
        let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
        dataCpy.totalEmissionOutputRate = dataCpy.totalEmissionOutputRate / conversionHelper;
        electricityUsed = this.convertUnitsService.value(electricityUsed).from('GJ').to('MMBtu');
      }

      totalEmissionsResult = this.getCo2EmissionsResultFromNumber(dataCpy.totalEmissionOutputRate, electricityUsed, settings);
    }
    return totalEmissionsResult;
  }


  getCo2EmissionsResultFromNumber(outputRate: number, electricityUsed: number, settings: Settings): number {
    let totalEmissionsResult: number = 0;
    if (outputRate && electricityUsed) {
      totalEmissionsResult = (outputRate) * (electricityUsed / 1000);

      if (settings.emissionsUnit !== 'Metric') {
        totalEmissionsResult = this.convertUnitsService.value(totalEmissionsResult).from('tonne').to('ton');
      }
    }
    return totalEmissionsResult;
  }

  calculateTotalCurrentCarbonEmissions(energyUsage: EnergyUsage, carbonResults: TreasureHuntCo2EmissionsResults): number {
    let totalCO2CurrentUse: number = 0;
    if (energyUsage.electricityUsed) {
      totalCO2CurrentUse += carbonResults.electricityCO2CurrentUse;
    }
    if (energyUsage.naturalGasUsed) {
      totalCO2CurrentUse += carbonResults.naturalGasCO2CurrentUse;
    }
    if (energyUsage.otherFuelUsed) {
      totalCO2CurrentUse += carbonResults.otherFuelCO2CurrentUse;
    }
    if (energyUsage.waterUsed) {
      totalCO2CurrentUse += carbonResults.waterCO2CurrentUse;
    }
    if (energyUsage.wasteWaterUsed) {
      totalCO2CurrentUse += carbonResults.wasteWaterCO2CurrentUse;
    }
    if (energyUsage.compressedAirUsed) {
      totalCO2CurrentUse += carbonResults.compressedAirCO2CurrentUse;
    }
    if (energyUsage.steamUsed) {
      totalCO2CurrentUse += carbonResults.steamCO2CurrentUse;
    }
    return totalCO2CurrentUse;
  }

  calculateTotalProjectedCarbonEmissions(energyUsage: EnergyUsage, carbonResults: TreasureHuntCo2EmissionsResults): number {
    let totalCO2ProjectedtUse: number = 0;
    if (energyUsage.electricityUsed) {
      totalCO2ProjectedtUse += carbonResults.electricityCO2ProjectedUse;
    }
    if (energyUsage.naturalGasUsed) {
      totalCO2ProjectedtUse += carbonResults.naturalGasCO2ProjectedUse;
    }
    if (energyUsage.otherFuelUsed) {
      totalCO2ProjectedtUse += carbonResults.otherFuelCO2ProjectedUse;
    }
    if (energyUsage.waterUsed) {
      totalCO2ProjectedtUse += carbonResults.waterCO2ProjectedUse;
    }
    if (energyUsage.wasteWaterUsed) {
      totalCO2ProjectedtUse += carbonResults.wasteWaterCO2ProjectedUse;
    }
    if (energyUsage.compressedAirUsed) {
      totalCO2ProjectedtUse += carbonResults.compressedAirCO2ProjectedUse;
    }
    if (energyUsage.steamUsed) {
      totalCO2ProjectedtUse += carbonResults.steamCO2ProjectedUse;
    }
    return totalCO2ProjectedtUse;
  }

}