import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { LightingReplacementData, LightingReplacementResults } from '../lighting-replacement.service';

@Component({
  selector: 'app-lighting-replacement-results',
  templateUrl: './lighting-replacement-results.component.html',
  styleUrls: ['./lighting-replacement-results.component.css']
})
export class LightingReplacementResultsComponent implements OnInit {
  @Input()
  baselineData: Array<LightingReplacementData>;
  @Input()
  modificationData: Array<LightingReplacementData>;
  @Input()
  baselineResults: LightingReplacementResults;
  @Input()
  modificationResults: LightingReplacementResults;

  @ViewChild('copyTable0') copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1') copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2') copyTable2: ElementRef;
  table2String: any;
  @ViewChild('copyTable3') copyTable3: ElementRef;
  table3String: any;
  
  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

  updateTable1String() {
    this.table1String = this.copyTable1.nativeElement.innerText;
  }

  updateTable2String() {
    this.table2String = this.copyTable2.nativeElement.innerText;
  }
  
  updateTable3String() {
    this.table3String = this.copyTable3.nativeElement.innerText;
  }
}
