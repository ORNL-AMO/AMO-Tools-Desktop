import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Modification } from '../../../shared/models/compressed-air-assessment';
import { DayTypeModificationResult } from '../../calculations/caCalculationModels';

@Component({
    selector: 'app-payback-period',
    templateUrl: './payback-period.component.html',
    styleUrls: ['./payback-period.component.css'],
    standalone: false
})
export class PaybackPeriodComponent implements OnInit {
  @Input()
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult }>;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor() { }

  ngOnInit(): void {
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
