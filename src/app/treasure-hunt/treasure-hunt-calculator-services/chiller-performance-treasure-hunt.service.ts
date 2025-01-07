import { Injectable } from '@angular/core';
import { ChillerPerformanceService } from '../../calculator/process-cooling/chiller-performance/chiller-performance.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ChillerPerformanceInput, ChillerPerformanceOutput } from '../../shared/models/chillers';
import { Settings } from '../../shared/models/settings';
import { ChillerPerformanceTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class ChillerPerformanceTreasureHuntService {

  constructor( private chillerPerformanceService: ChillerPerformanceService, private convertUnitsService: ConvertUnitsService ) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(chillerPerformance: ChillerPerformanceTreasureHunt) {
    this.chillerPerformanceService.chillerPerformanceInput.next(chillerPerformance.chillerPerformanceData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.chillerPerformanceOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(chillerPerformance: ChillerPerformanceTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.chillerPerformanceOpportunities) {
      treasureHunt.chillerPerformanceOpportunities = new Array();
    }
    treasureHunt.chillerPerformanceOpportunities.push(chillerPerformance);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.chillerPerformanceService.chillerPerformanceInput.next(undefined);
  }

  getTreasureHuntOpportunityResults(chillerPerformance: ChillerPerformanceTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: ChillerPerformanceOutput = this.chillerPerformanceService.calculate(settings, chillerPerformance.chillerPerformanceData);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSaving,
      energySavings: results.savingsEnergy,
      baselineCost: results.baselineEnergyCost,
      modificationCost: results.modEnergyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getChillerPerformanceCardData(chillerPerformance: ChillerPerformanceTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    
    let annualCostSavings: number = opportunitySummary.costSavings;
    if (chillerPerformance.opportunitySheet){
      if (chillerPerformance.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += chillerPerformance.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: chillerPerformance.selected,
      opportunityType: 'chiller-performance',
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
      chillerPerformance: chillerPerformance,
      name: opportunitySummary.opportunityName,
      opportunitySheet: chillerPerformance.opportunitySheet,
      iconString: 'assets/images/calculator-icons/process-cooling-icons/chiller-performance.png',
      teamName: chillerPerformance.opportunitySheet? chillerPerformance.opportunitySheet.owner : undefined,
      iconCalcType: 'processCooling',
      needBackground: true
    }
    return cardData;
  }

  convertChillerPerformanceOpportunities(chillerPerformanceOpportunities: Array<ChillerPerformanceTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ChillerPerformanceTreasureHunt>{
    chillerPerformanceOpportunities.forEach(chiller => {
      chiller.chillerPerformanceData = this.convertChillerPerformanceInput(chiller.chillerPerformanceData, oldSettings, newSettings);
    });
    return chillerPerformanceOpportunities;
  }
  
  convertChillerPerformanceInput(chillerPerformanceInput: ChillerPerformanceInput, oldSettings: Settings, newSettings: Settings): ChillerPerformanceInput{
    if (oldSettings.unitsOfMeasure == "Metric") {
      chillerPerformanceInput.baselineWaterSupplyTemp = this.convertUnitsService.value(chillerPerformanceInput.baselineWaterSupplyTemp).from('C').to('F');
      chillerPerformanceInput.baselineWaterEnteringTemp = this.convertUnitsService.value(chillerPerformanceInput.baselineWaterEnteringTemp).from('C').to('F');
      chillerPerformanceInput.modWaterSupplyTemp = this.convertUnitsService.value(chillerPerformanceInput.modWaterSupplyTemp).from('C').to('F');
      chillerPerformanceInput.modWaterEnteringTemp = this.convertUnitsService.value(chillerPerformanceInput.modWaterEnteringTemp).from('C').to('F');
      
      chillerPerformanceInput.waterDeltaT = this.convertUnitsService.value(chillerPerformanceInput.waterDeltaT).from('K').to('R');
      chillerPerformanceInput.waterFlowRate = this.convertUnitsService.value(chillerPerformanceInput.waterFlowRate).from('m3/s').to('gpm');
      chillerPerformanceInput.ariCapacity = this.convertUnitsService.value(chillerPerformanceInput.ariCapacity).from('kW').to('hp');

    } else if (oldSettings.unitsOfMeasure == "Imperial") {
      chillerPerformanceInput.baselineWaterSupplyTemp = this.convertUnitsService.value(chillerPerformanceInput.baselineWaterSupplyTemp).from('F').to('C');
      chillerPerformanceInput.baselineWaterEnteringTemp = this.convertUnitsService.value(chillerPerformanceInput.baselineWaterEnteringTemp).from('F').to('C');
      chillerPerformanceInput.modWaterSupplyTemp = this.convertUnitsService.value(chillerPerformanceInput.modWaterSupplyTemp).from('F').to('C');
      chillerPerformanceInput.modWaterEnteringTemp = this.convertUnitsService.value(chillerPerformanceInput.modWaterEnteringTemp).from('F').to('C');
      
      chillerPerformanceInput.waterDeltaT = this.convertUnitsService.value(chillerPerformanceInput.waterDeltaT).from('R').to('K');
      chillerPerformanceInput.waterFlowRate = this.convertUnitsService.value(chillerPerformanceInput.waterFlowRate).from('gpm').to('m3/s');
      chillerPerformanceInput.ariCapacity = this.convertUnitsService.value(chillerPerformanceInput.ariCapacity).from('hp').to('kW');
    }
    chillerPerformanceInput.waterDeltaT = this.roundVal(chillerPerformanceInput.waterDeltaT, 2);
    return chillerPerformanceInput;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
