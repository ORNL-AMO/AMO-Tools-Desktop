import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdjustedOrActual, BilledForDemand, PowerFactorCorrectionInputs, PowerFactorCorrectionOutputs, PowerFactorCorrectionService } from '../power-factor-correction.service';

@Component({
    selector: 'app-power-factor-correction-results',
    templateUrl: './power-factor-correction-results.component.html',
    styleUrls: ['./power-factor-correction-results.component.css'],
    standalone: false
})
export class PowerFactorCorrectionResultsComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  @ViewChild('copyChart', { static: false }) copyChart: ElementRef;
  tableString: any;
  chartString: any;

  inputs: PowerFactorCorrectionInputs;
  results: PowerFactorCorrectionOutputs;
  powerFactorInputSubscription: Subscription;
  powerFactorResultsSubscription: Subscription;

  BilledForDemand = BilledForDemand;
  AdjustedOrActual = AdjustedOrActual;

  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService) { }

  ngOnInit() {
      this.powerFactorInputSubscription = this.powerFactorCorrectionService.powerFactorInputs.subscribe(val => {
      this.inputs = val;
    });

     this.powerFactorResultsSubscription = this.powerFactorCorrectionService.powerFactorOutputs.subscribe(val => {
      this.results = val;
    });
    console.log(this.results.monthlyOutputs);
  }

  ngOnDestroy() {
    this.powerFactorInputSubscription.unsubscribe();
    this.powerFactorResultsSubscription.unsubscribe();
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

  updateChartString() {
    this.chartString = this.copyChart.nativeElement.innerText;
  }
}
