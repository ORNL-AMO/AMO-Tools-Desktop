import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-executive-summary-table',
  templateUrl: './executive-summary-table.component.html',
  styleUrls: ['./executive-summary-table.component.css']
})
export class ExecutiveSummaryTableComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  showFullSummary: boolean;
  @Input()
  settings: Settings;
  @Input()
  title: string;
  @Input()
  exportToPPT: boolean;

  colSpan: number;
  tableId: string;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  
  constructor() { }

  ngOnInit() {
    if(this.showFullSummary){
      this.tableId = 'detailedSum';
      this.colSpan = 11;
    } 
    if (!this.showFullSummary){
      this.tableId = 'costSum';
      this.colSpan = 5;
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
