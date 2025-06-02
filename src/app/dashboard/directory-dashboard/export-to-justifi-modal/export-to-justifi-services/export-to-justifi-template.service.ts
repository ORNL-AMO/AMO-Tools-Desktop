import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { ExportToJustifiPsatService } from './export-to-justifi-psat.service';
import { Assessment } from '../../../../shared/models/assessment';
import { Settings } from '../../../../shared/models/settings';
import { ExportToJustifiFsatService } from './export-to-justifi-fsat.service';

@Injectable({
  providedIn: 'root'
})
export class ExportToJustifiTemplateService {

  constructor(private exportToJustifiPsatService: ExportToJustifiPsatService,
    private exportToJustifiFsatService: ExportToJustifiFsatService
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
          // let account: IdbAccount = this.accountDbService.selectedAccount.getValue();
          // let accountName: string = account.name;
          // accountName = accountName.replaceAll(' ', '-');
          // accountName = accountName.replaceAll('.', '_');
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

      //D: savings data level
      //Individual or Assessment
      // if (assessment.type == 'CompressedAir' || assessment.type == 'TreasureHunt') {
      //   assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Individual';
      // } else {
      //   assessmentWorksheet.getCell('D' + assessmentRowIndex).value = 'Assessment';
      // }

      if (assessment.type == 'PSAT') {
        eemRowIndex = this.exportToJustifiPsatService.fillPSATWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      } else if (assessment.type == 'FSAT') {
        eemRowIndex = this.exportToJustifiFsatService.fillFSATWorksheet(workbook, assessment, assessmentRowIndex, eemRowIndex);
      }

      //E: implementation costs
      //F: electricity use
      //G: Electricity unit
      //H: electricity savings
      //I: NG use
      //J: NG unit
      //K: NG savings
      //L: Other fuels use
      //M: Other fuels unit
      //N: Other fuels savings
      //O: water use
      //P: water unit
      //Q: water savings
      //R: waste water use
      //S: waste water unit
      //T: waste water savings
      //U: compressed air use
      //V: compressed air unit
      //W: compressed air savings
      //x: steam use
      //Y: steam unit
      //Z: steam savings
      
      assessmentRowIndex++;
    })
  }

  // PHAST
  // FSAT 
  // SSMT 
  // TreasureHunt
  // WasteWater
  // Water
  // CompressedAir


}
