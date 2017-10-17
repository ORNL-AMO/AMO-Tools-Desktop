import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';
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
  @Input()
  isBaseline: boolean;

  chartData: any = {
    pieChartLabels: new Array<string>(),
    pieChartData: new Array<number>()
  }

  chartColors: Array<any>;
  //chartColorDataSet: Array<any>;

  options: any = {
    legend: {
      display: false
    }
  }

  @ViewChild(BaseChartDirective) private baseChart;

  constructor(private phastReportService: PhastReportService) { }

  ngOnInit() {
    this.getData(this.results, this.resultCats);
    this.getColors();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.results.firstChange) {
      this.getData(this.results, this.resultCats);
    }
  }

  getData(phastResults: PhastResults, resultCats: ShowResultsCategories) {
    this.chartData.pieChartData = new Array<number>();
    this.chartData.pieChartLabels = new Array<string>();

    let totalWallLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalWallLoss);
    this.chartData.pieChartData.push(totalWallLoss);
    this.chartData.pieChartLabels.push('Wall Losses (%)');

    let totalAtmosphereLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAtmosphereLoss);
    this.chartData.pieChartData.push(totalAtmosphereLoss);
    this.chartData.pieChartLabels.push('Atmosphere Losses (%)');

    let totalOtherLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOtherLoss);
    this.chartData.pieChartData.push(totalOtherLoss);
    this.chartData.pieChartLabels.push('Other Losses (%)');

    let totalCoolingLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalCoolingLoss);
    this.chartData.pieChartData.push(totalCoolingLoss);
    this.chartData.pieChartLabels.push('Cooling Losses (%)');

    let totalOpeningLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOpeningLoss);
    this.chartData.pieChartData.push(totalOpeningLoss);
    this.chartData.pieChartLabels.push('Opening Losses (%)');

    let totalFixtureLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFixtureLoss);
    this.chartData.pieChartData.push(totalFixtureLoss);
    this.chartData.pieChartLabels.push('Fixture Losses (%)');

    let totalLeakageLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalLeakageLoss);
    this.chartData.pieChartData.push(totalLeakageLoss);
    this.chartData.pieChartLabels.push('Leakage Losses (%)');

    let totalExtSurfaceLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExtSurfaceLoss);
    this.chartData.pieChartData.push(totalExtSurfaceLoss);
    this.chartData.pieChartLabels.push('Extended Surface Losses (%)');

    let totalChargeMaterialLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalChargeMaterialLoss);
    this.chartData.pieChartData.push(totalChargeMaterialLoss);
    this.chartData.pieChartLabels.push('Charge Materials (%)');

    if (resultCats.showFlueGas) {
      let totalFlueGas = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFlueGas);
      this.chartData.pieChartData.push(totalFlueGas);
      this.chartData.pieChartLabels.push('Flue Gas Losses (%)');
    }

    if (resultCats.showAuxPower) {
      let totalAuxPower = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAuxPower);
      this.chartData.pieChartData.push(totalAuxPower);
      this.chartData.pieChartLabels.push('Auxiliary Power Losses (%)');
    }

    if (resultCats.showSlag) {
      let totalSlag = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSlag);
      this.chartData.pieChartData.push(totalSlag);
      this.chartData.pieChartLabels.push('Slag Losses (%)');
    }
    if (resultCats.showExGas) {
      let totalExhaustGasEAF = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExhaustGasEAF);
      this.chartData.pieChartData.push(totalExhaustGasEAF);
      this.chartData.pieChartLabels.push('Exhaust Gas Losses (%)');
    }
    if (resultCats.showEnInput2) {
      let totalExhaustGas = this.getLossPercent(phastResults.totalExhaustGas, phastResults.totalExhaustGas);
      this.chartData.pieChartData.push(totalExhaustGas);
      this.chartData.pieChartLabels.push('Exhaust Gas Losses (%)');
    }
    if (resultCats.showSystemEff) {
      let totalSystemLosses = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSystemLosses);
      this.chartData.pieChartData.push(totalSystemLosses);
      this.chartData.pieChartLabels.push('System Losses (%)');
    }
    if (this.isBaseline) {
      this.phastReportService.baselineChartLabels.next(this.chartData.pieChartLabels);
    } else {
      this.phastReportService.modificationChartLabels.next(this.chartData.pieChartLabels);
    }
  }

  getLossPercent(totalLosses: number, loss: number): number {
    let num = (loss / totalLosses) * 100;
    let percent = this.roundVal(num, 0);
    return percent;
  }
  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }

  getColors() {
    this.chartColors = [
      {
        backgroundColor: graphColors
      }
    ]
  }
}
