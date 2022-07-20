import { Injectable } from '@angular/core';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ReplaceExistingResults } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, OpportunitySummary, ReplaceExistingMotorTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class ReplaceExistingTreasureHuntService {

  constructor(private replaceExistingService: ReplaceExistingService, private convertUnitsService: ConvertUnitsService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(replaceExistingTreasureHunt: ReplaceExistingMotorTreasureHunt) {
    this.replaceExistingService.replaceExistingData = replaceExistingTreasureHunt.replaceExistingData;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.replaceExistingMotors.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(motorReplacement: ReplaceExistingMotorTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.replaceExistingMotors) {
      treasureHunt.replaceExistingMotors = new Array();
    }
    treasureHunt.replaceExistingMotors.push(motorReplacement);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.replaceExistingService.replaceExistingData = undefined;
  }


  getTreasureHuntOpportunityResults(replaceExistingMotor: ReplaceExistingMotorTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: ReplaceExistingResults = this.replaceExistingService.getResults(replaceExistingMotor.replaceExistingData, settings);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.costSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.existingEnergyCost,
      modificationCost: results.newEnergyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

  getReplaceExistingCardData(replaceExistingMotor: ReplaceExistingMotorTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: replaceExistingMotor.selected,
      opportunityType: 'replace-existing',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
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

      replaceExistingMotor: replaceExistingMotor,
      name: opportunitySummary.opportunityName,
      opportunitySheet: replaceExistingMotor.opportunitySheet,
      iconString: 'assets/images/calculator-icons/motor-icons/replace.png',
      teamName: replaceExistingMotor.opportunitySheet? replaceExistingMotor.opportunitySheet.owner : undefined,
      iconCalcType: 'motor',
      needBackground: true
    };
    return cardData;
  }

  convertReplaceExistingMotors(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<ReplaceExistingMotorTreasureHunt> {
    replaceExistingMotors.forEach(replaceExistingMotor => {
      //imperial: hp, metric: kW
      replaceExistingMotor.replaceExistingData.motorSize = this.convertUnitsService.convertPowerValue(replaceExistingMotor.replaceExistingData.motorSize, oldSettings, newSettings);
    });
    return replaceExistingMotors;
  }


  

}