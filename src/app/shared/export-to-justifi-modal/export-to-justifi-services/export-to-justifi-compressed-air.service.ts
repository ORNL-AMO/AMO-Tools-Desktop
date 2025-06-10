import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../../compressed-air-assessment/compressed-air-assessment-results.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../models/settings';
import { Assessment } from '../../models/assessment';
import { Modification } from '../../models/compressed-air-assessment';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiCompressedAirService {

  constructor(private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private settingsDbService: SettingsDbService
  ) { }


  // Compressed Air
  fillCompressedAirWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Individual';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Compressed Air';

    //TODO: need to check assessment is valid...
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    let baselineResults: BaselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(assessment.compressedAirAssessment, settings);

    //E: implementation costs not at assessment level for CA
    //F: electricity use
    assessmentWorksheet.getCell('F' + assessmentRowIndex).value = baselineResults.total.energyUse;
    //G: Electricity unit
    //TODO: always MWh?
    assessmentWorksheet.getCell('G' + assessmentRowIndex).value = 'kWh';
    //H: electricity saving not at assessment level for CA

    let modification: Modification;
    if (assessment.compressedAirAssessment.selectedModificationId) {
      modification = assessment.compressedAirAssessment.modifications.find(mod => mod.modificationId === assessment.compressedAirAssessment.selectedModificationId);
    } else if (assessment.compressedAirAssessment.modifications && assessment.compressedAirAssessment.modifications.length > 0) {
      modification = assessment.compressedAirAssessment.modifications[0];
    }
    if (modification) {
      let modResults: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(assessment.compressedAirAssessment, modification, settings);
      let combinedResults: DayTypeModificationResult = this.compressedAirAssessmentResultsService.combineDayTypeResults(modResults, baselineResults);

      let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');

      //Flow Reallocation
      eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
      eemWorksheet.getCell('D' + eemRowIndex).value = "Flow Reallocation";
      eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
      eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.flowReallocationSavings.implementationCost;
      eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.flowReallocationSavings.savings.power;
      eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
      eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.flowReallocationSavings.savings.cost;
      eemRowIndex++;
      //Add Receiver Volume
      if (combinedResults.addReceiverVolumeSavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Add Receiver Volume";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.addReceiverVolumeSavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.addReceiverVolumeSavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.addReceiverVolumeSavings.savings.cost;
        eemRowIndex++;
      }
      //Adjust Cascading Points
      if (combinedResults.adjustCascadingSetPointsSavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Adjust Cascading Set Points";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.adjustCascadingSetPointsSavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.adjustCascadingSetPointsSavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.adjustCascadingSetPointsSavings.savings.cost;
        eemRowIndex++;
      }
      //Improve End Use Efficiency
      if (combinedResults.improveEndUseEfficiencySavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Improve End Use Efficiency";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.improveEndUseEfficiencySavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.improveEndUseEfficiencySavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.improveEndUseEfficiencySavings.savings.cost;
        eemRowIndex++;
      }
      //Reduce Air Leaks
      if (combinedResults.reduceAirLeaksSavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Reduce Air Leaks";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.reduceAirLeaksSavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.reduceAirLeaksSavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.reduceAirLeaksSavings.savings.cost;
        eemRowIndex++;
      }
      //Reduce Runtime
      if (combinedResults.reduceRunTimeSavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Reduce Runtime";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.reduceRunTimeSavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.reduceRunTimeSavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.reduceRunTimeSavings.savings.cost;
        eemRowIndex++;
      }
      //Reduce System Air Pressure
      if (combinedResults.reduceSystemAirPressureSavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Reduce System Air Pressure";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.reduceSystemAirPressureSavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.reduceSystemAirPressureSavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.reduceSystemAirPressureSavings.savings.cost;
        eemRowIndex++;
      }
      //Use automatic sequencer
      if (combinedResults.useAutomaticSequencerSavings.savings.cost) {
        eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
        eemWorksheet.getCell('D' + eemRowIndex).value = "Use Automatic Sequencer";
        eemWorksheet.getCell('E' + eemRowIndex).value = "Electricity";
        eemWorksheet.getCell('F' + eemRowIndex).value = combinedResults.useAutomaticSequencerSavings.implementationCost;
        eemWorksheet.getCell('G' + eemRowIndex).value = combinedResults.useAutomaticSequencerSavings.savings.power;
        eemWorksheet.getCell('H' + eemRowIndex).value = 'kWh';
        eemWorksheet.getCell('I' + eemRowIndex).value = combinedResults.useAutomaticSequencerSavings.savings.cost;
        eemRowIndex++;
      }
    }

    return eemRowIndex;
  }
}
