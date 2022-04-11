import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { OpportunityCost, OpportunitySummary } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';
import * as XLSX from 'xlsx';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import * as ExcelJS from 'exceljs';
import * as fs from 'file-saver';

@Component({
  selector: 'app-opportunity-summary-copy-table',
  templateUrl: './opportunity-summary-copy-table.component.html',
  styleUrls: ['./opportunity-summary-copy-table.component.css']
})
export class OpportunitySummaryCopyTableComponent implements OnInit {
  @Input()
  opportunitySummaries: Array<OpportunitySummary>;
  @Input()
  settings: Settings;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;
  tableString: any;

  fileName: string;
  pink: string = 'FFFFD9EF';
  blue: string = 'FFD9E1F2';
  yellow: string = 'FFFFF2CC';
  green: string = 'FFE2EFDA';
  individualOpportunitySummaries: Array<OpportunitySummary>;
  constructor() { }

  ngOnInit() {
    this.setIndividualSummaries();
  }

  setIndividualSummaries() {
    this.individualOpportunitySummaries = new Array();
    this.opportunitySummaries.forEach(summary => {
      if (summary.mixedIndividualResults) {
        summary.mixedIndividualResults.forEach(mixedSummary => {
          this.individualOpportunitySummaries.push(mixedSummary);
        })
      } else {
        this.individualOpportunitySummaries.push(summary);
      }
    })
  }

  getMaterialCost(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.material;
    } else {
      return 0;
    }
  }

  getLaborCost(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.labor;
    } else {
      return 0;
    }
  }

  getOtherCost(oppCost: OpportunityCost): number {
    let total: number = 0;
    if (oppCost && oppCost.otherCosts && oppCost.otherCosts.length != 0) {
      oppCost.otherCosts.forEach(oCost => {
        total = total + oCost.cost;
      });
    }
    if (oppCost && oppCost.additionalSavings) {
      total = total - oppCost.additionalSavings.cost
    }
    return total;
  }

  getEngineeringCost(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.engineeringServices;
    } else {
      return 0;
    }
  }

  getEffortToImplement(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.implementationEffort;
    } else {
      return 0;
    }
  }

  updateTableString() {
    this.setIndividualSummaries();
    this.tableString = this.copyTable.nativeElement.innerText;
  }

  exportToExcel() {
    if (!this.fileName) {
      this.fileName = this.getFileName();
    }
    const workbook: ExcelJS.Workbook = this.getWorkBook();
    workbook.xlsx.writeBuffer().then(excelData => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, this.fileName + '.xlsx');
    });
    this.hideExportModal();
  }

  getWorkBook(): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    workbook.properties.date1904 = true;
    workbook.calcProperties.fullCalcOnLoad = true;
    workbook.worksheets[0] = this.getWorksheet1(workbook);
    workbook.worksheets[1] = this.getWorksheet2(workbook);
    return workbook;
  }

  showExportModal() {
    this.fileName = this.getFileName();
    this.setIndividualSummaries();
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
  }

  getFileName(): string {
    const date: Date = new Date();
    let formatedDate: string = moment(date).format("MMM D, YYYY").toString();
    return formatedDate + '_Project Tracker.xlsx';
  }

  getWorksheet1(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    const worksheet1 = workbook.addWorksheet('Opportunity Summary', { properties: { tabColor: { argb: 'FF92D050' } } });
    let tableId1: string = this.copyTable.nativeElement.id;
    let targetTableElm: HTMLElement = document.getElementById(tableId1);
    let sheet1: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: "Opportunity Summary" });
    let table1Rows: any[][] = XLSX.utils.sheet_to_json(sheet1);
    const header = Object.keys(table1Rows[0]);
    worksheet1.getCell('A1').value = 'Opportunity Summary';
    const title = worksheet1.getCell('A1');
    title.font = { name: 'Calibri (Body)', size: 40, bold: true, color: { argb: 'FFFFFFFF' } };
    title.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF203864' }
    };
    title.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet1.mergeCells('A1', 'O5');
    worksheet1.columns = [
      {
        key: 'Opportunity Name',
        width: 30,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Utility',
        width: 12,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Team',
        width: 12,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Equipment',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Owner/Lead',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Utility Savings',
        width: 14,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'right' },
          numFmt: '#,##0.00_);[Red](#,##0.00)'
        }
      },
      {
        key: 'Utility Savings Units',
        width: 19,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'left' }
        }
      },
      {
        key: 'Cost Savings',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Material Cost',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Labor Cost',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Engineering Cost',
        width: 16,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Other Cost',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Total Cost',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Simple Payback',
        width: 20,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '#,##0.00_);[Red](#,##0.00)'
        }
      },
      {
        key: 'Effort to Implement',
        width: 20,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      }
    ];
    const headerRow = worksheet1.addRow(header);
    headerRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    table1Rows.forEach(d => {
      let row = worksheet1.addRow(Object.values(d));
      row.font = { name: 'Calibri', size: 12, color: { argb: 'FF000000' } };
    });
    return worksheet1
  }

  getWorksheet2(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    const worksheet2 = workbook.addWorksheet('Projects Tracker', { properties: { tabColor: { argb: 'FF92D050' } } });
    let tableId2: string = this.copyTable2.nativeElement.id;
    let targetTable2Elm: HTMLElement = document.getElementById(tableId2);
    let sheet2: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTable2Elm, <XLSX.Table2SheetOpts>{ sheet: "Project Tracking" });
    let table2Rows: any[][] = XLSX.utils.sheet_to_json(sheet2);
    const header = Object.keys(table2Rows[0]);
    worksheet2.getCell('A1').value = 'Project Tracker Tool';
    const title = worksheet2.getCell('A1');
    title.font = { name: 'Calibri (Body)', size: 40, bold: true, color: { argb: 'FFFFFFFF' } };
    title.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF203864' }
    };
    title.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet2.mergeCells('A1', 'H5');
    worksheet2.getCell('I1').style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203864' } },
    };
    worksheet2.mergeCells('I1', 'S5');

    worksheet2.getCell('A6').value = 'Projects Summary';
    worksheet2.getCell('A6').style = {
      font: { name: 'Calibri', size: 14, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { bottom: { style: 'double', color: { argb: 'FF000000' } } }
    };
    worksheet2.mergeCells('A6', 'D6');

    worksheet2.getCell('A7').value = 'Total Savings (USD)';
    worksheet2.getCell('A7').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('A7', 'B7');

    let c7 = worksheet2.getCell('C7');
    c7.value = { formula: 'SUM(L13:L900)', date1904: true };
    c7.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '$#,##0.00_);[Red]($#,##0.00)'
    };
    worksheet2.mergeCells('C7', 'D7');

    worksheet2.getCell('A8').value = 'Total Implementaion Cost (USD)';
    worksheet2.getCell('A8').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('A8', 'B8');

    let c8 = worksheet2.getCell('C8');
    c8.value = { formula: 'SUM(K13:K900)', date1904: true };
    c8.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '$#,##0.00_);[Red]($#,##0.00)'
    };
    worksheet2.mergeCells('C8', 'D8');

    worksheet2.getCell('A9').value = 'Total Electricity Savings (kWh)';
    worksheet2.getCell('A9').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('A9', 'B9');

    let c9 = worksheet2.getCell('C9');
    c9.value = { formula: 'SUMIF(R13:R901,"kWh", Q13:Q901)', date1904: true };
    c9.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '$#,##0.00_);[Red]($#,##0.00)'
    };
    worksheet2.mergeCells('C9', 'D9');

    worksheet2.getCell('A10').value = 'Total Natural Gas Savings (MMBtu)';
    worksheet2.getCell('A10').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('A10', 'B10');

    let c10 = worksheet2.getCell('C10');
    c10.value = { formula: 'SUMIF(R13:R901,"MMBtu", Q13:Q901)', date1904: true };
    c10.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '$#,##0.00_);[Red]($#,##0.00)'
    };
    worksheet2.mergeCells('C10', 'D10');

    worksheet2.getCell('A11').value = 'Overall Payback (Years)';
    worksheet2.getCell('A11').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('A11', 'B11');

    let c11 = worksheet2.getCell('C11');
    c11.value = { formula: 'IFERROR(C8/C7,"")', date1904: true };
    c11.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '0.00'
    };

    let D11 = worksheet2.getCell('D11');
    D11.value = { formula: '"or "&TEXT(IFERROR(C11*12,0),"0.0")&" months"', date1904: true };
    D11.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '0.00'
    };

    worksheet2.getCell('E6').value = 'Implementation Summary';
    worksheet2.getCell('E6').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { bottom: { style: 'double', color: { argb: 'FF000000' } } }
    };
    worksheet2.mergeCells('E6', 'H6');

    worksheet2.getCell('E7').value = 'Total Projects';
    worksheet2.getCell('E7').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('E7', 'F7');

    let g7 = worksheet2.getCell('G7');
    g7.value = { formula: 'COUNTA(A13:A901)', date1904: true };
    g7.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'left' }
    };
    worksheet2.mergeCells('G7', 'H7');

    worksheet2.getCell('E8').value = 'Implemented';
    worksheet2.getCell('E8').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('E8', 'F8');

    let g8 = worksheet2.getCell('G8');
    g8.value = { formula: 'COUNTIF(J13:J901,"Implemented")', date1904: true };
    g8.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'left' }
    };
    worksheet2.mergeCells('G8', 'H8');

    worksheet2.getCell('E9').value = 'Total Savings (USD)';
    worksheet2.getCell('E9').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('E9', 'F9');

    let g9 = worksheet2.getCell('G9');
    g9.value = { formula: 'SUM(O13:O901)', date1904: true };
    g9.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '$#,##0.00_);[Red]($#,##0.00)'
    };
    worksheet2.mergeCells('G9', 'H9');

    worksheet2.getCell('E10').value = 'Total Implementaion Cost (USD)';
    worksheet2.getCell('E10').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('E10', 'F10');

    let g10 = worksheet2.getCell('G10');
    g10.value = { formula: 'SUM(N13:N901)', date1904: true };
    g10.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '$#,##0.00_);[Red]($#,##0.00)'
    };
    worksheet2.mergeCells('G10', 'H10');

    worksheet2.getCell('E11').value = 'Overall Payback (Years)';
    worksheet2.getCell('E11').style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    };
    worksheet2.mergeCells('E11', 'F11');

    let g11 = worksheet2.getCell('G11');
    g11.value = { formula: 'IFERROR(G10/G9,"")', date1904: true };
    g11.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '0.00'
    };

    let h11 = worksheet2.getCell('H11');
    h11.value = { formula: '"or "&TEXT(IFERROR(G11*12,0),"0.0")&" months"', date1904: true };
    h11.style = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      numFmt: '0.00'
    };

    let I6 = worksheet2.getCell('I6');
    I6.style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
      border: null
    };
    worksheet2.mergeCells('I6', 'S11');

    worksheet2.columns = [
      {
        key: 'Opportunity Name',
        width: 30,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Utility',
        width: 12,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Team',
        width: 12,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Equipment',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Owner/Lead',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Effort to Implement',
        width: 20,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.green } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Date Started',
        width: 16,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: 'm/d/yyyy'
        }
      },
      {
        key: 'Date Completed',
        width: 16,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: 'm/d/yyyy'
        }
      },
      {
        key: 'Assigned',
        width: 12,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Status',
        width: 12,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.yellow } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Estimated Implementation Cost',
        width: 31,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Estimated Cost Savings',
        width: 22,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Estimated Payback',
        width: 18,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Actual Implementation Cost',
        width: 27,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Actual Cost Savings',
        width: 19,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '$#,##0.00_);[Red]($#,##0.00)'
        }
      },
      {
        key: 'Actual Payback',
        width: 15,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' }
        }
      },
      {
        key: 'Estimated Utility Savings',
        width: 24,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'right' },
          numFmt: '#,##0.00_);[Red](#,##0.00)'
        }
      },
      {
        key: 'Utility Savings Units',
        width: 19,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.pink } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'left' }
        }
      },
      {
        key: 'Actual Utility Savings',
        width: 20,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.blue } },
          border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          numFmt: '#,##0.00_);[Red](#,##0.00)'
        }
      }
    ];
    const headerRow = worksheet2.addRow(header);
    headerRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    table2Rows.forEach(d => {
      let row = worksheet2.addRow(Object.values(d));
      row.font = { name: 'Calibri', size: 12, color: { argb: 'FF000000' } };
    });

    return worksheet2
  }

}