import { Injectable } from '@angular/core';
import { WaterReductionService } from '../../calculator/waste-water/water-reduction/water-reduction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { WaterReductionData, WaterReductionResults } from '../../shared/models/standalone';
import { EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults, WaterReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';

@Injectable()
export class WaterReductionTreasureHuntService {

  constructor(private waterReductionService: WaterReductionService, private convertUnitsService: ConvertUnitsService) { }
  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(waterReduction: WaterReductionTreasureHunt) {
    this.waterReductionService.baselineData = _.cloneDeep(waterReduction.baseline);
    this.waterReductionService.modificationData = _.cloneDeep(waterReduction.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.waterReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(waterReduction: WaterReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.waterReductions) {
      treasureHunt.waterReductions = new Array();
    }
    treasureHunt.waterReductions.push(waterReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.waterReductionService.baselineData = undefined;
    this.waterReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(waterReduction: WaterReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: WaterReductionResults = this.waterReductionService.getResults(settings, waterReduction.baseline, waterReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualWaterSavings,
      baselineCost: results.baselineResults.waterCost,
      modificationCost: results.modificationResults.waterCost,
      utilityType: '',
    }

    if (waterReduction.baseline[0].isWastewater == true) {
      treasureHuntOpportunityResults.utilityType = 'Waste-Water';
    } else {
      treasureHuntOpportunityResults.utilityType = 'Water';
    }

    return treasureHuntOpportunityResults;
  }

  getWaterReductionCardData(reduction: WaterReductionTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let utilityCost: number = currentEnergyUsage.waterCosts;
    let unitStr: string = 'm3';
    if (settings.unitsOfMeasure == 'Imperial') {
      unitStr = 'kgal';
    }
    //electricity utility
    if (reduction.baseline[0].isWastewater == true) {
      utilityCost = currentEnergyUsage.wasteWaterCosts;
    }

    let annualCostSavings: number = opportunitySummary.costSavings;
    if (reduction.opportunitySheet){
      if (reduction.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += reduction.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: reduction.selected,
      opportunityType: 'water-reduction',
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: unitStr,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / utilityCost) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      waterReduction: reduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/water-reduction-icon.png',
      teamName: reduction.opportunitySheet? reduction.opportunitySheet.owner : undefined
    }
    return cardData;
  }

  convertWaterReductions(waterReductions: Array<WaterReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WaterReductionTreasureHunt> {
    waterReductions.forEach(waterReduction => {
      waterReduction.baseline.forEach(reduction => {
        reduction = this.convertWaterReduction(reduction, oldSettings, newSettings);
      });
      if (waterReduction.modification && waterReduction.modification.length > 0) { 
        waterReduction.modification.forEach(reduction => {
          reduction = this.convertWaterReduction(reduction, oldSettings, newSettings);
        });
      }
    })
    return waterReductions;
  }

  convertWaterReduction(reduction: WaterReductionData, oldSettings: Settings, newSettings: Settings): WaterReductionData {
    //imperial: $/gal, metric: $/L
    reduction.waterCost = this.convertUnitsService.convertDollarsPerGalAndLiter(reduction.waterCost, oldSettings, newSettings);
    //imperial: gpm, metric: L/min
    reduction.meteredFlowMethodData.meterReading = this.convertUnitsService.convertGallonPerMinuteAndLiterPerSecondValue(reduction.meteredFlowMethodData.meterReading, oldSettings, newSettings);
    reduction.volumeMeterMethodData.finalMeterReading = this.convertUnitsService.convertGallonPerMinuteAndLiterPerSecondValue(reduction.volumeMeterMethodData.finalMeterReading, oldSettings, newSettings);
    reduction.volumeMeterMethodData.initialMeterReading = this.convertUnitsService.convertGallonPerMinuteAndLiterPerSecondValue(reduction.volumeMeterMethodData.initialMeterReading, oldSettings, newSettings);
    //imperial: gal, metric: L
    reduction.bucketMethodData.bucketVolume = this.convertUnitsService.convertGalAndLiterValue(reduction.bucketMethodData.bucketVolume, oldSettings, newSettings);
    //imperial: gal/yr, metric: m3/yr
    reduction.otherMethodData.consumption = this.convertUnitsService.convertGalAndM3Value(reduction.otherMethodData.consumption, oldSettings, newSettings);
    return reduction;
  }

}