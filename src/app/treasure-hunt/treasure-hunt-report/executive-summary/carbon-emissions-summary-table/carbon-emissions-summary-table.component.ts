import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-carbon-emissions-summary-table',
  templateUrl: './carbon-emissions-summary-table.component.html',
  styleUrls: ['./carbon-emissions-summary-table.component.css']
})
export class CarbonEmissionsSummaryTableComponent implements OnInit {

  @Input()
  settings: Settings;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit(): void {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
