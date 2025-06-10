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

    assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Assessment';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Steam';

    //TODO: need to check assessment is valid...
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    let baselineResults: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(assessment.ssmt, settings);
    //TODO: select modification
    let modification: Modification = assessment.ssmt.modifications[0];
    let modResults: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateModificationModel(modification.ssmt, settings, baselineResults.outputData);
    //E: implementation costs
    assessmentWorksheet.getCell('E' + assessmentRowIndex).value = modification.ssmt.operatingCosts.implementationCosts;


    let baselineElectricityUse: number = baselineResults.outputData.operationsOutput.sitePowerImport *
      baselineResults.inputData.operationsInput.operatingHoursPerYear;
    let modElectricityUse: number = modResults.outputData.operationsOutput.sitePowerImport *
      modResults.inputData.operationsInput.operatingHoursPerYear;

    //F: electricity use
    assessmentWorksheet.getCell('F' + assessmentRowIndex).value = baselineElectricityUse;
    //G: Electricity unit
    assessmentWorksheet.getCell('G' + assessmentRowIndex).value = 'kWh';
    //H: electricity savings
    assessmentWorksheet.getCell('H' + assessmentRowIndex).value = baselineElectricityUse - modElectricityUse;

    if (assessment.ssmt.co2SavingsData.fuelType == 'Natural Gas') {
      //I: NG use
      assessmentWorksheet.getCell('I' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage;
      //J: NG unit
      assessmentWorksheet.getCell('J' + assessmentRowIndex).value = settings.steamEnergyMeasurement;
      //K: NG savings
      assessmentWorksheet.getCell('K' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage - modResults.outputData.operationsOutput.boilerFuelUsage;
    } else {
      //L: Other fuels use
      assessmentWorksheet.getCell('L' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage;
      //M: Other fuels unit
      assessmentWorksheet.getCell('J' + assessmentRowIndex).value = settings.steamEnergyMeasurement;
      //N: Other fuels savings      
      assessmentWorksheet.getCell('N' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.boilerFuelUsage - modResults.outputData.operationsOutput.boilerFuelUsage;
    }



    //O: water use
    assessmentWorksheet.getCell('O' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.makeupWaterVolumeFlowAnnual;
    //P: water unit
    assessmentWorksheet.getCell('P' + assessmentRowIndex).value = settings.steamVolumeMeasurement;
    //Q: water savings
    assessmentWorksheet.getCell('Q' + assessmentRowIndex).value = baselineResults.outputData.operationsOutput.makeupWaterVolumeFlowAnnual - modResults.outputData.operationsOutput.makeupWaterVolumeFlowAnnual;

    if (modification.exploreOpportunities) {
      let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
      console.log(modification);
      //TODO: add EEMs if Explore opps
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

    return eemRowIndex;
  }
}
