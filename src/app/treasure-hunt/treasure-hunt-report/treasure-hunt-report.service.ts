import { Injectable } from '@angular/core';
import { TreasureHuntResults, UtilityUsageData, OpportunitySummary, EnergyUsage, TreasureHunt, TreasureHuntCo2EmissionsResults } from '../../shared/models/treasure-hunt';
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
    let results: TreasureHuntResults = this.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, treasureHunt.currentEnergyUsage, settings);
    return results;
  }

  calculateTreasureHuntResultsFromSummaries(opportunitySummaries: Array<OpportunitySummary>, currentEnergyUsage: EnergyUsage, settings: Settings): TreasureHuntResults {
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
      thuntResults.opportunitySummaries.forEach( (element) => {
        element.costSavings = this.convertUnitsService.value(element.costSavings).from("$").to(settings.currency);
        element.totalCost = this.convertUnitsService.value(element.totalCost).from("$").to(settings.currency);
        element.opportunityCost = this.convertUnitsService.value(element.opportunityCost).from("$").to(settings.currency);
        element.baselineCost = this.convertUnitsService.value(element.baselineCost).from("$").to(settings.currency);
        element.modificationCost = this.convertUnitsService.value(element.modificationCost).from("$").to(settings.currency);
      });
    }
    thuntResults.co2EmissionsResults = this.getCO2EmissionsResults(currentEnergyUsage, thuntResults, settings);
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

  getCO2EmissionsResults(energyUsage: EnergyUsage, treasureHuntResults: TreasureHuntResults, settings: Settings): TreasureHuntCo2EmissionsResults {
    let carbonResults: TreasureHuntCo2EmissionsResults;
    carbonResults = this.calculateCO2Results(energyUsage, treasureHuntResults, settings);
    carbonResults.totalCO2CurrentUse = this.calculateTotalCurrentCarbonEmissions(energyUsage, carbonResults);
    carbonResults.totalCO2ProjectedUse = this.calculateTotalProjectedCarbonEmissions(energyUsage, carbonResults);
    carbonResults.totalCO2Savings = carbonResults.totalCO2CurrentUse - carbonResults.totalCO2ProjectedUse;
    return carbonResults;
  }

  calculateCO2Results(energyUsage: EnergyUsage, treasureHuntResults: TreasureHuntResults, settings: Settings): TreasureHuntCo2EmissionsResults  {
    let electricityCO2CurrentUse: number =  this.getCo2EmissionsResultFromObj(energyUsage.electricityCO2SavingsData, treasureHuntResults.electricity.baselineEnergyUsage, settings);
    let electricityCO2ProjectedUse: number = this.getCo2EmissionsResultFromObj(energyUsage.electricityCO2SavingsData, treasureHuntResults.electricity.modifiedEnergyUsage, settings);
    let naturalGasCO2CurrentUse: number = this.getCo2EmissionsResultFromObj(energyUsage.naturalGasCO2SavingsData, treasureHuntResults.naturalGas.baselineEnergyUsage, settings);
    let naturalGasCO2ProjectedUse: number = this.getCo2EmissionsResultFromObj(energyUsage.naturalGasCO2SavingsData, treasureHuntResults.naturalGas.modifiedEnergyUsage, settings);
    let otherFuelCO2CurrentUse: number = this.getCo2EmissionsResultFromObj(energyUsage.otherFuelCO2SavingsData, treasureHuntResults.otherFuel.baselineEnergyUsage, settings);
    let otherFuelCO2ProjectedUse: number = this.getCo2EmissionsResultFromObj(energyUsage.otherFuelCO2SavingsData, treasureHuntResults.otherFuel.modifiedEnergyUsage, settings);
    let waterCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.waterCO2OutputRate, treasureHuntResults.water.baselineEnergyUsage);
    let waterCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.waterCO2OutputRate, treasureHuntResults.water.modifiedEnergyUsage);
    let wasteWaterCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.wasteWaterCO2OutputRate, treasureHuntResults.wasteWater.baselineEnergyUsage);
    let wasteWaterCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.wasteWaterCO2OutputRate, treasureHuntResults.wasteWater.modifiedEnergyUsage);
    let compressedAirCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.compressedAirCO2OutputRate, treasureHuntResults.compressedAir.baselineEnergyUsage);
    let compressedAirCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.compressedAirCO2OutputRate, treasureHuntResults.compressedAir.modifiedEnergyUsage);
    let steamCO2CurrentUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.steamCO2OutputRate, treasureHuntResults.steam.baselineEnergyUsage);
    let steamCO2ProjectedUse: number = this.getCo2EmissionsResultFromNumber(energyUsage.steamCO2OutputRate, treasureHuntResults.steam.modifiedEnergyUsage);
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

  getCo2EmissionsResultFromObj(data: Co2SavingsData, electricityUsed: number, settings: Settings): number {
    //use copy for conversion data
    let totalEmissionsResult: number = 0;
    if (data){
      let dataCpy: Co2SavingsData = JSON.parse(JSON.stringify(data));      
      if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
        let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
        dataCpy.totalEmissionOutputRate = dataCpy.totalEmissionOutputRate / conversionHelper;
        electricityUsed = this.convertUnitsService.value(electricityUsed).from('GJ').to('MMBtu');
      }
      if (dataCpy.totalEmissionOutputRate && electricityUsed) {
        totalEmissionsResult = (dataCpy.totalEmissionOutputRate) * (electricityUsed / 1000);
      } 
    }    
    return totalEmissionsResult;
  }


  getCo2EmissionsResultFromNumber(outputRate: number, electricityUsed: number): number {
    let totalEmissionsResult: number = 0;
    if (outputRate && electricityUsed) {
      totalEmissionsResult = (outputRate) * (electricityUsed / 1000);
    } 
    return totalEmissionsResult;
  }

  calculateTotalCurrentCarbonEmissions(energyUsage: EnergyUsage, carbonResults: TreasureHuntCo2EmissionsResults): number{
    let totalCO2CurrentUse: number = 0;
    if(energyUsage.electricityUsed){
      totalCO2CurrentUse += carbonResults.electricityCO2CurrentUse;
    }
    if(energyUsage.naturalGasUsed){
      totalCO2CurrentUse += carbonResults.naturalGasCO2CurrentUse;
    }
    if(energyUsage.otherFuelUsed){
      totalCO2CurrentUse += carbonResults.otherFuelCO2CurrentUse;
    }
    if(energyUsage.waterUsed){
      totalCO2CurrentUse += carbonResults.waterCO2CurrentUse;
    }
    if(energyUsage.wasteWaterUsed){
      totalCO2CurrentUse += carbonResults.wasteWaterCO2CurrentUse;
    }
    if(energyUsage.compressedAirUsed){
      totalCO2CurrentUse += carbonResults.compressedAirCO2CurrentUse;
    }
    if(energyUsage.steamUsed){
      totalCO2CurrentUse += carbonResults.steamCO2CurrentUse;
    }
    return totalCO2CurrentUse;
  }

  calculateTotalProjectedCarbonEmissions(energyUsage: EnergyUsage, carbonResults: TreasureHuntCo2EmissionsResults): number{
    let totalCO2ProjectedtUse: number = 0;
    if(energyUsage.electricityUsed){
      totalCO2ProjectedtUse += carbonResults.electricityCO2ProjectedUse;
    }
    if(energyUsage.naturalGasUsed){
      totalCO2ProjectedtUse += carbonResults.naturalGasCO2ProjectedUse;
    }
    if(energyUsage.otherFuelUsed){
      totalCO2ProjectedtUse += carbonResults.otherFuelCO2ProjectedUse;
    }
    if(energyUsage.waterUsed){
      totalCO2ProjectedtUse += carbonResults.waterCO2ProjectedUse;
    }
    if(energyUsage.wasteWaterUsed){
      totalCO2ProjectedtUse += carbonResults.wasteWaterCO2ProjectedUse;
    }
    if(energyUsage.compressedAirUsed){
      totalCO2ProjectedtUse += carbonResults.compressedAirCO2ProjectedUse;
    }
    if(energyUsage.steamUsed){
      totalCO2ProjectedtUse += carbonResults.steamCO2ProjectedUse;
    }
    return totalCO2ProjectedtUse;
  }

  

}
