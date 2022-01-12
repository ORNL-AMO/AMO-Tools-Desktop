import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { ReportRollupService } from '../report-rollup.service';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportSummaryGraphsService } from './report-summary-graphs.service';

@Component({
  selector: 'app-report-summary-graphs',
  templateUrl: './report-summary-graphs.component.html',
  styleUrls: ['./report-summary-graphs.component.css']
})
export class ReportSummaryGraphsComponent implements OnInit {

  pieChartDataOption: string = 'energy';
  reportSummaryEnergyUnit: string;

  pieChartDataSub: Subscription;
  pieChartData: Array<PieChartDataItem>;

  energyChartDataSub: Subscription;
  energyChartData: Array<PieChartDataItem>;

  settings: Settings;
  settingsSub: Subscription;
  
  constructor(private reportRollupService: ReportRollupService,
    private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.settingsSub = this.reportRollupService.settings.subscribe(settings => {
      this.settings = settings;
      this.reportSummaryEnergyUnit = settings.commonRollupUnit;
    });
    this.pieChartDataSub = this.reportSummaryGraphService.reportSummaryGraphData.subscribe(val => {
      this.pieChartData = val;
    });
    this.energyChartDataSub = this.reportSummaryGraphService.energyChartData.subscribe(val => {
      this.energyChartData = val;
    });
  }

  ngOnDestroy() {
    this.reportSummaryGraphService.clearData();
    this.settingsSub.unsubscribe();
    this.pieChartDataSub.unsubscribe();
    this.energyChartDataSub.unsubscribe();
  }

}
