import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';

@Injectable()
export class ReportSummaryGraphsService {
  reportSummaryGraphData: BehaviorSubject<Array<PieChartDataItem>>;
  energyChartData: BehaviorSubject<Array<PieChartDataItem>>;

  totalEnergyUsed: BehaviorSubject<number>;
  totalFuel: BehaviorSubject<number>;
  totalElectricity: BehaviorSubject<number>;


  constructor() {
    this.reportSummaryGraphData = new BehaviorSubject<Array<PieChartDataItem>>(new Array<PieChartDataItem>());
    this.energyChartData = new BehaviorSubject<Array<PieChartDataItem>>(new Array<PieChartDataItem>());
    this.totalEnergyUsed = new BehaviorSubject<number>(0);
    this.totalElectricity = new BehaviorSubject<number>(0);
    this.totalFuel = new BehaviorSubject<number>(0);
  }

  calculateTotalEnergyUsed(energyUsed: number) {
    let total = this.totalEnergyUsed.getValue();
    let newTotal = total + energyUsed;
    this.totalEnergyUsed.next(newTotal);
  }

  calculateTotalFuelUsed(fuelUsed: number) {
    let total = this.totalFuel.getValue();
    let newTotal = total + fuelUsed;
    this.totalFuel.next(newTotal);
  }

  calculateTotalElectricityUsed(electricityUsed: number) {
    let total = this.totalElectricity.getValue();
    let newTotal = total + electricityUsed;
    this.totalElectricity.next(newTotal);
  }

  clearData() {
    this.totalEnergyUsed.next(0);
    this.totalElectricity.next(0);
    this.totalFuel.next(0);
    this.reportSummaryGraphData.next(new Array<PieChartDataItem>());
    this.energyChartData.next(new Array<PieChartDataItem>());
  }

  getEnergyGraphData(settings: Settings): Array<PieChartDataItem> {
    let energyChartData: Array<PieChartDataItem> = new Array<PieChartDataItem>();
    let totalEnergy = this.totalEnergyUsed.getValue();
    let totalFuel = this.totalFuel.getValue();
    let totalElectricity = this.totalElectricity.getValue();

    energyChartData.push({
      equipmentName: 'Fuel',
      energyUsed: totalFuel,
      annualCost: 0,
      energySavings: totalFuel - totalEnergy,
      costSavings: 0,
      percentCost: 0,
      percentEnergy: totalFuel / totalEnergy * 100,
      color: '#bf3d00',
      currencyUnit: settings.currency
    });

    energyChartData.push({
      equipmentName: 'Electricity',
      energyUsed: totalElectricity,
      annualCost: 0,
      energySavings: totalElectricity - totalEnergy,
      costSavings: 0,
      percentCost: 0,
      percentEnergy: totalElectricity / totalEnergy * 100,
      color: '#FFE400',
      currencyUnit: settings.currency
    });

    this.energyChartData.next(energyChartData);

    return this.energyChartData.getValue();
  }
}
