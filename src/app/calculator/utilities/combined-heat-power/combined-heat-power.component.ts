import { Component, OnInit } from '@angular/core';
import { StandaloneService } from '../../standalone.service';
import { CombinedHeatPower, CombinedHeatPowerOutput } from '../../../shared/models/combinedHeatPower';

@Component({
  selector: 'app-combined-heat-power',
  templateUrl: './combined-heat-power.component.html',
  styleUrls: ['./combined-heat-power.component.css']
})
export class CombinedHeatPowerComponent implements OnInit {

  inputs: CombinedHeatPower = {
    annualOperatingHours: 0,
    annualElectricityConsumption: 0,
    annualThermalDemand: 0,
    boilerThermalFuelCosts: 0,
    avgElectricityCosts: 0,
    option: 0,
    boilerThermalFuelCostsCHPcase: 0,
    CHPfuelCosts: 0,
    percentAvgkWhElectricCostAvoidedOrStandbyRate: 75,
    displacedThermalEfficiency: 0,
    chpAvailability: 0,
    thermalUtilization: 0
  }

  results: CombinedHeatPowerOutput = {
    annualOperationSavings: 0,
    totalInstalledCostsPayback: 0,
    simplePayback: 0,
    fuelCosts: 0,
    thermalCredit: 0,
    incrementalOandM: 0,
    totalOperatingCosts: 0
  }
  currentField: string = 'annualOperatingHours';
  tabSelect: string = 'results';
  constructor(private standaloneService: StandaloneService) { }

  ngOnInit() {
  }
  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.results = this.standaloneService.CHPcalculator(this.inputs);
  }

}
