import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-air-leak-results',
  templateUrl: './air-leak-results.component.html',
  styleUrls: ['./air-leak-results.component.css']
})
export class AirLeakSurveyResultsComponent implements OnInit {

  @Input()
  outputs: AirLeakSurveyOutput;
  @Input()
  settings: Settings;
  modificationExists: boolean = false;

  @ViewChild('baselineTable', { static: false }) baselineTable: ElementRef;
  baselineTableString: any;
  @ViewChild('modTable', { static: false }) modTable: ElementRef;
  modTableString: any;
  @ViewChild('savingsTable', { static: false }) savingsTable: ElementRef;
  savingsTableString: any;
  allTablesString: any;
  constructor() { }

  ngOnInit() {
    this.modificationExists = true;
  }

  updateTableString() {
    this.allTablesString = 
    this.baselineTable.nativeElement.innerText +
    this.modTable.nativeElement.innerText +
    this.savingsTable.nativeElement.innerText;
  }

}
