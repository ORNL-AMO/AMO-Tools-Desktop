import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { PsatReportRollupService } from '../../psat-report-rollup.service';

@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css', '../report-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  pumpSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numPsats: number;
  constructor(public psatReportRollupService: PsatReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.psatReportRollupService.psatAssessments.subscribe(val => {
      this.numPsats = val.length;
      if (val.length !== 0) {
        this.psatReportRollupService.setAllPsatResults(val);
        this.psatReportRollupService.initPsatCompare();
      }
    });

    this.selectedSub = this.psatReportRollupService.selectedPsats.subscribe(val => {
      if (val.length !== 0) {
        this.psatReportRollupService.setResultsFromSelected(val);
        this.calcPsatSums();
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  calcPsatSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.psatReportRollupService.selectedPsatResults.forEach(result => {
      let diffCost = result.baselineResults.annual_cost - result.modificationResults.annual_cost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annual_cost;
      let diffEnergy = result.baselineResults.annual_energy - result.modificationResults.annual_energy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annual_energy;
    });
    this.pumpSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }
}
