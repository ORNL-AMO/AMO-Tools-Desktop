import { Injectable } from '@angular/core';
import { OpportunityCardData, OpportunityCardsService } from './opportunity-cards.service';
import { SortCardsData } from './sort-cards-by.pipe';
import * as _ from 'lodash';
import {
  TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt,
  CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt
} from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
@Injectable()
export class SortCardsService {

  constructor(private opportunityCardsService: OpportunityCardsService) { }

  sortCards(value: Array<OpportunityCardData>, sortByData: SortCardsData): Array<OpportunityCardData> {
    if (sortByData.utilityType != 'All') {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(item.utilityType, sortByData.utilityType) });
    }
    if (sortByData.calculatorType != 'All') {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(item.opportunityType, sortByData.calculatorType) });
    }
    if (sortByData.teams.length != 0) {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(sortByData.teams, item.teamName) });
    }
    if (sortByData.equipments.length != 0) {
      value = _.filter(value, (item: OpportunityCardData) => {
        if (item.opportunitySheet) {
          let equipmentValues: Array<string> = _.map(sortByData.equipments, (equipmentValue) => { return equipmentValue.value });
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
    let lightingReplacements: Array<LightingReplacementTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'lighting-replacement') {
      if (treasureHunt.lightingReplacements && treasureHunt.lightingReplacements.length != 0) {
        lightingReplacements = this.sortLightingReplacements(treasureHunt.lightingReplacements, sortBy, treasureHunt);
      }
    }
    let opportunitySheets: Array<OpportunitySheet> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'opportunity-sheet') {
      if (treasureHunt.opportunitySheets && treasureHunt.opportunitySheets.length != 0) {
        opportunitySheets = this.sortOpportunitySheets(treasureHunt.opportunitySheets, sortBy, treasureHunt, settings);
      }
    }
    let replaceExistingMotors: Array<ReplaceExistingMotorTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'replace-existing') {
      if (treasureHunt.replaceExistingMotors && treasureHunt.replaceExistingMotors.length != 0) {
        replaceExistingMotors = this.sortReplaceExisting(treasureHunt.replaceExistingMotors, sortBy, treasureHunt, settings);
      }
    }
    let motorDrives: Array<MotorDriveInputsTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'motor-drive') {
      if (treasureHunt.motorDrives && treasureHunt.motorDrives.length != 0) {
        motorDrives = this.sortMotorDrives(treasureHunt.motorDrives, sortBy, treasureHunt);
      }
    }
    let naturalGasReductions: Array<NaturalGasReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'natural-gas-reduction') {
      if (treasureHunt.naturalGasReductions && treasureHunt.naturalGasReductions.length != 0) {
        naturalGasReductions = this.sortNaturalGasReductions(treasureHunt.naturalGasReductions, sortBy, treasureHunt, settings);
      }
    }
    let electricityReductions: Array<ElectricityReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'electricity-reduction') {
      if (treasureHunt.electricityReductions && treasureHunt.electricityReductions.length != 0) {
        electricityReductions = this.sortElectricityReductions(treasureHunt.electricityReductions, sortBy, treasureHunt, settings);
      }
    }
    let compressedAirReductions: Array<CompressedAirReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'compressed-air-reduction') {
      if (treasureHunt.compressedAirReductions && treasureHunt.compressedAirReductions.length != 0) {
        compressedAirReductions = this.sortCompressedAirReductions(treasureHunt.compressedAirReductions, sortBy, treasureHunt, settings);
      }
    }
    let compressedAirPressureReductions: Array<CompressedAirPressureReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'compressed-air-pressure-reduction') {
      if (treasureHunt.compressedAirPressureReductions && treasureHunt.compressedAirPressureReductions.length != 0) {
        compressedAirPressureReductions = this.sortCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, sortBy, treasureHunt, settings);
      }
    }
    let waterReductions: Array<WaterReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'water-reduction') {
      if (treasureHunt.waterReductions && treasureHunt.waterReductions.length != 0) {
        waterReductions = this.sortWaterReductions(treasureHunt.waterReductions, sortBy, treasureHunt, settings);
      }
    }
    let steamReductions: Array<SteamReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'steam-reduction') {
      if (treasureHunt.steamReductions && treasureHunt.steamReductions.length != 0) {
        steamReductions = this.sortSteamReductions(treasureHunt.steamReductions, sortBy, treasureHunt, settings);
      }
    }
    let pipeInsulationReductions: Array<PipeInsulationReductionTreasureHunt> = [];
    if (sortBy.calculatorType == 'All' || sortBy.calculatorType == 'pipe-insulation-reduction') {
      if (treasureHunt.pipeInsulationReductions && treasureHunt.pipeInsulationReductions.length != 0) {
        pipeInsulationReductions = this.sortPipeInsulationReductions(treasureHunt.pipeInsulationReductions, sortBy, treasureHunt, settings);
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
      operatingHours: treasureHunt.operatingHours,
      currentEnergyUsage: treasureHunt.currentEnergyUsage,
      setupDone: treasureHunt.setupDone
    };

    return filteredTreasureHunt;
  }

  checkCardItemIncluded(cardItem: OpportunityCardData, sortBy: SortCardsData): boolean {
    let isUtilityType: boolean = true;
    if (sortBy.utilityType != 'All') {
      isUtilityType = _.includes(cardItem.utilityType, sortBy.utilityType);
    }
    let isTeamIncluded: boolean = true;
    if (sortBy.teams.length != 0) {
      isTeamIncluded = _.includes(sortBy.teams, cardItem.teamName);
    }
    let isEquipmentIncluded: boolean = true;
    if (sortBy.equipments.length != 0) {
      if (cardItem.opportunitySheet) {
        let equipmentValues: Array<string> = _.map(sortBy.equipments, (equipmentValue) => { return equipmentValue.value });
        isEquipmentIncluded = _.includes(equipmentValues, cardItem.opportunitySheet.equipment);
      } else {
        isEquipmentIncluded = false;
      }
    }
    return (isUtilityType && isTeamIncluded && isEquipmentIncluded);
  }

  sortLightingReplacements(items: Array<LightingReplacementTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt): Array<LightingReplacementTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getLightingReplacementCardData(item, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortOpportunitySheets(items: Array<OpportunitySheet>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<OpportunitySheet> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(item, treasureHunt.currentEnergyUsage, 0, settings);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortReplaceExisting(items: Array<ReplaceExistingMotorTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<ReplaceExistingMotorTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getReplaceExistingCardData(item, 0, treasureHunt.currentEnergyUsage, settings);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortMotorDrives(items: Array<MotorDriveInputsTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt): Array<MotorDriveInputsTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getMotorDriveCard(item, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortNaturalGasReductions(items: Array<NaturalGasReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<NaturalGasReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getNaturalGasReductionCard(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortElectricityReductions(items: Array<ElectricityReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<ElectricityReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getElectricityReductionCard(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortCompressedAirReductions(items: Array<CompressedAirReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<CompressedAirReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getCompressedAirReductionCardData(item, settings, treasureHunt.currentEnergyUsage, 0);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortCompressedAirPressureReductions(items: Array<CompressedAirPressureReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<CompressedAirPressureReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getCompressedAirPressureReductionCardData(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortWaterReductions(items: Array<WaterReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<WaterReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getWaterReductionCardData(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortSteamReductions(items: Array<SteamReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<SteamReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getSteamReductionCardData(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }

  sortPipeInsulationReductions(items: Array<PipeInsulationReductionTreasureHunt>, sortBy: SortCardsData, treasureHunt: TreasureHunt, settings: Settings): Array<PipeInsulationReductionTreasureHunt> {
    return items.filter(item => {
      let cardItem: OpportunityCardData = this.opportunityCardsService.getPipeInsulationReductionCardData(item, settings, 0, treasureHunt.currentEnergyUsage);
      return this.checkCardItemIncluded(cardItem, sortBy);
    });
  }
}
