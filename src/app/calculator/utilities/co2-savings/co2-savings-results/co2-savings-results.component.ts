import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Co2SavingsData } from '../co2-savings.service';

@Component({
  selector: 'app-co2-savings-results',
  templateUrl: './co2-savings-results.component.html',
  styleUrls: ['./co2-savings-results.component.css']
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
