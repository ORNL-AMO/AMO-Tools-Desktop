import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReportRollupService } from '../../compressed-air-report-rollup.service';
import { ReportUtilityTotal } from '../../report-rollup-models';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';

@Component({
    selector: 'app-compressed-air-summary',
    templateUrl: './compressed-air-summary.component.html',
    styleUrls: ['./compressed-air-summary.component.css', '../report-summary.component.css'],
    standalone: false
})
export class CompressedAirSummaryComponent implements OnInit {
  @Input()
  settings: Settings;

  savingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numCompressedAir: number;
  constructor(public compressedAirReportRollupService: CompressedAirReportRollupService,
    private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.assessmentSub = this.compressedAirReportRollupService.compressedAirAssessments.subscribe(val => {
      this.numCompressedAir = val.length;
      if (val.length != 0) {
        this.compressedAirReportRollupService.setAllAssessmentResults(val);
        this.compressedAirReportRollupService.initCompressedAirCompare();
      }
    });
    this.selectedSub = this.compressedAirReportRollupService.selectedAssessments.subscribe(val => {
      if (val.length != 0) {
        this.compressedAirReportRollupService.setAssessmentResultsFromSelected(val);
        this.compressedAirReportRollupService.setTotals(this.settings);
        this.reportSummaryGraphService.setRollupChartsData(this.settings);
        let totals: ReportUtilityTotal = this.compressedAirReportRollupService.totals;
        this.savingPotential = totals.savingPotential;
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
