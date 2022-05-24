import { Injectable } from '@angular/core';
import { TankInsulationReductionService } from '../../calculator/steam/tank-insulation-reduction/tank-insulation-reduction.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { TankInsulationReductionInput, TankInsulationReductionResults } from '../../shared/models/standalone';
import { EnergyUsage, OpportunitySummary, TankInsulationReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class TankInsulationTreasureHuntService {

  constructor(private tankInsulationReductionService: TankInsulationReductionService, private convertUnitsService: ConvertUnitsService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(tankInsulationReduction: TankInsulationReductionTreasureHunt) {
    this.tankInsulationReductionService.baselineData = tankInsulationReduction.baseline;
    this.tankInsulationReductionService.modificationData = tankInsulationReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.tankInsulationReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(tankInsulationReduction: TankInsulationReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.tankInsulationReductions) {
      treasureHunt.tankInsulationReductions = new Array();
    }
    treasureHunt.tankInsulationReductions.push(tankInsulationReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.tankInsulationReductionService.baselineData = undefined;
    this.tankInsulationReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(tankInsulationReduction: TankInsulationReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: TankInsulationReductionResults = this.tankInsulationReductionService.getResults(settings, tankInsulationReduction.baseline, tankInsulationReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualHeatSavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: '',
    }

    if (tankInsulationReduction.baseline.utilityType == 0) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
    } else if (tankInsulationReduction.baseline.utilityType == 1) {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
    } else if (tankInsulationReduction.baseline.utilityType == 2) {
      treasureHuntOpportunityResults.utilityType = 'Electricity';
    } else if (tankInsulationReduction.baseline.utilityType == 3) {
      treasureHuntOpportunityResults.utilityType = 'Steam';
    }

    return treasureHuntOpportunityResults;
  }

  getTankInsulationReductionCardData(reduction: TankInsulationReductionTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let unitStr: string;
    let currentCosts: number;
    if (reduction.baseline.utilityType == 0) {
      currentCosts = currentEnergyUsage.naturalGasCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    } else if (reduction.baseline.utilityType == 1) {
      currentCosts = currentEnergyUsage.otherFuelCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    } else if (reduction.baseline.utilityType == 2) {
      currentCosts = currentEnergyUsage.electricityCosts;
      unitStr = 'kWh';
    } else if (reduction.baseline.utilityType == 3) {
      currentCosts = currentEnergyUsage.steamCosts;
      unitStr = 'MMBtu';
      if (settings.unitsOfMeasure == 'Imperial') {
        unitStr = 'GJ';
      }
    }

    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: reduction.selected,
      opportunityType: 'tank-insulation-reduction',
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
      tankInsulationReduction: reduction,
      name: opportunitySummary.opportunityName,
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/tank-ins.png',
      teamName: reduction.opportunitySheet? reduction.opportunitySheet.owner : undefined,
      iconCalcType: 'steam',
      needBackground: true
    }
    return cardData;
  }

  convertTankInsulationReductions(tankReductions: Array<TankInsulationReductionTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<TankInsulationReductionTreasureHunt> {
    tankReductions.forEach(tankReduction => {
      tankReduction.baseline = this.convertTankInsulationReduction(tankReduction.baseline, oldSettings, newSettings);
      if (tankReduction.modification) { 
        tankReduction.modification = this.convertTankInsulationReduction(tankReduction.modification, oldSettings, newSettings);
      }
    })
    return tankReductions;
  }

  convertTankInsulationReduction(reduction: TankInsulationReductionInput, oldSettings: Settings, newSettings: Settings): TankInsulationReductionInput {
    //utilityType imperial: $/MMBtu, metric: $/GJ
    reduction.utilityCost = this.convertUnitsService.convertDollarsPerMMBtuAndGJ(reduction.utilityCost, oldSettings, newSettings);

    //tankHeight imperial: ft, metric: m
    reduction.tankHeight = this.convertUnitsService.convertFtAndMeterValue(reduction.tankHeight, oldSettings, newSettings);
    //tankDiameter imperial: ft, metric: m
    reduction.tankDiameter = this.convertUnitsService.convertFtAndMeterValue(reduction.tankDiameter, oldSettings, newSettings);
    //tankThickness imperial: ft, metric: m
    reduction.tankThickness = this.convertUnitsService.convertFtAndMeterValue(reduction.tankThickness, oldSettings, newSettings);
    //insulationThickness imperial: ft, metric: m
    reduction.insulationThickness = this.convertUnitsService.convertFtAndMeterValue(reduction.insulationThickness, oldSettings, newSettings);
    //tankTemperature imperial: F, metric: C
    reduction.tankTemperature = this.convertUnitsService.convertTemperatureValue(reduction.tankTemperature, oldSettings, newSettings);
    //ambientTemperature imperial: F, metric: C
    reduction.ambientTemperature = this.convertUnitsService.convertTemperatureValue(reduction.ambientTemperature, oldSettings, newSettings);
    //customInsulationConductivity imperial: Btu/hr*ft*F, metric: W/mK
    reduction.customInsulationConductivity = this.convertUnitsService.convertConductivity(reduction.customInsulationConductivity, oldSettings, newSettings);
    return reduction;
  }
}
