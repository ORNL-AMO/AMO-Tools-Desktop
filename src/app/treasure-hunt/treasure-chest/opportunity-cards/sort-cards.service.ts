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

    let allCalcTypes = calculatorTypes.length != 0;
    let hasLightingReplacement = calculatorTypes.includes('lighting-replacement');
    let hasOppSheet: boolean = calculatorTypes.includes('opportunity-sheet');
    let hasReplaceExisting: boolean = calculatorTypes.includes('replace-existing');
    let hasMotorDrive: boolean = calculatorTypes.includes('motor-drive');
    let hasNaturalGasReduction: boolean = calculatorTypes.includes('natural-gas-reduction');
    let hasElectricityReduction: boolean = calculatorTypes.includes('electricity-reduction');
    let hasCompAirReduction: boolean = calculatorTypes.includes('compressed-air-reduction');
    let hasCompAirPressureReduction: boolean = calculatorTypes.includes('compressed-air-pressure-reduction');
    let hasWaterReduction: boolean = calculatorTypes.includes('water-reduction');
    let hasSteamReduction: boolean = calculatorTypes.includes('steam-reduction');
    let hasPipeInsulationReduction: boolean = calculatorTypes.includes('pipe-insulation-reduction');


    let lightingReplacements: Array<LightingReplacementTreasureHunt> = [];
    if (allCalcTypes || hasLightingReplacement) {
      if (treasureHunt.lightingReplacements && treasureHunt.lightingReplacements.length != 0) {
        lightingReplacements = this.sortLightingReplacements(treasureHunt.lightingReplacements, sortBy, treasureHunt);
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
        motorDrives = this.sortMotorDrives(treasureHunt.motorDrives, sortBy, treasureHunt);
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
    // if (sortBy.utilityTypes[0].value != 'All') {
    let utilityValues: Array<string> = _.map(sortBy.utilityTypes, (utility) => { return utility.value });
    if (sortBy.utilityTypes.length != 0) {
      let intersection = _.intersection(utilityValues, cardItem.utilityType);
      // isUtilityType = _.isEmpty(_.xor(intersection, utilityValues))
      isUtilityType = intersection.length != 0;
    }
    //else {
    //   isUtilityType = _.includes(utilityValues, cardItem.utilityType[0]);
    // }
    // }
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
