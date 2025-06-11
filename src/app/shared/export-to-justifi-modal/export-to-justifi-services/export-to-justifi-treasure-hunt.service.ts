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

    assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Individual';
    assessmentWorksheet.getCell('B' + assessmentRowIndex).value = 'Treasure Hunt';

    if (assessment.treasureHunt.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      let results: TreasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(assessment.treasureHunt, settings);

      //G: Electricity unit
      assessmentWorksheet.getCell('G' + assessmentRowIndex).value = 'kWh';
      //J: NG unit
      assessmentWorksheet.getCell('J' + assessmentRowIndex).value = this.getUnit(settings, 'Natural Gas');
      //M: Other fuels unit
      assessmentWorksheet.getCell('M' + assessmentRowIndex).value = this.getUnit(settings, 'Other Fuel');
      //P: water unit
      assessmentWorksheet.getCell('P' + assessmentRowIndex).value = this.getUnit(settings, 'Water');
      //S: waste water unit
      assessmentWorksheet.getCell('S' + assessmentRowIndex).value = this.getUnit(settings, 'Waste Water');
      //V: compressed air unit
      assessmentWorksheet.getCell('V' + assessmentRowIndex).value = this.getUnit(settings, 'Compressed Air');
      //Y: steam unit
      assessmentWorksheet.getCell('Y' + assessmentRowIndex).value = this.getUnit(settings, 'Steam');


      //F: electricity use
      assessmentWorksheet.getCell('F' + assessmentRowIndex).value = results.electricity.baselineEnergyUsage;
      //H: electricity savings;
      //I: NG use
      assessmentWorksheet.getCell('I' + assessmentRowIndex).value = results.naturalGas.baselineEnergyUsage;
      //K: NG savings
      //L: Other fuels use
      assessmentWorksheet.getCell('L' + assessmentRowIndex).value = results.otherFuel.baselineEnergyUsage;
      //N: Other fuels savings
      //O: water use
      assessmentWorksheet.getCell('O' + assessmentRowIndex).value = results.water.baselineEnergyUsage;
      //Q: water savings
      //R: waste water use
      assessmentWorksheet.getCell('R' + assessmentRowIndex).value = results.wasteWater.baselineEnergyUsage;
      //T: waste water savings
      //U: compressed air use
      assessmentWorksheet.getCell('U' + assessmentRowIndex).value = results.compressedAir.baselineEnergyUsage;
      //W: compressed air savings
      //x: steam use
      assessmentWorksheet.getCell('X' + assessmentRowIndex).value = results.steam.baselineEnergyUsage;
      //Z: steam savings

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
