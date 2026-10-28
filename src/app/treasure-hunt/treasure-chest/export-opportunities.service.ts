import { Injectable } from '@angular/core';
import { ImportExportOpportunities, TreasureHunt, TreasureHuntOpportunity } from '../../shared/models/treasure-hunt';

@Injectable({
  providedIn: 'root'
})
export class ExportOpportunitiesService {

  constructor() { }


    setImportExportData(treasureHunt: TreasureHunt, includeUnselected: boolean = false) {
      const exportOpportunities: ImportExportOpportunities = {
        origin: 'AMO-TOOLS-DESKTOP-OPPORTUNITIES',
        lightingReplacements: this.getSelectedOpportunitiesGeneric(treasureHunt.lightingReplacements, includeUnselected),
        opportunitySheets: this.getSelectedOpportunitiesGeneric(treasureHunt.opportunitySheets, includeUnselected),
        assessmentOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.assessmentOpportunities, includeUnselected),
        replaceExistingMotors: this.getSelectedOpportunitiesGeneric(treasureHunt.replaceExistingMotors, includeUnselected),
        motorDrives: this.getSelectedOpportunitiesGeneric(treasureHunt.motorDrives, includeUnselected),
        naturalGasReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.naturalGasReductions, includeUnselected),
        electricityReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.electricityReductions, includeUnselected),
        compressedAirReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.compressedAirReductions, includeUnselected),
        compressedAirPressureReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.compressedAirPressureReductions, includeUnselected),
        steamReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.steamReductions, includeUnselected),
        waterReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.waterReductions, includeUnselected),
        pipeInsulationReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.pipeInsulationReductions, includeUnselected),
        tankInsulationReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.tankInsulationReductions, includeUnselected),
        airLeakSurveys: this.getSelectedOpportunitiesGeneric(treasureHunt.airLeakSurveys, includeUnselected),
        airHeatingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.airHeatingOpportunities, includeUnselected),
        openingLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.openingLosses, includeUnselected),
        wallLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.wallLosses, includeUnselected),
        leakageLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.leakageLosses, includeUnselected),
        flueGasLosses: this.getSelectedOpportunitiesGeneric(treasureHunt.flueGasLosses, includeUnselected),
        wasteHeatReductions: this.getSelectedOpportunitiesGeneric(treasureHunt.wasteHeatReductions, includeUnselected),
        heatCascadingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.heatCascadingOpportunities, includeUnselected),
        waterHeatingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.waterHeatingOpportunities, includeUnselected),
        coolingTowerMakeupOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.coolingTowerMakeupOpportunities, includeUnselected),
        chillerStagingOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.chillerStagingOpportunities, includeUnselected),
        chillerPerformanceOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.chillerPerformanceOpportunities, includeUnselected),
        coolingTowerFanOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.coolingTowerFanOpportunities, includeUnselected),
        coolingTowerBasinOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.coolingTowerBasinOpportunities, includeUnselected),
        boilerBlowdownRateOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.boilerBlowdownRateOpportunities, includeUnselected),
        steamLeakSurveys: this.getSelectedOpportunitiesGeneric(treasureHunt.steamLeakSurveys, includeUnselected),
        powerFactorCorrectionOpportunities: this.getSelectedOpportunitiesGeneric(treasureHunt.powerFactorCorrectionOpportunities, includeUnselected)
      }
      return exportOpportunities;
    }
  
    hasUnselectedOpportunities(treasureHunt: TreasureHunt): boolean {
      const allOpportunities: ImportExportOpportunities = this.setImportExportData(treasureHunt, true);
      return Object.values(allOpportunities).some(opportunities => Array.isArray(opportunities) && opportunities.some((opportunity: TreasureHuntOpportunity) => !opportunity.selected));
    }

    private getSelectedOpportunitiesGeneric<T extends TreasureHuntOpportunity>(opportunities: Array<T>, includeUnselected: boolean): Array<T> | undefined {
      if (opportunities && opportunities.length > 0) {
        if (includeUnselected) {
          return opportunities;
        }
        return opportunities.filter((opportunity) => opportunity.selected);
      }
      return undefined;
    }
}
