import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { FsatService } from '../../../fsat/fsat.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../models/assessment';
import { Settings } from '../../models/settings';
import { FsatOutput, Modification } from '../../models/fans';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiFsatService {

  constructor(private fsatService: FsatService,
    private settingsDbService: SettingsDbService
  ) { }


  // FSAT
  fillFSATWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('C' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Fan';

    if (assessment.fsat.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let baselineResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(assessment.fsat)), true, settings);
      //E: electricity use
      assessmentWorksheet.getCell('E' + assessmentRowIndex).value = baselineResults.annualEnergy;
      //F: Electricity unit
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = 'MWh';
      //set modification
      let modification: Modification
      if (assessment.fsat.selectedModificationId) {
        modification = assessment.fsat.modifications.find(mod => mod.id === assessment.fsat.selectedModificationId);
      } else if (assessment.fsat.modifications.length > 0) {
        modification = assessment.fsat.modifications[0];
      }

      if (modification) {
        let modResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(modification.fsat)), false, settings);
        //D: implementation costs
        assessmentWorksheet.getCell('D' + assessmentRowIndex).value = modification.fsat.implementationCosts;
        //G: electricity savings
        assessmentWorksheet.getCell('G' + assessmentRowIndex).value = baselineResults.annualEnergy - modResults.annualEnergy;
        if (modification.exploreOpportunities) {
          let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
          //TODO: add EEMs if Explore opps
          if (modification.exploreOppsShowVfd && modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowVfd.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowDrive && modification.exploreOppsShowDrive.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowDrive.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowFanType && modification.exploreOppsShowFanType.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowFanType.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowMotor && modification.exploreOppsShowMotor.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowMotor.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowFlowRate && modification.exploreOppsShowFlowRate.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowFlowRate.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowReducePressure && modification.exploreOppsShowReducePressure.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowReducePressure.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowOpData && modification.exploreOppsShowOpData.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowOpData.display;
            eemRowIndex++;
          }
        }
      }
    }
    return eemRowIndex;
  }
}
