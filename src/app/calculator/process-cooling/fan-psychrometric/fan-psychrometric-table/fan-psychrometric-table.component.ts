import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';


@Component({
  selector: 'app-fan-psychrometric-table',
  templateUrl: './fan-psychrometric-table.component.html',
  styleUrls: ['./fan-psychrometric-table.component.css']
})
export class FanPsychrometricTableComponent implements OnInit {
  @Input()
  settings: Settings
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  resultData: Array<PsychrometricResults>;
  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  psychrometricResults: PsychrometricResults;


  constructor(private fanPsychrometricService: FanPsychrometricService) { }

  ngOnInit() {
    this.resetFormSubscription = this.fanPsychrometricService.resetData.subscribe(val => {
      this.resultData = [];
      this.psychrometricResults = undefined;
    });
    this.calculatedBaseGasDensitySubscription = this.fanPsychrometricService.calculatedBaseGasDensity.subscribe(results => {
      if(results) {
        this.psychrometricResults = results;
        let inputData: BaseGasDensity = this.fanPsychrometricService.baseGasDensityData.getValue();
        this.psychrometricResults.barometricPressure = inputData.barometricPressure;
        this.psychrometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }

  addResult() {
    this.resultData.push(this.psychrometricResults);
  }

  deleteResult(index: number) {
    this.resultData.splice(index, 1);
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText.replace(/Delete/g, '');
  }
}
