import { Injectable } from '@angular/core';
import { FlueGasService } from '../../calculator/furnaces/flue-gas/flue-gas.service';
import { FlueGasOutput } from '../../shared/models/phast/losses/flueGas';
import { Settings } from '../../shared/models/settings';
import { FlueGasTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class FlueGasTreasureHuntService {
  constructor(
    private flueGasService: FlueGasService) { }


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
      utilityType: '',
    }

    if (flueGasTreasureHunt.baseline.flueGasType == 'By Volume' && flueGasTreasureHunt.baseline.flueGasByVolume.gasTypeId == 1) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
    } else {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
    }

    return treasureHuntOpportunityResults;
  }

}

