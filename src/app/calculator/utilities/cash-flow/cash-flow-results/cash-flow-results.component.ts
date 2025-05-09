import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CashFlowFinalResults, CashFlowOutputsAndResults } from '../cash-flow';

@Component({
  selector: 'app-cash-flow-results',
  standalone: false,
  templateUrl: './cash-flow-results.component.html',
  styleUrl: './cash-flow-results.component.css'
})
export class CashFlowResultsComponent implements OnInit {
  @Input() cashFlowOutputsAndResults: CashFlowOutputsAndResults;

  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  tableString1: any;
  tableString2: any;
  
  ngOnInit(): void {
    
  }

  updateTableString1() {
    this.tableString1 = this.copyTable1.nativeElement.innerText;
  }

  updateTableString2() {
    this.tableString2 = this.copyTable2.nativeElement.innerText;
  }

}
