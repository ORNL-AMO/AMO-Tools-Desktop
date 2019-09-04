import { Injectable } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, EnergyUsage, OpportunitySheetResults } from '../../../shared/models/treasure-hunt';
import *  as _ from 'lodash';
import { LightingReplacementService } from '../../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementResults } from '../../../shared/models/lighting';
import { ReplaceExistingResults, MotorDriveOutputs } from '../../../shared/models/calculators';
import { ReplaceExistingService } from '../../../calculator/motors/replace-existing/replace-existing.service';
import { MotorDriveService } from '../../../calculator/motors/motor-drive/motor-drive.service';
import { NaturalGasReductionService } from '../../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';
import { NaturalGasReductionResults, ElectricityReductionResults, CompressedAirReductionResults, CompressedAirPressureReductionResults, WaterReductionResults } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { ElectricityReductionService } from '../../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { CompressedAirReductionService } from '../../../calculator/utilities/compressed-air-reduction/compressed-air-reduction.service';
import { CompressedAirPressureReductionService } from '../../../calculator/utilities/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';
import { WaterReductionService } from '../../../calculator/utilities/water-reduction/water-reduction.service';
import { OpportunitySheetService } from '../../calculators/standalone-opportunity-sheet/opportunity-sheet.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OpportunityCardsService {

  // opportunityCardsData: BehaviorSubject<Array<OpportunityCardData>>;


  constructor(private lightingReplacementService: LightingReplacementService, private replaceExistingService: ReplaceExistingService,
    private motorDriveService: MotorDriveService, private naturalGasReductionService: NaturalGasReductionService,
    private electricityReductionService: ElectricityReductionService, private compressedAirReductionService: CompressedAirReductionService,
    private compressedAirPressureReductionService: CompressedAirPressureReductionService, private waterReductionService: WaterReductionService,
    private opportunitySheetService: OpportunitySheetService) {
    // this.opportunityCardsData = new BehaviorSubject(new Array());
  }

  getOpportunityCardsData(treasureHunt: TreasureHunt, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    let lightingReplacementsCardData: Array<OpportunityCardData> = this.getLightingReplacements(treasureHunt.lightingReplacements, treasureHunt.currentEnergyUsage);
    let replaceExistingData: Array<OpportunityCardData> = this.getReplaceExistingMotors(treasureHunt.replaceExistingMotors, treasureHunt.currentEnergyUsage);
    let naturalGasReductionData: Array<OpportunityCardData> = this.getNaturalGasReductions(treasureHunt.naturalGasReductions, treasureHunt.currentEnergyUsage, settings);
    let electricityReductionData: Array<OpportunityCardData> = this.getElectricityReductions(treasureHunt.electricityReductions, treasureHunt.currentEnergyUsage, settings);
    let compressedAirReductionData: Array<OpportunityCardData> = this.getCompressedAirReductions(treasureHunt.compressedAirReductions, treasureHunt.currentEnergyUsage, settings);
    let compressedAirPressureReductionData: Array<OpportunityCardData> = this.getCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, treasureHunt.currentEnergyUsage, settings);
    let waterReductionData: Array<OpportunityCardData> = this.getWaterReductions(treasureHunt.waterReductions, treasureHunt.currentEnergyUsage, settings);
    let standaloneOpportunitySheetData: Array<OpportunityCardData> = this.getStandaloeOpportunitySheets(treasureHunt.opportunitySheets, settings, treasureHunt.currentEnergyUsage)
    opportunityCardsData = _.union(lightingReplacementsCardData, replaceExistingData, naturalGasReductionData, electricityReductionData, compressedAirReductionData, compressedAirPressureReductionData, waterReductionData, standaloneOpportunitySheetData);
    // this.opportunityCardsData.next(opportunityCardsData);
    return opportunityCardsData;
  }

  //lightingReplacement;
  getLightingReplacements(lightingReplacements: Array<LightingReplacementTreasureHunt>, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (lightingReplacements) {
      let index: number = 0;
      lightingReplacements.forEach(lightingReplacement => {
        let cardData: OpportunityCardData = this.getLightingReplacementCardData(lightingReplacement, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }

  getLightingReplacementCardData(lightingReplacement: LightingReplacementTreasureHunt, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let results: LightingReplacementResults = this.lightingReplacementService.getResults(lightingReplacement);
    let cardData: OpportunityCardData = {
      selected: lightingReplacement.selected,
      opportunityType: 'lighting-replacement',
      opportunityIndex: index,
      annualCostSavings: results.totalCostSavings,
      annualEnergySavings: [{
        savings: results.totalEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: this.getPercentSavings(results.totalCostSavings, currentEnergyUsage.electricityCosts),
        label: 'Electricity'
      }],
      lightingReplacement: lightingReplacement,
      name: this.getName(lightingReplacement.opportunitySheet, index, 'Lighting Replacement #'),
      opportunitySheet: lightingReplacement.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/lighting-replacement-icon.png'
    }
    return cardData;
  }

  //opportunitySheets
  getStandaloeOpportunitySheets(opportunitySheets: Array<OpportunitySheet>, settings: Settings, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (opportunitySheets) {
      let index: number = 0;
      opportunitySheets.forEach(oppSheet => {
        let cardData: OpportunityCardData = this.getOpportunitySheetCardData(oppSheet, currentEnergyUsage, index, settings);
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }

  getOpportunitySheetCardData(oppSheet: OpportunitySheet, currentEnergyUsage: EnergyUsage, index: number, settings: Settings): OpportunityCardData {
    let results: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
    let energyData = this.getOpportunitySheetEnergySavings(results, currentEnergyUsage, settings);
    let cardData: OpportunityCardData = {
      selected: oppSheet.selected,
      opportunityType: 'opportunity-sheet',
      opportunityIndex: index,
      annualCostSavings: results.totalCostSavings,
      annualEnergySavings: energyData.annualEnergySavings,
      percentSavings: energyData.percentSavings,
      opportunitySheet: oppSheet,
      name: this.getName(oppSheet, index, 'Opportunity Sheet #'),
      iconString: 'assets/images/calculator-icons/opportunity-sheet-icon.png',
      utilityType: energyData.utilityTypes
    }
    return cardData;
  }

  getOpportunitySheetEnergySavings(results: OpportunitySheetResults, currentEnergyUsage: EnergyUsage, settings: Settings): {
    annualEnergySavings: Array<{
      savings: number,
      label: string,
      energyUnit: string
    }>,
    percentSavings: Array<{
      percent: number,
      label: string
    }>,
    utilityTypes: Array<string>
  } {
    let annualEnergySavings: Array<{ savings: number, label: string, energyUnit: string }> = new Array();
    let percentSavings: Array<{ percent: number, label: string }> = new Array();
    let utilityTypes: Array<string> = new Array();

    if (results.electricityResults.energySavings != 0) {
      annualEnergySavings.push({
        savings: results.electricityResults.energySavings,
        label: 'Electricity',
        energyUnit: 'kWh'
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.electricityResults.energyCostSavings, currentEnergyUsage.electricityCosts),
          label: 'Electricity'
        }
      )
      utilityTypes.push('Electricity');
    };
    if (results.gasResults.energySavings != 0) {
      let unit: string = 'MMBTu/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'MJ/yr';
      }
      annualEnergySavings.push({
        savings: results.gasResults.energySavings,
        label: 'Natural Gas',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.gasResults.energyCostSavings, currentEnergyUsage.naturalGasCosts),
          label: 'Natural Gas'
        }
      )
      utilityTypes.push('Natural Gas');
    };
    if (results.compressedAirResults.energySavings != 0) {
      let unit: string = 'SCF/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'm3/yr';
      }
      annualEnergySavings.push({
        savings: results.compressedAirResults.energySavings,
        label: 'Compressed Air',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.compressedAirResults.energyCostSavings, currentEnergyUsage.compressedAirCosts),
          label: 'Compressed Air'
        }
      );
      utilityTypes.push('Compressed Air');
    };
    if (results.otherFuelResults.energySavings != 0) {
      let unit: string = 'MMBTu/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'MJ/yr';
      }
      annualEnergySavings.push({
        savings: results.otherFuelResults.energySavings,
        label: 'Other Fuel',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.otherFuelResults.energyCostSavings, currentEnergyUsage.otherFuelCosts),
          label: 'Other Fuel'
        }
      )
      utilityTypes.push('Other Fuel');
    };
    if (results.steamResults.energySavings != 0) {
      let unit: string = 'klb/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'tonne/yr';
      }
      annualEnergySavings.push({
        savings: results.steamResults.energySavings,
        label: 'Steam',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.steamResults.energyCostSavings, currentEnergyUsage.steamCosts),
          label: 'Steam'
        }
      )
      utilityTypes.push('Steam');
    };
    if (results.waterResults.energySavings != 0) {
      let unit: string = 'L/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'gal/yr';
      }
      annualEnergySavings.push({
        savings: results.waterResults.energySavings,
        label: 'Water',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.waterResults.energyCostSavings, currentEnergyUsage.waterCosts),
          label: 'Water'
        }
      )
      utilityTypes.push('Water');
    };

    if (results.wasteWaterResults.energySavings != 0) {
      let unit: string = 'L/yr';
      if (settings.unitsOfMeasure == 'Metric') {
        unit = 'gal/yr';
      }
      annualEnergySavings.push({
        savings: results.wasteWaterResults.energySavings,
        label: 'Waste Water',
        energyUnit: unit
      });
      percentSavings.push(
        {
          percent: this.getPercentSavings(results.wasteWaterResults.energyCostSavings, currentEnergyUsage.wasteWaterCosts),
          label: 'Waste Water'
        }
      )
      utilityTypes.push('Waste Water');
    };

    return { annualEnergySavings: annualEnergySavings, percentSavings: percentSavings, utilityTypes: utilityTypes }
  }

  //replaceExistingMotors
  getReplaceExistingMotors(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (replaceExistingMotors) {
      let index: number = 0;
      replaceExistingMotors.forEach(replaceExistingMotor => {
        let cardData: OpportunityCardData = this.getReplaceExistingCardData(replaceExistingMotor, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }

  getReplaceExistingCardData(replaceExistingMotor: ReplaceExistingMotorTreasureHunt, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let results: ReplaceExistingResults = this.replaceExistingService.getResults(replaceExistingMotor.replaceExistingData);
    let cardData: OpportunityCardData = {
      selected: replaceExistingMotor.selected,
      opportunityType: 'replace-existing',
      opportunityIndex: index,
      annualCostSavings: results.costSavings,
      annualEnergySavings: [{
        savings: results.annualEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: this.getPercentSavings(results.costSavings, currentEnergyUsage.electricityCosts),
        label: 'Electricity'
      }],

      replaceExistingMotor: replaceExistingMotor,
      name: this.getName(replaceExistingMotor.opportunitySheet, index, 'Replace Existing Motor #'),
      opportunitySheet: replaceExistingMotor.opportunitySheet,
      iconString: 'assets/images/calculator-icons/motor-icons/replace.png'
    };
    return cardData;
  }

  //motorDrives
  getMotorDrives(motorDrives: Array<MotorDriveInputsTreasureHunt>, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (motorDrives) {
      let index: number = 0;
      motorDrives.forEach(drive => {
        let cardData: OpportunityCardData = this.getMotorDriveCard(drive, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
      return opportunityCardsData;
    }
  }

  getMotorDriveCard(drive: MotorDriveInputsTreasureHunt, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let results: MotorDriveOutputs = this.motorDriveService.getResults(drive.motorDriveInputs);
    let cardData: OpportunityCardData = {
      selected: drive.selected,
      opportunityType: 'motor-drive',
      opportunityIndex: index,
      annualCostSavings: results.annualCostSavings,
      annualEnergySavings: [{
        savings: results.annualEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.electricityCosts),
        label: 'Electricity'
      }],
      motorDrive: drive,
      name: this.getName(drive.opportunitySheet, index, 'Motor Drive #'),
      opportunitySheet: drive.opportunitySheet,
      iconString: 'assets/images/calculator-icons/motor-icons/motor-drive.png'
    }
    return cardData;
  }
  //naturalGasReductions
  getNaturalGasReductions(naturalGasReductions: Array<NaturalGasReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (naturalGasReductions) {
      let index: number = 0;
      naturalGasReductions.forEach(naturalGasReduction => {
        let cardData: OpportunityCardData = this.getNaturalGasReductionCard(naturalGasReduction, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getNaturalGasReductionCard(naturalGasReduction: NaturalGasReductionTreasureHunt, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let results: NaturalGasReductionResults = this.naturalGasReductionService.getResults(settings, naturalGasReduction.baseline, naturalGasReduction.modification);
    let unitStr: string = 'MMBtu/yr';
    if (settings.unitsOfMeasure == 'Metric') {
      unitStr = 'MJ/yr';
    }
    let cardData: OpportunityCardData = {
      selected: naturalGasReduction.selected,
      opportunityType: 'natural-gas-reduction',
      opportunityIndex: index,
      annualCostSavings: results.annualCostSavings,
      annualEnergySavings: [{
        savings: results.annualEnergySavings,
        energyUnit: unitStr,
        label: 'Natural Gas'
      }],
      utilityType: ['Natural Gas'],
      percentSavings: [{
        percent: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.naturalGasCosts),
        label: 'Natural Gas'
      }],
      naturalGasReduction: naturalGasReduction,
      name: this.getName(naturalGasReduction.opportunitySheet, index, 'Natural Gas Reduction #'),
      opportunitySheet: naturalGasReduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/natural-gas-reduction-icon.png'
    }
    return cardData;
  }

  //electricityReductions
  getElectricityReductions(electricityReductions: Array<ElectricityReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (electricityReductions) {
      let index: number = 0;
      electricityReductions.forEach(reduction => {
        let results: ElectricityReductionResults = this.electricityReductionService.getResults(settings, reduction.baseline, reduction.modification);
        let cardData: OpportunityCardData = {
          selected: reduction.selected,
          opportunityType: 'electricity-reduction',
          opportunityIndex: index,
          annualCostSavings: results.annualCostSavings,
          annualEnergySavings: [{
            savings: results.annualEnergySavings,
            energyUnit: 'kWh',
            label: 'Electricity'
          }],
          utilityType: ['Electricity'],
          percentSavings: [{
            percent: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.electricityCosts),
            label: 'Electricity'
          }],
          electricityReduction: reduction,
          name: this.getName(reduction.opportunitySheet, index, 'Electricity Reduction #'),
          opportunitySheet: reduction.opportunitySheet,
          iconString: 'assets/images/calculator-icons/utilities-icons/electricity-reduction-icon.png'
        };
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }
  //compressedAirReductions
  getCompressedAirReductions(compressedAirReductions: Array<CompressedAirReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (compressedAirReductions) {
      let index: number = 0;
      compressedAirReductions.forEach(reduction => {
        let cardData: OpportunityCardData = this.getCompressedAirReductionCardData(reduction, settings, currentEnergyUsage, index);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getCompressedAirReductionCardData(reduction: CompressedAirReductionTreasureHunt, settings: Settings, currentEnergyUsage: EnergyUsage, index: number): OpportunityCardData{
    let results: CompressedAirReductionResults = this.compressedAirReductionService.getResults(settings, reduction.baseline, reduction.modification);
    let utilityCost: number = currentEnergyUsage.compressedAirCosts;
    let energyType: string = 'Compressed Air';
    let unitStr: string = 'kSCF'
    //electricity utility
    if (reduction.baseline[0].utilityType == 1) {
      energyType = 'Electricity';
      utilityCost = currentEnergyUsage.electricityCosts;
      unitStr = 'kWh'
    } else if (settings.unitsOfMeasure == 'Metric') {
      unitStr = 'Nm3'
    }
    let cardData: OpportunityCardData = {
      selected: reduction.selected,
      opportunityType: 'compressed-air-reduction',
      opportunityIndex: index,
      annualCostSavings: results.annualCostSavings,
      annualEnergySavings: [{
        savings: results.annualEnergySavings,
        energyUnit: unitStr,
        label: energyType
      }],
      utilityType: [energyType],
      percentSavings: [{
        percent: this.getPercentSavings(results.annualCostSavings, utilityCost),
        label: energyType
      }],
      compressedAirReduction: reduction,
      name: this.getName(reduction.opportunitySheet, index, 'Compressed Air Reduction #'),
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/compressed-air-reduction-icon.png'
    };
    return cardData;
  }

  //compressedAirPressureReductions
  getCompressedAirPressureReductions(compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (compressedAirPressureReductions) {
      let index: number = 0;
      compressedAirPressureReductions.forEach(reduction => {
        let cardData: OpportunityCardData = this.getCompressedAirPressureReductionCardData(reduction, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getCompressedAirPressureReductionCardData(reduction: CompressedAirPressureReductionTreasureHunt, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData{
    let results: CompressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(settings, reduction.baseline, reduction.modification);
    let cardData: OpportunityCardData = {
      selected: reduction.selected,
      opportunityType: 'compressed-air-pressure-reduction',
      opportunityIndex: index,
      annualCostSavings: results.annualCostSavings,
      annualEnergySavings: [{
        savings: results.annualEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.electricityCosts),
        label: 'Electricity'
      }],
      compressedAirPressureReduction: reduction,
      name: this.getName(reduction.opportunitySheet, index, 'Compressed Air Pressure Reduction #'),
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/compressed-air-pressure-reduction-icon.png'
    };
    return cardData;
  }

  //waterReductions
  getWaterReductions(waterReductions: Array<WaterReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (waterReductions) {
      let index: number = 0;
      waterReductions.forEach(reduction => {
        let cardData: OpportunityCardData = this.getWaterReductionCardData(reduction, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getWaterReductionCardData(reduction: WaterReductionTreasureHunt, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData{
    let results: WaterReductionResults = this.waterReductionService.getResults(settings, reduction.baseline, reduction.modification);
    let utilityCost: number = currentEnergyUsage.waterCosts;
    let energyType: string = 'Water';
    let unitStr: string = 'm3';
    if (settings.unitsOfMeasure == 'Imperial') {
      unitStr = 'kgal';
    }
    //electricity utility
    if (reduction.baseline[0].isWastewater == true) {
      energyType = 'Waste Water';
      utilityCost = currentEnergyUsage.wasteWaterCosts;
    }
    let cardData: OpportunityCardData = {
      selected: reduction.selected,
      opportunityType: 'water-reduction',
      opportunityIndex: index,
      annualCostSavings: results.annualCostSavings,
      annualEnergySavings: [{
        savings: results.annualWaterSavings,
        energyUnit: unitStr,
        label: energyType
      }],
      utilityType: [energyType],
      percentSavings: [{
        percent: this.getPercentSavings(results.annualCostSavings, utilityCost),
        label: energyType
      }],
      waterReduction: reduction,
      name: this.getName(reduction.opportunitySheet, index, energyType + ' Reduction #'),
      opportunitySheet: reduction.opportunitySheet,
      iconString: 'assets/images/calculator-icons/utilities-icons/water-reduction-icon.png'
    }
    return cardData;
  }

  getPercentSavings(totalCostSavings: number, totalUtiltyCost: number): number {
    return (totalCostSavings / totalUtiltyCost) * 100;
  }

  getName(opporunitySheet: OpportunitySheet, index: number, defaultName: string): string {
    if (opporunitySheet && opporunitySheet.name) {
      return opporunitySheet.name;
    } else {
      return defaultName + (index + 1);
    }
  }
}




export interface OpportunityCardData {
  selected: boolean;
  opportunityType: string;
  opportunityIndex: number;
  annualCostSavings: number;
  annualEnergySavings: Array<{
    savings: number,
    label: string,
    energyUnit: string
  }>;
  percentSavings: Array<{
    percent: number,
    label: string
  }>;
  utilityType: Array<string>;
  name: string;
  opportunitySheet: OpportunitySheet,
  iconString: string,
  lightingReplacement?: LightingReplacementTreasureHunt;
  opportunitySheets?: OpportunitySheet;
  replaceExistingMotor?: ReplaceExistingMotorTreasureHunt;
  motorDrive?: MotorDriveInputsTreasureHunt;
  naturalGasReduction?: NaturalGasReductionTreasureHunt;
  electricityReduction?: ElectricityReductionTreasureHunt;
  compressedAirReduction?: CompressedAirReductionTreasureHunt;
  compressedAirPressureReduction?: CompressedAirPressureReductionTreasureHunt;
  waterReduction?: WaterReductionTreasureHunt;
}
