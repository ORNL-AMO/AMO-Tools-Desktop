import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { WasteWaterReportRollupService } from '../../waste-water-report-rollup.service';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';
import { ReportUtilityTotal } from '../../report-rollup-models';

@Component({
  selector: 'app-waste-water-summary',
  templateUrl: './waste-water-summary.component.html',
  styleUrls: ['./waste-water-summary.component.css', '../report-summary.component.css']
})
export class WasteWaterSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  savingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numWasteWater: number;
  constructor(public wasteWaterReportRollupService: WasteWaterReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.assessmentSub = this.wasteWaterReportRollupService.wasteWaterAssessments.subscribe(val => {
      this.numWasteWater = val.length;
      if (val.length != 0) {
        this.wasteWaterReportRollupService.setAllWasteWaterResults(val);
        this.wasteWaterReportRollupService.initWasteWaterCompare();
      }
    });
    this.selectedSub = this.wasteWaterReportRollupService.selectedWasteWater.subscribe(val => {
      if (val.length != 0) {
        this.wasteWaterReportRollupService.setWasteWaterResultsFromSelected(val);
        this.wasteWaterReportRollupService.setTotals(this.settings);
        this.reportSummaryGraphService.setRollupChartsData(this.settings);
        let totals: ReportUtilityTotal = this.wasteWaterReportRollupService.totals;
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
