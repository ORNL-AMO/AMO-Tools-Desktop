import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { PsatReportRollupService } from '../../psat-report-rollup.service';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';
import { ReportUtilityTotal } from '../../report-rollup-models';

@Component({
    selector: 'app-psat-summary',
    templateUrl: './psat-summary.component.html',
    styleUrls: ['./psat-summary.component.css', '../report-summary.component.css'],
    standalone: false
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
  constructor(public psatReportRollupService: PsatReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

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
        this.psatReportRollupService.setTotals(this.settings);
        this.reportSummaryGraphService.setRollupChartsData(this.settings);
        let totals: ReportUtilityTotal = this.psatReportRollupService.totals;
        this.pumpSavingsPotential = totals.savingPotential;
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
