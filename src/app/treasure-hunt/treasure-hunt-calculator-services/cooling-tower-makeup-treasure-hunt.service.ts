import { Injectable } from '@angular/core';
import { CoolingTowerService } from '../../calculator/process-cooling/cooling-tower/cooling-tower.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CoolingTowerData, CoolingTowerOutput } from '../../shared/models/chillers';
import { Settings } from '../../shared/models/settings';
import { CoolingTowerMakeupWaterTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class CoolingTowerMakeupTreasureHuntService {

  constructor(private coolingTowerMakeupService: CoolingTowerService,
    private convertUnitsService: ConvertUnitsService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(coolingTowerMakeupWaterTreasureHunt: CoolingTowerMakeupWaterTreasureHunt) {
    this.coolingTowerMakeupService.baselineData.next(coolingTowerMakeupWaterTreasureHunt.baseline);
    this.coolingTowerMakeupService.modificationData.next(coolingTowerMakeupWaterTreasureHunt.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.coolingTowerMakeupOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(coolingTowerMakeup: CoolingTowerMakeupWaterTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.coolingTowerMakeupOpportunities) {
      treasureHunt.coolingTowerMakeupOpportunities = new Array();
    }
    treasureHunt.coolingTowerMakeupOpportunities.push(coolingTowerMakeup);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.coolingTowerMakeupService.baselineData.next(undefined);
    this.coolingTowerMakeupService.modificationData.next(undefined);
  }


  getTreasureHuntOpportunityResults(coolingTowerMakeup: CoolingTowerMakeupWaterTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(coolingTowerMakeup);
    this.coolingTowerMakeupService.calculate(settings);
    let coolingTowerOutput: CoolingTowerOutput = this.coolingTowerMakeupService.coolingTowerOutput.getValue();
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: coolingTowerOutput.annualCostSavings,
      energySavings: coolingTowerOutput.savingsPercentage,
      baselineCost: coolingTowerOutput.baselineCost,
      modificationCost: coolingTowerOutput.modificationCost,
      utilityType: 'Water'
    }
    
    return treasureHuntOpportunityResults;
  }

  getCoolingTowerMakeupCardData(coolingTowerMakeupWaterTreasureHunt: CoolingTowerMakeupWaterTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let utilityCost: number = currentEnergyUsage.waterCosts;
    let unitStr: string = 'kGal'
    if (settings.unitsOfMeasure == 'Metric') {
      unitStr = 'm3'
    }
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: coolingTowerMakeupWaterTreasureHunt.selected,
      opportunityType: 'cooling-tower-makeup',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: unitStr,
        label: 'Water'
      }],
      utilityType: ['Water'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / utilityCost) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      coolingTowerMakeup: coolingTowerMakeupWaterTreasureHunt,
      name: opportunitySummary.opportunityName,
      opportunitySheet: coolingTowerMakeupWaterTreasureHunt.opportunitySheet,
      iconString: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-makeup-water.png',
      teamName: coolingTowerMakeupWaterTreasureHunt.opportunitySheet? coolingTowerMakeupWaterTreasureHunt.opportunitySheet.owner : undefined,
      iconCalcType: 'processCooling',
      needBackground: true
    };
    return cardData;
  }

  convertCoolingTowerMakeups(coolingTowerMakeups: Array<CoolingTowerMakeupWaterTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CoolingTowerMakeupWaterTreasureHunt> {
    coolingTowerMakeups.forEach(coolingTowerMakeup => {
      coolingTowerMakeup.baseline.forEach(coolingTowerData => {
        coolingTowerData = this.convertCoolingTowerMakeup(coolingTowerData, oldSettings, newSettings);
      });
      if (coolingTowerMakeup.modification && coolingTowerMakeup.modification.length > 0) { 
        coolingTowerMakeup.modification.forEach(coolingTowerData => {
          coolingTowerData = this.convertCoolingTowerMakeup(coolingTowerData, oldSettings, newSettings);
        });
      }
    })
    return coolingTowerMakeups;
  }

  convertCoolingTowerMakeup(coolingTowerData: CoolingTowerData, oldSettings: Settings, newSettings: Settings): CoolingTowerData {

    if (newSettings.unitsOfMeasure === 'Metric') {
      coolingTowerData.flowRate = this.convertUnitsService.value(coolingTowerData.flowRate).from('gpm').to('m3/s');
      coolingTowerData.coolingLoad = this.convertUnitsService.value(coolingTowerData.coolingLoad).from('MMBtu').to('GJ');
      
    } else if (newSettings.unitsOfMeasure === 'Imperial') {
      coolingTowerData.flowRate = this.convertUnitsService.value(coolingTowerData.flowRate).from('m3/s').to('gpm');
      coolingTowerData.coolingLoad = this.convertUnitsService.value(coolingTowerData.coolingLoad).from('GJ').to('MMBtu');
    }
    coolingTowerData.flowRate = this.convertUnitsService.roundVal(coolingTowerData.flowRate, 2);
    coolingTowerData.coolingLoad = this.convertUnitsService.roundVal(coolingTowerData.coolingLoad, 2);

    return coolingTowerData;
  }

}