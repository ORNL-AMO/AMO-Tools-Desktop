import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { Subscription } from 'rxjs';
import { AirLeakService } from '../air-leak.service';

@Component({
  selector: 'app-air-leak-results',
  templateUrl: './air-leak-results.component.html',
  styleUrls: ['./air-leak-results.component.css']
})
export class AirLeakSurveyResultsComponent implements OnInit {

  airLeakOutput: AirLeakSurveyOutput;
  airLeakOutputSub: Subscription;

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
  constructor(private airLeakService: AirLeakService) { }

  ngOnInit() {
    this.airLeakOutputSub = this.airLeakService.airLeakOutput.subscribe(value => {
      this.airLeakOutput = value;
    })
  }

  ngOnDestroy() {
    this.airLeakOutputSub.unsubscribe();
  }

  updateTableString() {
    this.allTablesString = 
    this.baselineTable.nativeElement.innerText + '\n' +
    this.modTable.nativeElement.innerText + '\n' +
    this.savingsTable.nativeElement.innerText;
  }

}
