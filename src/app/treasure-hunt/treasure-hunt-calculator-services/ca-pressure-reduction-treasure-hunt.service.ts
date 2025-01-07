import { Injectable } from '@angular/core';
import { CompressedAirPressureReductionService } from '../../calculator/compressed-air/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResults } from '../../shared/models/standalone';
import { CompressedAirPressureReductionTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';

@Injectable()
export class CaPressureReductionTreasureHuntService {

  constructor(private compressedAirPressureReductionService: CompressedAirPressureReductionService, private convertUnitsService: ConvertUnitsService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt) {
    this.compressedAirPressureReductionService.baselineData = _.cloneDeep(compressedAirPressureReduction.baseline);
    this.compressedAirPressureReductionService.modificationData = _.cloneDeep(compressedAirPressureReduction.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.compressedAirPressureReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.compressedAirPressureReductions) {
      treasureHunt.compressedAirPressureReductions = new Array();
    }
    treasureHunt.compressedAirPressureReductions.push(compressedAirPressureReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.compressedAirPressureReductionService.baselineData = undefined;
    this.compressedAirPressureReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: CompressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(settings, compressedAirPressureReduction.baseline, compressedAirPressureReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getCompressedAirPressureReductionCardData(reduction: CompressedAirPressureReductionTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
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
      opportunityType: 'compressed-air-pressure-reduction',
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.electricityCosts) * 100,
        label: 'Electricity',
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      compressedAirPressureReduction: reduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/compressed-air-pressure-reduction-icon.png',
      teamName: reduction.opportunitySheet? reduction.opportunitySheet.owner : undefined,
      iconCalcType: 'compressedAir',
      needBackground: true
    };
    return cardData;
  }

  convertCompressedAirPressureReductions(compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CompressedAirPressureReductionTreasureHunt> {
    compressedAirPressureReductions.forEach(compressedAirPressureReduction => {
      compressedAirPressureReduction.baseline.forEach(reduction => {
        reduction = this.convertCompressedAirPressureReduction(reduction, oldSettings, newSettings);
      });
      if (compressedAirPressureReduction.modification && compressedAirPressureReduction.modification.length > 0) {
        compressedAirPressureReduction.modification.forEach(reduction => {
          reduction = this.convertCompressedAirPressureReduction(reduction, oldSettings, newSettings);
        });
      }
    });
    return compressedAirPressureReductions;
  }
  convertCompressedAirPressureReduction(reduction: CompressedAirPressureReductionData, oldSettings: Settings, newSettings: Settings): CompressedAirPressureReductionData {
    //imperial: psig, metric: barg
    reduction.pressure = this.convertUnitsService.convertPsigAndBargValue(reduction.pressure, oldSettings, newSettings);
    reduction.proposedPressure = this.convertUnitsService.convertPsigAndBargValue(reduction.proposedPressure, oldSettings, newSettings);
    return reduction;
  }

}