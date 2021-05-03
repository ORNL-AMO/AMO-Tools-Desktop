import { Injectable } from '@angular/core';
import { NaturalGasReductionService } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { NaturalGasReductionData, NaturalGasReductionResults } from '../../shared/models/standalone';
import { EnergyUsage, NaturalGasReductionTreasureHunt, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class NaturalGasReductionTreasureHuntService {

  constructor(private naturalGasReductionService: NaturalGasReductionService, private convertUnitsService: ConvertUnitsService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(naturalGasReduction: NaturalGasReductionTreasureHunt) {
    this.naturalGasReductionService.baselineData = naturalGasReduction.baseline;
    this.naturalGasReductionService.modificationData = naturalGasReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.naturalGasReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(naturalGasReduction: NaturalGasReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.naturalGasReductions) {
      treasureHunt.naturalGasReductions = new Array();
    }
    treasureHunt.naturalGasReductions.push(naturalGasReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.naturalGasReductionService.baselineData = undefined;
    this.naturalGasReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(naturalGasReduction: NaturalGasReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: NaturalGasReductionResults = this.naturalGasReductionService.getResults(settings, naturalGasReduction.baseline, naturalGasReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Natural Gas',
    }

    return treasureHuntOpportunityResults;
  }

  getNaturalGasReductionCard(naturalGasReduction: NaturalGasReductionTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    let unitStr: string = 'MMBtu/yr';
    if (settings.unitsOfMeasure == 'Metric') {
      unitStr = 'MJ/yr';
    }
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: naturalGasReduction.selected,
      opportunityType: 'natural-gas-reduction',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: unitStr,
        label: 'Natural Gas'
      }],
      utilityType: ['Natural Gas'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.naturalGasCosts) * 100,
        label: 'Natural Gas',
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      naturalGasReduction: naturalGasReduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: naturalGasReduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/natural-gas-reduction-icon.png',
      teamName: naturalGasReduction.opportunitySheet? naturalGasReduction.opportunitySheet.owner : undefined
    }
    return cardData;
  }

  convertNaturalGasReductions(naturalGasReductions: Array<NaturalGasReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<NaturalGasReductionTreasureHunt> {
    naturalGasReductions.forEach(reductionThItem => {
      reductionThItem.baseline.forEach(reduction => {
        reduction = this.convertNaturalGasReduction(reduction, oldSettings, newSettings);
      });
      if (reductionThItem.modification && reductionThItem.modification.length > 0) { 
        reductionThItem.modification.forEach(reduction => {
          reduction = this.convertNaturalGasReduction(reduction, oldSettings, newSettings);
        })
      }
      });
    return naturalGasReductions;
  }

  convertNaturalGasReduction(reduction: NaturalGasReductionData, oldSettings: Settings, newSettings: Settings): NaturalGasReductionData {
    //imperial: $/MMBtu, metric: $/GJ
    reduction.fuelCost = this.convertUnitsService.convertDollarsPerMMBtuAndGJ(reduction.fuelCost, oldSettings, newSettings);
    //imperial: ft3/hr, metric: m3/hr
    reduction.flowMeterMethodData.flowRate = this.convertUnitsService.convertFt3AndM3Value(reduction.flowMeterMethodData.flowRate, oldSettings, newSettings);
    //imperial: MMBtu/yr metric: GJ/yr
    reduction.otherMethodData.consumption = this.convertUnitsService.convertMMBtuAndGJValue(reduction.otherMethodData.consumption, oldSettings, newSettings);
    //imperial F, metric: C
    reduction.airMassFlowData.inletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.airMassFlowData.inletTemperature, oldSettings, newSettings);
    //imperial F, metric: C
    reduction.airMassFlowData.outletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.airMassFlowData.outletTemperature, oldSettings, newSettings);
    //imperial: ft2, metric: cm2
    reduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct = this.convertUnitsService.convertFt2AndCm2Value(reduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct, oldSettings, newSettings);
    //imperial: ft, metric: m
    reduction.airMassFlowData.airMassFlowMeasuredData.airVelocity = this.convertUnitsService.convertFtAndMeterValue(reduction.airMassFlowData.airMassFlowMeasuredData.airVelocity, oldSettings, newSettings);
    //imperial: ft3/min, metric: L/s
    reduction.airMassFlowData.airMassFlowNameplateData.airFlow = this.convertUnitsService.convertFt3AndLiterValue(reduction.airMassFlowData.airMassFlowNameplateData.airFlow, oldSettings, newSettings);
    //imperial: gpm, metric: L/s
    reduction.waterMassFlowData.waterFlow = this.convertUnitsService.convertGallonPerMinuteAndLiterPerSecondValue(reduction.waterMassFlowData.waterFlow, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowData.inletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.waterMassFlowData.inletTemperature, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowData.outletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.waterMassFlowData.outletTemperature, oldSettings, newSettings);
    return reduction;
  }


}