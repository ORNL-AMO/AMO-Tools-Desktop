import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { OpportunityCost, OpportunitySummary } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';
import * as XLSX from 'xlsx';
import { ModalDirective } from 'ngx-bootstrap/modal';

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
  
  
  fileName: string;
  individualOpportunitySummaries: Array<OpportunitySummary>;
  constructor( private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.individualOpportunitySummaries = new Array();
  }

  ngAfterViewInit(){
    this.setIndividualSummaries();
    this.cd.detectChanges();
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
    this.exportToExcel();
  } 

  exportToExcel() {
    let tableId1: string = this.copyTable.nativeElement.id;
    let tableId2: string = this.copyTable2.nativeElement.id;
    const date = new Date();
    const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
    if(!this.fileName){
      this.fileName = dateStr +'_Treasure-Hunt-Tracking.xlsx';
    }
    let targetTableElm: HTMLElement = document.getElementById(tableId1);
    let targetTable2Elm: HTMLElement = document.getElementById(tableId2);
    let sheet1: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: "Opportunity Summary" });
    let sheet2: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTable2Elm, <XLSX.Table2SheetOpts>{ sheet: "Project Tracking" });
    let wb: XLSX.WorkBook = XLSX.utils.book_new();
    wb.SheetNames = ['Opportunity Summary', 'Project Tracking'];
    wb.Sheets = {['Opportunity Summary']: sheet1, ['Project Tracking']: sheet2 };
    
    XLSX.writeFile(wb, this.fileName + '.xlsx');
    this.hideExportModal();
  }

  showExportModal() {
    const date = new Date();
    const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();   
    this.fileName = dateStr +'_Treasure-Hunt-Tracking.xlsx';
    this.setIndividualSummaries();
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
  }
}
