import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { BaseChartDirective } from 'ng2-charts';
@Component({
  selector: 'app-phast-pie-chart',
  templateUrl: './phast-pie-chart.component.html',
  styleUrls: ['./phast-pie-chart.component.css']
})
export class PhastPieChartComponent implements OnInit {
  @Input()
  results: PhastResults;
  @Input()
  resultCats: ShowResultsCategories;
  chartData: any = {
    pieChartLabels: new Array<string>(),
    pieChartData: new Array<number>()
  }

  chartColors: Array<any>;
  //chartColorDataSet: Array<any>;
  @ViewChild(BaseChartDirective) private baseChart;

  constructor() { }

  ngOnInit() {
    this.getData(this.results, this.resultCats);
    this.getColors();
  }

  getData(phastResults: PhastResults, resultCats: ShowResultsCategories) {
    if (phastResults.totalWallLoss) {
      let totalWallLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalWallLoss);
      this.chartData.pieChartData.push(totalWallLoss);
      this.chartData.pieChartLabels.push('Wall Losses');
    }
    if (phastResults.totalAtmosphereLoss) {
      let totalAtmosphereLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAtmosphereLoss);
      this.chartData.pieChartData.push(totalAtmosphereLoss);
      this.chartData.pieChartLabels.push('Atmosphere Losses');
    }
    if (phastResults.totalOtherLoss) {
      let totalOtherLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOtherLoss);
      this.chartData.pieChartData.push(totalOtherLoss);
      this.chartData.pieChartLabels.push('Other Losses');
    }
    if (phastResults.totalCoolingLoss) {
      let totalCoolingLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalCoolingLoss);
      this.chartData.pieChartData.push(totalCoolingLoss);
      this.chartData.pieChartLabels.push('Cooling Losses');
    }
    if (phastResults.totalOpeningLoss) {
      let totalOpeningLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOpeningLoss);
      this.chartData.pieChartData.push(totalOpeningLoss);
      this.chartData.pieChartLabels.push('Opening Losses');
    }
    if (phastResults.totalFixtureLoss) {
      let totalFixtureLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFixtureLoss);
      this.chartData.pieChartData.push(totalFixtureLoss);
      this.chartData.pieChartLabels.push('Fixture Losses');
    }
    if (phastResults.totalLeakageLoss) {
      let totalLeakageLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalLeakageLoss);
      this.chartData.pieChartData.push(totalLeakageLoss);
      this.chartData.pieChartLabels.push('Leakage Losses');
    }
    if (phastResults.totalExtSurfaceLoss) {
      let totalExtSurfaceLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExtSurfaceLoss);
      this.chartData.pieChartData.push(totalExtSurfaceLoss);
      this.chartData.pieChartLabels.push('Extended Surface Losses');
    }
    if (phastResults.totalChargeMaterialLoss) {
      let totalChargeMaterialLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalChargeMaterialLoss);
      this.chartData.pieChartData.push(totalChargeMaterialLoss);
      this.chartData.pieChartLabels.push('Charge Materials');
    }

    if (resultCats.showFlueGas && phastResults.totalFlueGas) {
      let totalFlueGas = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFlueGas);
      this.chartData.pieChartData.push(totalFlueGas);
      this.chartData.pieChartLabels.push('Flue Gas Losses');
    }

    if (resultCats.showAuxPower && phastResults.totalAuxPower) {
      let totalAuxPower = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAuxPower);
      this.chartData.pieChartData.push(totalAuxPower);
      this.chartData.pieChartLabels.push('Auxiliary Power Losses');
    }

    if (resultCats.showSlag && phastResults.totalSlag) {
      let totalSlag = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSlag);
      this.chartData.pieChartData.push(totalSlag);
      this.chartData.pieChartLabels.push('Slag Losses');
    }
    if (resultCats.showExGas && phastResults.totalExhaustGasEAF) {
      let totalExhaustGasEAF = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExhaustGasEAF);
      this.chartData.pieChartData.push(totalExhaustGasEAF);
      this.chartData.pieChartLabels.push('Exhaust Gas Losses');
    }
    if (resultCats.showEnInput2 && phastResults.totalExhaustGas) {
      let totalExhaustGas = this.getLossPercent(phastResults.totalExhaustGas, phastResults.totalExhaustGas);
      this.chartData.pieChartData.push(totalExhaustGas);
      this.chartData.pieChartLabels.push('Exhaust Gas Losses');
    }
    if (phastResults.totalSystemLosses && resultCats.showSystemEff) {
      let totalSystemLosses = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSystemLosses);
      this.chartData.pieChartData.push(totalSystemLosses +'%');
      this.chartData.pieChartLabels.push('System Losses')
    }

  }

  getLossPercent(totalLosses: number, loss: number): number {
    // let percent = (loss / totalLosses) * 100;
    let percent = this.roundVal(loss, 0);
    return percent;
  }
  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }

  getColors(){
    this.chartColors = [
      {
        backgroundColor: [
          '#BA4A00',
          '#CA6F1E',
          '#F39C12',
          '#F1C40F',
          '#DC7633',
          '#E74C3C',
          '#F9E79F',
          '#909497',
          '#D2B4DE',
        ]
      }
    ]
  }
}
