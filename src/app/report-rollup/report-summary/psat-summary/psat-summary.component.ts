import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService } from '../../report-rollup.service';
@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {

  // @Input()
  // psats: Array<Assessment>;
  
  pumpSavingsPotential: number;
  numPsats: number;
  energySavingsPotential: number;
  totalCost: number;
  totalEnergy: number;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.reportRollupService.psatAssessments.subscribe(val => {
      this.numPsats = val.length
    })
    this.pumpSavingsPotential = 0;
    this.energySavingsPotential = 0;
    this.totalCost = 0;
    this.totalEnergy = 0;

  }

}
