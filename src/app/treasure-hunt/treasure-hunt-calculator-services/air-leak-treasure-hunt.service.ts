import { Injectable } from '@angular/core';
import { AirLeakService } from '../../calculator/compressed-air/air-leak/air-leak.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { AirLeakSurveyInput, AirLeakSurveyOutput } from '../../shared/models/standalone';
import { AirLeakSurveyTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';

@Injectable()
export class AirLeakTreasureHuntService {

  constructor(
    private airLeakService: AirLeakService,
    private convertUnitsService: ConvertUnitsService,
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
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.savingsData.annualTotalElectricityCost,
      energySavings: 0,
      baselineCost: results.baselineData.annualTotalElectricityCost,
      modificationCost: results.modificationData.annualTotalElectricityCost,
      utilityType: '',
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
        unitStr = 'kSCF';
      }
    } else if (airLeakSurvey.airLeakSurveyInput.facilityCompressorData.utilityType == 1) {
      currentCosts = currentEnergyUsage.electricityCosts;
      unitStr = 'kWh';
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: airLeakSurvey.selected,
      opportunityType: 'air-leak-survey',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
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
    survey.compressedAirLeakSurveyInputVec.forEach(input => {
      //cm, in
      input.bagMethodData.height = this.convertUnitsService.convertInAndCmValue(input.bagMethodData.height, oldSettings, newSettings);
      input.bagMethodData.diameter = this.convertUnitsService.convertInAndCmValue(input.bagMethodData.diameter, oldSettings, newSettings);
      //ft3 m3 
      input.estimateMethodData.leakRateEstimate = this.convertUnitsService.convertFt3AndM3Value(input.estimateMethodData.leakRateEstimate, oldSettings, newSettings);
      //psig kPag
      input.decibelsMethodData.linePressure = this.convertUnitsService.convertPsigAndKpag(input.decibelsMethodData.linePressure, oldSettings, newSettings);
      input.decibelsMethodData.pressureA = this.convertUnitsService.convertPsigAndKpag(input.decibelsMethodData.pressureA, oldSettings, newSettings);
      input.decibelsMethodData.pressureB = this.convertUnitsService.convertPsigAndKpag(input.decibelsMethodData.pressureB, oldSettings, newSettings);
      //F C
      input.orificeMethodData.compressorAirTemp = this.convertUnitsService.convertTemperatureValue(input.orificeMethodData.compressorAirTemp, oldSettings, newSettings);
      //psia kPaa
      input.orificeMethodData.atmosphericPressure = this.convertUnitsService.convertPsiaAndKpaa(input.orificeMethodData.atmosphericPressure, oldSettings, newSettings);
      //in cm
      input.orificeMethodData.orificeDiameter = this.convertUnitsService.convertInAndCmValue(input.orificeMethodData.orificeDiameter, oldSettings, newSettings);
      //psia kPaa
      input.orificeMethodData.supplyPressure = this.convertUnitsService.convertPsiaAndKpaa(input.orificeMethodData.supplyPressure, oldSettings, newSettings);
      
      if (input.compressorElectricityData) {
        //1/m3 1/ft3
        input.compressorElectricityData.compressorSpecificPower = this.convertUnitsService.convertDollarsPerFt3AndM3(input.compressorElectricityData.compressorSpecificPower, oldSettings, newSettings)
      }
    })
    return survey;
  }

}
