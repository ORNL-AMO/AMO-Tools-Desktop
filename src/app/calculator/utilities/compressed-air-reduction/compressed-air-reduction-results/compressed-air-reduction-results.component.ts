import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CompressedAirReductionResults } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-compressed-air-reduction-results',
  templateUrl: './compressed-air-reduction-results.component.html',
  styleUrls: ['./compressed-air-reduction-results.component.css']
})
export class CompressedAirReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  compressedAirReductionResults: CompressedAirReductionResults;
  @Input()
  modificationExists: boolean;
  @Input()
  utilityType: number;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  table2String: any;

  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

  updateTable1String() {
    this.table1String = this.copyTable1.nativeElement.innerText;
  }

  updateTable2String() {
    this.table2String = this.copyTable2.nativeElement.innerText;
  }
}
