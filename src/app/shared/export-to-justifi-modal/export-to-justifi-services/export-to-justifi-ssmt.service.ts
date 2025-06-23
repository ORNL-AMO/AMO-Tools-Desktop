import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { SsmtService } from '../../../ssmt/ssmt.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../models/assessment';
import { Settings } from '../../models/settings';
import { Modification, SSMTInputs } from '../../models/steam/ssmt';
import { SSMTOutput } from '../../models/steam/steam-outputs';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiSsmtService {

  constructor(private ssmtService: SsmtService,
    private settingsDbService: SettingsDbService
  ) { }

  // SSMT
  fillSSMTWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('C' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Steam';

    if (assessment.ssmt.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let baselineResults: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(assessment.ssmt, settings);

      let baselineElectricityUse: number = baselineResults.outputData.operationsOutput.sitePowerImport *
        baselineResults.inputData.operationsInput.operatingHoursPerYear;
      //E: electricity use
      assessmentWorksheet.getCell('E' + assessmentRowIndex).value = baselineElectricityUse;
      //F: Electricity unit
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = 'kWh';
      if (assessment.ssmt.co2SavingsData.fuelType == 'Natural Gas') {
        //H: NG use
        assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage;
        //I: NG unit
        assessmentWorksheet.getCell('I' + assessmentRowIndex).value = settings.steamEnergyMeasurement;
      } else {
        //K: Other fuels use
        assessmentWorksheet.getCell('K' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage;
        //I: Other fuels unit
        assessmentWorksheet.getCell('I' + assessmentRowIndex).value = settings.steamEnergyMeasurement;
      }
      //N: water use
      assessmentWorksheet.getCell('N' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.makeupWaterVolumeFlowAnnual;
      //O: water unit
      assessmentWorksheet.getCell('O' + assessmentRowIndex).value = settings.steamVolumeMeasurement;

      let modification: Modification;
      if (assessment.ssmt.selectedModificationId) {
        modification = assessment.ssmt.modifications.find(mod => mod.modificationId === assessment.ssmt.selectedModificationId);
      } else if (assessment.ssmt.modifications && assessment.ssmt.modifications.length > 0) {
        modification = assessment.ssmt.modifications[0];
      }
      if (modification) {
        let modResults: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateModificationModel(modification.ssmt, settings, baselineResults.outputData);
        //D: implementation costs
        assessmentWorksheet.getCell('D' + assessmentRowIndex).value = modification.ssmt.operatingCosts.implementationCosts;
        let modElectricityUse: number = modResults.outputData.operationsOutput.sitePowerImport *
          modResults.inputData.operationsInput.operatingHoursPerYear;
        //G: electricity savings
        assessmentWorksheet.getCell('G' + assessmentRowIndex).value = baselineElectricityUse - modElectricityUse;


        if (assessment.ssmt.co2SavingsData.fuelType == 'Natural Gas') {
          //J: NG savings
          assessmentWorksheet.getCell('J' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage - modResults.outputData.operationsOutput.boilerFuelUsage;
        } else {
          //M: Other fuels savings      
          assessmentWorksheet.getCell('M' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage - modResults.outputData.operationsOutput.boilerFuelUsage;
        }

        //P: water savings
        assessmentWorksheet.getCell('P' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.makeupWaterVolumeFlowAnnual - modResults.outputData.operationsOutput.makeupWaterVolumeFlowAnnual;

        if (modification.exploreOpportunities) {
          let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
          //add EEMs if Explore opps
          if (modification.exploreOppsShowOperationsData && modification.exploreOppsShowOperationsData.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowOperationsData.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowUnitCosts && modification.exploreOppsShowUnitCosts.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowUnitCosts.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowBoilerData && modification.exploreOppsShowBoilerData.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowBoilerData.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowCondensateHandling && modification.exploreOppsShowCondensateHandling.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowCondensateHandling.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowHeatLoss && modification.exploreOppsShowHeatLoss.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowHeatLoss.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowSteamUsage && modification.exploreOppsShowSteamUsage.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowSteamUsage.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowCondensingTurbine && modification.exploreOppsShowCondensingTurbine.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowCondensingTurbine.display;
            eemRowIndex++;
          }

          if (modification.exploreOppsShowHighToLowPressureTurbine && modification.exploreOppsShowHighToLowPressureTurbine.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowHighToLowPressureTurbine.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowHighToMediumPressureTurbine && modification.exploreOppsShowHighToMediumPressureTurbine.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowHighToMediumPressureTurbine.display;
            eemRowIndex++;
          }
          if (modification.exploreOppsShowMediumToLowPressureTurbine && modification.exploreOppsShowMediumToLowPressureTurbine.hasOpportunity) {
            eemWorksheet.getCell('A' + eemRowIndex).value = assessment.name;
            eemWorksheet.getCell('D' + eemRowIndex).value = modification.exploreOppsShowMediumToLowPressureTurbine.display;
            eemRowIndex++;
          }
        }
      }
    }
    return eemRowIndex;
  }
}
