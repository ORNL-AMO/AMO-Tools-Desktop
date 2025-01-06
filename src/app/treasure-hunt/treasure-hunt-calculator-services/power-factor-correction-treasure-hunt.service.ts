import { Injectable } from '@angular/core';
import { PowerFactorCorrectionService } from '../../calculator/utilities/power-factor-correction/power-factor-correction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { EnergyUsage, OpportunitySheet, OpportunitySummary, OtherCostItem, PowerFactorCorrectionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { PowerFactorCorrectionOutputs } from '../../calculator/utilities/power-factor-correction/power-factor-correction.component';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class PowerFactorCorrectionTreasureHuntService {

  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(powerFactorCorrectionTreasureHunt: PowerFactorCorrectionTreasureHunt) {
    this.powerFactorCorrectionService.inputData = powerFactorCorrectionTreasureHunt.inputData;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.powerFactorCorrectionOpportunities.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(powerFactorCorrection: PowerFactorCorrectionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.powerFactorCorrectionOpportunities) {
      treasureHunt.powerFactorCorrectionOpportunities = new Array();
    }
    treasureHunt.powerFactorCorrectionOpportunities.push(powerFactorCorrection);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.powerFactorCorrectionService.inputData = undefined;
  }

  getPowerFactorCorrectionOpportunitySheet(powerFactorCorrection: PowerFactorCorrectionTreasureHunt, opportunitySheet: OpportunitySheet): OpportunitySheet{
    let pfResults: PowerFactorCorrectionOutputs = this.powerFactorCorrectionService.getResults(powerFactorCorrection.inputData);
    let pfOppSheet: OpportunitySheet = opportunitySheet;

    let capitalCost = this.convertUnitsService.roundVal(pfResults.capitalCost, 2);
    let annualPFPenalty = this.convertUnitsService.roundVal(pfResults.annualPFPenalty, 2);
    
    let pfOtherCostItem: OtherCostItem = {
      cost: annualPFPenalty,
      description: 'Other Annual Savings'
    }

    if (pfOppSheet.opportunityCost){
      pfOppSheet.opportunityCost.material = capitalCost;
      pfOppSheet.opportunityCost.additionalAnnualSavings = pfOtherCostItem;

    }
    return pfOppSheet;
  }

  getTreasureHuntOpportunityResults(powerFactorCorrection: PowerFactorCorrectionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: PowerFactorCorrectionOutputs = this.powerFactorCorrectionService.getResults(powerFactorCorrection.inputData);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: 0,
      energySavings: 0,
      baselineCost: 0,
      modificationCost: 0,
      utilityType: 'Other',
    }

    return treasureHuntOpportunityResults;
  }

  getPowerFactorCorrectionCardData(powerFactorCorrection: PowerFactorCorrectionTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: powerFactorCorrection.selected,
      opportunityType: 'power-factor-correction',
      opportunityIndex: index,
      annualCostSavings: powerFactorCorrection.opportunitySheet.opportunityCost.additionalAnnualSavings.cost,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: '',
        label: 'Other'
      }],
      utilityType: ['Other'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.electricityCosts) * 100,
        label: 'Other',
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],

      powerFactorCorrection: powerFactorCorrection,
      name: opportunitySummary.opportunityName,
      opportunitySheet: powerFactorCorrection.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/power-factor-correction-icon.png',
      teamName: powerFactorCorrection.opportunitySheet ? powerFactorCorrection.opportunitySheet.owner : undefined,
      iconCalcType: 'utility',
      needBackground: true
    };
    return cardData;
  }

  //TODO
  convertPowerFactorCorrection(powerFactorCorrection: Array<PowerFactorCorrectionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<PowerFactorCorrectionTreasureHunt> {
    powerFactorCorrection.forEach(powerFactorCorrection => {
      //imperial: hp, metric: kW
      //powerFactorCorrection.replaceExistingData.motorSize = this.convertUnitsService.convertPowerValue(replaceExistingMotor.replaceExistingData.motorSize, oldSettings, newSettings);
    });
    return powerFactorCorrection;
  }



}

