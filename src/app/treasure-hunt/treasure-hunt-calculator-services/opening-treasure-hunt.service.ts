import { Injectable } from '@angular/core';
import { OpeningService } from '../../calculator/furnaces/opening/opening.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { OpeningLoss, OpeningLossOutput } from '../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, OpeningLossTreasureHunt, OpportunitySummary, Treasure, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class OpeningTreasureHuntService {
  constructor(
    private openingService: OpeningService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(openingLoss: OpeningLossTreasureHunt) {
    // Use copy. on cancel energysource reset will change reference before form destroys
    openingLoss = JSON.parse(JSON.stringify(openingLoss));
    this.openingService.energySourceType.next(openingLoss.baseline[0].energySourceType);
    this.openingService.treasureHuntFuelCost.next(undefined);
    this.openingService.modificationData.next(openingLoss.modification);
    this.openingService.baselineData.next(openingLoss.baseline);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.openingLosses.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(openingLoss: OpeningLossTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.openingLosses) {
      treasureHunt.openingLosses = new Array();
    }
    treasureHunt.openingLosses.push(openingLoss);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.openingService.baselineData.next(undefined);
    this.openingService.modificationData.next(undefined);
    this.openingService.energySourceType.next(undefined);
    this.openingService.treasureHuntFuelCost.next(undefined);
  }


  getTreasureHuntOpportunityResults(openingLossTreasureHunt: OpeningLossTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(openingLossTreasureHunt);
    this.openingService.calculate(settings);
    let output: OpeningLossOutput = this.openingService.output.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavings,
      energySavings: output.fuelSavings,
      baselineCost: output.baseline.totalFuelCost,
      modificationCost: output.modification.totalFuelCost,
      utilityType: openingLossTreasureHunt.energySourceData.energySourceType,
    }

    return treasureHuntOpportunityResults;
  }

  getOpeningLossCardData(openingLoss: OpeningLossTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number = 0;
    if (openingLoss.energySourceData.energySourceType == 'Electricity') {
      currentCosts = currentEnergyUsage.electricityCosts;
    } else if (openingLoss.energySourceData.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (openingLoss.energySourceData.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    } else if (openingLoss.energySourceData.energySourceType == 'Steam') {
      currentCosts = currentEnergyUsage.steamCosts
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: openingLoss.selected,
      opportunityType: Treasure.openingLoss,
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: openingLoss.energySourceData.unit,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      openingLoss: openingLoss,
      name: opportunitySummary.opportunityName,
      opportunitySheet: openingLoss.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/opening.png',
      teamName: openingLoss.opportunitySheet? openingLoss.opportunitySheet.owner : undefined
    }
    return cardData;
  }

  convertOpeningLosses(openingLosses: Array<OpeningLossTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<OpeningLossTreasureHunt> {
    openingLosses.forEach(openingLoss => {
      openingLoss.baseline.forEach(baselineLoss => this.convertOpeningLoss(baselineLoss, oldSettings, newSettings));
      if (openingLoss.modification && openingLoss.modification.length > 0) {
        openingLoss.modification.forEach(modificationLoss => this.convertOpeningLoss(modificationLoss, oldSettings, newSettings));
      }
    });
    return openingLosses;
  }

  convertOpeningLoss(openingLoss: OpeningLoss, oldSettings: Settings, newSettings: Settings): OpeningLoss {
    openingLoss.ambientTemperature = this.convertUnitsService.convertTemperatureValue(openingLoss.ambientTemperature, oldSettings, newSettings);
    openingLoss.insideTemperature = this.convertUnitsService.convertTemperatureValue(openingLoss.insideTemperature, oldSettings, newSettings);
    
    openingLoss.thickness = this.convertUnitsService.convertInAndMm(openingLoss.thickness, oldSettings, newSettings);
    openingLoss.lengthOfOpening = this.convertUnitsService.convertInAndMm(openingLoss.lengthOfOpening, oldSettings, newSettings);
    if (openingLoss.heightOfOpening) {
      openingLoss.heightOfOpening = this.convertUnitsService.convertInAndMm(openingLoss.heightOfOpening, oldSettings, newSettings);
    }
 
    return openingLoss;
  }
}
