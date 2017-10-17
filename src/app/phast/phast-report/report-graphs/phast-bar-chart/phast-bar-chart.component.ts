import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { BaseChartDirective } from 'ng2-charts';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../graphColors';
@Component({
  selector: 'app-phast-bar-chart',
  templateUrl: './phast-bar-chart.component.html',
  styleUrls: ['./phast-bar-chart.component.css']
})
export class PhastBarChartComponent implements OnInit {
  @Input()
  results: PhastResults;
  @Input()
  modResults: PhastResults;
  @Input()
  resultCats: ShowResultsCategories;
  @Input()
  settings: Settings;
  chartData: any = {
    barChartLabels: new Array<string>(),
    barChartData: new Array<any>(),
    backgroundColor: [{}]
  }

  chartColors: any = [{}];
  baselineData: any = {};
  modificationData: any = {};


  options: any = { }
  @ViewChild(BaseChartDirective) private baseChart;

  constructor() { }

  ngOnInit() {
    let units = 'Btu/lb';
    if (this.settings.unitsOfMeasure == 'Metric') {
      units = 'kJ/kg';
    }

    this.options = {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Heat Loss (' + units + ')',
            fontStyle: 'bold',
            fontSize: 16
          }
        }]
      }
    }

    this.baselineData = {
      data: new Array<number>(),
      label: ' Baseline (' + units + ')',
      backgroundColor: graphColors[0]
    };
    this.modificationData = {
      data: new Array<number>(),
      label: ' Modification (' + units + ')',
      backgroundColor: graphColors[1]
    };
    this.getData(this.results, this.modResults, this.resultCats);
    this.getColors();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.modResults) {
      if (!changes.modResults.firstChange) {
        this.getData(this.results, this.modResults, this.resultCats);
      }
    } else if (changes.results) {
      if (!changes.results.firstChange) {
        this.getData(this.results, this.modResults, this.resultCats);
      }
    }
  }

  getData(phastResults: PhastResults, modResults: PhastResults, resultCats: ShowResultsCategories) {
    this.modificationData.data = new Array<number>();
    this.baselineData.data = new Array<number>();
    this.chartData.barChartData = new Array<number>();
    this.chartData.barChartLabels = new Array<string>();
    if (phastResults.totalWallLoss) {
      let totalWallLoss = this.getMMBtu(phastResults.totalWallLoss);
      this.baselineData.data.push(totalWallLoss);
      totalWallLoss = this.getMMBtu(modResults.totalWallLoss);
      this.modificationData.data.push(totalWallLoss);
      this.chartData.barChartLabels.push('Wall Losses');
    }
    if (phastResults.totalAtmosphereLoss) {
      let totalAtmosphereLoss = this.getMMBtu(phastResults.totalAtmosphereLoss);
      this.baselineData.data.push(totalAtmosphereLoss);
      totalAtmosphereLoss = this.getMMBtu(modResults.totalAtmosphereLoss);
      this.modificationData.data.push(totalAtmosphereLoss);
      this.chartData.barChartLabels.push('Atmosphere Losses');
    }
    if (phastResults.totalOtherLoss) {
      let totalOtherLoss = this.getMMBtu(phastResults.totalOtherLoss);
      this.baselineData.data.push(totalOtherLoss);
      totalOtherLoss = this.getMMBtu(modResults.totalWallLoss);
      this.modificationData.data.push(totalOtherLoss);
      this.chartData.barChartLabels.push('Other Losses');
    }
    if (phastResults.totalCoolingLoss) {
      let totalCoolingLoss = this.getMMBtu(phastResults.totalCoolingLoss);
      this.baselineData.data.push(totalCoolingLoss);
      totalCoolingLoss = this.getMMBtu(modResults.totalCoolingLoss);
      this.modificationData.data.push(totalCoolingLoss);
      this.chartData.barChartLabels.push('Cooling Losses');
    }
    if (phastResults.totalOpeningLoss) {
      let totalOpeningLoss = this.getMMBtu(phastResults.totalOpeningLoss);
      this.baselineData.data.push(totalOpeningLoss);
      totalOpeningLoss = this.getMMBtu(modResults.totalOpeningLoss);
      this.modificationData.data.push(totalOpeningLoss);
      this.chartData.barChartLabels.push('Opening Losses');
    }
    if (phastResults.totalFixtureLoss) {
      let totalFixtureLoss = this.getMMBtu(phastResults.totalFixtureLoss);
      this.baselineData.data.push(totalFixtureLoss);
      totalFixtureLoss = this.getMMBtu(modResults.totalFixtureLoss);
      this.modificationData.data.push(totalFixtureLoss);
      this.chartData.barChartLabels.push('Fixture Losses');
    }
    if (phastResults.totalLeakageLoss) {
      let totalLeakageLoss = this.getMMBtu(phastResults.totalLeakageLoss);
      this.baselineData.data.push(totalLeakageLoss);
      totalLeakageLoss = this.getMMBtu(modResults.totalLeakageLoss);
      this.modificationData.data.push(totalLeakageLoss);
      this.chartData.barChartLabels.push('Leakage Losses');
    }
    if (phastResults.totalExtSurfaceLoss) {
      let totalExtSurfaceLoss = this.getMMBtu(phastResults.totalExtSurfaceLoss);
      this.baselineData.data.push(totalExtSurfaceLoss);
      totalExtSurfaceLoss = this.getMMBtu(modResults.totalExtSurfaceLoss);
      this.modificationData.data.push(totalExtSurfaceLoss);
      this.chartData.barChartLabels.push('Extended Surface Losses');
    }
    if (phastResults.totalChargeMaterialLoss) {
      let totalChargeMaterialLoss = this.getMMBtu(phastResults.totalChargeMaterialLoss);
      this.baselineData.data.push(totalChargeMaterialLoss);
      totalChargeMaterialLoss = this.getMMBtu(modResults.totalChargeMaterialLoss);
      this.modificationData.data.push(totalChargeMaterialLoss);
      this.chartData.barChartLabels.push('Charge Materials');
    }

    if (resultCats.showFlueGas && phastResults.totalFlueGas) {
      let totalFlueGas = this.getMMBtu(phastResults.totalFlueGas);
      this.baselineData.data.push(totalFlueGas);
      totalFlueGas = this.getMMBtu(modResults.totalFlueGas);
      this.modificationData.data.push(totalFlueGas);
      this.chartData.barChartLabels.push('Flue Gas Losses');
    }

    if (resultCats.showAuxPower && phastResults.totalAuxPower) {
      let totalAuxPower = this.getMMBtu(phastResults.totalAuxPower);
      this.baselineData.data.push(totalAuxPower);
      totalAuxPower = this.getMMBtu(modResults.totalAuxPower);
      this.modificationData.data.push(totalAuxPower);
      this.chartData.barChartLabels.push('Auxiliary Power Losses');
    }

    if (resultCats.showSlag && phastResults.totalSlag) {
      let totalSlag = this.getMMBtu(phastResults.totalSlag);
      this.baselineData.data.push(totalSlag);
      totalSlag = this.getMMBtu(modResults.totalSlag);
      this.modificationData.data.push(totalSlag);
      this.chartData.barChartLabels.push('Slag Losses');
    }
    if (resultCats.showExGas && phastResults.totalExhaustGasEAF) {
      let totalExhaustGasEAF = this.getMMBtu(phastResults.totalExhaustGasEAF);
      this.baselineData.data.push(totalExhaustGasEAF);
      totalExhaustGasEAF = this.getMMBtu(modResults.totalExhaustGasEAF);
      this.modificationData.data.push(totalExhaustGasEAF);
      this.chartData.barChartLabels.push('Exhaust Gas Losses');
    }
    if (resultCats.showEnInput2 && phastResults.totalExhaustGas) {
      let totalExhaustGas = this.getMMBtu(phastResults.totalExhaustGas);
      this.baselineData.data.push(totalExhaustGas);
      totalExhaustGas = this.getMMBtu(modResults.totalExhaustGas);
      this.modificationData.data.push(totalExhaustGas);
      this.chartData.barChartLabels.push('Exhaust Gas Losses');
    }
    if (phastResults.totalSystemLosses && resultCats.showSystemEff) {
      let totalSystemLosses = this.getMMBtu(phastResults.totalSystemLosses);
      this.baselineData.data.push(totalSystemLosses);
      totalSystemLosses = this.getMMBtu(modResults.totalSystemLosses);
      this.modificationData.data.push(totalSystemLosses);
      this.chartData.barChartLabels.push('System Losses')
    }
    this.chartData.barChartData.push(this.baselineData);
    this.chartData.barChartData.push(this.modificationData);
  }

  getMMBtu(loss: number): number {

    let percent = this.roundVal(loss, 0);
    return percent;
  }
  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }

  getColors() {
    this.chartColors = [
      graphColors[0],
      graphColors[1],
    ]
  }
}
