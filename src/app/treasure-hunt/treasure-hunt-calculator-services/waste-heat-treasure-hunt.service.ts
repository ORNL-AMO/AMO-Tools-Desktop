import { Injectable } from '@angular/core';
import { WasteHeatService } from '../../calculator/furnaces/waste-heat/waste-heat.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { WasteHeatInput, WasteHeatOutput } from '../../shared/models/phast/wasteHeat';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, OpportunitySummary, Treasure, TreasureHunt, TreasureHuntOpportunityResults, WasteHeatTreasureHunt } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class WasteHeatTreasureHuntService {

  constructor(
    private wasteHeatService: WasteHeatService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(wasteHeat: WasteHeatTreasureHunt) {
    this.wasteHeatService.baselineData.next(wasteHeat.baseline);
    this.wasteHeatService.modificationData.next(wasteHeat.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.wasteHeatReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(wasteHeat: WasteHeatTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.wasteHeatReductions) {
      treasureHunt.wasteHeatReductions = new Array();
    }
    treasureHunt.wasteHeatReductions.push(wasteHeat);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.wasteHeatService.baselineData.next(undefined);
    this.wasteHeatService.modificationData.next(undefined);
  }


  getTreasureHuntOpportunityResults(wasteHeatTreasureHunt: WasteHeatTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(wasteHeatTreasureHunt);
    this.wasteHeatService.calculate(settings);
    let results: WasteHeatOutput = this.wasteHeatService.wasteHeatOutput.getValue();
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baseline.annualCost,
      modificationCost: results.modification.annualCost,
      utilityType: wasteHeatTreasureHunt.baseline.energySourceType,
    }

    return treasureHuntOpportunityResults;
  }

  getWasteHeatCardData(wasteHeat: WasteHeatTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number;
    let unitStr: string = 'MMBtu';
    if (settings.unitsOfMeasure != 'Imperial') {
      unitStr = 'GJ';
    }

    if (wasteHeat.baseline.energySourceType == 'Electricity') {
      currentCosts = currentEnergyUsage.electricityCosts;
    } else if (wasteHeat.baseline.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (wasteHeat.baseline.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    } else if (wasteHeat.baseline.energySourceType == 'Steam') {
      currentCosts = currentEnergyUsage.steamCosts
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: wasteHeat.selected,
      opportunityType: Treasure.wasteHeat,
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
      wasteHeat: wasteHeat,
      name: opportunitySummary.opportunityName,
      opportunitySheet: wasteHeat.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/waste-heat-icon.png',
      teamName: wasteHeat.opportunitySheet? wasteHeat.opportunitySheet.owner : undefined
    }
    return cardData;
  }

  convertWasteHeatReductions(wasteHeatReductions: Array<WasteHeatTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WasteHeatTreasureHunt> {
    wasteHeatReductions.forEach(wasteHeat => {
        wasteHeat.baseline = this.convertWasteHeatInput(wasteHeat.baseline, oldSettings, newSettings);
        if (wasteHeat.modification) {
          wasteHeat.modification = this.convertWasteHeatInput(wasteHeat.modification, oldSettings, newSettings);
        }
    });
    return wasteHeatReductions;
  }

  convertWasteHeatInput(wasteHeatInput: WasteHeatInput, oldSettings: Settings, newSettings: Settings): WasteHeatInput {
    wasteHeatInput.heatInput = this.convertUnitsService.convertMMBtuAndGJValue(wasteHeatInput.heatInput, oldSettings, newSettings);
    wasteHeatInput.chillerInTemperature = this.convertUnitsService.convertTemperatureValue(wasteHeatInput.chillerInTemperature, oldSettings, newSettings);
    wasteHeatInput.chillerOutTemperature = this.convertUnitsService.convertTemperatureValue(wasteHeatInput.chillerOutTemperature, oldSettings, newSettings);
    return wasteHeatInput;
  }

}

