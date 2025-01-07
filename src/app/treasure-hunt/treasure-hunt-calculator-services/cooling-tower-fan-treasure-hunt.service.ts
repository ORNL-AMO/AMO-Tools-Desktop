import { Injectable } from '@angular/core';
import { CoolingTowerFanService } from '../../calculator/process-cooling/cooling-tower-fan/cooling-tower-fan.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CoolingTowerFanInput, CoolingTowerFanOutput } from '../../shared/models/chillers';
import { Settings } from '../../shared/models/settings';
import { CoolingTowerFanTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class CoolingTowerFanTreasureHuntService {

  constructor(private coolingTowerFanService: CoolingTowerFanService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(coolingTowerFan: CoolingTowerFanTreasureHunt) {
    this.coolingTowerFanService.coolingTowerFanInput.next(coolingTowerFan.coolingTowerFanData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.coolingTowerFanOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(coolingTowerFan: CoolingTowerFanTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.coolingTowerFanOpportunities) {
      treasureHunt.coolingTowerFanOpportunities = new Array();
    }
    treasureHunt.coolingTowerFanOpportunities.push(coolingTowerFan);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.coolingTowerFanService.coolingTowerFanInput.next(undefined);
  }

  getTreasureHuntOpportunityResults(coolingTowerFan: CoolingTowerFanTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: CoolingTowerFanOutput = this.coolingTowerFanService.calculate(settings, coolingTowerFan.coolingTowerFanData);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSaving,
      energySavings: results.savingsEnergy,
      baselineCost: results.baselineEnergyCost,
      modificationCost: results.modEnergyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getCoolingTowerFanCardData(coolingTowerFan: CoolingTowerFanTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    
    let annualCostSavings: number = opportunitySummary.costSavings;
    if (coolingTowerFan.opportunitySheet){
      if (coolingTowerFan.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += coolingTowerFan.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: coolingTowerFan.selected,
      opportunityType: 'cooling-tower-fan',
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
      coolingTowerFan: coolingTowerFan,
      name: opportunitySummary.opportunityName,
      opportunitySheet: coolingTowerFan.opportunitySheet,
      iconString: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-fan.png',
      teamName: coolingTowerFan.opportunitySheet? coolingTowerFan.opportunitySheet.owner : undefined,
      iconCalcType: 'processCooling',
      needBackground: true
    }
    return cardData;
  }

  convertCoolingTowerFanOpportunities(coolingTowerFanOpportunities: Array<CoolingTowerFanTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CoolingTowerFanTreasureHunt>{
    coolingTowerFanOpportunities.forEach(chiller => {
      chiller.coolingTowerFanData = this.convertCoolingTowerFanInput(chiller.coolingTowerFanData, oldSettings, newSettings);
    });
    return coolingTowerFanOpportunities;
  }
  
  convertCoolingTowerFanInput(coolingTowerFanInput: CoolingTowerFanInput, oldSettings: Settings, newSettings: Settings): CoolingTowerFanInput{
    coolingTowerFanInput.waterEnteringTemp = this.convertUnitsService.convertTemperatureValue(coolingTowerFanInput.waterEnteringTemp, oldSettings, newSettings);
    coolingTowerFanInput.waterLeavingTemp = this.convertUnitsService.convertTemperatureValue(coolingTowerFanInput.waterLeavingTemp, oldSettings, newSettings);
    coolingTowerFanInput.operatingTempWetBulb = this.convertUnitsService.convertTemperatureValue(coolingTowerFanInput.operatingTempWetBulb, oldSettings, newSettings);
    coolingTowerFanInput.waterFlowRate = this.convertUnitsService.convertGallonPerMinuteAndM3PerSecondValue(coolingTowerFanInput.waterFlowRate, oldSettings, newSettings);
    coolingTowerFanInput.ratedFanPower = this.convertUnitsService.convertPowerValue(coolingTowerFanInput.ratedFanPower, oldSettings, newSettings);

    coolingTowerFanInput.waterEnteringTemp = this.roundVal(coolingTowerFanInput.waterEnteringTemp, 2);
    coolingTowerFanInput.waterLeavingTemp = this.roundVal(coolingTowerFanInput.waterLeavingTemp, 2);
    coolingTowerFanInput.operatingTempWetBulb = this.roundVal(coolingTowerFanInput.operatingTempWetBulb, 2);
    coolingTowerFanInput.waterFlowRate = this.roundVal(coolingTowerFanInput.waterFlowRate, 2);
    coolingTowerFanInput.ratedFanPower = this.roundVal(coolingTowerFanInput.ratedFanPower, 2);

    return coolingTowerFanInput;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
