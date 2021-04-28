import { Injectable } from '@angular/core';
import { WallService } from '../../calculator/furnaces/wall/wall.service';
import { WallLossOutput } from '../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../shared/models/settings';
import { TreasureHunt, TreasureHuntOpportunityResults, WallLossTreasureHunt } from '../../shared/models/treasure-hunt';

@Injectable()
export class WallTreasureHuntService {

  constructor(
    private wallService: WallService) { }


  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(wallLoss: WallLossTreasureHunt) {
    this.wallService.baselineData.next(wallLoss.baseline);
    this.wallService.modificationData.next(wallLoss.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.wallLosses.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(wallLoss: WallLossTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.wallLosses) {
      treasureHunt.wallLosses = new Array();
    }
    treasureHunt.wallLosses.push(wallLoss);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.wallService.baselineData.next(undefined);
    this.wallService.modificationData.next(undefined);
  }


  getTreasureHuntOpportunityResults(wallLossTreasureHunt: WallLossTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(wallLossTreasureHunt);
    this.wallService.calculate(settings);
    let output: WallLossOutput = this.wallService.output.getValue();
    this.resetCalculatorInputs()

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavings,
      energySavings: output.fuelSavings,
      baselineCost: output.baseline.totalFuelCost,
      modificationCost: output.modification.totalFuelCost,
      utilityType: wallLossTreasureHunt.energySourceData.energySourceType,
    }

    return treasureHuntOpportunityResults;
  }

}
