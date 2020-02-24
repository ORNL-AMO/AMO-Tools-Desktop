import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportRollupService } from '../../report-rollup.service';
import { SsmtResultsData } from '../../report-rollup-models';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-ssmt-summary',
  templateUrl: './ssmt-summary.component.html',
  styleUrls: ['./ssmt-summary.component.css', '../report-summary.component.css']
})
export class SsmtSummaryComponent implements OnInit {
  @Input()
  settings: Settings;

  ssmtSavingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  allSub: Subscription;
  selectedSub: Subscription;
  resultsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.reportRollupService.ssmtAssessments.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.initSsmtResultsArr(val);
      }
    })

    this.allSub = this.reportRollupService.allSsmtResults.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.initSsmtCompare(val);
      }
    })
    this.selectedSub = this.reportRollupService.selectedSsmt.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.getSsmtResultsFromSelected(val);
      }
    })

    this.resultsSub = this.reportRollupService.ssmtResults.subscribe(val => {
      if (val.length != 0) {
        this.calcSsmtSums(val);
      }
    })
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.allSub.unsubscribe();
    this.selectedSub.unsubscribe();
    this.resultsSub.unsubscribe();
  }

  calcSsmtSums(resultsData: Array<SsmtResultsData>) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    resultsData.forEach(result => {
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
