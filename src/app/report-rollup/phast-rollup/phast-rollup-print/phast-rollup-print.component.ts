import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';

@Component({
    selector: 'app-phast-rollup-print',
    templateUrl: './phast-rollup-print.component.html',
    styleUrls: ['./phast-rollup-print.component.css'],
    standalone: false
})
export class PhastRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculators: Array<Calculator>;
  @Input()
  energyBarChartData: Array<BarChartDataItem>;
  @Input()
  costBarChartData: Array<BarChartDataItem>;
  @Input()
  energyIntensityBarChartData: Array<BarChartDataItem>;
  @Input()
  availableHeatBarChartData: Array<BarChartDataItem>;
  @Input()
  pieChartData: Array<PieChartDataItem>;

  energyYAxisLabel: string;
  energyTickFormat: string;
  costYAxisLabel: string;
  costTickFormat: string;
  availableHeatLabel: string;
  availableHeatTickFormat: string;
  energyIntensityLabel: string;
  energyIntensityTickFormat: string;

  constructor() { }

  ngOnInit() {
    this.energyYAxisLabel = 'Annual Energy Usage (' + this.settings.phastRollupUnit + '/yr)';
    this.energyTickFormat = '.2s'

    this.costYAxisLabel = 'Annual Energy Cost ($/yr)';
    this.costTickFormat = '$.2s';

    this.availableHeatLabel = 'Available Heat (%)';
    this.availableHeatTickFormat = '.2s';

    let templateUnit: string = this.settings.phastRollupUnit;
    if (this.settings.unitsOfMeasure == 'Metric') {
      templateUnit = templateUnit + '/kg';
    } else {
      templateUnit = templateUnit + '/lb';
    }
    this.energyIntensityLabel = 'Annual Energy Cost (' + templateUnit + ')';
    this.energyIntensityTickFormat = '.2s';
  }

}
