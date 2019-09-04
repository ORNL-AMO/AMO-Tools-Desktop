import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpportunitySheet, TreasureHunt, LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt } from '../shared/models/treasure-hunt';

@Injectable()
export class TreasureHuntService {

  treasureHunt: BehaviorSubject<TreasureHunt>;

  mainTab: BehaviorSubject<string>;
  subTab: BehaviorSubject<string>;
  getResults: BehaviorSubject<boolean>;
  updateMenuOptions: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor() {
    this.mainTab = new BehaviorSubject<string>('system-basics');
    this.subTab = new BehaviorSubject<string>('settings');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.updateMenuOptions = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.treasureHunt = new BehaviorSubject<TreasureHunt>(undefined);
  }

  initOpportunitySheet(): OpportunitySheet {
    return {
      name: 'New Opportunity',
      equipment: '',
      description: '',
      originator: '',
      date: new Date(),
      owner: '',
      businessUnits: '',
      opportunityCost: {
        engineeringServices: 0,
        material: 0,
        otherCosts: [],
        costDescription: '',
        labor: 0,
        additionalSavings: undefined
      },
      baselineEnergyUseItems: [{
        type: 'Electricity',
        amount: 0
      }],
      modificationEnergyUseItems: []
    };
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
  editOpportunitySheetItem(opportunitySheetsItem: OpportunitySheet, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.opportunitySheets[index] = opportunitySheetsItem;
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
  editReplaceExistingMotorsItem(replaceExistingMotorsItem: ReplaceExistingMotorTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.replaceExistingMotors[index] = replaceExistingMotorsItem;
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
  editNaturalGasReductionsItem(naturalGasReductionsItem: NaturalGasReductionTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.naturalGasReductions[index] = naturalGasReductionsItem;
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
  editElectricityReductionsItem(electricityReductionsItem: ElectricityReductionTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.electricityReductions[index] = electricityReductionsItem;
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
  editCompressedAirReductionsItem(compressedAirReductionsItem: CompressedAirReductionTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.compressedAirReductions[index] = compressedAirReductionsItem;
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
  editCompressedAirPressureReductionsItem(compressedAirPressureReductionsItem: CompressedAirPressureReductionTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.compressedAirPressureReductions[index] = compressedAirPressureReductionsItem;
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
  editWaterReductionsItem(waterReductionsItem: WaterReductionTreasureHunt, index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.waterReductions[index] = waterReductionsItem;
    this.treasureHunt.next(treasureHunt);
  }
  deleteWaterReductionsItem(index: number) {
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.waterReductions.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }



}
