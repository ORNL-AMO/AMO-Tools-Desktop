import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
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

  energyChartData: Array<PieChartDataItem>;

  settings: Settings;
  settingsSub: Subscription;

  constructor(public reportRollupService: ReportRollupService,
    private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.reportSummaryGraphService.clearData();
    this.settingsSub.unsubscribe();
    this.pieChartDataSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.energyChartData = this.reportSummaryGraphService.getEnergyGraphData(this.settings);
  }

  initSubscriptions() {
    this.settingsSub = this.reportRollupService.settings.subscribe(settings => {
      this.settings = settings;
    });
    this.reportSummaryEnergyUnit = this.settings.energyResultUnit;

    this.energyChartData = this.reportSummaryGraphService.getEnergyGraphData(this.settings);

    this.pieChartDataSub = this.reportSummaryGraphService.reportSummaryGraphData.subscribe(val => {
      this.pieChartData = val;
    });

  }

}
