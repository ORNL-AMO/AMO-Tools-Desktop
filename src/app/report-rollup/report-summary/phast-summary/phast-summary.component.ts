import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { PhastReportRollupService } from '../../phast-report-rollup.service';
import { ReportRollupService } from '../../report-rollup.service';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';
import * as _ from 'lodash';
import { ReportUtilityTotal } from '../../report-rollup-models';

@Component({
    selector: 'app-phast-summary',
    templateUrl: './phast-summary.component.html',
    styleUrls: ['./phast-summary.component.css', '../report-summary.component.css'],
    standalone: false
})
export class PhastSummaryComponent implements OnInit {
  settings: Settings;
  furnaceSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  numPhasts: number;
  selectedPhastSub: Subscription;
  phastAssessmentsSub: Subscription;
  constructor(public phastReportRollupService: PhastReportRollupService,
    private reportRollupService: ReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.phastAssessmentsSub = this.phastReportRollupService.phastAssessments.subscribe(items => {
      this.numPhasts = items.length;
      if (items) {
        this.phastReportRollupService.setAllPhastResults(items);
        this.phastReportRollupService.initPhastCompare();
      }
    });
    this.selectedPhastSub = this.phastReportRollupService.selectedPhasts.subscribe(val => {
      if (val.length !== 0) {
        this.phastReportRollupService.setPhastResultsFromSelected(val);
        this.phastReportRollupService.setTotals(this.settings);
        this.reportSummaryGraphService.setRollupChartsData(this.settings);
        let totals: ReportUtilityTotal = this.phastReportRollupService.totals;
        this.furnaceSavingsPotential = totals.savingPotential;
        this.energySavingsPotential = totals.energySavingsPotential;
        this.totalCost = totals.totalCost;
        this.totalEnergy = totals.totalEnergy;
      }
    });
  }

  ngOnDestroy() {
    this.selectedPhastSub.unsubscribe();
    this.phastAssessmentsSub.unsubscribe();
  }
}
