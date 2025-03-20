import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportSummaryGraphsService } from '../report-summary-graphs.service';

@Component({
    selector: 'app-report-summary-graphs-print',
    templateUrl: './report-summary-graphs-print.component.html',
    styleUrls: ['./report-summary-graphs-print.component.css'],
    standalone: false
})
export class ReportSummaryGraphsPrintComponent implements OnInit {

  pieChartDataOption: string = 'energy';
  reportSummaryEnergyUnit: string;

  pieChartDataSub: Subscription;
  pieChartData: Array<PieChartDataItem>;

  energyChartDataSub: Subscription;
  energyChartData: Array<PieChartDataItem>;

  costBarChartSub: Subscription;
  costBarChart: Array<BarChartDataItem>;

  energyBarChartSub: Subscription;
  energyBarChart: Array<BarChartDataItem>;

  carbonBarChartSub: Subscription;
  carbonBarChart: Array<BarChartDataItem>;
  
  carbonEmissionsUnit: string;
  carbonEmissionsBarYLabel: string;

  settings: Settings;
  settingsSub: Subscription;

  constructor(private reportRollupService: ReportRollupService,
    private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.settingsSub = this.reportRollupService.settings.subscribe(settings => {
      this.settings = settings;
      this.reportSummaryEnergyUnit = settings.commonRollupUnit;
      this.carbonEmissionsUnit = this.reportRollupService.getCarbonEmissionsUnit(settings);
      this.carbonEmissionsBarYLabel = this.reportRollupService.getAnnualCarbonEmissionsLabel(this.carbonEmissionsUnit);
    });
    this.pieChartDataSub = this.reportSummaryGraphService.reportSummaryGraphData.subscribe(val => {
      this.pieChartData = val;
    });
    this.energyChartDataSub = this.reportSummaryGraphService.energyChartData.subscribe(val => {
      this.energyChartData = val;
    });
    this.costBarChartSub = this.reportSummaryGraphService.costBarChart.subscribe(val => {
      this.costBarChart = val;
    });
    this.energyBarChartSub = this.reportSummaryGraphService.energyBarChart.subscribe(val => {
      this.energyBarChart = val;
    });
    this.carbonBarChartSub = this.reportSummaryGraphService.carbonBarChart.subscribe(val => {
      this.carbonBarChart = val;
    });
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.pieChartDataSub.unsubscribe();
    this.energyChartDataSub.unsubscribe();
    this.costBarChartSub.unsubscribe();
    this.energyBarChartSub.unsubscribe();
    this.costBarChartSub.unsubscribe();
  }

}
