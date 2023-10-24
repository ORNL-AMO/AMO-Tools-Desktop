import { Injectable } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, EnergyUsage, OpportunitySheetResults, OpportunitySummary, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt, WallLossTreasureHunt, EnergySourceData, FlueGasTreasureHunt, LeakageLossTreasureHunt, OpeningLossTreasureHunt, WasteHeatTreasureHunt, HeatCascadingTreasureHunt, WaterHeatingTreasureHunt, AirHeatingTreasureHunt, CoolingTowerMakeupWaterTreasureHunt, ChillerStagingTreasureHunt, ChillerPerformanceTreasureHunt, CoolingTowerFanTreasureHunt, CoolingTowerBasinTreasureHunt, BoilerBlowdownRateTreasureHunt } from '../../../shared/models/treasure-hunt';
import *  as _ from 'lodash';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OpportunitySheetService } from '../../calculators/standalone-opportunity-sheet/opportunity-sheet.service';
import { BehaviorSubject } from 'rxjs';
import { OpportunitySummaryService } from '../../treasure-hunt-report/opportunity-summary.service';
import { AirLeakTreasureHuntService } from '../../treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { FlueGasTreasureHuntService } from '../../treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from '../../treasure-hunt-calculator-services/lighting-replacement-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from '../../treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from '../../treasure-hunt-calculator-services/pipe-insulation-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from '../../treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { SteamReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from '../../treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { WallTreasureHuntService } from '../../treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { LeakageTreasureHuntService } from '../../treasure-hunt-calculator-services/leakage-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from '../../treasure-hunt-calculator-services/waste-heat-treasure-hunt.service';
import { OpeningTreasureHuntService } from '../../treasure-hunt-calculator-services/opening-treasure-hunt.service';
import { AirHeatingTreasureHuntService } from '../../treasure-hunt-calculator-services/air-heating-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from '../../treasure-hunt-calculator-services/heat-cascading-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from '../../treasure-hunt-calculator-services/water-heating-treasure-hunt.service';
import { CoolingTowerMakeupTreasureHuntService } from '../../treasure-hunt-calculator-services/cooling-tower-makeup-treasure-hunt.service';
import { ChillerStagingTreasureHuntService } from '../../treasure-hunt-calculator-services/chiller-staging-treasure-hunt.service';
import { ChillerPerformanceTreasureHuntService } from '../../treasure-hunt-calculator-services/chiller-performance-treasure-hunt.service';
import { CoolingTowerFanTreasureHuntService } from '../../treasure-hunt-calculator-services/cooling-tower-fan-treasure-hunt.service';
import { CoolingTowerBasinTreasureHuntService } from '../../treasure-hunt-calculator-services/cooling-tower-basin-treasure-hunt.service';
import { BoilerBlowdownRateTreasureHuntService } from '../../treasure-hunt-calculator-services/boiler-blowdown-rate-treasure-hunt.service';

@Injectable()
export class OpportunityCardsService {

  updatedOpportunityCard: BehaviorSubject<OpportunityCardData>;
  opportunityCards: BehaviorSubject<Array<OpportunityCardData>>;
  updateOpportunityCards: BehaviorSubject<boolean>;
  currCurrency: string = "$"; 
  constructor(private opportunitySheetService: OpportunitySheetService, 
    private opportunitySummaryService: OpportunitySummaryService,
    private airLeakTreasureService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private lightingTreasureHuntService: LightingReplacementTreasureHuntService,
    private replaceExistingTreasureService: ReplaceExistingTreasureHuntService,
    private motorDriveTreasureHuntService: MotorDriveTreasureHuntService,
    private naturalGasTreasureHuntService: NaturalGasReductionTreasureHuntService,
    private electricityReductionTreasureHuntService: ElectricityReductionTreasureHuntService,
    private compressedAirTreasureHuntService: CaReductionTreasureHuntService,
    private compressedAirPressureTreasureHuntService: CaPressureReductionTreasureHuntService,
    private waterReductionTreasureHuntService: WaterReductionTreasureHuntService,
    private steamReductionTreasureHuntService: SteamReductionTreasureHuntService,
    private pipeInsulationTreasureHuntService: PipeInsulationTreasureHuntService,
    private wasteHeatTreasureHuntService: WasteHeatTreasureHuntService,
    private airHeatingTreasureHuntService: AirHeatingTreasureHuntService,
    private openingTreasureService: OpeningTreasureHuntService,
    private wallLossTreasureHuntService: WallTreasureHuntService,
    private leakageLossTreasureService: LeakageTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService,
    private convertUnitsService: ConvertUnitsService,
    private heatCascadingTreasureHuntService: HeatCascadingTreasureHuntService,
    private waterHeatingTreasureHuntService: WaterHeatingTreasureHuntService,
    private coolingTowerMakeupTreasureHuntService: CoolingTowerMakeupTreasureHuntService,
    private chillerStagingTreasureHuntService: ChillerStagingTreasureHuntService,
    private chillerPerformanceTreasureHuntService : ChillerPerformanceTreasureHuntService,
    private coolingTowerFanTreasureHuntService: CoolingTowerFanTreasureHuntService,
    private coolingTowerBasinTreasureHuntService: CoolingTowerBasinTreasureHuntService,
    private boilerBlowdownRateTreasureHuntService: BoilerBlowdownRateTreasureHuntService
    ) {
    this.updatedOpportunityCard = new BehaviorSubject<OpportunityCardData>(undefined);
    this.opportunityCards = new BehaviorSubject(new Array());
    this.updateOpportunityCards = new BehaviorSubject<boolean>(true);
  }

  getOpportunityCardsData(treasureHunt: TreasureHunt, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    let lightingReplacementsCardData: Array<OpportunityCardData> = this.getLightingReplacements(treasureHunt.lightingReplacements, treasureHunt.currentEnergyUsage, settings);
    let motorDrivesCardData: Array<OpportunityCardData> = this.getMotorDrives(treasureHunt.motorDrives, treasureHunt.currentEnergyUsage, settings);
    let replaceExistingData: Array<OpportunityCardData> = this.getReplaceExistingMotors(treasureHunt.replaceExistingMotors, treasureHunt.currentEnergyUsage, settings);
    let naturalGasReductionData: Array<OpportunityCardData> = this.getNaturalGasReductions(treasureHunt.naturalGasReductions, treasureHunt.currentEnergyUsage, settings);
    let electricityReductionData: Array<OpportunityCardData> = this.getElectricityReductions(treasureHunt.electricityReductions, treasureHunt.currentEnergyUsage, settings);
    let compressedAirReductionData: Array<OpportunityCardData> = this.getCompressedAirReductions(treasureHunt.compressedAirReductions, treasureHunt.currentEnergyUsage, settings);
    let compressedAirPressureReductionData: Array<OpportunityCardData> = this.getCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, treasureHunt.currentEnergyUsage, settings);
    let waterReductionData: Array<OpportunityCardData> = this.getWaterReductions(treasureHunt.waterReductions, treasureHunt.currentEnergyUsage, settings);
    let standaloneOpportunitySheetData: Array<OpportunityCardData> = this.getStandaloneOpportunitySheets(treasureHunt.opportunitySheets, treasureHunt.currentEnergyUsage, settings)
    let steamReductionData: Array<OpportunityCardData> = this.getSteamReductions(treasureHunt.steamReductions, treasureHunt.currentEnergyUsage, settings);
    let pipeInsulationReductionData: Array<OpportunityCardData> = this.getPipeInsulationReductions(treasureHunt.pipeInsulationReductions, treasureHunt.currentEnergyUsage, settings);
    let tankInsulationReductionData: Array<OpportunityCardData> = this.getTankInsulationReductions(treasureHunt.tankInsulationReductions, treasureHunt.currentEnergyUsage, settings);
    let airLeakSurveyData: Array<OpportunityCardData> = this.getAirLeakSurveys(treasureHunt.airLeakSurveys, treasureHunt.currentEnergyUsage, settings);
    let openingLossData: Array<OpportunityCardData> = this.getOpeningLosses(treasureHunt.openingLosses, treasureHunt.currentEnergyUsage, settings);
    let wallLossData: Array<OpportunityCardData> = this.getWallLosses(treasureHunt.wallLosses, treasureHunt.currentEnergyUsage, settings);
    let wasteHeatData: Array<OpportunityCardData> = this.getWasteHeatReductions(treasureHunt.wasteHeatReductions, treasureHunt.currentEnergyUsage, settings);
    let airHeatingData: Array<OpportunityCardData> = this.getAirHeatingOpportunities(treasureHunt.airHeatingOpportunities, treasureHunt.currentEnergyUsage, settings);
    let heatCascadingData: Array<OpportunityCardData> = this.getHeatCascadingOpportunities(treasureHunt.heatCascadingOpportunities, treasureHunt.currentEnergyUsage, settings);
    let waterHeatingData: Array<OpportunityCardData> = this.getWaterHeatingOpportunities(treasureHunt.waterHeatingOpportunities, treasureHunt.currentEnergyUsage, settings);
    let leakageLossData: Array<OpportunityCardData> = this.getLeakageLosses(treasureHunt.leakageLosses, treasureHunt.currentEnergyUsage, settings);
    let flueGasData: Array<OpportunityCardData> = this.getFlueGasLosses(treasureHunt.flueGasLosses, treasureHunt.currentEnergyUsage, settings);
    let coolingTowerMakeupData: Array<OpportunityCardData> = this.getCoolingTowerMakeupOpportunities(treasureHunt.coolingTowerMakeupOpportunities, treasureHunt.currentEnergyUsage, settings);
    let chillerStaging: Array<OpportunityCardData> = this.getChillerStagingOpportunities(treasureHunt.chillerStagingOpportunities, treasureHunt.currentEnergyUsage, settings);
    let chillerPerformance: Array<OpportunityCardData> = this.getChillerPerformanceOpportunities(treasureHunt.chillerPerformanceOpportunities, treasureHunt.currentEnergyUsage, settings);
    let coolingTowerFan: Array<OpportunityCardData> = this.getCoolingTowerFanOpportunities(treasureHunt.coolingTowerFanOpportunities, treasureHunt.currentEnergyUsage, settings);
    let coolingTowerBasin: Array<OpportunityCardData> = this.getCoolingTowerBasinOpportunities(treasureHunt.coolingTowerBasinOpportunities, treasureHunt.currentEnergyUsage, settings);
    let boilerBlowdownRate: Array<OpportunityCardData> = this.getBoilerBlowdownRateOpportunities(treasureHunt.boilerBlowdownRateOpportunities, treasureHunt.currentEnergyUsage, settings);

    opportunityCardsData = _.union(
      lightingReplacementsCardData, 
      replaceExistingData, 
      naturalGasReductionData, 
      electricityReductionData, 
      compressedAirReductionData, 
      compressedAirPressureReductionData, 
      waterReductionData, 
      standaloneOpportunitySheetData, 
      steamReductionData, 
      motorDrivesCardData, 
      pipeInsulationReductionData, 
      tankInsulationReductionData, 
      airLeakSurveyData,
      openingLossData,
      wallLossData,
      airHeatingData,
      leakageLossData,
      wasteHeatData,
      heatCascadingData,
      waterHeatingData,
      flueGasData,
      coolingTowerMakeupData,
      chillerStaging,
      chillerPerformance,
      coolingTowerFan,
      coolingTowerBasin,
      boilerBlowdownRate
      );
    let index: number = 0;
    opportunityCardsData.forEach(card => {
      card.index = index;
      index++;
      if (this.currCurrency !== settings.currency) {
        card.annualCostSavings = this.convertUnitsService.convertValue(card.annualCostSavings, this.currCurrency, settings.currency);
        card.implementationCost = this.convertUnitsService.convertValue(card.implementationCost, this.currCurrency, settings.currency);
        card.percentSavings.forEach(saving => {
          saving.baselineCost = this.convertUnitsService.convertValue(saving.baselineCost, this.currCurrency, settings.currency);
          saving.modificationCost = this.convertUnitsService.convertValue(saving.modificationCost, this.currCurrency, settings.currency);
        }); 
      }
    });
    // this.currCurrency = settings.currency;
    // this.opportunityCards.next(opportunityCardsData);

    return opportunityCardsData;
  }

  //lightingReplacement;
  getLightingReplacements(lightingReplacements: Array<LightingReplacementTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (lightingReplacements) {
      let index: number = 0;
      lightingReplacements.forEach(lightingReplacement => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(lightingReplacement, settings);
        let cardData: OpportunityCardData = this.lightingTreasureHuntService.getLightingReplacementCardData(lightingReplacement, opportunitySummary, index, currentEnergyUsage, settings);
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }

  //opportunitySheets
  getStandaloneOpportunitySheets(opportunitySheets: Array<OpportunitySheet>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (opportunitySheets) {
      let index: number = 0;
      opportunitySheets.forEach(oppSheet => {
        let cardData: OpportunityCardData = this.getOpportunitySheetCardData(oppSheet, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }

  getOpportunitySheetCardData(oppSheet: OpportunitySheet, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
    let results: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
    let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getOpportunitySheetSummary(oppSheet, settings);
    let energyData = this.getOpportunitySheetEnergySavings(results, currentEnergyUsage, settings);
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: oppSheet.selected,
      opportunityType: 'opportunity-sheet',
      opportunityIndex: index,
      annualCostSavings: results.totalCostSavings,
      annualEnergySavings: energyData.annualEnergySavings,
      percentSavings: energyData.percentSavings,
      opportunitySheet: oppSheet,
      name: opportunitySummary.opportunityName,
      iconString: 'assets/images/calculator-icons/opportunity-sheet-icon.png',
      utilityType: energyData.utilityTypes,
      teamName: this.getTeamName(oppSheet)
    }
    return cardData;
  }

  getOpportunitySheetEnergySavings(results: OpportunitySheetResults, currentEnergyUsage: EnergyUsage, settings: Settings): {
    annualEnergySavings: Array<{
      savings: number,
      label: string,
      energyUnit: string
    }>,
    percentSavings: Array<{ percent: number, label: string, baselineCost: number, modificationCost: number }>,
    utilityTypes: Array<string>
  } {
    let annualEnergySavings: Array<{ savings: number, label: string, energyUnit: string }> = new Array();
    let percentSavings: Array<{ percent: number, label: string, baselineCost: number, modificationCost: number }> = new Array();
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
          label: 'Electricity',
          baselineCost: results.electricityResults.baselineEnergyCost,
          modificationCost: results.electricityResults.modificationEnergyCost
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
          label: 'Natural Gas',
          baselineCost: results.gasResults.baselineEnergyCost,
          modificationCost: results.gasResults.modificationEnergyCost
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
          label: 'Compressed Air',
          baselineCost: results.compressedAirResults.baselineEnergyCost,
          modificationCost: results.compressedAirResults.modificationEnergyCost
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
          label: 'Other Fuel',
          baselineCost: results.otherFuelResults.baselineEnergyCost,
          modificationCost: results.otherFuelResults.modificationEnergyCost
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
          label: 'Steam',
          baselineCost: results.steamResults.baselineEnergyCost,
          modificationCost: results.steamResults.modificationEnergyCost
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
          label: 'Water',
          baselineCost: results.waterResults.baselineEnergyCost,
          modificationCost: results.waterResults.modificationEnergyCost
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
          label: 'Waste Water',
          baselineCost: results.wasteWaterResults.baselineEnergyCost,
          modificationCost: results.wasteWaterResults.modificationEnergyCost
        }
      )
      utilityTypes.push('Waste Water');
    };

    return { annualEnergySavings: annualEnergySavings, percentSavings: percentSavings, utilityTypes: utilityTypes }
  }

  
  getPercentSavings(totalCostSavings: number, totalUtiltyCost: number): number {
    return (totalCostSavings / totalUtiltyCost) * 100;
  }

  getTeamName(opportunitySheet: OpportunitySheet): string {
    if (opportunitySheet) {
      return opportunitySheet.owner;
    } else {
      return undefined;
    }
  }

  //replaceExistingMotors
  getReplaceExistingMotors(replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (replaceExistingMotors) {
      let index: number = 0;
      replaceExistingMotors.forEach(replaceExistingMotor => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(replaceExistingMotor, settings);
        let cardData: OpportunityCardData = this.replaceExistingTreasureService.getReplaceExistingCardData(replaceExistingMotor, opportunitySummary, index, currentEnergyUsage, settings);
        opportunityCardsData.push(cardData);
        index++;
      })
    }
    return opportunityCardsData;
  }

  //motorDrives
  getMotorDrives(motorDrives: Array<MotorDriveInputsTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (motorDrives) {
      let index: number = 0;
      motorDrives.forEach(drive => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(drive, settings);
        let cardData: OpportunityCardData = this.motorDriveTreasureHuntService.getMotorDriveCard(drive, opportunitySummary, index, currentEnergyUsage, settings);
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
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(naturalGasReduction, settings);
        let cardData: OpportunityCardData = this.naturalGasTreasureHuntService.getNaturalGasReductionCard(naturalGasReduction, opportunitySummary, index, currentEnergyUsage, settings);
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
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.electricityReductionTreasureHuntService.getElectricityReductionCard(reduction, opportunitySummary, settings, index, currentEnergyUsage);
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
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.compressedAirTreasureHuntService.getCompressedAirReductionCardData(reduction, opportunitySummary, settings, currentEnergyUsage, index);
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
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.compressedAirPressureTreasureHuntService.getCompressedAirPressureReductionCardData(reduction, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getCoolingTowerMakeupOpportunities(coolingTowerMakeupOpportunities: Array<CoolingTowerMakeupWaterTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData>{
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (coolingTowerMakeupOpportunities) {
      let index: number = 0;
      coolingTowerMakeupOpportunities.forEach(coolingWaterMakeup => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(coolingWaterMakeup, settings);
        let cardData: OpportunityCardData = this.coolingTowerMakeupTreasureHuntService.getCoolingTowerMakeupCardData(coolingWaterMakeup, opportunitySummary, settings, index, currentEnergyUsage);
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
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.waterReductionTreasureHuntService.getWaterReductionCardData(reduction, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  //steamReductions
  getSteamReductions(steamReductions: Array<SteamReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (steamReductions) {
      let index: number = 0;
      steamReductions.forEach(reduction => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.steamReductionTreasureHuntService.getSteamReductionCardData(reduction, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }


  //pipeInsulationReductions
  getPipeInsulationReductions(pipeInsulationReductions: Array<PipeInsulationReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (pipeInsulationReductions) {
      let index: number = 0;
      pipeInsulationReductions.forEach(reduction => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.pipeInsulationTreasureHuntService.getPipeInsulationReductionCardData(reduction, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  //tankInsulationReductions
  getTankInsulationReductions(tankInsulationReductions: Array<TankInsulationReductionTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (tankInsulationReductions) {
      let index: number = 0;
      tankInsulationReductions.forEach(reduction => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(reduction, settings);
        let cardData: OpportunityCardData = this.tankInsulationTreasureHuntService.getTankInsulationReductionCardData(reduction, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }


  // //airLeakSurvey
  getAirLeakSurveys(airLeakSurveys: Array<AirLeakSurveyTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (airLeakSurveys) {
      let index: number = 0;
      airLeakSurveys.forEach(airLeakSurvey => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(airLeakSurvey, settings);
        let cardData: OpportunityCardData = this.airLeakTreasureService.getAirLeakSurveyCardData(airLeakSurvey, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getOpeningLosses(openingLosses: Array<OpeningLossTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (openingLosses) {
      let index: number = 0;
      openingLosses.forEach(openingLoss => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(openingLoss, settings);
        let cardData: OpportunityCardData = this.openingTreasureService.getOpeningLossCardData(openingLoss, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }
  getWallLosses(wallLosses: Array<WallLossTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (wallLosses) {
      let index: number = 0;
      wallLosses.forEach(wallLoss => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(wallLoss, settings);
        let cardData: OpportunityCardData = this.wallLossTreasureHuntService.getWallLossCardData(wallLoss, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getLeakageLosses(leakageLosses: Array<LeakageLossTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (leakageLosses) {
      let index: number = 0;
      leakageLosses.forEach(leakageLoss => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(leakageLoss, settings);
        let cardData: OpportunityCardData = this.leakageLossTreasureService.getLeakageLossCardData(leakageLoss, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }
 
  getFlueGasLosses(flueGasLosses: Array<FlueGasTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (flueGasLosses) {
      let index: number = 0;
      flueGasLosses.forEach(flueGas => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(flueGas, settings);
        let cardData: OpportunityCardData = this.flueGasTreasureHuntService.getFlueGasCardData(flueGas, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getAirHeatingOpportunities(airHeatingOpportunities: Array<AirHeatingTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (airHeatingOpportunities) {
      let index: number = 0;
      airHeatingOpportunities.forEach(airHeating => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(airHeating, settings);
        let cardData: OpportunityCardData = this.airHeatingTreasureHuntService.getAirHeatingOpportunityCardData(airHeating, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getWasteHeatReductions(wasteHeatReductions: Array<WasteHeatTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (wasteHeatReductions) {
      let index: number = 0;
      wasteHeatReductions.forEach(wasteHeat => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(wasteHeat, settings);
        let cardData: OpportunityCardData = this.wasteHeatTreasureHuntService.getWasteHeatCardData(wasteHeat, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getHeatCascadingOpportunities(heatCascadingOpportunities: Array<HeatCascadingTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (heatCascadingOpportunities) {
      let index: number = 0;
      heatCascadingOpportunities.forEach(heatCascading => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(heatCascading, settings);
        let cardData: OpportunityCardData = this.heatCascadingTreasureHuntService.getHeatCascadingOpportunityCardData(heatCascading, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getWaterHeatingOpportunities(waterHeatingOpportunities: Array<WaterHeatingTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (waterHeatingOpportunities) {
      let index: number = 0;
      waterHeatingOpportunities.forEach(waterHeating => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(waterHeating, settings);
        let cardData: OpportunityCardData = this.waterHeatingTreasureHuntService.getWaterHeatingOpportunityCardData(waterHeating, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getChillerStagingOpportunities(chillerStagingOpportunities: Array<ChillerStagingTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (chillerStagingOpportunities) {
      let index: number = 0;
      chillerStagingOpportunities.forEach(chillerStaging => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(chillerStaging, settings);
        let cardData: OpportunityCardData = this.chillerStagingTreasureHuntService.getChillerStagingCardData(chillerStaging, opportunitySummary, index, currentEnergyUsage, settings);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getChillerPerformanceOpportunities(chillerPerformanceOpportunities: Array<ChillerPerformanceTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (chillerPerformanceOpportunities) {
      let index: number = 0;
      chillerPerformanceOpportunities.forEach(chillerPerformance => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(chillerPerformance, settings);
        let cardData: OpportunityCardData = this.chillerPerformanceTreasureHuntService.getChillerPerformanceCardData(chillerPerformance, opportunitySummary, index, currentEnergyUsage, settings);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getCoolingTowerFanOpportunities(coolingTowerFanOpportunities: Array<CoolingTowerFanTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (coolingTowerFanOpportunities) {
      let index: number = 0;
      coolingTowerFanOpportunities.forEach(coolingTowerFan => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(coolingTowerFan, settings);
        let cardData: OpportunityCardData = this.coolingTowerFanTreasureHuntService.getCoolingTowerFanCardData(coolingTowerFan, opportunitySummary, index, currentEnergyUsage, settings);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getCoolingTowerBasinOpportunities(coolingTowerBasinOpportunities: Array<CoolingTowerBasinTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (coolingTowerBasinOpportunities) {
      let index: number = 0;
      coolingTowerBasinOpportunities.forEach(coolingTowerBasin => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(coolingTowerBasin, settings);
        let cardData: OpportunityCardData = this.coolingTowerBasinTreasureHuntService.getCoolingTowerBasinCardData(coolingTowerBasin, opportunitySummary, index, currentEnergyUsage, settings);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

  getBoilerBlowdownRateOpportunities(boilerBlowdownRateOpportunities: Array<BoilerBlowdownRateTreasureHunt>, currentEnergyUsage: EnergyUsage, settings: Settings): Array<OpportunityCardData> {
    let opportunityCardsData: Array<OpportunityCardData> = new Array();
    if (boilerBlowdownRateOpportunities) {
      let index: number = 0;
      boilerBlowdownRateOpportunities.forEach(boilerBlowdownRate => {
        let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(boilerBlowdownRate, settings);
        let cardData: OpportunityCardData = this.boilerBlowdownRateTreasureHuntService.getBoilerBlowdownRateCardData(boilerBlowdownRate, opportunitySummary, settings, index, currentEnergyUsage);
        opportunityCardsData.push(cardData);
        index++;
      });
    }
    return opportunityCardsData;
  }

}


export interface OpportunityCardData {
  index?: number,
  teamName: string;
  paybackPeriod: number;
  selected: boolean;
  opportunityType: string;
  opportunityIndex: number;
  annualCostSavings: number;
  implementationCost: number;
  annualEnergySavings: Array<{
    savings: number,
    label: string,
    energyUnit: string
  }>;
  percentSavings: Array<{
    percent: number,
    label: string,
    baselineCost: number,
    modificationCost: number,
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
  steamReduction?: SteamReductionTreasureHunt;
  pipeInsulationReduction?: PipeInsulationReductionTreasureHunt;
  tankInsulationReduction?: TankInsulationReductionTreasureHunt;
  airLeakSurvey?: AirLeakSurveyTreasureHunt;
  wasteHeat?: WasteHeatTreasureHunt;
  airHeating?: AirHeatingTreasureHunt;
  openingLoss?: OpeningLossTreasureHunt;
  wallLoss?: WallLossTreasureHunt;
  leakageLoss?: LeakageLossTreasureHunt;
  flueGas?: FlueGasTreasureHunt;
  heatCascading?: HeatCascadingTreasureHunt;
  waterHeating?: WaterHeatingTreasureHunt;
  coolingTowerMakeup?: CoolingTowerMakeupWaterTreasureHunt;
  chillerStaging?: ChillerStagingTreasureHunt;
  chillerPerformance?: ChillerPerformanceTreasureHunt;
  coolingTowerFan?: CoolingTowerFanTreasureHunt;
  coolingTowerBasin?: CoolingTowerBasinTreasureHunt;
  boilerBlowdownRate?: BoilerBlowdownRateTreasureHunt;
  iconCalcType?: string;
  needBackground?: boolean;
}
