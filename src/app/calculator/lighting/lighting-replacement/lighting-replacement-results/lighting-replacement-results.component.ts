import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { LightingReplacementData, LightingReplacementResults } from '../../../../shared/models/lighting';

@Component({
  selector: 'app-lighting-replacement-results',
  templateUrl: './lighting-replacement-results.component.html',
  styleUrls: ['./lighting-replacement-results.component.css']
})
export class LightingReplacementResultsComponent implements OnInit {
  @Input()
  lightingReplacementResults: LightingReplacementResults;
  @Input()
  modificationExists: boolean;
  @Input()
  baselineElectricityCost: number;
  @Input()
  modificationElectricityCost: number;
  @Input()
  baselineData: LightingReplacementData;
  @Input()
  modificationData: LightingReplacementData;


  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: string;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: string;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  table2String: string;
  @ViewChild('copyTable3', { static: false }) copyTable3: ElementRef;
  table3String: string;

  constructor() { }

  ngOnInit() { }

  updateTable0String() {
    this.table0String = 
    this.copyTable0.nativeElement.innerText + '\n' +
    this.copyTable1.nativeElement.innerText + '\n' +
    this.copyTable2.nativeElement.innerText + '\n' +
    this.copyTable3.nativeElement.innerText;
  }

  // updateTable1String() {
  //   this.table1String = this.copyTable1.nativeElement.innerText;
  // }

  // updateTable2String() {
  //   this.table2String = this.copyTable2.nativeElement.innerText;
  // }

  // updateTable3String() {
  //   this.table3String = this.copyTable3.nativeElement.innerText;
  // }
}
