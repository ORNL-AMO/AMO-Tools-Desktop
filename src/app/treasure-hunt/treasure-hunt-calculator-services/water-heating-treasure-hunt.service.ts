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

  getWaterOpportunityResults(waterHeatingTreasureHunt: WaterHeatingTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(waterHeatingTreasureHunt);
    this.waterHeatingService.calculate(settings);
    let output: WaterHeatingOutput = this.waterHeatingService.waterHeatingOutput.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavingsWNT,
      energySavings: output.waterSaved,
      baselineCost: output.costSavingsWNT,
      modificationCost: 0,
      utilityType: 'Water',
    }

    return treasureHuntOpportunityResults;
  }

  getGasOpportunityResults(waterHeatingTreasureHunt: WaterHeatingTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(waterHeatingTreasureHunt);
    this.waterHeatingService.calculate(settings);
    let output: WaterHeatingOutput = this.waterHeatingService.waterHeatingOutput.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: (output.costSavingsBoiler + output.costSavingsDWH),
      energySavings: output.energySavedTotal,
      baselineCost: (output.costSavingsBoiler + output.costSavingsDWH),
      modificationCost: 0,
      utilityType: waterHeatingTreasureHunt.inputData.boilerUtilityType,
    }

    return treasureHuntOpportunityResults;
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
      utilityType: 'Mixed',
    }

    return treasureHuntOpportunityResults;
  }

  getWaterHeatingOpportunityCardData(waterHeatingOpportunity: WaterHeatingTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let energyData = this.getEnergyData(waterHeatingOpportunity, settings, currentEnergyUsage, opportunitySummary,);
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: waterHeatingOpportunity.selected,
      opportunityType: Treasure.waterHeating,
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: energyData.annualEnergySavings,
      percentSavings: energyData.percentSavings,
      utilityType: energyData.utilityTypes,
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

getEnergyData(waterHeatingOpportunity: WaterHeatingTreasureHunt, settings: Settings, currentEnergyUsage: EnergyUsage, opportunitySummary: OpportunitySummary): {
  annualEnergySavings: Array<{
    savings: number,
    label: string,
    energyUnit: string
  }>,
  percentSavings: Array<{ percent: number, label: string, baselineCost: number, modificationCost: number }>,
  utilityTypes: Array<string>
}{
  let annualEnergySavings: Array<{ savings: number, label: string, energyUnit: string }> = new Array();
  let percentSavings: Array<{ percent: number, label: string, baselineCost: number, modificationCost: number }> = new Array();
  let utilityTypes: Array<string> = new Array();
  let output: WaterHeatingOutput = this.waterHeatingService.waterHeatingOutput.getValue();

  if (waterHeatingOpportunity.energySourceData.energySourceType == 'Natural Gas') {
    let unit: string = 'MMBTu/yr';
    if (settings.unitsOfMeasure == 'Metric') {
      unit = 'MJ/yr';
    }
    annualEnergySavings.push({
      savings: output.energySavedTotal,
      label: 'Natural Gas',
      energyUnit: unit
    });
    percentSavings.push(
      {
        percent: ((output.costSavingsBoiler + output.costSavingsDWH) / currentEnergyUsage.naturalGasCosts) * 100,
        label: 'Natural Gas',
        baselineCost: (output.costSavingsBoiler + output.costSavingsDWH),
        modificationCost: opportunitySummary.modificationCost
      }
    )
    utilityTypes.push('Natural Gas');
  };
  if (waterHeatingOpportunity.energySourceData.energySourceType == 'Other Fuel') {
    let unit: string = 'MMBTu/yr';
    if (settings.unitsOfMeasure == 'Metric') {
      unit = 'MJ/yr';
    }
    annualEnergySavings.push({
      savings: output.energySavedTotal,
      label: 'Other Fuel',
      energyUnit: unit
    });
    percentSavings.push(
      {
        percent: ((output.costSavingsBoiler + output.costSavingsDWH) / currentEnergyUsage.otherFuelCosts) * 100,
        label: 'Other Fuel',
        baselineCost: (output.costSavingsBoiler + output.costSavingsDWH),
        modificationCost: opportunitySummary.modificationCost
      }
    )
    utilityTypes.push('Natural Gas');
  };
  let unit: string = 'L/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'gal/yr';
      }
      annualEnergySavings.push({
        savings: (output.costSavingsWNT / currentEnergyUsage.waterCosts) * 100,
        label: 'Water',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: (output.costSavingsWNT / currentEnergyUsage.waterCosts) * 100,
          label: 'Water',
          baselineCost: output.costSavingsWNT,
          modificationCost: opportunitySummary.modificationCost
        }
      )
      utilityTypes.push('Water');

  return { annualEnergySavings: annualEnergySavings, percentSavings: percentSavings, utilityTypes: utilityTypes }

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
