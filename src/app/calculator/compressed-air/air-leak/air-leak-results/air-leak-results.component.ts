import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { Subscription } from 'rxjs';
import { AirLeakService } from '../air-leak.service';

@Component({
    selector: 'app-air-leak-results',
    templateUrl: './air-leak-results.component.html',
    styleUrls: ['./air-leak-results.component.css'],
    standalone: false
})
export class AirLeakSurveyResultsComponent implements OnInit {

  airLeakOutput: AirLeakSurveyOutput;
  airLeakOutputSub: Subscription;
  airLeakInputSub: Subscription;

  @Input()
  settings: Settings;
  modificationExists: boolean = false;

  @ViewChild('baselineTable', { static: false }) baselineTable: ElementRef;
  baselineTableString: string;
  @ViewChild('modTable', { static: false }) modTable: ElementRef;
  modTableString: string;
  @ViewChild('savingsTable', { static: false }) savingsTable: ElementRef;
  savingsTableString: string;
  allTablesString: string;
  compressorControlAdjustment: number;
  constructor(private airLeakService: AirLeakService) { }

  ngOnInit() {
    this.airLeakOutputSub = this.airLeakService.airLeakOutput.subscribe(value => {
      this.airLeakOutput = value;
    });
    this.airLeakInputSub = this.airLeakService.airLeakInput.subscribe(value => {
      if (value && value.facilityCompressorData.utilityType == 1) {
       this.compressorControlAdjustment = value.facilityCompressorData.compressorElectricityData.compressorControlAdjustment;
      } else {
        this.compressorControlAdjustment = undefined;
      }
    });
  }

  ngOnDestroy() {
    this.airLeakOutputSub.unsubscribe();
    this.airLeakInputSub.unsubscribe();
  }

  updateTableString() {
    this.allTablesString = 
    this.baselineTable.nativeElement.innerText + '\n' +
    this.modTable.nativeElement.innerText + '\n' +
    this.savingsTable.nativeElement.innerText;
  }

}
