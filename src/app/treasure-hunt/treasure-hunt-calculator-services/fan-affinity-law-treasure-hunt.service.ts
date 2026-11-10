import { Injectable } from '@angular/core';
import { FanAffinityLawService } from '../../calculator/fans/fan-affinity-law/fan-affinity-law.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FanAffinityLawsInput, FanAffinityLawsOutput } from '../../shared/models/standalone';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, FanAffinityLawTreasureHunt, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class FanAffinityLawTreasureHuntService {

  constructor(private fanAffinityLawService: FanAffinityLawService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(fanAffinityLaw: FanAffinityLawTreasureHunt) {
    this.fanAffinityLawService.fanAffinityLawInputs = fanAffinityLaw.inputData;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.fanAffinityLawOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(fanAffinityLaw: FanAffinityLawTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.fanAffinityLawOpportunities) {
      treasureHunt.fanAffinityLawOpportunities = new Array();
    }
    treasureHunt.fanAffinityLawOpportunities.push(fanAffinityLaw);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.fanAffinityLawService.fanAffinityLawInputs = undefined;
  }

  getTreasureHuntOpportunityResults(fanAffinityLaw: FanAffinityLawTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: FanAffinityLawsOutput = this.fanAffinityLawService.getResults(fanAffinityLaw.inputData, settings, true);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergyBaseline - results.annualEnergyNew,
      baselineCost: results.annualEnergyBaseline * fanAffinityLaw.inputData.electricalRate,
      modificationCost: results.annualEnergyNew * fanAffinityLaw.inputData.electricalRate,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getFanAffinityLawCardData(fanAffinityLaw: FanAffinityLawTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {

    let annualCostSavings: number = opportunitySummary.costSavings;
    if (fanAffinityLaw.opportunitySheet) {
      if (fanAffinityLaw.opportunitySheet.opportunityCost.additionalAnnualSavings) {
        annualCostSavings += fanAffinityLaw.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: fanAffinityLaw.selected,
      opportunityType: 'fan-affinity-law',
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.electricityCosts) * 100,
        label: 'Electricity',
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      fanAffinityLaw: fanAffinityLaw,
      name: opportunitySummary.opportunityName,
      opportunitySheet: fanAffinityLaw.opportunitySheet,
      iconString: 'assets/images/calculator-icons/process-cooling-icons/psychrometric-icon.png',
      teamName: fanAffinityLaw.opportunitySheet ? fanAffinityLaw.opportunitySheet.owner : undefined,
      iconCalcType: 'fan',
      needBackground: true
    }
    return cardData;
  }

  convertFanAffinityLawOpportunities(fanAffinityLawOpportunities: Array<FanAffinityLawTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<FanAffinityLawTreasureHunt> {
    fanAffinityLawOpportunities.forEach(fanAffinityLaw => {
      fanAffinityLaw.inputData = this.convertFanAffinityLawInput(fanAffinityLaw.inputData, oldSettings, newSettings);
    });
    return fanAffinityLawOpportunities;
  }

  convertFanAffinityLawInput(fanAffinityLawInput: FanAffinityLawsInput, oldSettings: Settings, newSettings: Settings): FanAffinityLawsInput {
    fanAffinityLawInput.powerMotor = this.convertUnitsService.convertPowerValue(fanAffinityLawInput.powerMotor, oldSettings, newSettings);
    fanAffinityLawInput.ratedFlow = this.convertFlow(fanAffinityLawInput.ratedFlow, oldSettings, newSettings);
    fanAffinityLawInput.actualFlow = this.convertFlow(fanAffinityLawInput.actualFlow, oldSettings, newSettings);
    fanAffinityLawInput.desiredFlowVolume = this.convertFlow(fanAffinityLawInput.desiredFlowVolume, oldSettings, newSettings);
    fanAffinityLawInput.diameterFan = this.convertUnitsService.convertInAndCmValue(fanAffinityLawInput.diameterFan, oldSettings, newSettings);
    fanAffinityLawInput.diameterFanNew = this.convertUnitsService.convertInAndCmValue(fanAffinityLawInput.diameterFanNew, oldSettings, newSettings);

    fanAffinityLawInput.powerMotor = this.roundVal(fanAffinityLawInput.powerMotor, 3);
    fanAffinityLawInput.ratedFlow = this.roundVal(fanAffinityLawInput.ratedFlow, 3);
    fanAffinityLawInput.actualFlow = this.roundVal(fanAffinityLawInput.actualFlow, 3);
    fanAffinityLawInput.desiredFlowVolume = this.roundVal(fanAffinityLawInput.desiredFlowVolume, 3);
    fanAffinityLawInput.diameterFan = this.roundVal(fanAffinityLawInput.diameterFan, 3);
    fanAffinityLawInput.diameterFanNew = this.roundVal(fanAffinityLawInput.diameterFanNew, 3);

    return fanAffinityLawInput;
  }

  // Matches fan-affinity-law.service.ts's own convention: ft3/min (Imperial) <-> m3/s (Metric).
  convertFlow(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure === newSettings.unitsOfMeasure) return val;
    if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure !== 'Imperial') {
      return this.convertUnitsService.convertValue(val, 'ft3/min', 'm3/s');
    }
    return this.convertUnitsService.convertValue(val, 'm3/s', 'ft3/min');
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
