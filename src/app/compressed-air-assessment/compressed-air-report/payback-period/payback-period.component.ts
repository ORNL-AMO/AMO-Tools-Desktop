import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessmentResult } from '../../compressed-air-assessment-results.service';

@Component({
  selector: 'app-payback-period',
  templateUrl: './payback-period.component.html',
  styleUrls: ['./payback-period.component.css']
})
export class PaybackPeriodComponent implements OnInit {
  @Input()
  assessmentResults: Array<CompressedAirAssessmentResult>;

  constructor() { }

  ngOnInit(): void {
    console.log(this.assessmentResults);
  }

}
