import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { OpportunityCost, OpportunitySummary } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';
import * as XLSX from 'xlsx';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';

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
    let tableId1: string = this.copyTable.nativeElement.id;
    let tableId2: string = this.copyTable2.nativeElement.id;
    if (!this.fileName) {
      this.fileName = this.getFileName();
    }
    let targetTableElm: HTMLElement = document.getElementById(tableId1);
    let targetTable2Elm: HTMLElement = document.getElementById(tableId2);
    let sheet1: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: "Opportunity Summary" });
    let sheet2: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTable2Elm, <XLSX.Table2SheetOpts>{ sheet: "Project Tracking" });
    let wb: XLSX.WorkBook = XLSX.utils.book_new();
    wb.SheetNames = ['Opportunity Summary', 'Project Tracking'];
    wb.Sheets = { ['Opportunity Summary']: sheet1, ['Project Tracking']: sheet2 };

    XLSX.writeFile(wb, this.fileName + '.xlsx');
    this.hideExportModal();
  }

  showExportModal() {
    this.fileName = this.getFileName();
    this.setIndividualSummaries();
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
  }

  getFileName(): string{
    const date: Date = new Date();
    let formatedDate: string = moment(date).format("MMM D, YYYY").toString();
    return formatedDate + '_Project Tracker.xlsx';
  }
}
