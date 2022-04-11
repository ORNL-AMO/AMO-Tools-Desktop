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

  naturalGasUnit: string;

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
        });
      } else {
        this.individualOpportunitySummaries.push(summary);
      }
    });
    if (this.settings.unitsOfMeasure == 'Imperial') {
      this.naturalGasUnit = 'MMBtu'
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.naturalGasUnit = 'MJ'
    }
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

  getJSONfromCopyTable(copyTable: ElementRef): any[][] {
    let tableId: string = copyTable.nativeElement.id;
    let targetTableElm: HTMLElement = document.getElementById(tableId);
    let sheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: "Copy Table data" });
    let tableRows: any[][] = XLSX.utils.sheet_to_json(sheet);
    return tableRows;
  }

  getWorksheet1(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    const worksheet1 = workbook.addWorksheet('Opportunity Summary', { properties: { tabColor: { argb: 'FF92D050' } } });
    worksheet1.getCell('A1').value = 'Opportunity Summary';
    worksheet1.getCell('A1').style = this.setTitleStyle();
    worksheet1.mergeCells('A1', 'O5');
    worksheet1.columns = [
      {
        key: 'Opportunity Name',
        width: 30,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Utility',
        width: 12,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Team',
        width: 12,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Equipment',
        width: 15,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Owner/Lead',
        width: 15,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Utility Savings',
        width: 14,
        style: this.setColumnsStyle(this.pink, 'right', '#,##0.00_);[Red](#,##0.00)')
      },
      {
        key: 'Utility Savings Units',
        width: 19,
        style: this.setColumnsStyle(this.pink, 'left')
      },
      {
        key: 'Cost Savings',
        width: 15,
        style: this.setColumnsStyle(this.pink, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Material Cost',
        width: 15,
        style: this.setColumnsStyle(this.yellow, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Labor Cost',
        width: 15,
        style: this.setColumnsStyle(this.yellow, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Engineering Cost',
        width: 16,
        style: this.setColumnsStyle(this.yellow, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Other Cost',
        width: 15,
        style: this.setColumnsStyle(this.yellow, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Total Cost',
        width: 15,
        style: this.setColumnsStyle(this.yellow, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Simple Payback',
        width: 20,
        style: this.setColumnsStyle(this.blue, 'center', '#,##0.00_);[Red](#,##0.00)')
      },
      {
        key: 'Effort to Implement',
        width: 20,
        style: this.setColumnsStyle(this.blue, 'center')
      }
    ];

    let table1Rows: any[][] = this.getJSONfromCopyTable(this.copyTable);
    const header = Object.keys(table1Rows[0]);
    const headerRow = worksheet1.addRow(header);
    headerRow.eachCell(cell => {
      cell.style = this.setHeaderStyle();
    });
    table1Rows.forEach(d => {
      worksheet1.addRow(Object.values(d));
    });
    return worksheet1
  }

  getWorksheet2(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    const worksheet2 = workbook.addWorksheet('Projects Tracker', { properties: { tabColor: { argb: 'FF92D050' } } });

    worksheet2.getCell('A1').value = 'Project Tracker Tool';
    worksheet2.getCell('A1').style = this.setTitleStyle();
    worksheet2.mergeCells('A1', 'H5');
    worksheet2.getCell('I1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203864' } };
    worksheet2.mergeCells('I1', 'S5');

    this.createProjectsSummaryTable(worksheet2);

    this.createImplementationsSummaryTable(worksheet2);

    worksheet2.getCell('I6').style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, border: null };
    worksheet2.mergeCells('I6', 'S11');

    worksheet2.columns = [
      {
        key: 'Opportunity Name',
        width: 30,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Utility',
        width: 12,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Team',
        width: 12,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Equipment',
        width: 15,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Owner/Lead',
        width: 15,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Effort to Implement',
        width: 20,
        style: this.setColumnsStyle(this.green, 'center')
      },
      {
        key: 'Date Started',
        width: 16,
        style: this.setColumnsStyle(this.yellow, 'center', 'm/d/yyyy')
      },
      {
        key: 'Date Completed',
        width: 16,
        style: this.setColumnsStyle(this.yellow, 'center', 'm/d/yyyy')
      },
      {
        key: 'Assigned',
        width: 12,
        style: this.setColumnsStyle(this.yellow, 'center')
      },
      {
        key: 'Status',
        width: 12,
        style: this.setColumnsStyle(this.yellow, 'center')
      },
      {
        key: 'Estimated Implementation Cost',
        width: 31,
        style: this.setColumnsStyle(this.pink, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Estimated Cost Savings',
        width: 22,
        style: this.setColumnsStyle(this.pink, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Estimated Payback',
        width: 18,
        style: this.setColumnsStyle(this.pink, 'center')
      },
      {
        key: 'Actual Implementation Cost',
        width: 27,
        style: this.setColumnsStyle(this.blue, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Actual Cost Savings',
        width: 19,
        style: this.setColumnsStyle(this.blue, 'center', '$#,##0.00_);[Red]($#,##0.00)')
      },
      {
        key: 'Actual Payback',
        width: 15,
        style: this.setColumnsStyle(this.blue, 'center')
      },
      {
        key: 'Estimated Utility Savings',
        width: 24,
        style: this.setColumnsStyle(this.pink, 'right', '#,##0.00_);[Red](#,##0.00)')
      },
      {
        key: 'Utility Savings Units',
        width: 19,
        style: this.setColumnsStyle(this.pink, 'left')
      },
      {
        key: 'Actual Utility Savings',
        width: 20,
        style: this.setColumnsStyle(this.blue, 'center', '#,##0.00_);[Red](#,##0.00)')
      }
    ];

    let table2Rows: any[][] = this.getJSONfromCopyTable(this.copyTable2);
    const header = Object.keys(table2Rows[0]);
    const headerRow = worksheet2.addRow(header);
    headerRow.eachCell(cell => {
      cell.style = this.setHeaderStyle();
    });
    table2Rows.forEach(d => {
      worksheet2.addRow(Object.values(d));
    });

    return worksheet2
  }

  setColumnsStyle(fillColor: string, alignment?: string, numFmt?: string): Partial<ExcelJS.Style> {
    let cellStyle: Partial<ExcelJS.Style>;
    cellStyle = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    }
    if (alignment) {
      if (alignment === 'left') {
        cellStyle.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      if (alignment === 'center') {
        cellStyle.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      if (alignment === 'right') {
        cellStyle.alignment = { vertical: 'middle', horizontal: 'right' };
      }
    }
    if (numFmt) {
      cellStyle.numFmt = numFmt;
    }

    return cellStyle;
  }

  setHeaderStyle(): Partial<ExcelJS.Style> {
    let cellStyle: Partial<ExcelJS.Style>;
    cellStyle = {
      font: { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
      border: {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      },
      alignment: { vertical: 'middle', horizontal: 'center' }
    }

    return cellStyle;
  }

  setTitleStyle(): Partial<ExcelJS.Style> {
    let cellStyle: Partial<ExcelJS.Style>;
    cellStyle = {
      font: { name: 'Calibri (Body)', size: 40, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203864' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    }
    return cellStyle;
  }

  setTableTitleStyle(fillColor: string): Partial<ExcelJS.Style> {
    let cellStyle: Partial<ExcelJS.Style>;
    cellStyle = {
      font: { name: 'Calibri', size: 14, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { bottom: { style: 'double', color: { argb: 'FF000000' } } }
    }
    return cellStyle;
  }

  setTableLableStyle(fillColor: string): Partial<ExcelJS.Style> {
    let cellStyle: Partial<ExcelJS.Style>;
    cellStyle = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } },
      alignment: { vertical: 'middle', horizontal: 'right' }
    }
    return cellStyle;
  }

  setTableDataStyle(fillColor: string, numFmt?: string): Partial<ExcelJS.Style> {
    let cellStyle: Partial<ExcelJS.Style>;
    cellStyle = {
      font: { name: 'Calibri', size: 12, color: { argb: 'FF000000' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } },
      alignment: { vertical: 'middle', horizontal: 'left' }
    }
    if (numFmt) {
      cellStyle.numFmt = numFmt;
    }
    return cellStyle;
  }

  createProjectsSummaryTable(workSheet: ExcelJS.Worksheet): ExcelJS.Worksheet {
    workSheet.getCell('A6').value = 'Projects Summary';
    workSheet.getCell('A6').style = this.setTableTitleStyle(this.pink);
    workSheet.mergeCells('A6', 'D6');

    workSheet.getCell('A7').value = 'Total Savings (USD)';
    workSheet.getCell('A7').style = this.setTableLableStyle(this.pink);
    workSheet.mergeCells('A7', 'B7');

    workSheet.getCell('C7').value = { formula: 'SUM(L13:L900)', date1904: true };
    workSheet.getCell('C7').style = this.setTableDataStyle(this.pink, '$#,##0.00_);[Red]($#,##0.00)');
    workSheet.mergeCells('C7', 'D7');

    workSheet.getCell('A8').value = 'Total Implementaion Cost (USD)';
    workSheet.getCell('A8').style = this.setTableLableStyle(this.pink);
    workSheet.mergeCells('A8', 'B8');


    workSheet.getCell('C8').value = { formula: 'SUM(K13:K900)', date1904: true };
    workSheet.getCell('C8').style = this.setTableDataStyle(this.pink, '$#,##0.00_);[Red]($#,##0.00)');
    workSheet.mergeCells('C8', 'D8');

    workSheet.getCell('A9').value = 'Total Electricity Savings (kWh)';
    workSheet.getCell('A9').style = this.setTableLableStyle(this.pink);
    workSheet.mergeCells('A9', 'B9');

    workSheet.getCell('C9').value = { formula: 'SUMIF(R13:R901,"kWh", Q13:Q901)', date1904: true };
    workSheet.getCell('C9').style = this.setTableDataStyle(this.pink, '$#,##0.00_);[Red]($#,##0.00)');
    workSheet.mergeCells('C9', 'D9');

    workSheet.getCell('A10').value = 'Total Natural Gas Savings (MMBtu)';
    workSheet.getCell('A10').style = this.setTableLableStyle(this.pink);
    workSheet.mergeCells('A10', 'B10');

    workSheet.getCell('C10').value = { formula: 'SUMIF(R13:R901,"MMBtu", Q13:Q901)', date1904: true };
    workSheet.getCell('C10').style = this.setTableDataStyle(this.pink, '$#,##0.00_);[Red]($#,##0.00)');
    workSheet.mergeCells('C10', 'D10');

    workSheet.getCell('A11').value = 'Overall Payback (Years)';
    workSheet.getCell('A11').style = this.setTableLableStyle(this.pink);
    workSheet.mergeCells('A11', 'B11');

    workSheet.getCell('C11').value = { formula: 'IFERROR(C8/C7,"")', date1904: true };
    workSheet.getCell('C11').style = this.setTableDataStyle(this.pink, '0.00');

    workSheet.getCell('D11').value = { formula: '"or "&TEXT(IFERROR(C11*12,0),"0.0")&" months"', date1904: true };
    workSheet.getCell('D11').style = this.setTableDataStyle(this.pink, '0.00');

    return workSheet
  }

  createImplementationsSummaryTable(workSheet: ExcelJS.Worksheet): ExcelJS.Worksheet {
    workSheet.getCell('E6').value = 'Implementation Summary';
    workSheet.getCell('E6').style = this.setTableTitleStyle(this.blue);
    workSheet.mergeCells('E6', 'H6');

    workSheet.getCell('E7').value = 'Total Projects';
    workSheet.getCell('E7').style = this.setTableLableStyle(this.blue);
    workSheet.mergeCells('E7', 'F7');

    workSheet.getCell('G7').value = { formula: 'COUNTA(A13:A901)', date1904: true };
    workSheet.getCell('G7').style = this.setTableDataStyle(this.blue);
    workSheet.mergeCells('G7', 'H7');

    workSheet.getCell('E8').value = 'Implemented';
    workSheet.getCell('E8').style = this.setTableLableStyle(this.blue);
    workSheet.mergeCells('E8', 'F8');


    workSheet.getCell('G8').value = { formula: 'COUNTIF(J13:J901,"Implemented")', date1904: true };
    workSheet.getCell('G8').style = this.setTableDataStyle(this.blue);
    workSheet.mergeCells('G8', 'H8');

    workSheet.getCell('E9').value = 'Total Savings (USD)';
    workSheet.getCell('E9').style = this.setTableLableStyle(this.blue);
    workSheet.mergeCells('E9', 'F9');

    workSheet.getCell('G9').value = { formula: 'SUM(O13:O901)', date1904: true };
    workSheet.getCell('G9').style = this.setTableDataStyle(this.blue, '$#,##0.00_);[Red]($#,##0.00)');
    workSheet.mergeCells('G9', 'H9');

    workSheet.getCell('E10').value = 'Total Implementaion Cost (USD)';
    workSheet.getCell('E10').style = this.setTableLableStyle(this.blue);
    workSheet.mergeCells('E10', 'F10');

    workSheet.getCell('G10').value = { formula: 'SUM(N13:N901)', date1904: true };
    workSheet.getCell('G10').style = this.setTableDataStyle(this.blue, '$#,##0.00_);[Red]($#,##0.00)');
    workSheet.mergeCells('G10', 'H10');

    workSheet.getCell('E11').value = 'Overall Payback (Years)';
    workSheet.getCell('E11').style = this.setTableLableStyle(this.blue);
    workSheet.mergeCells('E11', 'F11');

    workSheet.getCell('G11').value = { formula: 'IFERROR(G10/G9,"")', date1904: true };
    workSheet.getCell('G11').style = this.setTableDataStyle(this.blue, '0.00');

    workSheet.getCell('H11').value = { formula: '"or "&TEXT(IFERROR(G11*12,0),"0.0")&" months"', date1904: true };
    workSheet.getCell('H11').style = this.setTableDataStyle(this.blue, '0.00');

    return workSheet
  }


}