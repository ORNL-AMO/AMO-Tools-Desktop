import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PowerFactorCorrectionInputs, PowerFactorCorrectionOutputs } from '../power-factor-correction.component';

@Component({
    selector: 'app-power-factor-correction-results',
    templateUrl: './power-factor-correction-results.component.html',
    styleUrls: ['./power-factor-correction-results.component.css'],
    standalone: false
})
export class PowerFactorCorrectionResultsComponent implements OnInit {
  @Input()
  results: PowerFactorCorrectionOutputs;
  @Input()
  inputs: PowerFactorCorrectionInputs;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  @ViewChild('copyChart', { static: false }) copyChart: ElementRef;
  tableString: any;
  chartString: any;

  constructor() { }

  ngOnInit() {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

  updateChartString() {
    this.chartString = this.copyChart.nativeElement.innerText;
  }
}
