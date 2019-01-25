import { Component, OnInit } from '@angular/core';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';

@Component({
  selector: 'app-default-summary-table',
  templateUrl: './default-summary-table.component.html',
  styleUrls: ['./default-summary-table.component.css']
})
export class DefaultSummaryTableComponent implements OnInit {

  boiler: BoilerOutput;
  totalOperatingCost: number;
  boilerFuelCost: number;
  boilerFuelUsage: number;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.boiler = this.calculateModelService.boilerOutput;
    this.totalOperatingCost = this.calculateModelService.totalOperatingCost;
    this.boilerFuelCost = this.calculateModelService.boilerFuelCost;
    this.boilerFuelUsage = this.calculateModelService.boilerFuelUsage;
  }
}
