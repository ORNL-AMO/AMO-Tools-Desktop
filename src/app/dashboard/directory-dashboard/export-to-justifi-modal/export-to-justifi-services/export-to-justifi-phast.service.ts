import { Injectable } from '@angular/core';
import { Assessment } from '../../../../shared/models/assessment';
import * as ExcelJS from 'exceljs';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { Settings } from '../../../../shared/models/settings';
import { ExecutiveSummaryService } from '../../../../phast/phast-report/executive-summary.service';
import { ExecutiveSummary } from '../../../../shared/models/phast/phast';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiPhastService {

  constructor(private executiveSummaryService: ExecutiveSummaryService,
    private settingsDbService: SettingsDbService
  ) { }


  // PHAST
  fillPHASTWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    //TODO: gotta figure out fuel/utility type
    // let assessmentWorksheet = workbook.getWorksheet('Assessments');

    // assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Assessment';
    // assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Process heating';

    // //TODO: need to check assessment is valid...
    // let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    // let baselineResults: ExecutiveSummary = this.executiveSummaryService.getSummary(assessment.phast, false, settings, assessment.phast);
    // //TODO: select modification
    // let modification = assessment.phast.modifications[0];
    // let modResults: ExecutiveSummary = this.executiveSummaryService.getSummary(modification.phast, true, settings, assessment.phast, baselineResults);
    // //E: implementation costs
    // assessmentWorksheet.getCell('E' + assessmentRowIndex).value = modResults.implementationCosts;


    // //F: electricity use
    // assessmentWorksheet.getCell('F' + assessmentRowIndex).value = baselineResults.annualEnergyUsed;
    // //G: Electricity unit
    // assessmentWorksheet.getCell('G' + assessmentRowIndex).value = settings.energyResultUnit;
    // //H: electricity savings
    // assessmentWorksheet.getCell('H' + assessmentRowIndex).value = modResults.annualEnergySavings;

    // if (modification.exploreOpportunities) {
    //   let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
    //   //TODO: add EEMs if Explore opps
    //   if (modification.exploreOppsShowVfd && modification.exploreOppsShowVfd.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowVfd.display;
    //     eemRowIndex++;
    //   }

    //   if (modification.exploreOppsShowDrive && modification.exploreOppsShowDrive.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowDrive.display;
    //     eemRowIndex++;
    //   }

    //   if (modification.exploreOppsShowFanType && modification.exploreOppsShowFanType.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowFanType.display;
    //     eemRowIndex++;
    //   }

    //   if (modification.exploreOppsShowMotor && modification.exploreOppsShowMotor.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowMotor.display;
    //     eemRowIndex++;
    //   }

    //   if (modification.exploreOppsShowFlowRate && modification.exploreOppsShowFlowRate.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowFlowRate.display;
    //     eemRowIndex++;
    //   }

    //   if (modification.exploreOppsShowReducePressure && modification.exploreOppsShowReducePressure.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowReducePressure.display;
    //     eemRowIndex++;
    //   }

    //   if (modification.exploreOppsShowOpData && modification.exploreOppsShowOpData.hasOpportunity && !modification.exploreOppsShowVfd.hasOpportunity) {
    //     eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
    //     eemWorksheet.getCell('B' + eemRowIndex).value = modification.exploreOppsShowOpData.display;
    //     eemRowIndex++;
    //   }
    // }

    return eemRowIndex;
  }
}
