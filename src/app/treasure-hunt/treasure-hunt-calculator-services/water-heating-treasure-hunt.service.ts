import { Injectable } from '@angular/core';
import { WaterHeatingService } from '../../calculator/steam/water-heating/water-heating.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { HeatCascadingInput } from '../../shared/models/phast/heatCascading';
import { Settings } from '../../shared/models/settings';
import { WaterHeatingInput, WaterHeatingOutput } from '../../shared/models/steam/waterHeating';
import { EnergyUsage, OpportunitySummary, Treasure, TreasureHunt, TreasureHuntOpportunityResults, WaterHeatingTreasureHunt } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class WaterHeatingTreasureHuntService {


  constructor(
    private waterHeatingService: WaterHeatingService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(waterHeatingOpportunity: WaterHeatingTreasureHunt) {
    this.waterHeatingService.waterHeatingInput.next(waterHeatingOpportunity.inputData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.waterHeatingOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(waterHeatingOpportunity: WaterHeatingTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.waterHeatingOpportunities) {
      treasureHunt.waterHeatingOpportunities = new Array();
    }
    treasureHunt.waterHeatingOpportunities.push(waterHeatingOpportunity);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.waterHeatingService.waterHeatingInput.next(undefined);
  }


  getTreasureHuntOpportunityResults(waterHeatingTreasureHunt: WaterHeatingTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(waterHeatingTreasureHunt);
    this.waterHeatingService.calculate(settings);
    let output: WaterHeatingOutput = this.waterHeatingService.waterHeatingOutput.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavingsTotal,
      energySavings: output.energySavedTotal,
      baselineCost: output.costSavingsTotal,
      modificationCost: 0,
      utilityType: waterHeatingTreasureHunt.inputData.boilerUtilityType,
    }

    return treasureHuntOpportunityResults;
  }

  getWaterHeatingOpportunityCardData(waterHeatingOpportunity: WaterHeatingTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number = 0;
    if (waterHeatingOpportunity.energySourceData.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (waterHeatingOpportunity.energySourceData.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    }
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: waterHeatingOpportunity.selected,
      opportunityType: Treasure.waterHeating,
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: waterHeatingOpportunity.energySourceData.unit,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      waterHeating: waterHeatingOpportunity,
      name: opportunitySummary.opportunityName,
      opportunitySheet: waterHeatingOpportunity.opportunitySheet,
      iconString: 'assets/images/calculator-icons/steam-icons/water-heating-icon.png',
      teamName: waterHeatingOpportunity.opportunitySheet? waterHeatingOpportunity.opportunitySheet.owner : undefined,
      iconCalcType: 'steam',
      needBackground: true
    }
    return cardData;
}

  convertWaterHeatingOpportunities(waterHeatingOpportunities: Array<WaterHeatingTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WaterHeatingTreasureHunt> {
    waterHeatingOpportunities.forEach(waterHeatingOpportunity => {
      this.convertWaterHeatingOpportunity(waterHeatingOpportunity.inputData, oldSettings, newSettings);
    });
    return waterHeatingOpportunities;
  }

  convertWaterHeatingOpportunity(waterHeatingOpportunity: WaterHeatingInput, oldSettings: Settings, newSettings: Settings): WaterHeatingInput {
    if (oldSettings.unitsOfMeasure == 'Metric'){
      waterHeatingOpportunity.pressureSteamIn = this.convertUnitsService.value(waterHeatingOpportunity.pressureSteamIn).from('Pa').to('psig');
      waterHeatingOpportunity.flowSteamRate = this.convertUnitsService.value(waterHeatingOpportunity.flowSteamRate).from('kg').to('lb');
      waterHeatingOpportunity.temperatureWaterIn = this.convertUnitsService.value(waterHeatingOpportunity.temperatureWaterIn).from('C').to('F');
      waterHeatingOpportunity.pressureWaterOut = this.convertUnitsService.value(waterHeatingOpportunity.pressureWaterOut).from('Pa').to('psig');
      waterHeatingOpportunity.flowWaterRate = this.convertUnitsService.value(waterHeatingOpportunity.flowWaterRate).from('m3/s').to('gpm');
      waterHeatingOpportunity.tempMakeupWater = this.convertUnitsService.value(waterHeatingOpportunity.tempMakeupWater).from('C').to('F');
      waterHeatingOpportunity.presMakeupWater = this.convertUnitsService.value(waterHeatingOpportunity.presMakeupWater).from('Pa').to('psig');
    } else if (oldSettings.unitsOfMeasure == 'Imperial') {
      waterHeatingOpportunity.pressureSteamIn = this.convertUnitsService.value(waterHeatingOpportunity.pressureSteamIn).from('psig').to('Pa');
      waterHeatingOpportunity.flowSteamRate = this.convertUnitsService.value(waterHeatingOpportunity.flowSteamRate).from('lb').to('kg');
      waterHeatingOpportunity.temperatureWaterIn = this.convertUnitsService.value(waterHeatingOpportunity.temperatureWaterIn).from('F').to('C');
      waterHeatingOpportunity.pressureWaterOut = this.convertUnitsService.value(waterHeatingOpportunity.pressureWaterOut).from('psig').to('Pa');
      waterHeatingOpportunity.flowWaterRate = this.convertUnitsService.value(waterHeatingOpportunity.flowWaterRate).from('gpm').to('m3/s');
      waterHeatingOpportunity.tempMakeupWater = this.convertUnitsService.value(waterHeatingOpportunity.tempMakeupWater).from('F').to('C');
      waterHeatingOpportunity.presMakeupWater = this.convertUnitsService.value(waterHeatingOpportunity.presMakeupWater).from('psig').to('Pa');
    }
    return waterHeatingOpportunity;
  }
}
