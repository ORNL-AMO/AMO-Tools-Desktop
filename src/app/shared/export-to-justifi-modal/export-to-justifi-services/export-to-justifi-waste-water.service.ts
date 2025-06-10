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

    assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Waste Water';

    //TODO: need to check assessment is valid...
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    let baselineResults: WasteWaterResults = this.wasteWaterService.calculateResults(assessment.wasteWater.baselineData.activatedSludgeData, assessment.wasteWater.baselineData.aeratorPerformanceData, assessment.wasteWater.baselineData.operations, assessment.wasteWater.baselineData.co2SavingsData, settings, false);
    //TODO: select modification
    let modification: WasteWaterData = assessment.wasteWater.modifications[0];
    let modResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, modification.operations, modification.co2SavingsData, settings, false, baselineResults);
    //E: implementation costs
    assessmentWorksheet.getCell('E' + assessmentRowIndex).value = modification.operations.implementationCosts;
    //F: electricity use
    assessmentWorksheet.getCell('F' + assessmentRowIndex).value = baselineResults.AeEnergyAnnual;
    //G: Electricity unit
    //TODO: always MWh?
    assessmentWorksheet.getCell('G' + assessmentRowIndex).value = 'MWh';
    //H: electricity savings
    assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineResults.AeEnergyAnnual - modResults.AeEnergyAnnual;

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

    return eemRowIndex;
  }
}
