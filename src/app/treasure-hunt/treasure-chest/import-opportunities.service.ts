import { Injectable } from '@angular/core';
import { ImportExportOpportunities, TreasureHunt } from '../../shared/models/treasure-hunt';

@Injectable()
export class ImportOpportunitiesService {


  

  constructor() { }

  importData(data: ImportExportOpportunities, treasureHunt: TreasureHunt): TreasureHunt {
    if (data.compressedAirReductions) {
      if (treasureHunt.compressedAirReductions == undefined) {
        treasureHunt.compressedAirReductions = new Array();
      }
      treasureHunt.compressedAirReductions = treasureHunt.compressedAirReductions.concat(data.compressedAirReductions);
    }
    if (data.opportunitySheets) {
      if (treasureHunt.opportunitySheets == undefined) {
        treasureHunt.opportunitySheets = new Array();
      }
      treasureHunt.opportunitySheets = treasureHunt.opportunitySheets.concat(data.opportunitySheets);
    }
    if (data.replaceExistingMotors) {
      if (treasureHunt.replaceExistingMotors == undefined) {
        treasureHunt.replaceExistingMotors = new Array();
      }
      treasureHunt.replaceExistingMotors = treasureHunt.replaceExistingMotors.concat(data.replaceExistingMotors);
    }
    if (data.motorDrives) {
      if (treasureHunt.motorDrives == undefined) {
        treasureHunt.motorDrives = new Array();
      }
      treasureHunt.motorDrives = treasureHunt.motorDrives.concat(data.motorDrives);
    }
    if (data.naturalGasReductions) {
      if (treasureHunt.naturalGasReductions == undefined) {
        treasureHunt.naturalGasReductions = new Array();
      }
      treasureHunt.naturalGasReductions = treasureHunt.naturalGasReductions.concat(data.naturalGasReductions);
    }
    if (data.electricityReductions) {
      if (treasureHunt.electricityReductions == undefined) {
        treasureHunt.electricityReductions = new Array();
      }
      treasureHunt.electricityReductions = treasureHunt.electricityReductions.concat(data.electricityReductions);
    }
    if (data.lightingReplacements) {
      if (treasureHunt.lightingReplacements == undefined) {
        treasureHunt.lightingReplacements = new Array();
      }
      treasureHunt.lightingReplacements = treasureHunt.lightingReplacements.concat(data.lightingReplacements);
    }
    if (data.waterReductions) {
      if (treasureHunt.waterReductions == undefined) {
        treasureHunt.waterReductions = new Array();
      }
      treasureHunt.waterReductions = treasureHunt.waterReductions.concat(data.waterReductions);
    }
    if (data.compressedAirPressureReductions) {
      if (treasureHunt.compressedAirPressureReductions == undefined) {
        treasureHunt.compressedAirPressureReductions = new Array();
      }
      treasureHunt.compressedAirPressureReductions = treasureHunt.compressedAirPressureReductions.concat(data.compressedAirPressureReductions);
    }
    return treasureHunt;
  }
}
