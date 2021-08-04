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
    if (data.pipeInsulationReductions) {
      if (treasureHunt.pipeInsulationReductions == undefined) {
        treasureHunt.pipeInsulationReductions = new Array();
      }
      treasureHunt.pipeInsulationReductions = treasureHunt.pipeInsulationReductions.concat(data.pipeInsulationReductions);
    }
    if (data.tankInsulationReductions) {
      if (treasureHunt.tankInsulationReductions == undefined) {
        treasureHunt.tankInsulationReductions = new Array();
      }
      treasureHunt.tankInsulationReductions = treasureHunt.tankInsulationReductions.concat(data.tankInsulationReductions);
    }

    if(data.flueGasLosses){
      if (treasureHunt.flueGasLosses == undefined) {
        treasureHunt.flueGasLosses = new Array();
      }
      treasureHunt.flueGasLosses = treasureHunt.flueGasLosses.concat(data.flueGasLosses);
    }

    if(data.airLeakSurveys){
      if (treasureHunt.airLeakSurveys == undefined) {
        treasureHunt.airLeakSurveys = new Array();
      }
      treasureHunt.airLeakSurveys = treasureHunt.airLeakSurveys.concat(data.airLeakSurveys);
    }
    if(data.openingLosses){
      if (treasureHunt.openingLosses == undefined) {
        treasureHunt.openingLosses = new Array();
      }
      treasureHunt.openingLosses = treasureHunt.openingLosses.concat(data.openingLosses);
    }
    if(data.wallLosses){
      if (treasureHunt.wallLosses == undefined) {
        treasureHunt.wallLosses = new Array();
      }
      treasureHunt.wallLosses = treasureHunt.wallLosses.concat(data.wallLosses);
    }
    if(data.wasteHeatReductions){
      if (treasureHunt.wasteHeatReductions == undefined) {
        treasureHunt.wasteHeatReductions = new Array();
      }
      treasureHunt.wasteHeatReductions = treasureHunt.wasteHeatReductions.concat(data.wasteHeatReductions);
    }
    if(data.airHeatingOpportunities){
      if (treasureHunt.airHeatingOpportunities == undefined) {
        treasureHunt.airHeatingOpportunities = new Array();
      }
      treasureHunt.airHeatingOpportunities = treasureHunt.airHeatingOpportunities.concat(data.airHeatingOpportunities);
    }
    if(data.leakageLosses){
      if (treasureHunt.leakageLosses == undefined) {
        treasureHunt.leakageLosses = new Array();
      }
      treasureHunt.leakageLosses = treasureHunt.leakageLosses.concat(data.leakageLosses);
    }
    if(data.heatCascadingOpportunities){
      if (treasureHunt.heatCascadingOpportunities == undefined) {
        treasureHunt.heatCascadingOpportunities = new Array();
      }
      treasureHunt.heatCascadingOpportunities = treasureHunt.heatCascadingOpportunities.concat(data.heatCascadingOpportunities);
    }
    if(data.waterHeatingOpportunities){
      if (treasureHunt.waterHeatingOpportunities == undefined) {
        treasureHunt.waterHeatingOpportunities = new Array();
      }
      treasureHunt.waterHeatingOpportunities = treasureHunt.waterHeatingOpportunities.concat(data.waterHeatingOpportunities);
    }
    return treasureHunt;
  }
}
