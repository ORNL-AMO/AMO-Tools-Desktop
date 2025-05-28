import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Co2SavingsData } from '../co2-savings.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-co2-savings-results',
    templateUrl: './co2-savings-results.component.html',
    styleUrls: ['./co2-savings-results.component.css'],
    standalone: false
})
export class Co2SavingsResultsComponent implements OnInit {
  @Input()
  baselineData: Array<Co2SavingsData>;
  @Input()
  modificationData: Array<Co2SavingsData>;
  @Input()
  baselineTotal: number;
  @Input()
  modificationTotal: number;
  @Input()
  settings: Settings;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  // @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  // table1String: any;
  // @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  // table2String: any;
  // @ViewChild('copyTable3', { static: false }) copyTable3: ElementRef;
  // table3String: any;

  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
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
