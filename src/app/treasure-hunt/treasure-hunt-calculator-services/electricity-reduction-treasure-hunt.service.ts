import { Injectable } from '@angular/core';
import { ElectricityReductionService } from '../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { ElectricityReductionData, ElectricityReductionResults } from '../../shared/models/standalone';
import { ElectricityReductionTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';

@Injectable()
export class ElectricityReductionTreasureHuntService {
  constructor(private electricityReductionService: ElectricityReductionService, private convertUnitsService: ConvertUnitsService) { }
  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(electricityReduction: ElectricityReductionTreasureHunt) {
    this.electricityReductionService.baselineData = _.cloneDeep(electricityReduction.baseline);
    this.electricityReductionService.modificationData = _.cloneDeep(electricityReduction.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.electricityReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(electricityReduction: ElectricityReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.electricityReductions) {
      treasureHunt.electricityReductions = new Array();
    }
    treasureHunt.electricityReductions.push(electricityReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.electricityReductionService.baselineData = undefined;
    this.electricityReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(electricityReduction: ElectricityReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: ElectricityReductionResults = this.electricityReductionService.getResults(settings, electricityReduction.baseline, electricityReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Electricity',
    }
    
    return treasureHuntOpportunityResults;
  }

  getElectricityReductionCard(reduction: ElectricityReductionTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: reduction.selected,
      opportunityType: 'electricity-reduction',
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
        modificationCost: opportunitySummary.modificationCost,
      }],
      electricityReduction: reduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/electricity-reduction-icon.png',
      teamName: reduction.opportunitySheet? reduction.opportunitySheet.owner : undefined
    };
    return cardData;
  }


}