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
  
  currencyUnit: string;


  totalBaselineEnergyUse: number = 0;
  totalModificationEnergyUse: number = 0;
  totalBaselineCost: number = 0;
  totalModificationCost: number = 0;
  totalCostSavings: number = 0;
  totalImplementationCosts: number = 0;
  totalPaybackPeriod: number = 0;
  constructor() { }

  ngOnInit(): void {
    this.currencyUnit = this.tableData[0].currencyUnit;
    this.tableData.forEach(dataItem => {
      this.totalBaselineEnergyUse += dataItem.baselineEnergyUse;
      this.totalBaselineCost += dataItem.baselineCost;
      if (dataItem.modificationName) {
        this.totalModificationCost += dataItem.modificationCost;
        this.totalModificationEnergyUse += dataItem.modificationEnergyUse;
      }
      this.totalCostSavings += dataItem.costSavings;
      this.totalImplementationCosts += dataItem.implementationCosts;
    });
    if(this.totalImplementationCosts <= 0){
      this.totalImplementationCosts = 0;
      this.totalPaybackPeriod = 0;
    }else{
      this.totalPaybackPeriod = this.totalImplementationCosts / this.totalCostSavings;
    }
    
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
  payBackPeriod: number,
  currencyUnit?: string
}