import { Injectable } from '@angular/core';
import { WallService } from '../../calculator/furnaces/wall/wall.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { WallLoss, WallLossOutput } from '../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../shared/models/settings';
import { EnergySourceData, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults, WallLossTreasureHunt } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class WallTreasureHuntService {

  constructor(
    private wallService: WallService, private convertUnitsService: ConvertUnitsService) { }


  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(wallLoss: WallLossTreasureHunt) {
    // Use copy. on cancel energysource reset will change reference before form destroys
    wallLoss = JSON.parse(JSON.stringify(wallLoss));
    this.wallService.energySourceType.next(wallLoss.baseline[0].energySourceType);
    this.wallService.treasureHuntFuelCost.next(undefined);
    this.wallService.modificationData.next(wallLoss.modification);
    this.wallService.baselineData.next(wallLoss.baseline);
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
    this.wallService.energySourceType.next(undefined);
    this.wallService.treasureHuntFuelCost.next(undefined);
  }


  getTreasureHuntOpportunityResults(wallLossTreasureHunt: WallLossTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(wallLossTreasureHunt);
    this.wallService.calculate(settings);
    let output: WallLossOutput = this.wallService.output.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavings,
      energySavings: output.fuelSavings,
      baselineCost: output.baseline.totalFuelCost,
      modificationCost: output.modification.totalFuelCost,
      utilityType: wallLossTreasureHunt.energySourceData.energySourceType,
    }

    return treasureHuntOpportunityResults;
  }

  getWallLossCardData(wallLoss: WallLossTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number = 0;
    if (wallLoss.energySourceData.energySourceType == 'Electricity') {
      currentCosts = currentEnergyUsage.electricityCosts;
    } else if (wallLoss.energySourceData.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (wallLoss.energySourceData.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    } else if (wallLoss.energySourceData.energySourceType == 'Steam') {
      currentCosts = currentEnergyUsage.steamCosts
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: wallLoss.selected,
      opportunityType: 'wall-loss',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: wallLoss.energySourceData.unit,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      wallLoss: wallLoss,
      name: opportunitySummary.opportunityName,
      opportunitySheet: wallLoss.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/wall-loss.png',
      teamName: wallLoss.opportunitySheet? wallLoss.opportunitySheet.owner : undefined,
      iconCalcType: 'heat',
      needBackground: true
    }
    return cardData;
  }

  convertWallLosses(wallLosses: Array<WallLossTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<WallLossTreasureHunt> {
    wallLosses.forEach(wallLoss => {
      wallLoss.baseline.forEach(baselineLoss => this.convertWallLoss(baselineLoss, oldSettings, newSettings));
      if (wallLoss.modification && wallLoss.modification.length > 0) {
        wallLoss.modification.forEach(modificationLoss => this.convertWallLoss(modificationLoss, oldSettings, newSettings));
      }
    });
    return wallLosses;
  }

  convertWallLoss(wallLoss: WallLoss, oldSettings: Settings, newSettings: Settings): WallLoss {
    wallLoss.ambientTemperature = this.convertUnitsService.convertTemperatureValue(wallLoss.ambientTemperature, oldSettings, newSettings);
    wallLoss.surfaceTemperature = this.convertUnitsService.convertTemperatureValue(wallLoss.surfaceTemperature, oldSettings, newSettings);

    if (oldSettings.unitsOfMeasure == 'Imperial'){
      wallLoss.windVelocity = this.convertUnitsService.value(wallLoss.windVelocity).from('mph').to('km/h');
      wallLoss.surfaceArea = this.convertUnitsService.value(wallLoss.surfaceArea).from('ft2').to('m2');
    }
    if (oldSettings.unitsOfMeasure == 'Metric'){
      wallLoss.windVelocity = this.convertUnitsService.value(wallLoss.windVelocity).from('km/h').to('mph');
      wallLoss.surfaceArea = this.convertUnitsService.value(wallLoss.surfaceArea).from('m2').to('ft2');
    }
    return wallLoss;
  }
}
