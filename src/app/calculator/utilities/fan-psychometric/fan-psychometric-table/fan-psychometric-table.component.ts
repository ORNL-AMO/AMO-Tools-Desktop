import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychometricService } from '../fan-psychometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychometricResults } from '../../../../shared/models/fans';


@Component({
  selector: 'app-fan-psychometric-table',
  templateUrl: './fan-psychometric-table.component.html',
  styleUrls: ['./fan-psychometric-table.component.css']
})
export class FanPsychometricTableComponent implements OnInit {
  @Input()
  settings: Settings
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  resultData: Array<PsychometricResults>;
  inputData: {barometricPressure: number, dryBulbTemp: number};
  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  psychometricResults: PsychometricResults;


  constructor(private fanPsychometricService: FanPsychometricService) { }

  ngOnInit() {
    this.resetFormSubscription = this.fanPsychometricService.resetData.subscribe(val => {
      this.resultData = [];
      this.psychometricResults = undefined;
    });
    this.calculatedBaseGasDensitySubscription = this.fanPsychometricService.calculatedBaseGasDensity.subscribe(results => {
      if(results) {
        this.psychometricResults = results;
        let inputData: BaseGasDensity = this.fanPsychometricService.baseGasDensityData.getValue();
        this.psychometricResults.barometricPressure = inputData.barometricPressure;
        this.psychometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }

  addResult() {
    this.resultData.push(this.psychometricResults);
  }

  deleteResult(index: number) {
    this.resultData.splice(index, 1);
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText.replace(/Delete/g, '');
  }
}
