import { Injectable } from '@angular/core';
import { SteamReductionService } from '../../calculator/steam/steam-reduction/steam-reduction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { SteamReductionData, SteamReductionResults } from '../../shared/models/standalone';
import { EnergyUsage, OpportunitySummary, SteamReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';

@Injectable()
export class SteamReductionTreasureHuntService {

  constructor(private steamReductionService: SteamReductionService, private convertUnitsService: ConvertUnitsService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(steamReduction: SteamReductionTreasureHunt) {
    this.steamReductionService.baselineData = _.cloneDeep(steamReduction.baseline);
    this.steamReductionService.modificationData = _.cloneDeep(steamReduction.modification);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.steamReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(steamReduction: SteamReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.steamReductions) {
      treasureHunt.steamReductions = new Array();
    }
    treasureHunt.steamReductions.push(steamReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.steamReductionService.baselineData = undefined;
    this.steamReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(steamReduction: SteamReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: SteamReductionResults = this.steamReductionService.getResults(settings, steamReduction.baseline, steamReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualSteamSavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Steam',
    }

    if (steamReduction.baseline[0].utilityType == 1) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
      treasureHuntOpportunityResults.energySavings = results.annualEnergySavings;
    } else if (steamReduction.baseline[0].utilityType == 2) {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
      treasureHuntOpportunityResults.energySavings = results.annualEnergySavings;
    }

    return treasureHuntOpportunityResults;
  }

  getSteamReductionCardData(reduction: SteamReductionTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let unitStr: string = 'klb';
    if (settings.unitsOfMeasure == 'Imperial') {
      unitStr = 'tonnes';
    }
    let currentCosts: number = currentEnergyUsage.steamCosts;
    if (reduction.baseline[0].utilityType == 1) {
      currentCosts = currentEnergyUsage.naturalGasCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    } else if (reduction.baseline[0].utilityType == 2) {
      currentCosts = currentEnergyUsage.otherFuelCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    }

    let annualCostSavings: number = opportunitySummary.costSavings;
    if (reduction.opportunitySheet){
      if (reduction.opportunitySheet.opportunityCost.additionalAnnualSavings){
        annualCostSavings += reduction.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: reduction.selected,
      opportunityType: 'steam-reduction',
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
      steamReduction: reduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/steam-reduction-icon.png',
      teamName: reduction.opportunitySheet? reduction.opportunitySheet.owner : undefined
    }
    return cardData;
  }

  convertSteamReductions(steamReductions: Array<SteamReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<SteamReductionTreasureHunt> {
    steamReductions.forEach(steamReduction => {
      steamReduction.baseline.forEach(reduction => {
        reduction = this.convertSteamReduction(reduction, oldSettings, newSettings);
      });
      if (steamReduction.modification && steamReduction.modification.length > 0) {
        steamReduction.modification.forEach(reduction => {
          reduction = this.convertSteamReduction(reduction, oldSettings, newSettings);
        })
      }
    })
    return steamReductions;
  }

  convertSteamReduction(reduction: SteamReductionData, oldSettings: Settings, newSettings: Settings): SteamReductionData {
    //utilityType = 0: imperial: $/klb, metric: $/tonne
    //utilityType != 0: imperial: $/MMBtu, metric: $/GJ
    if (reduction.utilityType == 0) {
      reduction.utilityCost = this.convertUnitsService.convertDollarsPerKlbAndTonne(reduction.utilityCost, oldSettings, newSettings);
    } else {
      reduction.utilityCost = this.convertUnitsService.convertDollarsPerMMBtuAndGJ(reduction.utilityCost, oldSettings, newSettings);
    }

    //imperial: psig, metric: barg
    reduction.pressure = this.convertUnitsService.convertPsigAndBargValue(reduction.pressure, oldSettings, newSettings);
    //imperial: lb/hr, metric: kg/hr
    reduction.flowMeterMethodData.flowRate = this.convertUnitsService.convertLbAndKgValue(reduction.flowMeterMethodData.flowRate, oldSettings, newSettings);
    //imperial ft/min, metric: m/min
    reduction.airMassFlowMethodData.massFlowMeasuredData.airVelocity = this.convertUnitsService.convertFtAndMeterValue(reduction.airMassFlowMethodData.massFlowMeasuredData.airVelocity, oldSettings, newSettings);
    //imperial: ft2, metric: cm2
    reduction.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertUnitsService.convertFt2AndCm2Value(reduction.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.airMassFlowMethodData.inletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.airMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.airMassFlowMethodData.outletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.airMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: ft3/min, metric: L/s
    reduction.airMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.convertFt3AndLiterValue(reduction.airMassFlowMethodData.massFlowNameplateData.flowRate, oldSettings, newSettings);

    //imperial ft/min, metric: m/min
    reduction.waterMassFlowMethodData.massFlowMeasuredData.airVelocity = this.convertUnitsService.convertFtAndMeterValue(reduction.waterMassFlowMethodData.massFlowMeasuredData.airVelocity, oldSettings, newSettings);
    //imperial: ft2, metric: cm2
    reduction.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertUnitsService.convertFt2AndCm2Value(reduction.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowMethodData.inletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.waterMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: F, metric: C
    reduction.waterMassFlowMethodData.outletTemperature = this.convertUnitsService.convertTemperatureValue(reduction.waterMassFlowMethodData.outletTemperature, oldSettings, newSettings);
    //imperial: gpm, metric: L/s
    reduction.waterMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.convertGallonPerMinuteAndLiterPerSecondValue(reduction.waterMassFlowMethodData.massFlowNameplateData.flowRate, oldSettings, newSettings);
    return reduction;
  }



}