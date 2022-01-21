import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { FsatReportRollupService } from '../../fsat-report-rollup.service';
import { ReportUtilityTotal } from '../../report-rollup-models';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';

@Component({
  selector: 'app-fsat-summary',
  templateUrl: './fsat-summary.component.html',
  styleUrls: ['./fsat-summary.component.css', '../report-summary.component.css']
})
export class FsatSummaryComponent implements OnInit {
  @Input()
  settings: Settings;

  fanSavingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numFsats: number;
  constructor(public fsatReportRollupService: FsatReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.assessmentSub = this.fsatReportRollupService.fsatAssessments.subscribe(val => {
      this.numFsats = val.length;
      if (val.length != 0) {
        this.fsatReportRollupService.setAllFsatResults(val);
        this.fsatReportRollupService.initFsatCompare();
      }
    });

    this.selectedSub = this.fsatReportRollupService.selectedFsats.subscribe(val => {
      if (val.length != 0) {
        this.fsatReportRollupService.setFsatResultsFromSelected(val);
        this.fsatReportRollupService.setTotals(this.settings);
        this.reportSummaryGraphService.setRollupChartsData(this.settings);
        let totals: ReportUtilityTotal = this.fsatReportRollupService.totals;
        this.fanSavingPotential = totals.savingPotential;
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
