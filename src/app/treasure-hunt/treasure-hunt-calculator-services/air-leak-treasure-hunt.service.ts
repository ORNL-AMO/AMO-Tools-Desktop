import { Injectable } from '@angular/core';
import { AirLeakService } from '../../calculator/compressed-air/air-leak/air-leak.service';
import { Settings } from '../../shared/models/settings';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyOutput } from '../../shared/models/standalone';
import { AirLeakSurveyTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';
import { ConvertAirLeakService } from '../../calculator/compressed-air/air-leak/convert-air-leak.service';

@Injectable()
export class AirLeakTreasureHuntService {

  constructor(
    private airLeakService: AirLeakService,
    private convertAirLeakService: ConvertAirLeakService
    ) { }


  initNewCalculator() {
    this.airLeakService.airLeakInput.next(undefined);
  }

  setCalculatorInputFromOpportunity(airLeakSurvey: AirLeakSurveyTreasureHunt) {
    let airLeakInput: AirLeakSurveyInput = _.cloneDeep(airLeakSurvey.airLeakSurveyInput)
    this.airLeakService.airLeakInput.next(airLeakInput);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.airLeakSurveys.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(airLeakSurvey: AirLeakSurveyTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.airLeakSurveys) {
      treasureHunt.airLeakSurveys = new Array();
    }
    treasureHunt.airLeakSurveys.push(airLeakSurvey);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.airLeakService.airLeakInput.next(undefined);
  }


  getTreasureHuntOpportunityResults(airLeakSurveyTreasureHunt: AirLeakSurveyTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: AirLeakSurveyOutput = this.airLeakService.getResults(settings, airLeakSurveyTreasureHunt.airLeakSurveyInput);

    // 7419 temporary patch results
    results.baselineData.annualTotalElectricity = results.savingsData.annualTotalElectricity;
    results.baselineData.annualTotalElectricityCost = results.savingsData.annualTotalElectricityCost;
    results.baselineData.annualTotalFlowRate = results.savingsData.annualTotalFlowRate;
    results.baselineData.totalFlowRate = results.savingsData.totalFlowRate;

    results.modificationData.annualTotalElectricity = 0;
    results.modificationData.annualTotalElectricityCost = 0;
    results.modificationData.annualTotalFlowRate = 0;
    results.modificationData.totalFlowRate = 0;
    // end 7419 patch


    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.savingsData.annualTotalElectricityCost,
      energySavings: 0,
      baselineCost: results.baselineData.annualTotalElectricityCost,
      modificationCost: results.modificationData.annualTotalElectricityCost,
      utilityType: 'Electricity',
    }

    // utility type: 0 = compressed air, 1 = electric
    if (airLeakSurveyTreasureHunt.airLeakSurveyInput.facilityCompressorData.utilityType == 0) {
      treasureHuntOpportunityResults.energySavings = results.savingsData.annualTotalFlowRate;
      treasureHuntOpportunityResults.utilityType = 'Compressed Air';
    } else {
      treasureHuntOpportunityResults.energySavings = results.savingsData.annualTotalElectricity;
      treasureHuntOpportunityResults.utilityType = 'Electricity';
    }

    return treasureHuntOpportunityResults;
  }

  getAirLeakSurveyCardData(airLeakSurvey: AirLeakSurveyTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let unitStr: string;
    let currentCosts: number;
    //utilityType: 0 = Compressed Air, 1 = Electricity
    if (airLeakSurvey.airLeakSurveyInput.facilityCompressorData.utilityType == 0) {
      currentCosts = currentEnergyUsage.compressedAirCosts;
      unitStr = 'm3';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'kscf';
      }
    } else if (airLeakSurvey.airLeakSurveyInput.facilityCompressorData.utilityType == 1) {
      currentCosts = currentEnergyUsage.electricityCosts;
      unitStr = 'kWh';
    }

    let annualCostSavings: number = opportunitySummary.costSavings;
    if (airLeakSurvey.opportunitySheet){
      if (airLeakSurvey.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += airLeakSurvey.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: airLeakSurvey.selected,
      opportunityType: 'air-leak-survey',
      opportunityIndex: index,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: unitStr,
        label: opportunitySummary.utilityType
      }],
      utilityType: [opportunitySummary.utilityType],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentCosts) * 100,
        label: opportunitySummary.utilityType,
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      airLeakSurvey: airLeakSurvey,
      name: opportunitySummary.opportunityName,
      opportunitySheet: airLeakSurvey.opportunitySheet,
      iconString: 'assets/images/calculator-icons/compressed-air-icons/CAleak-icon.png',
      teamName: airLeakSurvey.opportunitySheet? airLeakSurvey.opportunitySheet.owner : undefined,
      iconCalcType: 'compressedAir',
      needBackground: true
    }
    return cardData;
  }

  convertAirLeakSurveys(airLeakSurveys: Array<AirLeakSurveyTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<AirLeakSurveyTreasureHunt> {
    airLeakSurveys.forEach(airLeakSurvey => {
      airLeakSurvey.airLeakSurveyInput = this.convertAirLeakSurveyInput(airLeakSurvey.airLeakSurveyInput, oldSettings, newSettings);
    });
    return airLeakSurveys;
  }
  
  convertAirLeakSurveyInput(survey: AirLeakSurveyInput, oldSettings: Settings, newSettings: Settings): AirLeakSurveyInput {
    survey.compressedAirLeakSurveyInputVec = survey.compressedAirLeakSurveyInputVec.map((input: AirLeakSurveyData) => {
      return this.convertAirLeakService.convertInputDataImperialToMetric(input);
    });
    survey.facilityCompressorData = this.convertAirLeakService.convertDefaultFacilityCompressorData(survey.facilityCompressorData);
    return survey;
  }

}
