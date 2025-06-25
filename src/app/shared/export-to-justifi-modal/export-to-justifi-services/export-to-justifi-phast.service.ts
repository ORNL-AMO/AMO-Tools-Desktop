import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { ExecutiveSummaryService } from '../../../phast/phast-report/executive-summary.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../models/assessment';
import { Settings } from '../../models/settings';
import { ExecutiveSummary, Modification, PHAST, PhastResults } from '../../models/phast/phast';
import { PhastResultsService } from '../../../phast/phast-results.service';
@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiPhastService {

  constructor(private executiveSummaryService: ExecutiveSummaryService,
    private settingsDbService: SettingsDbService,
    private phastResultsService: PhastResultsService
  ) { }

  // PHAST
  fillPHASTWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');
    assessmentWorksheet.getCell('C' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Process heating';
    if (assessment.phast.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let baselineResults: PhastResults = this.phastResultsService.getResults(assessment.phast, settings);

      let modification: Modification;
      let modResults: PhastResults;
      if (assessment.phast.selectedModificationId) {
        modification = assessment.phast.modifications.find(mod => mod.id === assessment.phast.selectedModificationId);
        modResults = this.phastResultsService.getResults(modification.phast, settings);
      } else if (assessment.phast.modifications && assessment.phast.modifications.length > 0) {
        modification = assessment.phast.modifications[0]
        modResults = this.phastResultsService.getResults(modification.phast, settings);
      }

      if (settings.furnaceType == 'Electric Arc Furnace (EAF)') {
        this.setEAFResults(assessmentWorksheet, assessmentRowIndex, baselineResults, modResults);
      } else {
        this.setNonEAFResults(assessmentWorksheet, assessmentRowIndex, baselineResults, modResults, modification, assessment.phast, settings);
      }

      if (modification) {
        //E: implementation costs
        assessmentWorksheet.getCell('D' + assessmentRowIndex).value = modification.phast.implementationCost;
        if (modification.exploreOpportunities) {
          let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
          if (modification.exploreOppsShowFlueGas && modification.exploreOppsShowFlueGas.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowFlueGas.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowAirTemp && modification.exploreOppsShowAirTemp.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowAirTemp.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowMaterial && modification.exploreOppsShowMaterial.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowMaterial.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowAllTimeOpen && modification.exploreOppsShowAllTimeOpen.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowAllTimeOpen.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowOpening && modification.exploreOppsShowOpening.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowOpening.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowAllEmissivity && modification.exploreOppsShowAllEmissivity.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowAllEmissivity.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowCooling && modification.exploreOppsShowCooling.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowCooling.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowAtmosphere && modification.exploreOppsShowAtmosphere.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowAtmosphere.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowOperations && modification.exploreOppsShowOperations.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowOperations.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowLeakage && modification.exploreOppsShowLeakage.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowLeakage.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowSlag && modification.exploreOppsShowSlag.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowSlag.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowWall && modification.exploreOppsShowWall.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowWall.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowEfficiencyData && modification.exploreOppsShowEfficiencyData.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowEfficiencyData.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowAllTemp && modification.exploreOppsShowAllTemp.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowAllTemp.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowFixtures && modification.exploreOppsShowFixtures.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowFixtures.display;
            eemRowIndex++;
          }
        }
      }
    }
    return eemRowIndex;
  }

  setNonEAFResults(assessmentWorksheet: ExcelJS.Worksheet, assessmentRowIndex: number, baselineResults: PhastResults, modResults: PhastResults, modification: Modification, phast: PHAST, settings: Settings) {
    let baselineSummary: ExecutiveSummary = this.executiveSummaryService.getSummary(phast, false, settings, phast, undefined, baselineResults);
    if (phast.co2SavingsData && phast.co2SavingsData.fuelType == 'Steam & Hot Water') {
      //W: steam use
      assessmentWorksheet.getCell('W' + assessmentRowIndex).value = baselineSummary.annualEnergyUsed;
      //X: steam unit
      assessmentWorksheet.getCell('X' + assessmentRowIndex).value = settings.energyResultUnit;
    } else if (phast.co2SavingsData && phast.co2SavingsData.fuelType == 'Natural Gas') {
      //H: NG use
      assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineSummary.annualEnergyUsed;
      //I: NG unit
      assessmentWorksheet.getCell('I' + assessmentRowIndex).value = settings.energyResultUnit;
    } else {
      //K: Other fuels use
      assessmentWorksheet.getCell('K' + assessmentRowIndex).value = baselineSummary.annualEnergyUsed;
      //L: Other fuels unit
      assessmentWorksheet.getCell('L' + assessmentRowIndex).value = settings.energyResultUnit;
    }
    if (modification) {
      let modSummary: ExecutiveSummary = this.executiveSummaryService.getSummary(modification.phast, true, settings, phast, baselineSummary, modResults);
      if (modification.phast.co2SavingsData && modification.phast.co2SavingsData.fuelType == 'Steam & Hot Water') {
        //Y: steam savings
        assessmentWorksheet.getCell('Y' + assessmentRowIndex).value = baselineSummary.annualEnergyUsed - modSummary.annualEnergyUsed;
      } else if (modification.phast.co2SavingsData && modification.phast.co2SavingsData.fuelType == 'Natural Gas') {
        //J: NG savings
        assessmentWorksheet.getCell('J' + assessmentRowIndex).value = baselineSummary.annualEnergyUsed - modSummary.annualEnergyUsed;
      }
      else {
        //M: Other fuels savings
        assessmentWorksheet.getCell('M' + assessmentRowIndex).value = baselineSummary.annualEnergyUsed - modSummary.annualEnergyUsed;
      }
    }
  }

  setEAFResults(assessmentWorksheet: ExcelJS.Worksheet, assessmentRowIndex: number, baselineResults: PhastResults, modResults: PhastResults) {
    //E: electricity use
    assessmentWorksheet.getCell('E' + assessmentRowIndex).value = baselineResults.annualEAFResults.electricEnergyUsed;
    //F: Electricity unit
    assessmentWorksheet.getCell('F' + assessmentRowIndex).value = 'kWh';
    //H: NG use
    assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineResults.annualEAFResults.naturalGasUsed;
    //I: NG unit
    assessmentWorksheet.getCell('I' + assessmentRowIndex).value = 'kWh';

    let totalBaselineOtherFuelUsed = baselineResults.annualEAFResults.otherFuelUsed + baselineResults.annualEAFResults.electrodeEnergyUsed + baselineResults.annualEAFResults.coalCarbonUsed;
    //K: Other fuels use
    assessmentWorksheet.getCell('K' + assessmentRowIndex).value = totalBaselineOtherFuelUsed;
    //L: Other fuels unit
    assessmentWorksheet.getCell('L' + assessmentRowIndex).value = 'kWh';

    if (modResults) {
      //G: electricity savings
      assessmentWorksheet.getCell('G' + assessmentRowIndex).value = baselineResults.annualEAFResults.electricEnergyUsed - modResults.annualEAFResults.electricEnergyUsed;
      //J: NG savings
      assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineResults.annualEAFResults.naturalGasUsed - modResults.annualEAFResults.naturalGasUsed;
      let totalModOtherFuelUsed = modResults.annualEAFResults.otherFuelUsed + modResults.annualEAFResults.electrodeEnergyUsed + modResults.annualEAFResults.coalCarbonUsed;
      //M: Other fuels use
      assessmentWorksheet.getCell('M' + assessmentRowIndex).value = totalBaselineOtherFuelUsed - totalModOtherFuelUsed;
    }
  }
}
