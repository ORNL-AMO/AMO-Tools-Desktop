import { Injectable } from '@angular/core';
import { CoolingTowerBasinService } from '../../calculator/process-cooling/cooling-tower-basin/cooling-tower-basin.service';
import { WeatherBinsService } from '../../calculator/utilities/weather-bins/weather-bins.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CoolingTowerBasinInput, CoolingTowerBasinOutput } from '../../shared/models/chillers';
import { Settings } from '../../shared/models/settings';
import { CoolingTowerBasinTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class CoolingTowerBasinTreasureHuntService {

  constructor(private coolingTowerBasinService: CoolingTowerBasinService, private convertUnitsService: ConvertUnitsService, private weatherBinsService: WeatherBinsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(coolingTowerBasin: CoolingTowerBasinTreasureHunt) {
    this.coolingTowerBasinService.coolingTowerBasinInput.next(coolingTowerBasin.coolingTowerBasinData);
    this.weatherBinsService.inputData.next(coolingTowerBasin.weatherData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.coolingTowerBasinOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(coolingTowerBasin: CoolingTowerBasinTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.coolingTowerBasinOpportunities) {
      treasureHunt.coolingTowerBasinOpportunities = new Array();
    }
    treasureHunt.coolingTowerBasinOpportunities.push(coolingTowerBasin);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.coolingTowerBasinService.coolingTowerBasinInput.next(undefined);
  }

  getTreasureHuntOpportunityResults(coolingTowerBasin: CoolingTowerBasinTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: CoolingTowerBasinOutput = this.coolingTowerBasinService.calculate(settings, coolingTowerBasin.coolingTowerBasinData, coolingTowerBasin.weatherData);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.totalResults.annualCostSaving,
      energySavings: results.totalResults.savingsEnergy,
      baselineCost: results.totalResults.baselineEnergyCost,
      modificationCost: results.totalResults.modEnergyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getCoolingTowerBasinCardData(coolingTowerBasin: CoolingTowerBasinTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: coolingTowerBasin.selected,
      opportunityType: 'cooling-tower-basin',
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
      coolingTowerBasin: coolingTowerBasin,
      name: opportunitySummary.opportunityName,
      opportunitySheet: coolingTowerBasin.opportunitySheet,
      iconString: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-basin-heater.png',
      teamName: coolingTowerBasin.opportunitySheet? coolingTowerBasin.opportunitySheet.owner : undefined,
      iconCalcType: 'processCooling',
      needBackground: true
    }
    return cardData;
  }

  convertCoolingTowerBasinOpportunities(coolingTowerBasinOpportunities: Array<CoolingTowerBasinTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CoolingTowerBasinTreasureHunt>{
    coolingTowerBasinOpportunities.forEach(chiller => {
      chiller.coolingTowerBasinData = this.convertCoolingTowerBasinInput(chiller.coolingTowerBasinData, oldSettings, newSettings);
    });
    return coolingTowerBasinOpportunities;
  }
  
  convertCoolingTowerBasinInput(coolingTowerBasinInput: CoolingTowerBasinInput, oldSettings: Settings, newSettings: Settings): CoolingTowerBasinInput{
    coolingTowerBasinInput.ratedTempSetPoint = this.convertUnitsService.convertTemperatureValue(coolingTowerBasinInput.ratedTempSetPoint, oldSettings, newSettings);
    coolingTowerBasinInput.ratedTempSetPoint = this.roundVal(coolingTowerBasinInput.ratedTempSetPoint, 2);

    coolingTowerBasinInput.ratedTempDryBulb = this.convertUnitsService.convertTemperatureValue(coolingTowerBasinInput.ratedTempDryBulb, oldSettings, newSettings);
    coolingTowerBasinInput.ratedTempDryBulb = this.roundVal(coolingTowerBasinInput.ratedTempDryBulb, 2);
    
    coolingTowerBasinInput.ratedWindSpeed = this.convertUnitsService.convertMphAndKmPerHour(coolingTowerBasinInput.ratedWindSpeed, oldSettings, newSettings);
    coolingTowerBasinInput.ratedWindSpeed = this.roundVal(coolingTowerBasinInput.ratedWindSpeed, 2);

    coolingTowerBasinInput.operatingTempDryBulb = this.convertUnitsService.convertTemperatureValue(coolingTowerBasinInput.operatingTempDryBulb, oldSettings, newSettings);
    coolingTowerBasinInput.operatingTempDryBulb = this.roundVal(coolingTowerBasinInput.operatingTempDryBulb, 2);

    coolingTowerBasinInput.operatingWindSpeed = this.convertUnitsService.convertMphAndKmPerHour(coolingTowerBasinInput.operatingWindSpeed, oldSettings, newSettings);
    coolingTowerBasinInput.operatingWindSpeed = this.roundVal(coolingTowerBasinInput.operatingWindSpeed, 2);

    coolingTowerBasinInput.baselineTempSetPoint = this.convertUnitsService.convertTemperatureValue(coolingTowerBasinInput.baselineTempSetPoint, oldSettings, newSettings);
    coolingTowerBasinInput.baselineTempSetPoint = this.roundVal(coolingTowerBasinInput.baselineTempSetPoint, 2);

    coolingTowerBasinInput.modTempSetPoint = this.convertUnitsService.convertTemperatureValue(coolingTowerBasinInput.modTempSetPoint, oldSettings, newSettings);
    coolingTowerBasinInput.modTempSetPoint = this.roundVal(coolingTowerBasinInput.modTempSetPoint, 2);

    coolingTowerBasinInput.ratedCapacity = this.convertUnitsService.convertTonsAndKW(coolingTowerBasinInput.ratedCapacity, oldSettings, newSettings);
    coolingTowerBasinInput.ratedCapacity = this.roundVal(coolingTowerBasinInput.ratedCapacity, 2);
   
    return coolingTowerBasinInput;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
