import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ElectricityReductionResults } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-electricity-reduction-results',
  templateUrl: './electricity-reduction-results.component.html',
  styleUrls: ['./electricity-reduction-results.component.css']
})
export class ElectricityReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  electricityReductionResults: ElectricityReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0') copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1') copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2') copyTable2: ElementRef;
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
