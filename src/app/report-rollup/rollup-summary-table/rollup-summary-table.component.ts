import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-rollup-summary-table',
  templateUrl: './rollup-summary-table.component.html',
  styleUrls: ['./rollup-summary-table.component.css']
})
export class RollupSummaryTableComponent implements OnInit {
  @Input()
  tableData: Array<RollupSummaryTableData>;
  @Input()
  equipmentType: string;
  @Input()
  energyUnit: string;
  constructor() { }

  ngOnInit(): void {
  }

}

export interface RollupSummaryTableData {
  equipmentName: string,
  modificationName: string,
  baselineEnergyUse: number,
  modificationEnergyUse: number,
  baselineCost: number,
  modificationCost: number,
  costSavings: number,
  implementationCosts: number,
  payBackPeriod: number
}