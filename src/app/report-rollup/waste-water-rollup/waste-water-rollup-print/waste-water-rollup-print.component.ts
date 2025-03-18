import { Component, Input, OnInit } from '@angular/core';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryTableData } from '../../rollup-summary-table/rollup-summary-table.component';

@Component({
    selector: 'app-waste-water-rollup-print',
    templateUrl: './waste-water-rollup-print.component.html',
    styleUrls: ['./waste-water-rollup-print.component.css'],
    standalone: false
})
export class WasteWaterRollupPrintComponent implements OnInit {
  @Input()
  energyBarChartData: Array<BarChartDataItem>;
  @Input()
  costBarChartData: Array<BarChartDataItem>;
  @Input()
  pieChartData: Array<PieChartDataItem>;
  @Input()
  rollupSummaryTableData: Array<RollupSummaryTableData>;

  costTickFormat: string;
  costYAxisLabel: string;
  energyTickFormat: string;
  energyYAxisLabel: string;

  constructor() { }

  ngOnInit() {
    this.energyYAxisLabel = 'Annual Energy Usage (MWh)';
    this.energyTickFormat = '.2s'
    this.costYAxisLabel = 'Annual Energy Cost ($/yr)';
    this.costTickFormat = '$.2s';
  }

}
