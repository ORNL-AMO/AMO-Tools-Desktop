import { Component, OnInit, Input } from '@angular/core';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-rollup-summary-energy-table',
  templateUrl: './rollup-summary-energy-table.component.html',
  styleUrls: ['./rollup-summary-energy-table.component.css']
})
export class RollupSummaryEnergyTableComponent implements OnInit {
  @Input()
  pieChartData: Array<PieChartDataItem>;
  @Input()
  energyUnit: string;
  @Input()
  equipmentType: string;

  totalEnergyUse: number;
  totalCost: number;
  constructor() { }

  ngOnInit(): void {    
    this.totalEnergyUse = _.sumBy(this.pieChartData, 'energyUsed');
    this.totalCost = _.sumBy(this.pieChartData, 'annualCost');
  }

}
