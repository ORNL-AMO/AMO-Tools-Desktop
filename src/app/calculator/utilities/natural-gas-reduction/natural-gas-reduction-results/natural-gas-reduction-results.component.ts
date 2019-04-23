import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { NaturalGasReductionResults } from '../natural-gas-reduction.service';
import { Settings } from '../../../../shared/models/settings';
import * as d3 from 'd3';

@Component({
  selector: 'app-natural-gas-reduction-results',
  templateUrl: './natural-gas-reduction-results.component.html',
  styleUrls: ['./natural-gas-reduction-results.component.css']
})
export class NaturalGasReductionResultsComponent implements OnInit, OnChanges {
  @Input()
  settings: Settings;
  @Input()
  baselineResults: NaturalGasReductionResults;
  @Input()
  modificationResults: NaturalGasReductionResults;
  @Input()
  modificationExists: boolean;

  annualEnergySavings: number;
  annualCostSavings: number;
  format: any;
  currencyFormat: any;

  @ViewChild('copyTable0') copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1') copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2') copyTable2: ElementRef;
  table2String: any;

  constructor() { }

  ngOnInit() {
    this.setFormat();
    this.setCurrencyFormat();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.baselineResults || changes.modificationResults) && this.modificationExists) {
      this.getSavings();
    }
  }

  setFormat(): any {
    this.format = d3.format(',.3f');
  }

  setCurrencyFormat(): void {
    this.currencyFormat = d3.format('$,.2f');
  }

  getSavings(): void {
    if (this.modificationExists) {
      this.annualEnergySavings = this.baselineResults.energyUse - this.modificationResults.energyUse;
      this.annualCostSavings = this.baselineResults.energyCost - this.modificationResults.energyCost;
    }
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
