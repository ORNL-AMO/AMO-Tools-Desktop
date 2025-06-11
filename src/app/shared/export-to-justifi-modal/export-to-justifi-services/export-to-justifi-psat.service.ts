import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { PsatService } from '../../../psat/psat.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../models/assessment';
import { Settings } from '../../models/settings';
import { Modification, PsatOutputs } from '../../models/psat';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiPsatService {

  constructor(private psatService: PsatService,
    private settingsDbService: SettingsDbService
  ) { }


  // PSAT
  fillPSATWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Pump';

    if (assessment.psat.setupDone == true) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let baselineResults: PsatOutputs = this.psatService.resultsExisting(JSON.parse(JSON.stringify(assessment.psat.inputs)), settings);
      //F: electricity use
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = baselineResults.annual_energy;
      //G: Electricity unit
      //TODO: always MWh?
      assessmentWorksheet.getCell('G' + assessmentRowIndex).value = 'MWh';

      //set modification
      let modification: Modification = assessment.psat.modifications[0];
      if (assessment.psat.selectedModificationId) {
        modification = assessment.psat.modifications.find(mod => mod.id === assessment.psat.selectedModificationId);
      } else if (assessment.psat.modifications && assessment.psat.modifications.length > 0) {
        modification = assessment.psat.modifications[0];
      }
      if (modification) {
        let modResults: PsatOutputs;
        if (!modification.psat.inputs.whatIfScenario) {
          modResults = this.psatService.resultsExisting(JSON.parse(JSON.stringify(assessment.psat.inputs)), settings);
        } else {
          modResults = this.psatService.resultsModified(JSON.parse(JSON.stringify(modification.psat.inputs)), settings);
          //H: electricity savings
          assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineResults.annual_energy - modResults.annual_energy;
        }
        //E: implementation costs
        assessmentWorksheet.getCell('E' + assessmentRowIndex).value = modification.psat.inputs.implementationCosts;
        if (modification.exploreOpportunities) {
          let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
          //TODO: add EEMs if Explore opps
          if (modification.exploreOppsShowVfd && modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowVfd.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowMotorDrive && modification.exploreOppsShowMotorDrive.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowMotorDrive.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowPumpType && modification.exploreOppsShowPumpType.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowPumpType.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowRatedMotorData && modification.exploreOppsShowRatedMotorData.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowRatedMotorData.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowSystemData && modification.exploreOppsShowSystemData.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowSystemData.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowFlowRate && modification.exploreOppsShowFlowRate.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowFlowRate.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowHead && modification.exploreOppsShowHead.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowHead.display;
            eemRowIndex++;
          }
        }
      }
    }
    return eemRowIndex;
  }
}
