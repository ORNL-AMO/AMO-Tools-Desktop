import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { WasteWaterService } from '../../../waste-water/waste-water.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../models/assessment';
import { Settings } from '../../models/settings';
import { WasteWaterData, WasteWaterResults } from '../../models/waste-water';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiWasteWaterService {
  constructor(private wasteWaterService: WasteWaterService,
    private settingsDbService: SettingsDbService
  ) { }


  // Waste Water
  fillWasteWaterWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('C' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Waste Water';

    if (assessment.wasteWater.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let baselineResults: WasteWaterResults = this.wasteWaterService.calculateResults(assessment.wasteWater.baselineData.activatedSludgeData, assessment.wasteWater.baselineData.aeratorPerformanceData, assessment.wasteWater.baselineData.operations, assessment.wasteWater.baselineData.co2SavingsData, settings, false);
      //E: electricity use
      assessmentWorksheet.getCell('E' + assessmentRowIndex).value = baselineResults.AeEnergyAnnual;
      //F: Electricity unit
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = 'MWh';
      //set modification
      let modification: WasteWaterData;
      if (assessment.wasteWater.selectedModificationId) {
        modification = assessment.wasteWater.modifications.find(mod => mod.id === assessment.wasteWater.selectedModificationId);
      } else if (assessment.wasteWater.modifications && assessment.wasteWater.modifications.length > 0) {
        modification = assessment.wasteWater.modifications[0];
      }
      if (modification) {
        let modResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, modification.operations, modification.co2SavingsData, settings, false, baselineResults);
        //D: implementation costs
        assessmentWorksheet.getCell('D' + assessmentRowIndex).value = modification.operations.implementationCosts;
        //G: electricity savings
        assessmentWorksheet.getCell('G' + assessmentRowIndex).value = baselineResults.AeEnergyAnnual - modResults.AeEnergyAnnual;

        if (modification.exploreOpportunities) {
          let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
          if (modification.exploreAeratorPerformance && modification.exploreAeratorPerformance.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreAeratorPerformance.display;
            eemRowIndex++;
          }

          if (modification.exploreAeratorUpgrade && modification.exploreAeratorUpgrade.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreAeratorUpgrade.display;
            eemRowIndex++;
          }

          if (modification.exploreReduceOxygen && modification.exploreReduceOxygen.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreReduceOxygen.display;
            eemRowIndex++;
          }

          if (modification.exploreMLSS && modification.exploreMLSS.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreMLSS.display;
            eemRowIndex++;
          }

          if (modification.exploreVOLR && modification.exploreVOLR.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreVOLR.display;
            eemRowIndex++;
          }

          if (modification.exploreRAS && modification.exploreRAS.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreRAS.display;
            eemRowIndex++;
          }
        }
      }
    }
    return eemRowIndex;
  }
}
