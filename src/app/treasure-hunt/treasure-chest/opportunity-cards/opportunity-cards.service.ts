import { Injectable } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, EnergyUsage } from '../../../shared/models/treasure-hunt';
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

@Injectable()
export class OpportunityCardsService {

  constructor(private lightingReplacementService: LightingReplacementService, private replaceExistingService: ReplaceExistingService,
    private motorDriveService: MotorDriveService, private naturalGasReductionService: NaturalGasReductionService,
    private electricityReductionService: ElectricityReductionService, private compressedAirReductionService: CompressedAirReductionService,
    private compressedAirPressureReductionService: CompressedAirPressureReductionService, private waterReductionService: WaterReductionService) { }

  getOpportunityCardsData(treasureHunt: TreasureHunt, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    let lightingReplacementsCardData: Array<OpportunityCardData> = this.getLightingReplacements(treasureHunt.lightingReplacements, treasureHunt.currentEnergyUsage);
    let replaceExistingData: Array<OpportunityCardData> = this.getReplaceExistingMotors(treasureHunt.replaceExistingMotors, treasureHunt.currentEnergyUsage);
    let naturalGasReductionData: Array<OpportunityCardData> = this.getNaturalGasReductions(treasureHunt.naturalGasReductions, treasureHunt.currentEnergyUsage, settings);
    let electricityReductionData: Array<OpportunityCardData> = this.getElectricityReductions(treasureHunt.electricityReductions, treasureHunt.currentEnergyUsage, settings);
    let compressedAirReductionData: Array<OpportunityCardData> = this.getCompressedAirReductions(treasureHunt.compressedAirReductions, treasureHunt.currentEnergyUsage, settings);
    let compressedAirPressureReductionData: Array<OpportunityCardData> = this.getCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, treasureHunt.currentEnergyUsage, settings);
    let waterReductionData: Array<OpportunityCardData> = this.getWaterReductions(treasureHunt.waterReductions, treasureHunt.currentEnergyUsage, settings);
    //TODO Oppsheets
    opportunityCardsData = _.union(lightingReplacementsCardData, replaceExistingData, naturalGasReductionData, electricityReductionData, compressedAirReductionData, compressedAirPressureReductionData, waterReductionData);
    return opportunityCardsData;
  }

  //lightingReplacement;
  getLightingReplacements(lightingReplacements: Array<LightingReplacementTreasureHunt>, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (lightingReplacements) {
      let index: number = 0;
      lightingReplacements.forEach(lightingReplacement => {
        let results: LightingReplacementResults = this.lightingReplacementService.getResults(lightingReplacement);
        let cardData: OpportunityCardData = {
          selected: lightingReplacement.selected,
          opportunityType: 'lighting-replacement',
          opportunityIndex: index,
          annualCostSavings: results.totalCostSavings,
          utilityType: 'Electricity',
          percentSavings: this.getPercentSavings(results.totalCostSavings, currentEnergyUsage.electricityCosts),
          lightingReplacement: lightingReplacement
        }
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }
  //opportunitySheets
  //TODO
  //replaceExistingMotors
  getReplaceExistingMotors(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (replaceExistingMotors) {
      let index: number = 0;
      replaceExistingMotors.forEach(replaceExistingMotor => {
        let results: ReplaceExistingResults = this.replaceExistingService.getResults(replaceExistingMotor.replaceExistingData);
        let cardData: OpportunityCardData = {
          selected: replaceExistingMotor.selected,
          opportunityType: 'replace-existing',
          opportunityIndex: index,
          annualCostSavings: results.costSavings,
          utilityType: 'Electricity',
          percentSavings: this.getPercentSavings(results.costSavings, currentEnergyUsage.electricityCosts),
          replaceExistingMotor: replaceExistingMotor
        };
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }
  //motorDrives
  getMotorDrives(motorDrives: Array<MotorDriveInputsTreasureHunt>, currentEnergyUsage: EnergyUsage): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (motorDrives) {
      let index: number = 0;
      motorDrives.forEach(drive => {
        let results: MotorDriveOutputs = this.motorDriveService.getResults(drive.motorDriveInputs);
        let cardData: OpportunityCardData = {
          selected: drive.selected,
          opportunityType: 'motor-drive',
          opportunityIndex: index,
          annualCostSavings: results.annualCostSavings,
          utilityType: 'Electricity',
          percentSavings: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.electricityCosts),
          motorDrive: drive,
        }
        opportunityCardsData.push(cardData);
        index++;
      });
      return opportunityCardsData;
    }
  }
  //naturalGasReductions
  getNaturalGasReductions(naturalGasReductions: Array<NaturalGasReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (naturalGasReductions) {
      let index: number = 0;
      naturalGasReductions.forEach(naturalGasReduction => {
        let results: NaturalGasReductionResults = this.naturalGasReductionService.getResults(settings, naturalGasReduction.baseline, naturalGasReduction.modification);
        let cardData: OpportunityCardData = {
          selected: naturalGasReduction.selected,
          opportunityType: 'natural-gas-reduction',
          opportunityIndex: index,
          annualCostSavings: results.annualCostSavings,
          percentSavings: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.naturalGasCosts),
          utilityType: 'Natural Gas',
          naturalGasReduction: naturalGasReduction
        }
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
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
          percentSavings: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.electricityCosts),
          utilityType: 'Electricity',
          electricityReduction: reduction
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
        let results: CompressedAirReductionResults = this.compressedAirReductionService.getResults(settings, reduction.baseline, reduction.modification);
        let utilityCost: number = currentEnergyUsage.compressedAirCosts;
        let energyType: string = 'Compressed Air';
        //electricity utility
        if (reduction.baseline[0].utilityType == 1) {
          energyType = 'Electricity';
          utilityCost = currentEnergyUsage.electricityCosts;
        }
        let cardData: OpportunityCardData = {
          selected: reduction.selected,
          opportunityType: 'compressed-air-reduction',
          opportunityIndex: index,
          annualCostSavings: results.annualCostSavings,
          percentSavings: this.getPercentSavings(results.annualCostSavings, utilityCost),
          utilityType: energyType,
          compressedAirReduction: reduction
        };
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }
  //compressedAirPressureReductions
  getCompressedAirPressureReductions(compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (compressedAirPressureReductions) {
      let index: number = 0;
      compressedAirPressureReductions.forEach(reduction => {
        let results: CompressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(settings, reduction.baseline, reduction.modification);

        let cardData: OpportunityCardData = {
          selected: reduction.selected,
          opportunityType: 'compressed-air-reduction',
          opportunityIndex: index,
          annualCostSavings: results.annualCostSavings,
          percentSavings: this.getPercentSavings(results.annualCostSavings, currentEnergyUsage.electricityCosts),
          utilityType: 'Electricity',
          compressedAirPressureReduction: reduction
        };
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }
  //waterReductions
  getWaterReductions(waterReductions: Array<WaterReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (waterReductions) {
      let index: number = 0;
      waterReductions.forEach(reduction => {
        let results: WaterReductionResults = this.waterReductionService.getResults(settings, reduction.baseline, reduction.modification);
        let utilityCost: number = currentEnergyUsage.waterCosts;
        let energyType: string = 'Water';
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
          percentSavings: this.getPercentSavings(results.annualCostSavings, utilityCost),
          utilityType: energyType,
          waterReduction: reduction
        }
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getPercentSavings(totalCostSavings: number, totalUtiltyCost: number): number {
    return (totalCostSavings / totalUtiltyCost) * 100;
  }
}




export interface OpportunityCardData {
  selected: boolean;
  opportunityType: string;
  opportunityIndex: number;
  annualCostSavings: number;
  percentSavings: number;
  utilityType: string;
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
