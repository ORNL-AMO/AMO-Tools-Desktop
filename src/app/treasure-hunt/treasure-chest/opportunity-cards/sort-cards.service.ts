
import { Injectable } from '@angular/core';
import { OpportunityCardData, OpportunityCardsService } from './opportunity-cards.service';
import { SortCardsData } from './sort-cards-by.pipe';
import * as _ from 'lodash';
import {
  TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt,
  CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt, FlueGasTreasureHunt, WallLossTreasureHunt, OpportunitySummary, Treasure, LeakageLossTreasureHunt, OpeningLossTreasureHunt, WasteHeatTreasureHunt, HeatCascadingTreasureHunt, WaterHeatingTreasureHunt, AirHeatingTreasureHunt, CoolingTowerMakeupWaterTreasureHunt
} from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';

import { OpportunitySummaryService } from '../../treasure-hunt-report/opportunity-summary.service';
import { AirLeakTreasureHuntService } from '../../treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from '../../treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { FlueGasTreasureHuntService } from '../../treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from '../../treasure-hunt-calculator-services/lighting-replacement-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from '../../treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from '../../treasure-hunt-calculator-services/pipe-insulation-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from '../../treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { StandaloneOpportunitySheetService } from '../../treasure-hunt-calculator-services/standalone-opportunity-sheet.service';
import { SteamReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { WallTreasureHuntService } from '../../treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from '../../treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { LeakageTreasureHuntService } from '../../treasure-hunt-calculator-services/leakage-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from '../../treasure-hunt-calculator-services/waste-heat-treasure-hunt.service';
import { OpeningTreasureHuntService } from '../../treasure-hunt-calculator-services/opening-treasure-hunt.service';
import { AirHeatingTreasureHuntService } from '../../treasure-hunt-calculator-services/air-heating-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from '../../treasure-hunt-calculator-services/heat-cascading-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from '../../treasure-hunt-calculator-services/water-heating-treasure-hunt.service';
import { CoolingTowerMakeupTreasureHuntService } from '../../treasure-hunt-calculator-services/cooling-tower-makeup-treasure-hunt.service';

@Injectable()
export class SortCardsService {

  constructor(private opportunityCardsService: OpportunityCardsService,
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
    private standaloneOpportunitySheetService: StandaloneOpportunitySheetService,
    private leakageTreasureHuntService: LeakageTreasureHuntService,
    private wallLossTreasureHuntService: WallTreasureHuntService,
    private airHeatingTreasureHuntService: AirHeatingTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService,
    private wasteHeatTreasureHuntService: WasteHeatTreasureHuntService,
    private openingTreasureHuntService: OpeningTreasureHuntService,
    private heatCascadingTreasureHuntService: HeatCascadingTreasureHuntService,
    private waterHeatingTreasureHuntService: WaterHeatingTreasureHuntService,
    private coolingTowerMakeupTreasureHuntService: CoolingTowerMakeupTreasureHuntService,
    ) { }

  sortCards(value: Array<OpportunityCardData>, sortByData: SortCardsData): Array<OpportunityCardData> {
    if (sortByData.utilityTypes.length != 0) {
      let utilityValues: Array<string> = _.map(sortByData.utilityTypes, (utility) => { return utility.value });
      value = _.filter(value, (item: OpportunityCardData) => {
        let intersection = _.intersection(utilityValues, item.utilityType);
        return intersection.length != 0;
      });
    }
    if (sortByData.calculatorTypes.length != 0) {
      let calcValues: Array<string> = _.map(sortByData.calculatorTypes, (calc) => { return calc.value });
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(calcValues, item.opportunityType) });
    }
    if (sortByData.teams.length != 0) {
      let teamValues: Array<string> = _.map(sortByData.teams, (team) => { return team.value });
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(teamValues, item.teamName) });
    }
    if (sortByData.equipments.length != 0) {
      value = _.filter(value, (item: OpportunityCardData) => {
        if (item.opportunitySheet) {
          let equipmentValues: Array<string> = _.map(sortByData.equipments, (equipment) => { return equipment.value });
          return _.includes(equipmentValues, item.opportunitySheet.equipment);
        } else {
          return false;
        }
      });
    }
    let direction: string = 'desc';
    if (sortByData.sortBy == 'teamName' || sortByData.sortBy == 'name') {
      direction = 'asc';
    }
    value = _.orderBy(value, [sortByData.sortBy], direction);
    return value;
  }

  sortTreasureHunt(treasureHunt: TreasureHunt, sortBy: SortCardsData, settings: Settings): TreasureHunt {
    let calculatorTypes: Array<string> = _.map(sortBy.calculatorTypes, (calc) => { return calc.value });

    let allCalcTypes = calculatorTypes.length == 0;
    let hasLightingReplacement = calculatorTypes.includes(Treasure.lightingReplacement);
    let hasOppSheet: boolean = calculatorTypes.includes(Treasure.opportunitySheet);
    let hasReplaceExisting: boolean = calculatorTypes.includes(Treasure.replaceExisting);
    let hasMotorDrive: boolean = calculatorTypes.includes(Treasure.motorDrive);
    let hasNaturalGasReduction: boolean = calculatorTypes.includes(Treasure.naturalGasReduction);
    let hasElectricityReduction: boolean = calculatorTypes.includes(Treasure.electricityReduction);
    let hasCompAirReduction: boolean = calculatorTypes.includes(Treasure.compressedAir);
    let hasCompAirPressureReduction: boolean = calculatorTypes.includes(Treasure.compressedAirPressure);
    let hasWaterReduction: boolean = calculatorTypes.includes(Treasure.waterReduction);
    let hasSteamReduction: boolean = calculatorTypes.includes(Treasure.steamReduction);
    let hasPipeInsulationReduction: boolean = calculatorTypes.includes(Treasure.pipeInsulation);
    let hasTankInsulationReduction: boolean = calculatorTypes.includes(Treasure.tankInsulation);
    let hasAirLeakSurvey: boolean = calculatorTypes.includes(Treasure.airLeak);
    let hasWallLoss: boolean = calculatorTypes.includes(Treasure.wallLoss);
    let hasFlueGas: boolean = calculatorTypes.includes(Treasure.flueGas);
    let hasWasteHeat: boolean = calculatorTypes.includes(Treasure.wasteHeat);
    let hasAirHeating: boolean = calculatorTypes.includes(Treasure.airHeating);
    let hasLeakageLoss: boolean = calculatorTypes.includes(Treasure.leakageLoss);
    let hasOpeningLoss: boolean = calculatorTypes.includes(Treasure.openingLoss);
    let hasHeatCascading: boolean = calculatorTypes.includes(Treasure.heatCascading);
    let hasWaterHeating: boolean = calculatorTypes.includes(Treasure.waterHeating);
    let hasMakeupWater: boolean = calculatorTypes.includes(Treasure.coolingTowerMakeup);

    let lightingReplacements: Array<LightingReplacementTreasureHunt> = [];
    if (allCalcTypes || hasLightingReplacement) {
      if (treasureHunt.lightingReplacements && treasureHunt.lightingReplacements.length != 0) {
        lightingReplacements = this.sortLightingReplacements(treasureHunt.lightingReplacements, sortBy, treasureHunt, settings);
      }
    }
    let opportunitySheets: Array<OpportunitySheet> = [];
    if (allCalcTypes || hasOppSheet) {
      if (treasureHunt.opportunitySheets && treasureHunt.opportunitySheets.length != 0) {
        opportunitySheets = this.sortOpportunitySheets(treasureHunt.opportunitySheets, sortBy, treasureHunt, settings);
      }
    }
    let replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt> = [];
    if (allCalcTypes || hasReplaceExisting) {
      if (treasureHunt.replaceExistingMotors && treasureHunt.replaceExistingMotors.length != 0) {
        replaceExistingMotors = this.sortReplaceExisting(treasureHunt.replaceExistingMotors, sortBy, treasureHunt, settings);
      }
    }
    let motorDrives: Array<MotorDriveInputsTreasureHunt> = [];
    if (allCalcTypes || hasMotorDrive) {
      if (treasureHunt.motorDrives && treasureHunt.motorDrives.length != 0) {
        motorDrives = this.sortMotorDrives(treasureHunt.motorDrives, sortBy, treasureHunt, settings);
      }
    }
    let naturalGasReductions: Array<NaturalGasReductionTreasureHunt> = [];
    if (allCalcTypes || hasNaturalGasReduction) {
      if (treasureHunt.naturalGasReductions && treasureHunt.naturalGasReductions.length != 0) {
        naturalGasReductions = this.sortNaturalGasReductions(treasureHunt.naturalGasReductions, sortBy, treasureHunt, settings);
      }
    }
    let electricityReductions: Array<ElectricityReductionTreasureHunt> = [];
    if (allCalcTypes || hasElectricityReduction) {
      if (treasureHunt.electricityReductions && treasureHunt.electricityReductions.length != 0) {
        electricityReductions = this.sortElectricityReductions(treasureHunt.electricityReductions, sortBy, treasureHunt, settings);
      }
    }
    let compressedAirReductions: Array<CompressedAirReductionTreasureHunt> = [];
    if (allCalcTypes || hasCompAirReduction) {
      if (treasureHunt.compressedAirReductions && treasureHunt.compressedAirReductions.length != 0) {
        compressedAirReductions = this.sortCompressedAirReductions(treasureHunt.compressedAirReductions, sortBy, treasureHunt, settings);
      }
    }
    let compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt> = [];
    if (allCalcTypes || hasCompAirPressureReduction) {
      if (treasureHunt.compressedAirPressureReductions && treasureHunt.compressedAirPressureReductions.length != 0) {
        compressedAirPressureReductions = this.sortCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, sortBy, treasureHunt, settings);
      }
    }
    let waterReductions: Array<WaterReductionTreasureHunt> = [];
    if (allCalcTypes || hasWaterReduction) {
      if (treasureHunt.waterReductions && treasureHunt.waterReductions.length != 0) {
        waterReductions = this.sortWaterReductions(treasureHunt.waterReductions, sortBy, treasureHunt, settings);
      }
    }
    let steamReductions: Array<SteamReductionTreasureHunt> = [];
    if (allCalcTypes || hasSteamReduction) {
      if (treasureHunt.steamReductions && treasureHunt.steamReductions.length != 0) {
        steamReductions = this.sortSteamReductions(treasureHunt.steamReductions, sortBy, treasureHunt, settings);
      }
    }
    let pipeInsulationReductions: Array<PipeInsulationReductionTreasureHunt> = [];
    if (allCalcTypes || hasPipeInsulationReduction) {
      if (treasureHunt.pipeInsulationReductions && treasureHunt.pipeInsulationReductions.length != 0) {
        pipeInsulationReductions = this.sortPipeInsulationReductions(treasureHunt.pipeInsulationReductions, sortBy, treasureHunt, settings);
      }
    }
    let tankInsulationReductions: Array<TankInsulationReductionTreasureHunt> = [];
    if (allCalcTypes || hasTankInsulationReduction) {
      if (treasureHunt.tankInsulationReductions && treasureHunt.tankInsulationReductions.length != 0) {
        tankInsulationReductions = this.sortTankInsulationReductions(treasureHunt.tankInsulationReductions, sortBy, treasureHunt, settings);
      }
    }
    let airLeakSurveys: Array<AirLeakSurveyTreasureHunt> = [];
    if (allCalcTypes || hasAirLeakSurvey) {
      if (treasureHunt.airLeakSurveys && treasureHunt.airLeakSurveys.length != 0) {
        airLeakSurveys = this.sortAirLeakSurveys(treasureHunt.airLeakSurveys, sortBy, treasureHunt, settings);
      }
    }
    let wallLosses: Array<WallLossTreasureHunt> = [];
    if (allCalcTypes || hasWallLoss) {
      if (treasureHunt.wallLosses && treasureHunt.wallLosses.length != 0) {
        wallLosses = this.sortWallLosses(treasureHunt.wallLosses, sortBy, treasureHunt, settings);
      }
    }
    let openingLosses: Array<OpeningLossTreasureHunt> = [];
    if (allCalcTypes || hasOpeningLoss) {
      if (treasureHunt.openingLosses && treasureHunt.openingLosses.length != 0) {
        openingLosses = this.sortOpeningLosses(treasureHunt.openingLosses, sortBy, treasureHunt, settings);
      }
    }
    let flueGasLosses: Array<FlueGasTreasureHunt> = [];
    if (allCalcTypes || hasFlueGas) {
      if (treasureHunt.flueGasLosses && treasureHunt.flueGasLosses.length != 0) {
        flueGasLosses = this.sortFlueGasLosses(treasureHunt.flueGasLosses, sortBy, treasureHunt, settings);
      }
    }
    let wasteHeatReductions: Array<WasteHeatTreasureHunt> = [];
    if (allCalcTypes || hasWasteHeat) {
      if (treasureHunt.wasteHeatReductions && treasureHunt.wasteHeatReductions.length != 0) {
        wasteHeatReductions = this.sortWasteHeatReductions(treasureHunt.wasteHeatReductions, sortBy, treasureHunt, settings);
      }
    }
    let airHeatingOpportunities: Array<AirHeatingTreasureHunt> = [];
    if (allCalcTypes || hasAirHeating) {
      if (treasureHunt.airHeatingOpportunities && treasureHunt.airHeatingOpportunities.length != 0) {
        airHeatingOpportunities = this.sortAirHeatingOpportunities(treasureHunt.airHeatingOpportunities, sortBy, treasureHunt, settings);
      }
    }
    let leakageLosses: Array<LeakageLossTreasureHunt> = [];
    if (allCalcTypes || hasLeakageLoss) {
      if (treasureHunt.leakageLosses && treasureHunt.leakageLosses.length != 0) {
        leakageLosses = this.sortLeakageLosses(treasureHunt.leakageLosses, sortBy, treasureHunt, settings);
      }
    }
    let heatCascadingOpportunities: Array<HeatCascadingTreasureHunt> = [];
    if (allCalcTypes || hasHeatCascading) {
      if (treasureHunt.heatCascadingOpportunities && treasureHunt.heatCascadingOpportunities.length != 0) {
        heatCascadingOpportunities = this.sortheatCascadingOpportunities(treasureHunt.heatCascadingOpportunities, sortBy, treasureHunt, settings);
      }
    }
    let waterHeatingOpportunities: Array<WaterHeatingTreasureHunt> = [];
    if (allCalcTypes || hasWaterHeating) {
      if (treasureHunt.waterHeatingOpportunities && treasureHunt.waterHeatingOpportunities.length != 0) {
        waterHeatingOpportunities = this.sortWaterHeatingOpportunities(treasureHunt.waterHeatingOpportunities, sortBy, treasureHunt, settings);
      }
    }
    let coolingTowerMakeupOpportunities: Array<CoolingTowerMakeupWaterTreasureHunt> = [];
    if (allCalcTypes || hasWaterHeating) {
      if (treasureHunt.coolingTowerMakeupOpportunities && treasureHunt.coolingTowerMakeupOpportunities.length != 0) {
        coolingTowerMakeupOpportunities = this.sortCoolingTowerMakeupOpportunities(treasureHunt.coolingTowerMakeupOpportunities, sortBy, treasureHunt, settings);
      }
    }

    let filteredTreasureHunt: TreasureHunt = {
      name: treasureHunt.name,
      lightingReplacements: lightingReplacements,
      opportunitySheets: opportunitySheets,
      replaceExistingMotors: replaceExistingMotors,
      motorDrives: motorDrives,
      naturalGasReductions: naturalGasReductions,
      electricityReductions: electricityReductions,
      compressedAirReductions: compressedAirReductions,
      compressedAirPressureReductions: compressedAirPressureReductions,
      waterReductions: waterReductions,
      steamReductions: steamReductions,
      pipeInsulationReductions: pipeInsulationReductions,
      tankInsulationReductions: tankInsulationReductions,
      airLeakSurveys: airLeakSurveys,
      openingLosses: openingLosses,
      wallLosses: wallLosses,
      airHeatingOpportunities: airHeatingOpportunities,
      flueGasLosses: flueGasLosses,
      leakageLosses: leakageLosses,
      wasteHeatReductions: wasteHeatReductions,
      heatCascadingOpportunities: heatCascadingOpportunities,
      waterHeatingOpportunities: waterHeatingOpportunities,
      coolingTowerMakeupOpportunities: coolingTowerMakeupOpportunities,
      operatingHours: treasureHunt.operatingHours,
      currentEnergyUsage: treasureHunt.currentEnergyUsage,
      setupDone: treasureHunt.setupDone
    };

    return filteredTreasureHunt;
  }

  checkCardItemIncluded(cardItem: OpportunityCardData, sortBy: SortCardsData): boolean {
    let isUtilityType: boolean = true;
    let utilityValues: Array<string> = _.map(sortBy.utilityTypes, (utility) => { return utility.value });
    if (sortBy.utilityTypes.length != 0) {
      let intersection = _.intersection(utilityValues, cardItem.utilityType);
      isUtilityType = intersection.length != 0;
    }
    let isCalcTypeIncluded: boolean = true;
    if (sortBy.calculatorTypes.length != 0) {
      let calcValues: Array<string> = _.map(sortBy.calculatorTypes, (calc) => { return calc.value });
      isCalcTypeIncluded = _.includes(calcValues, cardItem.opportunityType);
    }
    let isTeamIncluded: boolean = true;
    if (sortBy.teams.length != 0) {
      let teamValues: Array<string> = _.map(sortBy.teams, (team) => { return team.value });
      isTeamIncluded = _.includes(teamValues, cardItem.teamName);
    }
    let isEquipmentIncluded: boolean = true;
    if (sortBy.equipments.length != 0) {
      if (cardItem.opportunitySheet) {
        let equipmentValues: Array<string> = _.map(sortBy.equipments, (equipment) => { return equipment.value });
        isEquipmentIncluded = _.includes(equipmentValues, cardItem.opportunitySheet.equipment);
      } else {
        isEquipmentIncluded = false;
      }
    }
    return (isUtilityType && isCalcTypeIncluded && isTeamIncluded && isEquipmentIncluded);
  }

  sortLightingReplacements(items: Array<LightingReplacementTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<LightingReplacementTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.lightingTreasureHuntService.getLightingReplacementCardData(item, opportunitySummary, 0, treasureHunt.currentEnergyUsage, settings);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortOpportunitySheets(items: Array<OpportunitySheet>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<OpportunitySheet> {
    return items.filter(item => {
      // let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortReplaceExisting(items: Array<ReplaceExistingMotorTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<ReplaceExistingMotorTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.replaceExistingTreasureService.getReplaceExistingCardData(item, opportunitySummary, 0, treasureHunt.currentEnergyUsage, settings);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortMotorDrives(items: Array<MotorDriveInputsTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<MotorDriveInputsTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.motorDriveTreasureHuntService.getMotorDriveCard(item, opportunitySummary, 0, treasureHunt.currentEnergyUsage, settings);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortNaturalGasReductions(items: Array<NaturalGasReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<NaturalGasReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.naturalGasTreasureHuntService.getNaturalGasReductionCard(item, opportunitySummary, 0, treasureHunt.currentEnergyUsage,  settings);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortElectricityReductions(items: Array<ElectricityReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<ElectricityReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.electricityReductionTreasureHuntService.getElectricityReductionCard(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortCompressedAirReductions(items: Array<CompressedAirReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<CompressedAirReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.compressedAirTreasureHuntService.getCompressedAirReductionCardData(item, opportunitySummary, settings, treasureHunt.currentEnergyUsage, 0);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortCompressedAirPressureReductions(items: Array<CompressedAirPressureReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<CompressedAirPressureReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.compressedAirPressureTreasureHuntService.getCompressedAirPressureReductionCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortWaterReductions(items: Array<WaterReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<WaterReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.waterReductionTreasureHuntService.getWaterReductionCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortSteamReductions(items: Array<SteamReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<SteamReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.steamReductionTreasureHuntService.getSteamReductionCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortPipeInsulationReductions(items: Array<PipeInsulationReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<PipeInsulationReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.pipeInsulationTreasureHuntService.getPipeInsulationReductionCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortTankInsulationReductions(items: Array<TankInsulationReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<TankInsulationReductionTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.tankInsulationTreasureHuntService.getTankInsulationReductionCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
  sortAirLeakSurveys(items: Array<AirLeakSurveyTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<AirLeakSurveyTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.airLeakTreasureService.getAirLeakSurveyCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
  sortOpeningLosses(items: Array<OpeningLossTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<OpeningLossTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.openingTreasureHuntService.getOpeningLossCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
  });
  }
  sortWallLosses(items: Array<WallLossTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<WallLossTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.wallLossTreasureHuntService.getWallLossCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
  });
}
sortLeakageLosses(items: Array<LeakageLossTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<LeakageLossTreasureHunt> {
  return items.filter(item => {
    let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
    let cardItem: OpportunityCardData = this.leakageTreasureHuntService.getLeakageLossCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
    return this.checkCardItemIncluded(cardItem, sortBy);
});
}
sortAirHeatingOpportunities(items: Array<AirHeatingTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<AirHeatingTreasureHunt> {
  return items.filter(item => {
    let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
    let cardItem: OpportunityCardData = this.airHeatingTreasureHuntService.getAirHeatingOpportunityCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
    return this.checkCardItemIncluded(cardItem, sortBy);
});
}
  sortFlueGasLosses(items: Array<FlueGasTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<FlueGasTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.flueGasTreasureHuntService.getFlueGasCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
  sortWasteHeatReductions(items: Array<WasteHeatTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<WasteHeatTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.wasteHeatTreasureHuntService.getWasteHeatCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
  sortheatCascadingOpportunities(items: Array<HeatCascadingTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<HeatCascadingTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.heatCascadingTreasureHuntService.getHeatCascadingOpportunityCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
  sortWaterHeatingOpportunities(items: Array<WaterHeatingTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<WaterHeatingTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.waterHeatingTreasureHuntService.getWaterHeatingOpportunityCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
  sortCoolingTowerMakeupOpportunities(items: Array<CoolingTowerMakeupWaterTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<CoolingTowerMakeupWaterTreasureHunt> {
    return items.filter(item => {
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(item, settings);
      let cardItem: OpportunityCardData = this.coolingTowerMakeupTreasureHuntService.getCoolingTowerMakeupCardData(item, opportunitySummary, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
}
