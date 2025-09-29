import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { CompressedAirAssessmentResultsService } from '../../../compressed-air-assessment/compressed-air-assessment-results.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../models/settings';
import { Assessment } from '../../models/assessment';
import { Modification } from '../../models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment/compressed-air-assessment.service';
import { BaselineResults, CompressedAirAssessmentResult, DayTypeModificationResult } from '../../../compressed-air-assessment/calculations/caCalculationModels'
import { CompressedAirAssessmentBaselineResults } from '../../../compressed-air-assessment/calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../../../compressed-air-assessment/compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentModificationResults } from '../../../compressed-air-assessment/calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirCombinedDayTypeResults } from '../../../compressed-air-assessment/calculations/modifications/CompressedAirCombinedDayTypeResults';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiCompressedAirService {

  constructor(private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private settingsDbService: SettingsDbService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService
  ) { }


  // Compressed Air
  fillCompressedAirWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('C' + assessmentRowIndex).value = 'Individual';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Compressed Air';


    this.compressedAirAssessmentService.setIsSetupDone(assessment.compressedAirAssessment);
    if (assessment.compressedAirAssessment.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(assessment.compressedAirAssessment, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);

      let baselineResults: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;

      //D: implementation costs not at assessment level for CA
      //E: electricity use
      assessmentWorksheet.getCell('E' + assessmentRowIndex).value = baselineResults.total.energyUse;
      //F: Electricity unit
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = 'kWh';
      //H: electricity saving not at assessment level for CA

      let modification: Modification;
      if (assessment.compressedAirAssessment.selectedModificationId) {
        modification = assessment.compressedAirAssessment.modifications.find(mod => mod.modificationId === assessment.compressedAirAssessment.selectedModificationId);
      } else if (assessment.compressedAirAssessment.modifications && assessment.compressedAirAssessment.modifications.length > 0) {
        modification = assessment.compressedAirAssessment.modifications[0];
      }
      if (modification) {
        let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(assessment.compressedAirAssessment, modification, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);
        let compressedAirCombinedDayTypeResults: CompressedAirCombinedDayTypeResults = new CompressedAirCombinedDayTypeResults(compressedAirAssessmentModificationResults);
        let combinedResults: DayTypeModificationResult = compressedAirCombinedDayTypeResults.getDayTypeModificationResult();

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
    }
    return eemRowIndex;
  }
}
