import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryTableData } from '../../rollup-summary-table/rollup-summary-table.component';

@Component({
  selector: 'app-psat-rollup-print',
  templateUrl: './psat-rollup-print.component.html',
  styleUrls: ['./psat-rollup-print.component.css']
})
export class PsatRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculators: Array<Calculator>;
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
    this.energyYAxisLabel = 'Annual Energy Usage (' + this.settings.powerMeasurement + ')';
    this.energyTickFormat = '.2s'
    this.costYAxisLabel = 'Annual Energy Cost ($/yr)';
    this.costTickFormat = '$.2s';
  }

}
