import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { SsmtReportRollupService } from '../../ssmt-report-rollup.service';
import { ReportRollupService } from '../../report-rollup.service';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';
import { ReportUtilityTotal } from '../../report-rollup-models';

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

  constructor(public ssmtReportRollupService: SsmtReportRollupService, private reportRollupService: ReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

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
        this.ssmtReportRollupService.setTotals(this.settings);
        this.reportSummaryGraphService.setRollupChartsData(this.settings);
        let totals: ReportUtilityTotal = this.ssmtReportRollupService.totals;
        this.ssmtSavingPotential = totals.savingPotential;
        this.energySavingsPotential = totals.energySavingsPotential;
        this.totalCost = totals.totalCost;
        this.totalEnergy = totals.totalEnergy;
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

}
