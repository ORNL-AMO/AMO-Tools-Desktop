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
    this.wasteHeatService.wasteHeatInput.next(wasteHeat.inputData);
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
    this.wasteHeatService.wasteHeatInput.next(undefined)
  }


  getTreasureHuntOpportunityResults(wasteHeatTreasureHunt: WasteHeatTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(wasteHeatTreasureHunt);
    this.wasteHeatService.calculate(settings);
    let results: WasteHeatOutput = this.wasteHeatService.wasteHeatOutput.getValue();
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCost,
      energySavings: results.annualEnergy,
      baselineCost: results.annualEnergy * wasteHeatTreasureHunt.inputData.cost,
      modificationCost: 0,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getWasteHeatCardData(wasteHeat: WasteHeatTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    
    let annualCostSavings: number = opportunitySummary.costSavings;
    if (wasteHeat.opportunitySheet){
      if (wasteHeat.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += wasteHeat.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: wasteHeat.selected,
      opportunityType: Treasure.wasteHeat,
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: 'kWh',
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.electricityCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      wasteHeat: wasteHeat,
      name: opportunitySummary.opportunityName,
      opportunitySheet: wasteHeat.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/waste-heat-icon.png',
      teamName: wasteHeat.opportunitySheet? wasteHeat.opportunitySheet.owner : undefined,
      iconCalcType: 'heat',
      needBackground: true
    }
    return cardData;
  }

  convertWasteHeatReductions(wasteHeatReductions: Array<WasteHeatTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WasteHeatTreasureHunt> {
    wasteHeatReductions.forEach(wasteHeat => {
        wasteHeat.inputData = this.convertWasteHeatInput(wasteHeat.inputData, oldSettings, newSettings);
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

