import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService } from '../../report-rollup.service';
import { Subscription } from 'rxjs';
import { PsatResultsData } from '../../report-rollup-models';
import { PsatReportRollupService } from '../../psat-report-rollup.service';

@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css', '../report-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {

  pumpSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  allSub: Subscription;
  selectedSub: Subscription;
  resultsSub: Subscription;
  numPsats: number;
  constructor(public psatReportRollupService: PsatReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.psatReportRollupService.psatAssessments.subscribe(val => {
      this.numPsats = val.length;
      if (val.length !== 0) {
        this.psatReportRollupService.initResultsArr(val);
      }
    });

    this.allSub = this.psatReportRollupService.allPsatResults.subscribe(val => {
      if (val.length !== 0) {
        this.psatReportRollupService.initPsatCompare(val);
      }
    });
    this.selectedSub = this.psatReportRollupService.selectedPsats.subscribe(val => {
      if (val.length !== 0) {
        this.psatReportRollupService.getResultsFromSelected(val);
      }
    });

    this.resultsSub = this.psatReportRollupService.psatResults.subscribe(val => {
      if (val.length !== 0) {
        this.calcPsatSums(val);
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.allSub.unsubscribe();
    this.selectedSub.unsubscribe();
    this.resultsSub.unsubscribe();
  }

  calcPsatSums(resultsData: Array<PsatResultsData>) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    resultsData.forEach(result => {
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
