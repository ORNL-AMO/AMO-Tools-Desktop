import { Injectable } from '@angular/core';
import { ImportExportOpportunities, TreasureHunt, TreasureHuntOpportunity } from '../../shared/models/treasure-hunt';

@Injectable({
  providedIn: 'root'
})
export class ExportOpportunitiesService {

  constructor() { }


    setImportExportData(treasureHunt: TreasureHunt) {
      const exportOpportunities: ImportExportOpportunities = {
        origin: 'AMO-TOOLS-DESKTOP-OPPORTUNITIES',
        lightingReplacements: this.getSelectedOpportunitiesGeneric(treasureHunt.lightingReplacements),
        opportunitySheets: this.getSelectedOpportunitiesGeneric(treasureHunt.opportunitySheets),
        assessmentOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.assessmentOpportunities),
        replaceExistingMotors: this.getSelectedOpportunitiesGeneric(treasureHunt.replaceExistingMotors),
        motorDrives: this.getSelectedOpportunitiesGeneric(treasureHunt.motorDrives),
        naturalGasReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.naturalGasReductions),
        electricityReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.electricityReductions),
        compressedAirReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.compressedAirReductions),
        compressedAirPressureReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.compressedAirPressureReductions),
        steamReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.steamReductions),
        waterReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.waterReductions),
        pipeInsulationReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.pipeInsulationReductions),
        tankInsulationReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.tankInsulationReductions),
        airLeakSurveys: this.getSelectedOpportunitiesGeneric(treasureHunt.airLeakSurveys),
        airHeatingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.airHeatingOpportunities),
        openingLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.openingLosses),
        wallLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.wallLosses),
        leakageLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.leakageLosses),
        flueGasLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.flueGasLosses),
        wasteHeatReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.wasteHeatReductions),
        heatCascadingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.heatCascadingOpportunities),
        waterHeatingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.waterHeatingOpportunities),
        coolingTowerMakeupOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.coolingTowerMakeupOpportunities),
        chillerStagingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.chillerStagingOpportunities),
        chillerPerformanceOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.chillerPerformanceOpportunities),
        coolingTowerFanOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.coolingTowerFanOpportunities),
        coolingTowerBasinOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.coolingTowerBasinOpportunities),
        boilerBlowdownRateOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.boilerBlowdownRateOpportunities),
        powerFactorCorrectionOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.powerFactorCorrectionOpportunities)
      }
      return exportOpportunities;
    }
  
    private getSelectedOpportunitiesGeneric<T extends TreasureHuntOpportunity>(opportunities: Array<T>): Array<T> | undefined {
      if (opportunities && opportunities.length > 0) {
        return opportunities.filter((opportunity) => opportunity.selected);
      }
      return undefined;
    }
}
