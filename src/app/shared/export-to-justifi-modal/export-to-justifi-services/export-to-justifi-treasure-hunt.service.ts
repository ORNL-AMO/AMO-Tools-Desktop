import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { TreasureHuntReportService } from '../../../treasure-hunt/treasure-hunt-report/treasure-hunt-report.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../models/assessment';
import { Settings } from '../../models/settings';
import { OpportunitySummary, OpportunityUtilityType, TreasureHuntResults } from '../../models/treasure-hunt';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiTreasureHuntService {

  constructor(
    private treasureHuntReportService: TreasureHuntReportService,
    private settingsDbService: SettingsDbService
  ) { }


  // Treasure Hunt
  fillTreasureHuntWorksheet(workbook: ExcelJS.Workbook, assessment: Assessment, assessmentRowIndex: number, eemRowIndex: number): number {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    assessmentWorksheet.getCell('C' + assessmentRowIndex).value = 'Individual';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Treasure Hunt';

    if (assessment.treasureHunt.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let results: TreasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(assessment.treasureHunt, settings);

      //F: Electricity unit
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = 'kWh';
      //I: NG unit
      assessmentWorksheet.getCell('I' + assessmentRowIndex).value = this.getUnit(settings, 'Natural Gas');
      //L: Other fuels unit
      assessmentWorksheet.getCell('L' + assessmentRowIndex).value = this.getUnit(settings, 'Other Fuel');
      //O: water unit
      assessmentWorksheet.getCell('O' + assessmentRowIndex).value = this.getUnit(settings, 'Water');
      //R: waste water unit
      assessmentWorksheet.getCell('R' + assessmentRowIndex).value = this.getUnit(settings, 'Waste Water');
      //U: compressed air unit
      assessmentWorksheet.getCell('U' + assessmentRowIndex).value = this.getUnit(settings, 'Compressed Air');
      //X: steam unit
      assessmentWorksheet.getCell('X' + assessmentRowIndex).value = this.getUnit(settings, 'Steam');


      //E: electricity use
      assessmentWorksheet.getCell('E' + assessmentRowIndex).value = results.electricity.baselineEnergyUsage;
      //H: NG use
      assessmentWorksheet.getCell('H' + assessmentRowIndex).value = results.naturalGas.baselineEnergyUsage;
      //K: Other fuels use
      assessmentWorksheet.getCell('K' + assessmentRowIndex).value = results.otherFuel.baselineEnergyUsage;
      //N: water use
      assessmentWorksheet.getCell('N' + assessmentRowIndex).value = results.water.baselineEnergyUsage;
      //Q: waste water use
      assessmentWorksheet.getCell('Q' + assessmentRowIndex).value = results.wasteWater.baselineEnergyUsage
      //T: compressed air use
      assessmentWorksheet.getCell('T' + assessmentRowIndex).value = results.compressedAir.baselineEnergyUsage;
      //W: steam use
      assessmentWorksheet.getCell('W' + assessmentRowIndex).value = results.steam.baselineEnergyUsage;

      let eemWorksheet = workbook.getWorksheet('Energy_Efficiency_Measures');
      //Flow Reallocation
      results.opportunitySummaries.forEach(opportunity => {
        if (opportunity.selected) {
          if (opportunity.utilityType == 'Mixed') {
            opportunity.mixedIndividualResults.forEach(mixedOpportunity => {
              this.addOpportunityToWorksheet(eemWorksheet, mixedOpportunity, eemRowIndex, assessment.name, true, settings);
              eemRowIndex++;
            })
          } else {
            this.addOpportunityToWorksheet(eemWorksheet, opportunity, eemRowIndex, assessment.name, false, settings);
            eemRowIndex++;
          }
        }
      })
    }
    return eemRowIndex;
  }

  addOpportunityToWorksheet(eemWorksheet: ExcelJS.Worksheet, opportunity: OpportunitySummary, eemRowIndex: number, assessmentName: string, isMixed: boolean, settings: Settings) {
    eemWorksheet.getCell('A' + eemRowIndex).value = assessmentName;
    if (!isMixed) {
      eemWorksheet.getCell('D' + eemRowIndex).value = opportunity.opportunityName;
    } else {
      eemWorksheet.getCell('D' + eemRowIndex).value = opportunity.opportunityName + ' (' + opportunity.utilityType + ')';
    }
    eemWorksheet.getCell('E' + eemRowIndex).value = opportunity.utilityType;
    eemWorksheet.getCell('F' + eemRowIndex).value = opportunity.totalCost;
    eemWorksheet.getCell('G' + eemRowIndex).value = opportunity.totalEnergySavings;
    eemWorksheet.getCell('I' + eemRowIndex).value = opportunity.costSavings;
    eemWorksheet.getCell('H' + eemRowIndex).value = this.getUnit(settings, opportunity.utilityType);
  }

  getUnit(settings: Settings, utilityType: OpportunityUtilityType): string {
    switch (utilityType) {
      case 'Electricity':
        return 'kWh';
      case 'Natural Gas':
        return settings.unitsOfMeasure == 'Imperial' ? 'MMBtu' : 'GJ';
      case 'Other Fuel':
        return settings.unitsOfMeasure == 'Imperial' ? 'MMBtu' : 'GJ';
      case 'Water':
        return settings.unitsOfMeasure == 'Imperial' ? 'kgal' : 'L';
      case 'Waste Water':
        return settings.unitsOfMeasure == 'Imperial' ? 'kgal' : 'L';
      case 'Compressed Air':
        return settings.unitsOfMeasure == 'Imperial' ? 'kscf' : 'm3';
      case 'Steam':
        return settings.unitsOfMeasure == 'Imperial' ? 'klb' : 'tonne';
      default:
        return '';
    }
  }
}
