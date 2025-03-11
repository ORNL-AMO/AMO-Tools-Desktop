import { Injectable } from '@angular/core';
import { FlueGasService } from '../../calculator/furnaces/flue-gas/flue-gas.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FlueGasByMass, FlueGasByVolume, FlueGasOutput } from '../../shared/models/phast/losses/flueGas';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, FlueGasTreasureHunt, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class FlueGasTreasureHuntService {
  constructor(
    private flueGasService: FlueGasService, private convertUnitsService: ConvertUnitsService) { }


  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(flueGas: FlueGasTreasureHunt) {
    this.flueGasService.baselineData.next(flueGas.baseline);
    this.flueGasService.baselineEnergyData.next(flueGas.baselineEnergyData);
    this.flueGasService.modificationData.next(flueGas.modification);
    this.flueGasService.modificationEnergyData.next(flueGas.modificationEnergyData);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.flueGasLosses.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(flueGas: FlueGasTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.flueGasLosses) {
      treasureHunt.flueGasLosses = new Array();
    }
    treasureHunt.flueGasLosses.push(flueGas);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.flueGasService.baselineData.next(undefined);
    this.flueGasService.modificationData.next(undefined);
  }


  getTreasureHuntOpportunityResults(flueGasTreasureHunt: FlueGasTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(flueGasTreasureHunt);
    this.flueGasService.calculate(settings);
    let results: FlueGasOutput = this.flueGasService.output.getValue();
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.costSavings,
      energySavings: results.fuelSavings,
      baselineCost: results.baseline.fuelCost,
      modificationCost: results.modification.fuelCost,
      utilityType: flueGasTreasureHunt.baseline.flueGasType == 'By Volume'? flueGasTreasureHunt.baselineEnergyData.utilityType : 'Other Fuel',
    }
    
    return treasureHuntOpportunityResults;
  }

  getFlueGasCardData(flueGas: FlueGasTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number;
    let unitStr: string = 'MMBtu';
    if (settings.unitsOfMeasure != 'Imperial') {
      unitStr = 'GJ';
    }

    if (flueGas.baseline.flueGasType == 'By Volume' && flueGas.baselineEnergyData.utilityType === 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts;
    } else {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    }

    let annualCostSavings: number = opportunitySummary.costSavings;
    if (flueGas.opportunitySheet){
      if (flueGas.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += flueGas.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: flueGas.selected,
      opportunityType: 'flue-gas',
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
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
      flueGas: flueGas,
      name: opportunitySummary.opportunityName,
      opportunitySheet: flueGas.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/fluegas.png',
      teamName: flueGas.opportunitySheet? flueGas.opportunitySheet.owner : undefined,
      iconCalcType: 'heat',
      needBackground: true
    }
    return cardData;
  }

  convertFlueGasLosses(flueGasLosses: Array<FlueGasTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<FlueGasTreasureHunt> {
    flueGasLosses.forEach(flueGas => {
      if (flueGas.baseline.flueGasType == 'By Volume') {
        flueGas.baseline.flueGasByVolume = this.convertFlueGasInput(flueGas.baseline.flueGasByVolume, oldSettings, newSettings);
        if (flueGas.modification) {
          flueGas.modification.flueGasByVolume = this.convertFlueGasInput(flueGas.modification.flueGasByVolume, oldSettings, newSettings);
        }
      } 
      if (flueGas.baseline.flueGasType == 'By Mass') {
        flueGas.baseline.flueGasByMass = this.convertFlueGasInput(flueGas.baseline.flueGasByMass, oldSettings, newSettings);
        if (flueGas.modification) {
          flueGas.modification.flueGasByMass = this.convertFlueGasInput(flueGas.modification.flueGasByMass, oldSettings, newSettings);
        }
      }
    });
    return flueGasLosses;
  }

  convertFlueGasInput(flueGasInput: FlueGasByMass | FlueGasByVolume, oldSettings: Settings, newSettings: Settings): FlueGasByMass | FlueGasByVolume {
    flueGasInput.combustionAirTemperature = this.convertUnitsService.convertTemperatureValue(flueGasInput.combustionAirTemperature, oldSettings, newSettings);
    flueGasInput.flueGasTemperature = this.convertUnitsService.convertTemperatureValue(flueGasInput.flueGasTemperature, oldSettings, newSettings);
    flueGasInput.fuelTemperature = this.convertUnitsService.convertTemperatureValue(flueGasInput.fuelTemperature, oldSettings, newSettings);

    if ('ashDischargeTemperature' in flueGasInput) {
      flueGasInput.ashDischargeTemperature = this.convertUnitsService.convertTemperatureValue(flueGasInput.ashDischargeTemperature, oldSettings, newSettings);
    }
    flueGasInput.heatInput = this.convertUnitsService.convertMMBtuAndGJValue(flueGasInput.heatInput, oldSettings, newSettings);

    return flueGasInput;
  }

}

