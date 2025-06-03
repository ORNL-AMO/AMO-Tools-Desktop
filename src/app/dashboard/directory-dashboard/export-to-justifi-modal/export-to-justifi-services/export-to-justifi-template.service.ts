import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { ExportToJustifiPsatService } from './export-to-justifi-psat.service';
import { Assessment } from '../../../../shared/models/assessment';
import { Settings } from '../../../../shared/models/settings';
import { ExportToJustifiFsatService } from './export-to-justifi-fsat.service';
import { ExportToJustifiSsmtService } from './export-to-justifi-ssmt.service';
import { ExportToJustifiPhastService } from './export-to-justifi-phast.service';
import { ExportToJustifiCompressedAirService } from './export-to-justifi-compressed-air.service';
import { ExportToJustifiTreasureHuntService } from './export-to-justifi-treasure-hunt.service';
import { ExportToJustifiWasteWaterService } from './export-to-justifi-waste-water.service';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiTemplateService {

  constructor(private exportToJustifiPsatService: ExportToJustifiPsatService,
    private exportToJustifiFsatService: ExportToJustifiFsatService,
    private exportToJustifiSsmtService: ExportToJustifiSsmtService,
    private exportToJustifiPhastService: ExportToJustifiPhastService,
    private exportToJustifiCompressedAirService: ExportToJustifiCompressedAirService,
    private exportToJustifiTreasureHuntService: ExportToJustifiTreasureHuntService,
    private exportToJustifiWasteWaterService: ExportToJustifiWasteWaterService
  ) { }

  exportData(settings: Settings, assessments: Array<Assessment>) {
    let workbook = new ExcelJS.Workbook();
    var request = new XMLHttpRequest();
    request.open('GET', 'assets/templates/JUSTIFI_project_template.xlsx', true);
    request.responseType = 'blob';
    request.onload = () => {
      workbook.xlsx.load(request.response).then(() => {
        this.fillWorkbook(workbook, settings, assessments);
        workbook.xlsx.writeBuffer().then(excelData => {
          let blob: Blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          let a = document.createElement("a");
          let url = window.URL.createObjectURL(blob);
          a.href = url;
          let date = new Date();
          let datePipe = new DatePipe('en-us');
          a.download = "MEASUR_To_JUSTIFI" + "-" + datePipe.transform(date, 'MM-dd-yyyy');
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          // this.loadingService.setLoadingStatus(false);
        });
      })
    };
    // this.loadingService.setLoadingMessage('Exporting to .xlsx template');
    // this.loadingService.setLoadingStatus(true);
    request.send();
  }

  fillWorkbook(workbook: ExcelJS.Workbook, settings: Settings, assessments: Array<Assessment>) {
    this.fillFacilityWorksheet(workbook, settings);
    this.fillAssessmentsWorksheets(workbook, assessments);
  }

  fillFacilityWorksheet(workbook: ExcelJS.Workbook, settings: Settings) {

    let facilityWorksheet = workbook.getWorksheet('Facility');
    //name: B2
    facilityWorksheet.getCell('B2').value = settings.facilityInfo.facilityName;

    //address b4
    facilityWorksheet.getCell('B4').value = settings.facilityInfo.address.street;
    //country b5
    facilityWorksheet.getCell('B5').value = settings.facilityInfo.address.country;
    //state b6
    facilityWorksheet.getCell('B6').value = settings.facilityInfo.address.state;
    //city b7
    facilityWorksheet.getCell('B7').value = settings.facilityInfo.address.city;
    //zip b8
    facilityWorksheet.getCell('B8').value = settings.facilityInfo.address.zip;


    //TODO: fill out use from assessments?
    //electricity
    //use b11
    //unit c11 Imperial/Metric
    //price d11
    facilityWorksheet.getCell('D11').value = settings.electricityCost;


    //natural gas
    //use b12
    //unit c12
    //price d12
    //TODO: fuel cost?
    facilityWorksheet.getCell('D12').value = settings.fuelCost;

    //water
    //use b13
    //unit c13
    //price d13

    //water water
    //use b14
    //unit c14
    //price d14

    //steam
    //use b15
    //unit c15
    //price d15
    facilityWorksheet.getCell('D15').value = settings.steamCost;

    //compressed air
    //use b16
    //unit c16
    //price d16
  }

  fillAssessmentsWorksheets(workbook: ExcelJS.Workbook, assessments: Array<Assessment>) {
    let assessmentWorksheet = workbook.getWorksheet('Assessments');

    let assessmentRowIndex = 3;
    let eemRowIndex = 3;
    assessments.forEach(assessment => {
      //A: name
      assessmentWorksheet.getCell('A' + assessmentRowIndex).value = assessment.name;
      //B Type
      // assessmentWorksheet.getCell('B' + assessmentRowIndex).value = assessment.type;
      //C: date
      //assessment date not a thing

      if (assessment.type == 'PSAT') {
        eemRowIndex = this.exportToJustifiPsatService.fillPSATWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'FSAT') {
        eemRowIndex = this.exportToJustifiFsatService.fillFSATWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'SSMT') {
        eemRowIndex = this.exportToJustifiSsmtService.fillSSMTWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'PHAST') {
        eemRowIndex = this.exportToJustifiPhastService.fillPHASTWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'CompressedAir') {
        eemRowIndex = this.exportToJustifiCompressedAirService.fillCompressedAirWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'TreasureHunt') {
        eemRowIndex = this.exportToJustifiTreasureHuntService.fillTreasureHuntWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'WasteWater') {
        eemRowIndex = this.exportToJustifiWasteWaterService.fillWasteWaterWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      }
      assessmentRowIndex++;
    })
  }
}
