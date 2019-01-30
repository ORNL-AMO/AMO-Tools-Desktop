import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PowerFactorCorrectionOutputs } from '../power-factor-correction.component';

@Component({
  selector: 'app-power-factor-correction-results',
  templateUrl: './power-factor-correction-results.component.html',
  styleUrls: ['./power-factor-correction-results.component.css']
})
export class PowerFactorCorrectionResultsComponent implements OnInit {
  @Input()
  results: PowerFactorCorrectionOutputs;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
