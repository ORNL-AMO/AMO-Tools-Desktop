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

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
