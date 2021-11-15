import { Injectable } from '@angular/core';
import { AirHeatingService } from '../../calculator/furnaces/air-heating/air-heating.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { AirHeatingInput, AirHeatingOutput } from '../../shared/models/phast/airHeating';
import { Settings } from '../../shared/models/settings';
import { AirHeatingTreasureHunt, EnergyUsage, OpportunitySummary, Treasure, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class AirHeatingTreasureHuntService {

  constructor(
    private airHeatingService: AirHeatingService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(airHeatingOpportunity: AirHeatingTreasureHunt) {
    this.airHeatingService.airHeatingInput.next(airHeatingOpportunity.inputData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.airHeatingOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(airHeatingOpportunity: AirHeatingTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.airHeatingOpportunities) {
      treasureHunt.airHeatingOpportunities = new Array();
    }
    treasureHunt.airHeatingOpportunities.push(airHeatingOpportunity);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.airHeatingService.airHeatingInput.next(undefined);
  }


  getTreasureHuntOpportunityResults(airHeatingTreasureHunt: AirHeatingTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(airHeatingTreasureHunt);
    this.airHeatingService.calculate(settings);
    let output: AirHeatingOutput = this.airHeatingService.airHeatingOutput.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavings,
      energySavings: output.energySavings,
      baselineCost: output.energySavings * airHeatingTreasureHunt.inputData.fuelCost,
      modificationCost: 0,
      utilityType: airHeatingTreasureHunt.inputData.gasFuelType? airHeatingTreasureHunt.inputData.utilityType : 'Other Fuel',
    }

    return treasureHuntOpportunityResults;
  }

  getAirHeatingOpportunityCardData(airHeatingOpportunity: AirHeatingTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number = 0;
    if (airHeatingOpportunity.energySourceData.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (airHeatingOpportunity.energySourceData.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    }
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: airHeatingOpportunity.selected,
      opportunityType: Treasure.airHeating,
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: airHeatingOpportunity.energySourceData.unit,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      airHeating: airHeatingOpportunity,
      name: opportunitySummary.opportunityName,
      opportunitySheet: airHeatingOpportunity.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/air-heating-icon.png',
      teamName: airHeatingOpportunity.opportunitySheet? airHeatingOpportunity.opportunitySheet.owner : undefined,
      iconCalcType: 'heat',
      needBackground: true
    }
    return cardData;
}

  convertAirHeatingOpportunities(airHeatingOpportunities: Array<AirHeatingTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<AirHeatingTreasureHunt> {
    airHeatingOpportunities.forEach(airHeatingOpportunity => {
      this.convertAirHeatingOpportunity(airHeatingOpportunity.inputData, oldSettings, newSettings);
    });
    return airHeatingOpportunities;
  }

  convertAirHeatingOpportunity(airHeatingOpportunity: AirHeatingInput, oldSettings: Settings, newSettings: Settings): AirHeatingInput {
    if (oldSettings.unitsOfMeasure == 'Metric'){
      airHeatingOpportunity.airflow = this.convertUnitsService.value(airHeatingOpportunity.airflow).from('m3').to('ft3');
    } else if (oldSettings.unitsOfMeasure == 'Imperial') {
      airHeatingOpportunity.airflow = this.convertUnitsService.value(airHeatingOpportunity.airflow).from('ft3').to('m3');

    }
    airHeatingOpportunity.flueTemperature = this.convertUnitsService.convertTemperatureValue(airHeatingOpportunity.flueTemperature, oldSettings, newSettings);
    airHeatingOpportunity.inletTemperature = this.convertUnitsService.convertTemperatureValue(airHeatingOpportunity.inletTemperature, oldSettings, newSettings);
    airHeatingOpportunity.fireRate = this.convertUnitsService.convertMMBtuAndGJValue(airHeatingOpportunity.fireRate, oldSettings, newSettings);
    
    return airHeatingOpportunity;
  }
  
}