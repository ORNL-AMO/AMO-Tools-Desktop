import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EfficiencyImprovement } from '../../../../shared/models/phast/efficiencyImprovement';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-efficiency-improvement-results',
  templateUrl: './efficiency-improvement-results.component.html',
  styleUrls: ['./efficiency-improvement-results.component.css']
})
export class EfficiencyImprovementResultsComponent implements OnInit {
  @Input()
  efficiencyImprovement: EfficiencyImprovement;
  @Input()
  settings: Settings;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  table2String: any;
  
  constructor() { }

  ngOnInit(): void {
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
}
