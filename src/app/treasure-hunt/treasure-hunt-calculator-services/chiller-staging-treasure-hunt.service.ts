import { Injectable } from '@angular/core';
import { ChillerStagingService } from '../../calculator/process-cooling/chiller-staging/chiller-staging.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ChillerStagingInput, ChillerStagingOutput } from '../../shared/models/chillers';
import { Settings } from '../../shared/models/settings';
import { ChillerStagingTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class ChillerStagingTreasureHuntService {

  constructor( private chillerStagingService: ChillerStagingService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(chillerStaging: ChillerStagingTreasureHunt) {
    this.chillerStagingService.chillerStagingInput.next(chillerStaging.chillerStagingData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.chillerStagingOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(chillerStaging: ChillerStagingTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.chillerStagingOpportunities) {
      treasureHunt.chillerStagingOpportunities = new Array();
    }
    treasureHunt.chillerStagingOpportunities.push(chillerStaging);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.chillerStagingService.chillerStagingInput.next(undefined);
  }

  getTreasureHuntOpportunityResults(chillerStaging: ChillerStagingTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: ChillerStagingOutput = this.chillerStagingService.calculate(settings, chillerStaging.chillerStagingData);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.costSavings,
      energySavings: results.savingsEnergy,
      baselineCost: results.baselineCost,
      modificationCost: results.modificationCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getChillerStagingCardData(chillerStaging: ChillerStagingTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    
    let annualCostSavings: number = opportunitySummary.costSavings;
    if (chillerStaging.opportunitySheet){
      if (chillerStaging.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += chillerStaging.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: chillerStaging.selected,
      opportunityType: 'chiller-staging',
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
      chillerStaging: chillerStaging,
      name: opportunitySummary.opportunityName,
      opportunitySheet: chillerStaging.opportunitySheet,
      iconString: 'assets/images/calculator-icons/process-cooling-icons/chiller-staging.png',
      teamName: chillerStaging.opportunitySheet? chillerStaging.opportunitySheet.owner : undefined,
      iconCalcType: 'processCooling',
      needBackground: true
    }
    return cardData;
  }

  convertChillerStagingOpportunities(chillerStagingOpportunities: Array<ChillerStagingTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ChillerStagingTreasureHunt>{
    chillerStagingOpportunities.forEach(chiller => {
      chiller.chillerStagingData = this.convertChillerStagingInput(chiller.chillerStagingData, oldSettings, newSettings);
    });
    return chillerStagingOpportunities;
  }
  
  convertChillerStagingInput(chillerStagingInput: ChillerStagingInput, oldSettings: Settings, newSettings: Settings): ChillerStagingInput{
    chillerStagingInput.waterSupplyTemp = this.convertUnitsService.convertTemperatureValue(chillerStagingInput.waterSupplyTemp, oldSettings, newSettings);
    chillerStagingInput.waterEnteringTemp = this.convertUnitsService.convertTemperatureValue(chillerStagingInput.waterEnteringTemp, oldSettings, newSettings);
    chillerStagingInput.waterSupplyTemp = this.roundVal(chillerStagingInput.waterSupplyTemp, 2);
    chillerStagingInput.waterEnteringTemp = this.roundVal(chillerStagingInput.waterEnteringTemp, 2);
    return chillerStagingInput;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
