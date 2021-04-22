import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpportunitySheet, TreasureHunt, LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt, TreasureHuntOpportunity } from '../shared/models/treasure-hunt';
import { OpportunityCardsService, OpportunityCardData } from './treasure-chest/opportunity-cards/opportunity-cards.service';
import { Settings } from '../shared/models/settings';

@Injectable()
export class TreasureHuntService {

  treasureHunt: BehaviorSubject<TreasureHunt>;

  mainTab: BehaviorSubject<string>;
  subTab: BehaviorSubject<string>;
  getResults: BehaviorSubject<boolean>;
  updateMenuOptions: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor(
    private opportunityCardsService: OpportunityCardsService
    ) {
    this.mainTab = new BehaviorSubject<string>('system-basics');
    this.subTab = new BehaviorSubject<string>('settings');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.updateMenuOptions = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.treasureHunt = new BehaviorSubject<TreasureHunt>(undefined);
  }

  //lighting
  addNewLightingReplacementTreasureHuntItem(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.lightingReplacements) {
      treasureHunt.lightingReplacements = new Array();
    }
    treasureHunt.lightingReplacements.push(lightingReplacementTreasureHunt);
    this.treasureHunt.next(treasureHunt);
  }

  editLightingReplacementTreasureHuntItem(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.lightingReplacements[index] = lightingReplacementTreasureHunt;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getLightingReplacementCardData(lightingReplacementTreasureHunt, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }

  deleteLightingReplacementTreasureHuntItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.lightingReplacements.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // opportunitySheets
  addNewOpportunitySheetsItem(opportunitySheetsItem: OpportunitySheet) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.opportunitySheets) {
      treasureHunt.opportunitySheets = new Array();
    }
    treasureHunt.opportunitySheets.push(opportunitySheetsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editOpportunitySheetItem(opportunitySheetsItem: OpportunitySheet, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.opportunitySheets[index] = opportunitySheetsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(opportunitySheetsItem, treasureHunt.currentEnergyUsage, index, settings);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteOpportunitySheetItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.opportunitySheets.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }

  // replaceExistingMotors
  addNewReplaceExistingMotorsItem(replaceExistingMotorsItem: ReplaceExistingMotorTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.replaceExistingMotors) {
      treasureHunt.replaceExistingMotors = new Array();
    }
    treasureHunt.replaceExistingMotors.push(replaceExistingMotorsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editReplaceExistingMotorsItem(replaceExistingMotorsItem: ReplaceExistingMotorTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.replaceExistingMotors[index] = replaceExistingMotorsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getReplaceExistingCardData(replaceExistingMotorsItem, index, treasureHunt.currentEnergyUsage, settings);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteReplaceExistingMotorsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.replaceExistingMotors.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // motorDrives
  addNewMotorDrivesItem(motorDriveItem: MotorDriveInputsTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.motorDrives) {
      treasureHunt.motorDrives = new Array();
    }
    treasureHunt.motorDrives.push(motorDriveItem);
    this.treasureHunt.next(treasureHunt);
  }
  editMotorDrivesItem(motorDriveItem: MotorDriveInputsTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.motorDrives[index] = motorDriveItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getMotorDriveCard(motorDriveItem, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteMotorDrivesItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.motorDrives.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // naturalGasReductions
  addNewNaturalGasReductionsItem(naturalGasReductionsItem: NaturalGasReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.naturalGasReductions) {
      treasureHunt.naturalGasReductions = new Array();
    }
    treasureHunt.naturalGasReductions.push(naturalGasReductionsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editNaturalGasReductionsItem(naturalGasReductionsItem: NaturalGasReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.naturalGasReductions[index] = naturalGasReductionsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getNaturalGasReductionCard(naturalGasReductionsItem, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteNaturalGasReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.naturalGasReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // electricityReductions
  addNewElectricityReductionsItem(electricityReductionsItem: ElectricityReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.electricityReductions) {
      treasureHunt.electricityReductions = new Array();
    }
    treasureHunt.electricityReductions.push(electricityReductionsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editElectricityReductionsItem(electricityReductionsItem: ElectricityReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.electricityReductions[index] = electricityReductionsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getElectricityReductionCard(electricityReductionsItem, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteElectricityReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.electricityReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // compressedAirReductions
  addNewCompressedAirReductionsItem(compressedAirReductionsItem: CompressedAirReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.compressedAirReductions) {
      treasureHunt.compressedAirReductions = new Array();
    }
    treasureHunt.compressedAirReductions.push(compressedAirReductionsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editCompressedAirReductionsItem(compressedAirReductionsItem: CompressedAirReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.compressedAirReductions[index] = compressedAirReductionsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getCompressedAirReductionCardData(compressedAirReductionsItem, settings, treasureHunt.currentEnergyUsage, index);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteCompressedAirReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.compressedAirReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // compressedAirPressureReductions
  addNewCompressedAirPressureReductionsItem(compressedAirPressureReductionsItem: CompressedAirPressureReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.compressedAirPressureReductions) {
      treasureHunt.compressedAirPressureReductions = new Array();
    }
    treasureHunt.compressedAirPressureReductions.push(compressedAirPressureReductionsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editCompressedAirPressureReductionsItem(compressedAirPressureReductionsItem: CompressedAirPressureReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.compressedAirPressureReductions[index] = compressedAirPressureReductionsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getCompressedAirPressureReductionCardData(compressedAirPressureReductionsItem, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteCompressedAirPressureReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.compressedAirPressureReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  // waterReductions
  addNewWaterReductionsItem(waterReductionsItem: WaterReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.waterReductions) {
      treasureHunt.waterReductions = new Array();
    }
    treasureHunt.waterReductions.push(waterReductionsItem);
    this.treasureHunt.next(treasureHunt);
  }
  editWaterReductionsItem(waterReductionsItem: WaterReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.waterReductions[index] = waterReductionsItem;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getWaterReductionCardData(waterReductionsItem, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteWaterReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.waterReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  //steam reduction
  addNewSteamReductionItem(steamReduction: SteamReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.steamReductions) {
      treasureHunt.steamReductions = new Array();
    }
    treasureHunt.steamReductions.push(steamReduction);
    this.treasureHunt.next(treasureHunt);
  }
  editSteamReductionItem(steamReductions: SteamReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.steamReductions[index] = steamReductions;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getSteamReductionCardData(steamReductions, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteSteamReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.steamReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
  //pipe reduction
  addNewPipeInsulationReductionItem(pipeInsulationReduction: PipeInsulationReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.pipeInsulationReductions) {
      treasureHunt.pipeInsulationReductions = new Array();
    }
    treasureHunt.pipeInsulationReductions.push(pipeInsulationReduction);
    this.treasureHunt.next(treasureHunt);
  }
  editPipeInsulationReductionItem(pipeInsulationReduction: PipeInsulationReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.pipeInsulationReductions[index] = pipeInsulationReduction;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getPipeInsulationReductionCardData(pipeInsulationReduction, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deletePipeInsulationReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.pipeInsulationReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }

  //tank reduction
  addNewTankInsulationReductionItem(tankInsulationReduction: TankInsulationReductionTreasureHunt) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if (!treasureHunt.tankInsulationReductions) {
      treasureHunt.tankInsulationReductions = new Array();
    }
    treasureHunt.tankInsulationReductions.push(tankInsulationReduction);
    this.treasureHunt.next(treasureHunt);
  }
  editTankInsulationReductionItem(tankInsulationReduction: TankInsulationReductionTreasureHunt, index: number, settings: Settings) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.tankInsulationReductions[index] = tankInsulationReduction;
    let updatedCard: OpportunityCardData = this.opportunityCardsService.getTankInsulationReductionCardData(tankInsulationReduction, settings, index, treasureHunt.currentEnergyUsage);
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHunt.next(treasureHunt);
  }
  deleteTankInsulationReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.tankInsulationReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }

  //air leak survey
  // addNewAirLeakSurveyItem(airLeakSurvey: AirLeakSurveyTreasureHunt) {
  //   let treasureHunt: TreasureHunt = this.treasureHunt.value;
  //   if (!treasureHunt.airLeakSurveys) {
  //     treasureHunt.airLeakSurveys = new Array();
  //   }
  //   treasureHunt.airLeakSurveys.push(airLeakSurvey);
  //   this.treasureHunt.next(treasureHunt);
  // }
  
  // editAirLeakSurveyItem(airLeakSurvey: AirLeakSurveyTreasureHunt, index: number, settings: Settings) {
  //   let treasureHunt: TreasureHunt = this.treasureHunt.value;
  //   treasureHunt.airLeakSurveys[index] = airLeakSurvey;
  //   let updatedCard: OpportunityCardData = this.opportunityCardsService.getAirLeakSurveyCardData(airLeakSurvey, settings, index, treasureHunt.currentEnergyUsage);
  //   this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
  //   this.treasureHunt.next(treasureHunt);
  // }
  // deleteAirLeakSurveyItem(index: number) {
  //   let treasureHunt: TreasureHunt = this.treasureHunt.value;
  //   treasureHunt.airLeakSurveys.splice(index, 1);
  //   this.treasureHunt.next(treasureHunt);
  // }



}

