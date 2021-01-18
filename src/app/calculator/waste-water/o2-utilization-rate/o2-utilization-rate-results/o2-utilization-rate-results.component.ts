import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { O2UtilizationRateService } from '../o2-utilization-rate.service';
import * as regression from 'regression';

@Component({
  selector: 'app-o2-utilization-rate-results',
  templateUrl: './o2-utilization-rate-results.component.html',
  styleUrls: ['./o2-utilization-rate-results.component.css']
})
export class O2UtilizationRateResultsComponent implements OnInit {

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  inputDataPointsSub: Subscription;
  r2: number;
  oxygenUtilizationRate: number;
  regressionEquation: string;
  copyTableString: string;
  constructor(private o2UtilizationRateService: O2UtilizationRateService) { }

  ngOnInit(): void {
    this.inputDataPointsSub = this.o2UtilizationRateService.inputDataPoints.subscribe(inputDataPoints => {
      let regressionData: Array<[number, number]> = inputDataPoints.map(dataPoint => { return [dataPoint.time, dataPoint.dissolvedOxygen] });
      let regressionResult = regression.linear(regressionData, { precision: 5 });
      this.r2 = regressionResult.r2;
      this.oxygenUtilizationRate = regressionResult.equation[0] * (-3600);
      this.regressionEquation = regressionResult.string;
    });
  }

  ngOnDestroy() {
    this.inputDataPointsSub.unsubscribe();
  }


  updateTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
