import { Component, Input, OnInit } from '@angular/core';
import { Modification } from '../../../shared/models/compressed-air-assessment';
import { DayTypeModificationResult } from '../../compressed-air-assessment-results.service';

@Component({
    selector: 'app-payback-period',
    templateUrl: './payback-period.component.html',
    styleUrls: ['./payback-period.component.css'],
    standalone: false
})
export class PaybackPeriodComponent implements OnInit {
  @Input()
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult }>;

  constructor() { }

  ngOnInit(): void {
  }

}
