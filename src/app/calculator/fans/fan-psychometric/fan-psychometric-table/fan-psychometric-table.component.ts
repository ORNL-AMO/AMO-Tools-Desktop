import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychometricService } from '../fan-psychometric.service';
import { Subscription } from 'rxjs';
import { CalculatedGasDensity } from '../../../../shared/models/fans';

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

  resultData: Array<CalculatedGasDensity>;
  resetFormSubscription: Subscription;
  currentBaseGasDensity: CalculatedGasDensity;

  constructor(private fanPsychometricService: FanPsychometricService) { }

  ngOnInit() {
    this.resetFormSubscription = this.fanPsychometricService.resetData.subscribe(val => {
      this.resultData = [];
    });
    this.resetFormSubscription = this.fanPsychometricService.calculatedBaseGasDensity.subscribe(val => {
      this.currentBaseGasDensity = val;
    });
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
  }

  addResult() {
    this.resultData.push(this.currentBaseGasDensity);
  }

  deleteResult(index: number) {
    this.resultData.splice(index, 1);
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText.replace(/Delete/g, '');
  }
}
