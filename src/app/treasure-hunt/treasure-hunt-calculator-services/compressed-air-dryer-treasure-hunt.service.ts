import { Injectable } from '@angular/core';
import { CompressedAirDryerService } from '../../calculator/compressed-air/compressed-air-dryer/compressed-air-dryer.service';
import { ConvertCompressedAirDryerService } from '../../calculator/compressed-air/compressed-air-dryer/convert-compressed-air-dryer.service';
import { DryerOperatingCostOutput } from '../../shared/models/standalone';
import { Settings } from '../../shared/models/settings';
import { CompressedAirDryerTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class CompressedAirDryerTreasureHuntService {

  constructor(
    private compressedAirDryerService: CompressedAirDryerService,
    private convertCompressedAirDryerService: ConvertCompressedAirDryerService,
  ) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(compressedAirDryer: CompressedAirDryerTreasureHunt) {
    this.compressedAirDryerService.baselineInput = compressedAirDryer.baseline;
    this.compressedAirDryerService.modificationInput = compressedAirDryer.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.compressedAirDryerOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(compressedAirDryer: CompressedAirDryerTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.compressedAirDryerOpportunities) {
      treasureHunt.compressedAirDryerOpportunities = new Array();
    }
    treasureHunt.compressedAirDryerOpportunities.push(compressedAirDryer);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.compressedAirDryerService.baselineInput = undefined;
    this.compressedAirDryerService.modificationInput = undefined;
  }

  getTreasureHuntOpportunityResults(compressedAirDryer: CompressedAirDryerTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let baselineOutput: DryerOperatingCostOutput = this.compressedAirDryerService.calculate(compressedAirDryer.baseline, settings);
    let modificationOutput: DryerOperatingCostOutput = compressedAirDryer.modification
      ? this.compressedAirDryerService.calculate(compressedAirDryer.modification, settings)
      : baselineOutput;

    // The engine only returns a blended $/yr total (electricity + compressed air purge + cooling
    // water combined), not a separate energy (kWh) figure, so energySavings is left at 0 here --
    // the same convention used by power-factor-correction-treasure-hunt.service.ts.
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: baselineOutput.totalCostPerYear - modificationOutput.totalCostPerYear,
      energySavings: 0,
      baselineCost: baselineOutput.totalCostPerYear,
      modificationCost: modificationOutput.totalCostPerYear,
      utilityType: 'Compressed Air',
    }

    return treasureHuntOpportunityResults;
  }

  getCompressedAirDryerCardData(compressedAirDryer: CompressedAirDryerTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {

    let annualCostSavings: number = opportunitySummary.costSavings;
    if (compressedAirDryer.opportunitySheet) {
      if (compressedAirDryer.opportunitySheet.opportunityCost.additionalAnnualSavings) {
        annualCostSavings += compressedAirDryer.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: compressedAirDryer.selected,
      opportunityType: 'compressed-air-dryer',
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: '',
        label: 'Compressed Air'
      }],
      utilityType: ['Compressed Air'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.compressedAirCosts) * 100,
        label: 'Compressed Air',
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      compressedAirDryer: compressedAirDryer,
      name: opportunitySummary.opportunityName,
      opportunitySheet: compressedAirDryer.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/compressed-air-pressure-reduction-icon.png',
      teamName: compressedAirDryer.opportunitySheet ? compressedAirDryer.opportunitySheet.owner : undefined,
      iconCalcType: 'compressedAir',
      needBackground: true
    }
    return cardData;
  }

  convertCompressedAirDryerOpportunities(compressedAirDryerOpportunities: Array<CompressedAirDryerTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<CompressedAirDryerTreasureHunt> {
    compressedAirDryerOpportunities.forEach(compressedAirDryer => {
      compressedAirDryer.baseline = this.convertCompressedAirDryerService.convertStoredInput(compressedAirDryer.baseline, oldSettings.unitsOfMeasure, newSettings.unitsOfMeasure);
      if (compressedAirDryer.modification) {
        compressedAirDryer.modification = this.convertCompressedAirDryerService.convertStoredInput(compressedAirDryer.modification, oldSettings.unitsOfMeasure, newSettings.unitsOfMeasure);
      }
    });
    return compressedAirDryerOpportunities;
  }

}
