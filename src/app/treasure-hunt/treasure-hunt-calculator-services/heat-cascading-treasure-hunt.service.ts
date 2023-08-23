import { Injectable } from '@angular/core';
import { HeatCascadingService } from '../../calculator/furnaces/heat-cascading/heat-cascading.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { HeatCascadingInput, HeatCascadingOutput } from '../../shared/models/phast/heatCascading';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, HeatCascadingTreasureHunt, OpportunitySummary, Treasure, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class HeatCascadingTreasureHuntService {

  constructor(
    private heatCascadingService: HeatCascadingService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(heatCascadingOpportunity: HeatCascadingTreasureHunt) {
    this.heatCascadingService.heatCascadingInput.next(heatCascadingOpportunity.inputData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.heatCascadingOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(heatCascadingOpportunity: HeatCascadingTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.heatCascadingOpportunities) {
      treasureHunt.heatCascadingOpportunities = new Array();
    }
    treasureHunt.heatCascadingOpportunities.push(heatCascadingOpportunity);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.heatCascadingService.heatCascadingInput.next(undefined);
  }


  getTreasureHuntOpportunityResults(heatCascadingTreasureHunt: HeatCascadingTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(heatCascadingTreasureHunt);
    this.heatCascadingService.calculate(settings);
    let output: HeatCascadingOutput = this.heatCascadingService.heatCascadingOutput.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavings,
      energySavings: output.energySavings,
      baselineCost: heatCascadingTreasureHunt.inputData.fuelCost,
      modificationCost: 0,
      utilityType: heatCascadingTreasureHunt.inputData.utilityType,
    }

    return treasureHuntOpportunityResults;
  }

  getHeatCascadingOpportunityCardData(heatCascadingOpportunity: HeatCascadingTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number = 0;
    if (heatCascadingOpportunity.energySourceData.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (heatCascadingOpportunity.energySourceData.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    }
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: heatCascadingOpportunity.selected,
      opportunityType: Treasure.heatCascading,
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: heatCascadingOpportunity.energySourceData.unit,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      heatCascading: heatCascadingOpportunity,
      name: opportunitySummary.opportunityName,
      opportunitySheet: heatCascadingOpportunity.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/heat-cascading.png',
      teamName: heatCascadingOpportunity.opportunitySheet? heatCascadingOpportunity.opportunitySheet.owner : undefined,
      iconCalcType: 'heat',
      needBackground: true
    }
    return cardData;
}

  convertHeatCascadingOpportunities(heatCascadingOpportunities: Array<HeatCascadingTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<HeatCascadingTreasureHunt> {
    heatCascadingOpportunities.forEach(heatCascadingOpportunity => {
      this.convertHeatCascadingOpportunity(heatCascadingOpportunity.inputData, oldSettings, newSettings);
    });
    return heatCascadingOpportunities;
  }

  convertHeatCascadingOpportunity(heatCascadingOpportunity: HeatCascadingInput, oldSettings: Settings, newSettings: Settings): HeatCascadingInput {
    if (oldSettings.unitsOfMeasure == 'Metric'){
      heatCascadingOpportunity.fuelHV = this.convertUnitsService.value(heatCascadingOpportunity.fuelHV).from('MJNm3').to('btuscf');
    } else if (oldSettings.unitsOfMeasure == 'Imperial') {
      heatCascadingOpportunity.fuelHV = this.convertUnitsService.value(heatCascadingOpportunity.fuelHV).from('btuscf').to('MJNm3');
    }
    heatCascadingOpportunity.priExhaustTemperature = this.convertUnitsService.convertTemperatureValue(heatCascadingOpportunity.priExhaustTemperature, oldSettings, newSettings);
    heatCascadingOpportunity.priCombAirTemperature = this.convertUnitsService.convertTemperatureValue(heatCascadingOpportunity.priCombAirTemperature, oldSettings, newSettings);
    heatCascadingOpportunity.secExhaustTemperature = this.convertUnitsService.convertTemperatureValue(heatCascadingOpportunity.secExhaustTemperature, oldSettings, newSettings);
    heatCascadingOpportunity.secCombAirTemperature = this.convertUnitsService.convertTemperatureValue(heatCascadingOpportunity.secCombAirTemperature, oldSettings, newSettings);

    heatCascadingOpportunity.priFiringRate = this.convertUnitsService.convertMMBtuAndGJValue(heatCascadingOpportunity.priFiringRate, oldSettings, newSettings);
    heatCascadingOpportunity.secFiringRate = this.convertUnitsService.convertMMBtuAndGJValue(heatCascadingOpportunity.secFiringRate, oldSettings, newSettings);
    
    return heatCascadingOpportunity;
  }
}
