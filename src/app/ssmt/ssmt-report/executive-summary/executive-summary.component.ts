import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<SSMTOutput>;
  
  tableCellWidth: number;
  chartWidth: number;
  constructor() { }

  ngOnInit() {
    this.getTableCellWidth();
  }

  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  getTableCellWidth(){
    this.tableCellWidth = 100 / (this.modificationOutputs.length + 2);
    this.chartWidth = this.tableCellWidth * .75;
  }
}
