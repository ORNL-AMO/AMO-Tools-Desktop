import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { SsmtResultsData } from '../../report-rollup-models';
import { Settings } from '../../../shared/models/settings';
import { SsmtReportRollupService } from '../../ssmt-report-rollup.service';
import { ReportRollupService } from '../../report-rollup.service';

@Component({
  selector: 'app-ssmt-summary',
  templateUrl: './ssmt-summary.component.html',
  styleUrls: ['./ssmt-summary.component.css', '../report-summary.component.css']
})
export class SsmtSummaryComponent implements OnInit {

  settings: Settings;
  ssmtSavingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numSsmt: number;
  constructor(public ssmtReportRollupService: SsmtReportRollupService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.assessmentSub = this.ssmtReportRollupService.ssmtAssessments.subscribe(val => {
      this.numSsmt = val.length;
      if (val.length != 0) {
        this.ssmtReportRollupService.setAllSsmtResults(val);
        this.ssmtReportRollupService.initSsmtCompare();
      }
    });
    this.selectedSub = this.ssmtReportRollupService.selectedSsmt.subscribe(val => {
      if (val.length != 0) {
        this.ssmtReportRollupService.setSsmtResultsFromSelected(val);
        this.calcSsmtSums();
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  calcSsmtSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.ssmtReportRollupService.selectedSsmtResults.forEach(result => {
      let diffCost = result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.operationsOutput.totalOperatingCost;
      let diffEnergy = result.baselineResults.operationsOutput.boilerFuelUsage - result.modificationResults.operationsOutput.boilerFuelUsage;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.operationsOutput.boilerFuelUsage;
    })
    this.ssmtSavingPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

}
