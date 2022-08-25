import { Injectable } from '@angular/core';
import { CompressedAirPressureReductionTreasureHunt, ImportExportOpportunities, Treasure, TreasureHunt } from '../../shared/models/treasure-hunt';

@Injectable()
export class ImportOpportunitiesService {

  constructor() { }

  importData(data: ImportExportOpportunities, treasureHunt: TreasureHunt): TreasureHunt {
    if (data.compressedAirReductions) {
      if (treasureHunt.compressedAirReductions == undefined) {
        treasureHunt.compressedAirReductions = new Array();
      }
      this.updateLegacyOpportunities(data.compressedAirReductions, Treasure.compressedAir);
      treasureHunt.compressedAirReductions = treasureHunt.compressedAirReductions.concat(data.compressedAirReductions);
    }
    if (data.opportunitySheets) {
      if (treasureHunt.opportunitySheets == undefined) {
        treasureHunt.opportunitySheets = new Array();
      }
      this.updateLegacyOpportunities(data.opportunitySheets, Treasure.opportunitySheet);
      treasureHunt.opportunitySheets = treasureHunt.opportunitySheets.concat(data.opportunitySheets);
    }
    if (data.replaceExistingMotors) {
      if (treasureHunt.replaceExistingMotors == undefined) {
        treasureHunt.replaceExistingMotors = new Array();
      }
      this.updateLegacyOpportunities(data.replaceExistingMotors, Treasure.replaceExisting);
      treasureHunt.replaceExistingMotors = treasureHunt.replaceExistingMotors.concat(data.replaceExistingMotors);
    }
    if (data.motorDrives) {
      if (treasureHunt.motorDrives == undefined) {
        treasureHunt.motorDrives = new Array();
      }
      this.updateLegacyOpportunities(data.motorDrives, Treasure.motorDrive);
      treasureHunt.motorDrives = treasureHunt.motorDrives.concat(data.motorDrives);
    }
    if (data.naturalGasReductions) {
      if (treasureHunt.naturalGasReductions == undefined) {
        treasureHunt.naturalGasReductions = new Array();
      }
      this.updateLegacyOpportunities(data.naturalGasReductions, Treasure.naturalGasReduction);
      treasureHunt.naturalGasReductions = treasureHunt.naturalGasReductions.concat(data.naturalGasReductions);
    }
    if (data.electricityReductions) {
      if (treasureHunt.electricityReductions == undefined) {
        treasureHunt.electricityReductions = new Array();
      }
      this.updateLegacyOpportunities(data.electricityReductions, Treasure.electricityReduction);
      treasureHunt.electricityReductions = treasureHunt.electricityReductions.concat(data.electricityReductions);
    }
    if (data.lightingReplacements) {
      if (treasureHunt.lightingReplacements == undefined) {
        treasureHunt.lightingReplacements = new Array();
      }
      this.updateLegacyOpportunities(data.lightingReplacements, Treasure.lightingReplacement);
      treasureHunt.lightingReplacements = treasureHunt.lightingReplacements.concat(data.lightingReplacements);
    }
    if (data.waterReductions) {
      if (treasureHunt.waterReductions == undefined) {
        treasureHunt.waterReductions = new Array();
      }
      this.updateLegacyOpportunities(data.waterReductions, Treasure.waterReduction);
      treasureHunt.waterReductions = treasureHunt.waterReductions.concat(data.waterReductions);
    }
    if (data.compressedAirPressureReductions) {
      if (treasureHunt.compressedAirPressureReductions == undefined) {
        treasureHunt.compressedAirPressureReductions = new Array();
      }
      this.updateLegacyOpportunities(data.compressedAirPressureReductions, Treasure.compressedAirPressure);
      treasureHunt.compressedAirPressureReductions = treasureHunt.compressedAirPressureReductions.concat(data.compressedAirPressureReductions);
    }
    if (data.pipeInsulationReductions) {
      if (treasureHunt.pipeInsulationReductions == undefined) {
        treasureHunt.pipeInsulationReductions = new Array();
      }
      this.updateLegacyOpportunities(data.pipeInsulationReductions, Treasure.pipeInsulation);
      treasureHunt.pipeInsulationReductions = treasureHunt.pipeInsulationReductions.concat(data.pipeInsulationReductions);
    }
    if (data.tankInsulationReductions) {
      if (treasureHunt.tankInsulationReductions == undefined) {
        treasureHunt.tankInsulationReductions = new Array();
      }
      this.updateLegacyOpportunities(data.tankInsulationReductions, Treasure.tankInsulation);
      treasureHunt.tankInsulationReductions = treasureHunt.tankInsulationReductions.concat(data.tankInsulationReductions);
    }

    if(data.flueGasLosses){
      if (treasureHunt.flueGasLosses == undefined) {
        treasureHunt.flueGasLosses = new Array();
      }
      this.updateLegacyOpportunities(data.flueGasLosses, Treasure.flueGas);
      treasureHunt.flueGasLosses = treasureHunt.flueGasLosses.concat(data.flueGasLosses);
    }

    if(data.airLeakSurveys){
      if (treasureHunt.airLeakSurveys == undefined) {
        treasureHunt.airLeakSurveys = new Array();
      }
      this.updateLegacyOpportunities(data.airLeakSurveys, Treasure.airLeak);
      treasureHunt.airLeakSurveys = treasureHunt.airLeakSurveys.concat(data.airLeakSurveys);
    }
    if(data.openingLosses){
      if (treasureHunt.openingLosses == undefined) {
        treasureHunt.openingLosses = new Array();
      }
      this.updateLegacyOpportunities(data.openingLosses, Treasure.openingLoss);
      treasureHunt.openingLosses = treasureHunt.openingLosses.concat(data.openingLosses);
    }
    if(data.wallLosses){
      if (treasureHunt.wallLosses == undefined) {
        treasureHunt.wallLosses = new Array();
      }
      this.updateLegacyOpportunities(data.wallLosses, Treasure.wallLoss);
      treasureHunt.wallLosses = treasureHunt.wallLosses.concat(data.wallLosses);
    }
    if(data.wasteHeatReductions){
      if (treasureHunt.wasteHeatReductions == undefined) {
        treasureHunt.wasteHeatReductions = new Array();
      }
      this.updateLegacyOpportunities(data.wasteHeatReductions, Treasure.wasteHeat);
      treasureHunt.wasteHeatReductions = treasureHunt.wasteHeatReductions.concat(data.wasteHeatReductions);
    }
    if(data.airHeatingOpportunities){
      if (treasureHunt.airHeatingOpportunities == undefined) {
        treasureHunt.airHeatingOpportunities = new Array();
      }
      this.updateLegacyOpportunities(data.airHeatingOpportunities, Treasure.airHeating);
      treasureHunt.airHeatingOpportunities = treasureHunt.airHeatingOpportunities.concat(data.airHeatingOpportunities);
    }
    if(data.leakageLosses){
      if (treasureHunt.leakageLosses == undefined) {
        treasureHunt.leakageLosses = new Array();
      }
      this.updateLegacyOpportunities(data.leakageLosses, Treasure.leakageLoss);
      treasureHunt.leakageLosses = treasureHunt.leakageLosses.concat(data.leakageLosses);
    }
    if(data.heatCascadingOpportunities){
      if (treasureHunt.heatCascadingOpportunities == undefined) {
        treasureHunt.heatCascadingOpportunities = new Array();
      }
      this.updateLegacyOpportunities(data.heatCascadingOpportunities, Treasure.heatCascading);
      treasureHunt.heatCascadingOpportunities = treasureHunt.heatCascadingOpportunities.concat(data.heatCascadingOpportunities);
    }
    if(data.waterHeatingOpportunities){
      if (treasureHunt.waterHeatingOpportunities == undefined) {
        treasureHunt.waterHeatingOpportunities = new Array();
      }
      this.updateLegacyOpportunities(data.waterHeatingOpportunities, Treasure.waterHeating);
      treasureHunt.waterHeatingOpportunities = treasureHunt.waterHeatingOpportunities.concat(data.waterHeatingOpportunities);
    }
    if(data.coolingTowerMakeupOpportunities){
      if (treasureHunt.coolingTowerMakeupOpportunities == undefined) {
        treasureHunt.coolingTowerMakeupOpportunities = new Array();
      }
      this.updateLegacyOpportunities(data.coolingTowerMakeupOpportunities, Treasure.coolingTowerMakeup);
      treasureHunt.coolingTowerMakeupOpportunities = treasureHunt.coolingTowerMakeupOpportunities.concat(data.coolingTowerMakeupOpportunities);
    }
    if (data.chillerStagingOpportunities) {
      if (treasureHunt.chillerStagingOpportunities == undefined) {
        treasureHunt.chillerStagingOpportunities = new Array();
      }
      this.updateLegacyOpportunities(data.chillerStagingOpportunities, Treasure.chillerStaging);
      treasureHunt.chillerStagingOpportunities = treasureHunt.chillerStagingOpportunities.concat(data.chillerStagingOpportunities);
    }
    return treasureHunt;
  }

  updateLegacyOpportunities(opportunities: Array<any>, opportunityType: string) {
    return opportunities.map(opp => {
      if (!opp.hasOwnProperty(opportunityType)) {
        opp.opportunityType = opportunityType;
      }

      if (opportunityType == Treasure.compressedAirPressure) {
        this.updateCompressedAirPressureFields(opp);
      }
    })
  }

  updateCompressedAirPressureFields(compressedAirPressureReductionTH: CompressedAirPressureReductionTreasureHunt) {
    compressedAirPressureReductionTH.baseline.forEach(baselineInput => {
      if (!baselineInput.atmosphericPressure) {
        baselineInput.atmosphericPressure = 0;
      }
      if (!baselineInput.pressureRated) {
        baselineInput.pressureRated = 0;
      }
      if (!baselineInput.powerType) {
        baselineInput.powerType = 'Measured';
      }
    });
    if (compressedAirPressureReductionTH.modification && compressedAirPressureReductionTH.modification.length > 0) {
      compressedAirPressureReductionTH.modification.forEach(modification => {
        if (!modification.atmosphericPressure) {
          modification.atmosphericPressure = 0;
        }
        if (!modification.pressureRated) {
          modification.pressureRated = 0;
        }
        if (!modification.powerType) {
          modification.powerType = 'Measured';
        }
      });
    }
    return compressedAirPressureReductionTH;
  }
  
}
