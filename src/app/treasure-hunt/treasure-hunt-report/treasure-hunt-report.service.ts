import { Injectable } from '@angular/core';
import { TreasureHuntResults, UtilityUsageData, OpportunitySummary, EnergyUsage, TreasureHunt } from '../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { OpportunitySummaryService } from './opportunity-summary.service';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest/treasure-chest-menu/treasure-chest-menu.service';

@Injectable()
export class TreasureHuntReportService {

  constructor(private opportunitySummaryService: OpportunitySummaryService, private treasureChestMenuService: TreasureChestMenuService) {
  }

  calculateTreasureHuntResults(treasureHunt: TreasureHunt, settings: Settings): TreasureHuntResults {
    let opportunitySummaries: Array<OpportunitySummary> = this.opportunitySummaryService.getOpportunitySummaries(treasureHunt, settings);
    let results: TreasureHuntResults = this.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, treasureHunt.currentEnergyUsage);
    return results;
  }

  calculateTreasureHuntResultsFromSummaries(opportunitySummaries: Array<OpportunitySummary>, currentEnergyUsage: EnergyUsage): TreasureHuntResults {
    let totalBaselineCost: number = this.getTotalBaselineCost(currentEnergyUsage);

    let totalAdditionalSavings: number = _.sumBy(opportunitySummaries, (summary) => {
      if (summary.opportunityCost && summary.opportunityCost.additionalAnnualSavings && summary.opportunityCost.additionalAnnualSavings.cost) {
        return summary.opportunityCost.additionalAnnualSavings.cost;
      } else {
        return 0;
      }
    })

    //Mixed
    let mixedSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Mixed' && summary.selected == true });
    let otherUtilityUsage: UtilityUsageData = this.getUtilityUsageData(mixedSummaries, 'Mixed', 0, 0);
    //Electricity
    let electricitySummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Electricity' && summary.selected == true });
    let electricityUtilityUsage: UtilityUsageData = this.getUtilityUsageData(electricitySummaries, 'Electricity', currentEnergyUsage.electricityUsage, currentEnergyUsage.electricityCosts, mixedSummaries);
    //Compresssed Air
    let compressedAirSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Compressed Air' && summary.selected == true });
    let compressedAirUtilityUsage: UtilityUsageData = this.getUtilityUsageData(compressedAirSummaries, 'Compressed Air', currentEnergyUsage.compressedAirUsage, currentEnergyUsage.compressedAirCosts, mixedSummaries)
    //Natural Gas
    let naturalGasSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Natural Gas' && summary.selected == true });
    let naturalGasUtilityUsage: UtilityUsageData = this.getUtilityUsageData(naturalGasSummaries, 'Natural Gas', currentEnergyUsage.naturalGasUsage, currentEnergyUsage.naturalGasCosts, mixedSummaries)
    //Water
    let waterSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Water' && summary.selected == true });
    let waterUtilityUsage: UtilityUsageData = this.getUtilityUsageData(waterSummaries, 'Water', currentEnergyUsage.waterUsage, currentEnergyUsage.waterCosts, mixedSummaries)
    //Waste Water
    let wasteWaterSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Waste Water' && summary.selected == true });
    let wasteWaterUtilityUsage: UtilityUsageData = this.getUtilityUsageData(wasteWaterSummaries, 'Waste Water', currentEnergyUsage.wasteWaterUsage, currentEnergyUsage.wasteWaterCosts, mixedSummaries)
    //Steam
    let steamSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Steam' && summary.selected == true });
    let steamUtilityUsage: UtilityUsageData = this.getUtilityUsageData(steamSummaries, 'Steam', currentEnergyUsage.steamUsage, currentEnergyUsage.steamCosts, mixedSummaries)

    //Other Fuel
    let otherFuelSummaries: Array<OpportunitySummary> = opportunitySummaries.filter(summary => { return summary.utilityType == 'Other Fuel' && summary.selected == true });
    let otherFuelUtilityUsage: UtilityUsageData = this.getUtilityUsageData(otherFuelSummaries, 'Other Fuel', currentEnergyUsage.otherFuelUsage, currentEnergyUsage.otherFuelCosts, mixedSummaries)




    let utilityArr: Array<UtilityUsageData> = [electricityUtilityUsage, compressedAirUtilityUsage, naturalGasUtilityUsage, waterUtilityUsage, wasteWaterUtilityUsage, steamUtilityUsage, otherFuelUtilityUsage];
    let totalImplementationCost: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.implementationCost }) + otherUtilityUsage.implementationCost;
    let totalCostSavings: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.costSavings }) + totalAdditionalSavings;

    let hasMixed: boolean = electricityUtilityUsage.hasMixed || naturalGasUtilityUsage.hasMixed || waterUtilityUsage.hasMixed || wasteWaterUtilityUsage.hasMixed || otherFuelUtilityUsage.hasMixed || compressedAirUtilityUsage.hasMixed || steamUtilityUsage.hasMixed;
    let thuntResults: TreasureHuntResults = {
      totalSavings: totalCostSavings,
      percentSavings: (totalCostSavings / totalBaselineCost) * 100,
      totalBaselineCost: totalBaselineCost,
      totalModificationCost: totalBaselineCost - totalCostSavings,
      paybackPeriod: totalImplementationCost / totalCostSavings,
      electricity: electricityUtilityUsage,
      naturalGas: naturalGasUtilityUsage,
      water: waterUtilityUsage,
      wasteWater: wasteWaterUtilityUsage,
      otherFuel: otherFuelUtilityUsage,
      compressedAir: compressedAirUtilityUsage,
      steam: steamUtilityUsage,
      other: otherUtilityUsage,
      opportunitySummaries: opportunitySummaries,
      totalImplementationCost: totalImplementationCost,
      hasMixed: hasMixed,
      totalAdditionalSavings: totalAdditionalSavings
    };

    return thuntResults;
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
}
