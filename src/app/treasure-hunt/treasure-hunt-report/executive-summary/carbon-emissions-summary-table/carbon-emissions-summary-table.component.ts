import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { TreasureHuntCo2EmissionsResults, TreasureHuntResults } from '../../../../shared/models/treasure-hunt';

@Component({
    selector: 'app-carbon-emissions-summary-table',
    templateUrl: './carbon-emissions-summary-table.component.html',
    styleUrls: ['./carbon-emissions-summary-table.component.css'],
    standalone: false
})
export class CarbonEmissionsSummaryTableComponent implements OnInit {

  @Input()
  settings: Settings;

  @Input()
  treasureHuntResults: TreasureHuntResults;  
  
  carbonResults: TreasureHuntCo2EmissionsResults;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
    this.carbonResults = this.treasureHuntResults.co2EmissionsResults;
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}