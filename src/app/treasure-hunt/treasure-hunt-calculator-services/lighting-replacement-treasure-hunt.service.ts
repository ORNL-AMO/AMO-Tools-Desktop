import { Injectable } from '@angular/core';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementResults } from '../../shared/models/lighting';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, LightingReplacementTreasureHunt, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';

@Injectable()
export class LightingReplacementTreasureHuntService {

  constructor(private lightingReplacementService: LightingReplacementService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt) {
    this.lightingReplacementService.baselineData = _.cloneDeep(lightingReplacementTreasureHunt.baseline);
    this.lightingReplacementService.modificationData = _.cloneDeep(lightingReplacementTreasureHunt.modifications);
    this.lightingReplacementService.baselineElectricityCost = _.cloneDeep(lightingReplacementTreasureHunt.baselineElectricityCost);
    this.lightingReplacementService.modificationElectricityCost = _.cloneDeep(lightingReplacementTreasureHunt.modificationElectricityCost);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.lightingReplacements.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(lightingReplacement: LightingReplacementTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.lightingReplacements) {
      treasureHunt.lightingReplacements = new Array();
    }
    treasureHunt.lightingReplacements.push(lightingReplacement);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.lightingReplacementService.baselineData = undefined;
    this.lightingReplacementService.modificationData = undefined;
    this.lightingReplacementService.baselineElectricityCost = undefined;
    this.lightingReplacementService.modificationElectricityCost = undefined;
  }


  getTreasureHuntOpportunityResults(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt): TreasureHuntOpportunityResults {
    let results: LightingReplacementResults = this.lightingReplacementService.getResults(lightingReplacementTreasureHunt);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.totalCostSavings,
      energySavings: results.totalEnergySavings,
      baselineCost: results.baselineResults.totalOperatingCosts,
      modificationCost: results.modificationResults.totalOperatingCosts,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getLightingReplacementCardData(lightingReplacement: LightingReplacementTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: lightingReplacement.selected,
      opportunityType: 'lighting-replacement',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
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
        modificationCost: opportunitySummary.modificationCost
      }],
      lightingReplacement: lightingReplacement,
      name: opportunitySummary.opportunityName,
      opportunitySheet: lightingReplacement.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/lighting-replacement-icon.png',
      teamName: lightingReplacement.opportunitySheet? lightingReplacement.opportunitySheet.owner : undefined,
      iconCalcType: 'lighting',
      needBackground: true
    }
    return cardData;
  }

}