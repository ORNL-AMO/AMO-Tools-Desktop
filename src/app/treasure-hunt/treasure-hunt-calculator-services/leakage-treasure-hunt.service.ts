import { Injectable } from '@angular/core';
import { LeakageService } from '../../calculator/furnaces/leakage/leakage.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { LeakageLoss, LeakageLossOutput } from '../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, LeakageLossTreasureHunt, OpportunitySummary, Treasure, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class LeakageTreasureHuntService {

  constructor(
    private leakageService: LeakageService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(leakageLoss: LeakageLossTreasureHunt) {
     // Use copy. on cancel energysource reset will change reference before form destroys
     leakageLoss = JSON.parse(JSON.stringify(leakageLoss));
     this.leakageService.energySourceType.next(leakageLoss.baseline[0].energySourceType);
     this.leakageService.treasureHuntFuelCost.next(undefined);
     this.leakageService.modificationData.next(leakageLoss.modification);
     this.leakageService.baselineData.next(leakageLoss.baseline);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.leakageLosses.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(leakageLoss: LeakageLossTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.leakageLosses) {
      treasureHunt.leakageLosses = new Array();
    }
    treasureHunt.leakageLosses.push(leakageLoss);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.leakageService.baselineData.next(undefined);
    this.leakageService.modificationData.next(undefined);
    this.leakageService.energySourceType.next(undefined);
    this.leakageService.treasureHuntFuelCost.next(undefined);
  }


  getTreasureHuntOpportunityResults(leakageLossTreasureHunt: LeakageLossTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.setCalculatorInputFromOpportunity(leakageLossTreasureHunt);
    this.leakageService.calculate(settings);
    let output: LeakageLossOutput = this.leakageService.output.getValue();

    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: output.costSavings,
      energySavings: output.fuelSavings,
      baselineCost: output.baseline.totalFuelCost,
      modificationCost: output.modification.totalFuelCost,
      utilityType: leakageLossTreasureHunt.energySourceData.energySourceType,
    }

    return treasureHuntOpportunityResults;
  }

  getLeakageLossCardData(leakageLoss: LeakageLossTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let currentCosts: number = 0;
    if (leakageLoss.energySourceData.energySourceType == 'Electricity') {
      currentCosts = currentEnergyUsage.electricityCosts;
    } else if (leakageLoss.energySourceData.energySourceType == 'Natural Gas') {
      currentCosts = currentEnergyUsage.naturalGasCosts
    } else if (leakageLoss.energySourceData.energySourceType == 'Other Fuel') {
      currentCosts = currentEnergyUsage.otherFuelCosts;
    } else if (leakageLoss.energySourceData.energySourceType == 'Steam') {
      currentCosts = currentEnergyUsage.steamCosts
    }
    
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: leakageLoss.selected,
      opportunityType: Treasure.leakageLoss,
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: leakageLoss.energySourceData.unit,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      leakageLoss: leakageLoss,
      name: opportunitySummary.opportunityName,
      opportunitySheet: leakageLoss.opportunitySheet,
      iconString: 'assets/images/calculator-icons/furnace-icons/leakage.png',
      teamName: leakageLoss.opportunitySheet? leakageLoss.opportunitySheet.owner : undefined,
      iconCalcType: 'heat',
      needBackground: true
    }
    return cardData;
  }

  convertLeakageLosses(leakageLosses: Array<LeakageLossTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<LeakageLossTreasureHunt> {
    leakageLosses.forEach(leakageLoss => {
      leakageLoss.baseline.forEach(baselineLoss => this.convertLeakageLoss(baselineLoss, oldSettings, newSettings));
      if (leakageLoss.modification && leakageLoss.modification.length > 0) {
        leakageLoss.modification.forEach(modificationLoss => this.convertLeakageLoss(modificationLoss, oldSettings, newSettings));
      }
    });
    return leakageLosses;
  }

  convertLeakageLoss(leakageLoss: LeakageLoss, oldSettings: Settings, newSettings: Settings): LeakageLoss {
    leakageLoss.leakageGasTemperature = this.convertUnitsService.convertTemperatureValue(leakageLoss.leakageGasTemperature, oldSettings, newSettings);
    leakageLoss.ambientTemperature = this.convertUnitsService.convertTemperatureValue(leakageLoss.ambientTemperature, oldSettings, newSettings);
    
    if (oldSettings.unitsOfMeasure == 'Metric'){
      leakageLoss.draftPressure = this.convertUnitsService.value(leakageLoss.draftPressure).from('Pa').to('inH2o');
      leakageLoss.openingArea = this.convertUnitsService.value(leakageLoss.openingArea).from('m2').to('ft2');
    } else if (oldSettings.unitsOfMeasure == 'Imperial') {
      leakageLoss.draftPressure = this.convertUnitsService.value(leakageLoss.draftPressure).from('inH2o').to('Pa');
      leakageLoss.openingArea = this.convertUnitsService.value(leakageLoss.openingArea).from('ft2').to('m2');
    }
    return leakageLoss;
  }
}
