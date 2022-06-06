import { Injectable } from '@angular/core';
import { PipeInsulationReductionService } from '../../calculator/steam/pipe-insulation-reduction/pipe-insulation-reduction.service';
import { Settings } from '../../shared/models/settings';
import { PipeInsulationReductionResults } from '../../shared/models/standalone';
import { EnergyUsage, OpportunitySummary, PipeInsulationReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class PipeInsulationTreasureHuntService {

  constructor(private pipeInsulationReductionService: PipeInsulationReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(pipeInsulationReduction: PipeInsulationReductionTreasureHunt) {
    this.pipeInsulationReductionService.baselineData = pipeInsulationReduction.baseline;
    this.pipeInsulationReductionService.modificationData = pipeInsulationReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.pipeInsulationReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(pipeInsulationReduction: PipeInsulationReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.pipeInsulationReductions) {
      treasureHunt.pipeInsulationReductions = new Array();
    }
    treasureHunt.pipeInsulationReductions.push(pipeInsulationReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.pipeInsulationReductionService.baselineData = undefined;
    this.pipeInsulationReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(pipeInsulationReduction: PipeInsulationReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: PipeInsulationReductionResults = this.pipeInsulationReductionService.getResults(settings, pipeInsulationReduction.baseline, pipeInsulationReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualHeatSavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: '',
    }

    if (pipeInsulationReduction.baseline.utilityType == 0) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
    } else if (pipeInsulationReduction.baseline.utilityType == 1) {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
    } else if (pipeInsulationReduction.baseline.utilityType == 2) {
      treasureHuntOpportunityResults.utilityType = 'Electricity';
    } else if (pipeInsulationReduction.baseline.utilityType == 3) {
      treasureHuntOpportunityResults.utilityType = 'Steam';
    }

    return treasureHuntOpportunityResults;
  }

  getPipeInsulationReductionCardData(reduction: PipeInsulationReductionTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let unitStr: string;
    let currentCosts: number;
    if (reduction.baseline.utilityType == 0) {
      currentCosts = currentEnergyUsage.naturalGasCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    } else if (reduction.baseline.utilityType == 1) {
      currentCosts = currentEnergyUsage.otherFuelCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    } else if (reduction.baseline.utilityType == 2) {
      currentCosts = currentEnergyUsage.electricityCosts;
      unitStr = 'kWh';
    } else if (reduction.baseline.utilityType == 3) {
      currentCosts = currentEnergyUsage.steamCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: reduction.selected,
      opportunityType: 'pipe-insulation-reduction',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: unitStr,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      pipeInsulationReduction: reduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/pipe-ins.png',
      teamName: reduction.opportunitySheet? reduction.opportunitySheet.owner : undefined,
      iconCalcType: 'steam',
      needBackground: true
    }
    return cardData;
  }

}