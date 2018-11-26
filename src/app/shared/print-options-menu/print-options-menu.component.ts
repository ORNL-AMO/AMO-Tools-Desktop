import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-print-options-menu',
  templateUrl: './print-options-menu.component.html',
  styleUrls: ['./print-options-menu.component.css']
})
export class PrintOptionsMenuComponent implements OnInit {
  @Input()
  showPsatReportOptions: boolean;
  @Input()
  showFsatReportOptions: boolean;
  @Input()
  showPhastReportOptions: boolean;
  @Input()
  showRollupReportOptions: boolean;

  @ViewChild('printMenuModal') public printMenuModal: ModalDirective;

  selectAll: boolean = false;
  printReportGraphs: boolean = false;
  printReportSankey: boolean = false;
  printResults: boolean = false;
  printInputData: boolean = false;
  printPsatRollup: boolean = false;
  printPhastRollup: boolean = false;
  printFsatRollup: boolean = false;

  //phast options
  printEnergyUsed: boolean = false;
  printExecutiveSummary: boolean = false;


  constructor() { }

  ngOnInit() {
  }

}
