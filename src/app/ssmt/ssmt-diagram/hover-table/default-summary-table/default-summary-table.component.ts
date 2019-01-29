import { Component, OnInit, Input } from '@angular/core';
import { BoilerOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-default-summary-table',
  templateUrl: './default-summary-table.component.html',
  styleUrls: ['./default-summary-table.component.css']
})
export class DefaultSummaryTableComponent implements OnInit {
  @Input()
  outputData: SSMTOutput;

  boiler: BoilerOutput;
  totalOperatingCost: number;
  boilerFuelCost: number;
  boilerFuelUsage: number;
  constructor() { }

  ngOnInit() {
    this.boiler = this.outputData.boilerOutput;
    this.totalOperatingCost = this.outputData.totalOperatingCost;
    this.boilerFuelCost = this.outputData.boilerFuelCost;
    this.boilerFuelUsage = this.outputData.boilerFuelUsage;
  }
}
