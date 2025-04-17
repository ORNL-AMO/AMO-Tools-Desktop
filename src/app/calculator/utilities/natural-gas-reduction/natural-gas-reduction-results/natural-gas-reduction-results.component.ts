import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { NaturalGasReductionResults } from '../../../../shared/models/standalone';

@Component({
    selector: 'app-natural-gas-reduction-results',
    templateUrl: './natural-gas-reduction-results.component.html',
    styleUrls: ['./natural-gas-reduction-results.component.css'],
    standalone: false
})
export class NaturalGasReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: NaturalGasReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  table2String: any;

  constructor() { }

  ngOnInit() {
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if ((changes.baselineResults || changes.modificationResults) && this.modificationExists) {
  //     this.getSavings();
  //   }
  // }

  // getSavings(): void {
  //   if (this.modificationExists) {
  //     this.annualEnergySavings = this.baselineResults.energyUse - this.modificationResults.energyUse;
  //     this.annualCostSavings = this.baselineResults.energyCost - this.modificationResults.energyCost;
  //   }
  // }

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
