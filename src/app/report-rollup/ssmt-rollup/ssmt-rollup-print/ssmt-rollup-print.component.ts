import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableData } from '../../rollup-summary-table/rollup-summary-table.component';

@Component({
  selector: 'app-ssmt-rollup-print',
  templateUrl: './ssmt-rollup-print.component.html',
  styleUrls: ['./ssmt-rollup-print.component.css']
})
export class SsmtRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  costChartData: Array<BarChartDataItem>;
  @Input()
  energyChartData: Array<BarChartDataItem>;
  @Input()
  rollupSummaryTableData: Array<RollupSummaryTableData>;
  @Input()
  energyUnit: string;

  energyYAxisLabel: string;
  energyTickFormat: string;
  costYAxisLabel: string;
  costTickFormat: string;
  constructor() { }

  ngOnInit(): void {
    this.energyYAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
    this.energyTickFormat = '.2s'
    this.costYAxisLabel = `Annual Energy Cost (${this.settings.currency !== '$' ? '$k' : '$'}/yr)`;
    this.costTickFormat = '$.2s';
  }
}
