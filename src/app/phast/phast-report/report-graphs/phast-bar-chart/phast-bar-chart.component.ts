import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { BaseChartDirective } from 'ng2-charts';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../graphColors';
import * as d3 from 'd3';
import * as c3 from 'c3';
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
  @Input()
  phast1Name: string;
  @Input()
  phast2Name: string;
  @Input()
  printView: boolean;
  @Input()
  chartIndex: number;
  @Input()
  chartContainerWidth: number;

  chartContainerHeight: number;


  chartColors: any = [{}];
  baselineData: Array<any>;
  modificationData: Array<any>;
  chartLabels: Array<string>;
  chartData: Array<any>;

  options: any = {}

  doc: any;
  window: any;
  resultsWidth: number;
  chart: any;

  constructor(private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.getData(this.results, this.modResults, this.resultCats);
    this.getColors();
  }

  ngAfterViewInit() {


    if (!this.printView) {
      if (this.chartContainerWidth > 877) {
        this.chartContainerWidth = 877;
      }
      else {
        this.chartContainerWidth = this.chartContainerWidth * 0.58;
      }
      this.chartContainerHeight = 280;
      this.initChart();
    }
    else {
      this.chartContainerWidth = 1400;
      this.chartContainerHeight = 700;
      this.initPrintCharts();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modResults) {
      if (!changes.modResults.firstChange) {
        let mod = this.modificationData[0];
        this.getData(this.results, this.modResults, this.resultCats);
        this.updateChart(1, mod);
      }
    } else if (changes.results) {
      if (!changes.results.firstChange) {
        let base = this.baselineData[0];
        this.getData(this.results, this.modResults, this.resultCats);
        this.updateChart(0, base);
      }
    }
  }

  initChart() {
    let charts = document.getElementsByClassName("bar-chart");
    let currentChart;

    let unit;
    if (this.settings.unitsOfMeasure == "Metric") {
      unit = "GJ/hr";
    }
    else if (this.settings.unitsOfMeasure == "Imperial") {
      unit = "MMBtu/hr";
    }

    currentChart = document.getElementsByClassName("bar-chart")[charts.length - 1];
    currentChart.className = "app-chart";

    this.chart = c3.generate({
      bindto: currentChart,
      data: {
        columns: this.chartData,
        type: 'bar',
      },
      axis: {
        x: {
          type: 'category',
          categories: this.chartLabels
        },
        y: {
          label: {
            text: 'Heat Loss (' + unit + ')',
            position: 'outer-middle'
          },
          tick: {
            format: d3.format('.1f')
          },
        }
      },
      grid: {
        y: {
          show: true
        }
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      padding: {
        bottom: 20
      },
      color: {
        pattern: graphColors
      },
      legend: {
        position: 'right'
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px; display: inline-block; white-space: nowrap;";
          let html = "<div style='" + styling + "'>"
            + "<table>"
            + "<tr>"
            + "<td>"
            + d[0].name + ": "
            + "</td>"
            + "<td style='text-align: right; font-weight: bold'>"
            + d[0].value + " " + unit
            + "</td>"
            + "</tr>"
            + "<tr>";

          if (d[1]) {
            html = html
              + "<td>"
              + d[1].name + ": "
              + "</td>"
              + "<td style='text-align: right; font-weight: bold'>"
              + d[1].value + " " + unit
              + "</td>"
              + "</tr>"
          }
          html = html + "</table></div>";
          return html;
        }
      }
    });
    d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
    d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
    d3.selectAll(".c3-texts").style("font-size", "10px");
    d3.selectAll(".c3-legend-item text").style("font-size", "11px");
    d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
  }

  updateChart(i: number, tmp: string) {
    if (this.chart) {
      this.chart.load({
        unload: [tmp],
        columns: [
          this.chartData[0],
          this.chartData[1]
        ]
      });
      setTimeout(function () {
        d3.selectAll(".c3-legend-item text").style("font-size", "12px");
        d3.selectAll(".c3-texts").style("font-size", "12px");
      }, 500);
    }
  }


  getData(phastResults: PhastResults, modResults: PhastResults, resultCats: ShowResultsCategories) {
    this.modificationData = new Array<any>();
    this.baselineData = new Array<any>();
    this.chartLabels = new Array<string>();
    this.chartData = new Array<any>();

    this.baselineData.push(this.phast1Name);
    this.modificationData.push(this.phast2Name);

    if (phastResults.totalWallLoss) {
      let totalWallLoss = this.getMMBtu(phastResults.totalWallLoss);
      this.baselineData.push(totalWallLoss);
      totalWallLoss = this.getMMBtu(modResults.totalWallLoss);
      this.modificationData.push(totalWallLoss);
      this.chartLabels.push('Wall Losses');
    }
    if (phastResults.totalAtmosphereLoss) {
      let totalAtmosphereLoss = this.getMMBtu(phastResults.totalAtmosphereLoss);
      this.baselineData.push(totalAtmosphereLoss);
      totalAtmosphereLoss = this.getMMBtu(modResults.totalAtmosphereLoss);
      this.modificationData.push(totalAtmosphereLoss);
      this.chartLabels.push('Atmosphere Losses');
    }
    if (phastResults.totalOtherLoss) {
      let totalOtherLoss = this.getMMBtu(phastResults.totalOtherLoss);
      this.baselineData.push(totalOtherLoss);
      totalOtherLoss = this.getMMBtu(modResults.totalWallLoss);
      this.modificationData.push(totalOtherLoss);
      this.chartLabels.push('Other Losses');
    }
    if (phastResults.totalCoolingLoss) {
      let totalCoolingLoss = this.getMMBtu(phastResults.totalCoolingLoss);
      this.baselineData.push(totalCoolingLoss);
      totalCoolingLoss = this.getMMBtu(modResults.totalCoolingLoss);
      this.modificationData.push(totalCoolingLoss);
      this.chartLabels.push('Cooling Losses');
    }
    if (phastResults.totalOpeningLoss) {
      let totalOpeningLoss = this.getMMBtu(phastResults.totalOpeningLoss);
      this.baselineData.push(totalOpeningLoss);
      totalOpeningLoss = this.getMMBtu(modResults.totalOpeningLoss);
      this.modificationData.push(totalOpeningLoss);
      this.chartLabels.push('Opening Losses');
    }
    if (phastResults.totalFixtureLoss) {
      let totalFixtureLoss = this.getMMBtu(phastResults.totalFixtureLoss);
      this.baselineData.push(totalFixtureLoss);
      totalFixtureLoss = this.getMMBtu(modResults.totalFixtureLoss);
      this.modificationData.push(totalFixtureLoss);
      this.chartLabels.push('Fixture Losses');
    }
    if (phastResults.totalLeakageLoss) {
      let totalLeakageLoss = this.getMMBtu(phastResults.totalLeakageLoss);
      this.baselineData.push(totalLeakageLoss);
      totalLeakageLoss = this.getMMBtu(modResults.totalLeakageLoss);
      this.modificationData.push(totalLeakageLoss);
      this.chartLabels.push('Leakage Losses');
    }
    if (phastResults.totalExtSurfaceLoss) {
      let totalExtSurfaceLoss = this.getMMBtu(phastResults.totalExtSurfaceLoss);
      this.baselineData.push(totalExtSurfaceLoss);
      totalExtSurfaceLoss = this.getMMBtu(modResults.totalExtSurfaceLoss);
      this.modificationData.push(totalExtSurfaceLoss);
      this.chartLabels.push('Extended Surface Losses');
    }
    if (phastResults.totalChargeMaterialLoss) {
      let totalChargeMaterialLoss = this.getMMBtu(phastResults.totalChargeMaterialLoss);
      this.baselineData.push(totalChargeMaterialLoss);
      totalChargeMaterialLoss = this.getMMBtu(modResults.totalChargeMaterialLoss);
      this.modificationData.push(totalChargeMaterialLoss);
      this.chartLabels.push('Charge Material Losses');
    }

    if (resultCats.showFlueGas && phastResults.totalFlueGas) {
      let totalFlueGas = this.getMMBtu(phastResults.totalFlueGas);
      this.baselineData.push(totalFlueGas);
      totalFlueGas = this.getMMBtu(modResults.totalFlueGas);
      this.modificationData.push(totalFlueGas);
      this.chartLabels.push('Flue Gas Losses');
    }

    if (resultCats.showAuxPower && phastResults.totalAuxPower) {
      let totalAuxPower = this.getMMBtu(phastResults.totalAuxPower);
      this.baselineData.push(totalAuxPower);
      totalAuxPower = this.getMMBtu(modResults.totalAuxPower);
      this.modificationData.push(totalAuxPower);
      this.chartLabels.push('Auxillary Power Losses');
    }

    if (resultCats.showSlag && phastResults.totalSlag) {
      let totalSlag = this.getMMBtu(phastResults.totalSlag);
      this.baselineData.push(totalSlag);
      totalSlag = this.getMMBtu(modResults.totalSlag);
      this.modificationData.push(totalSlag);
      this.chartLabels.push('Slag Losses');
    }
    if (resultCats.showExGas && phastResults.totalExhaustGasEAF) {
      let totalExhaustGasEAF = this.getMMBtu(phastResults.totalExhaustGasEAF);
      this.baselineData.push(totalExhaustGasEAF);
      totalExhaustGasEAF = this.getMMBtu(modResults.totalExhaustGasEAF);
      this.modificationData.push(totalExhaustGasEAF);
      this.chartLabels.push('Exhaust Gas (EAF) Losses');
    }
    if (resultCats.showEnInput2 && phastResults.totalExhaustGas) {
      let totalExhaustGas = this.getMMBtu(phastResults.totalExhaustGas);
      this.baselineData.push(totalExhaustGas);
      totalExhaustGas = this.getMMBtu(modResults.totalExhaustGas);
      this.modificationData.push(totalExhaustGas);
      this.chartLabels.push('Exhaust Gas Losses');
    }
    if (phastResults.totalSystemLosses && resultCats.showSystemEff) {
      let totalSystemLosses = this.getMMBtu(phastResults.totalSystemLosses);
      this.baselineData.push(totalSystemLosses);
      totalSystemLosses = this.getMMBtu(modResults.totalSystemLosses);
      this.modificationData.push(totalSystemLosses);
      this.chartLabels.push('System Losses');
    }
    this.chartData.push(this.baselineData);
    this.chartData.push(this.modificationData);
  }


  getMMBtu(loss: number): number {

    let percent = this.roundVal(loss, 1);
    return percent;
  }
  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }

  getColors() {
    this.chartColors = [
      '#1E7640',
      '#2ABDDA',
    ]
  }


  initPrintCharts() {
    let currentChart = document.getElementsByClassName("bar-chart")[0];
    currentChart.className = "print-bar-chart";
    let unit;
    if (this.settings.unitsOfMeasure == "Metric") {
      unit = "GJ/hr";
    }
    else if (this.settings.unitsOfMeasure == "Imperial") {
      unit = "MMBtu/hr";
    }

    this.chart = c3.generate({
      bindto: currentChart,
      data: {
        columns: this.chartData,
        type: 'bar',
      },
      axis: {
        x: {
          type: 'category',
          categories: this.chartLabels,
          tick: {
            rotate: 60,
            multiline: false
          },
          height: 300
        },
        y: {
          label: {
            text: 'Heat Loss (' + unit + ')',
            position: 'outer-bottom',
          }
        }
      },
      grid: {
        y: {
          show: true
        }
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      padding: {
        bottom: 20
      },
      color: {
        pattern: graphColors
      },
      legend: {
        position: 'right'
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          return;
        }
      }
    });
    d3.selectAll(".print-bar-chart .c3-axis").style("fill", "none").style("stroke", "#000");
    d3.selectAll(".print-bar-chart .c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
    d3.selectAll(".print-bar-chart .c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
    d3.selectAll(".print-bar-chart .c3-axis-x g.tick text tspan").style("font-size", "1.4rem").style("fill", "#000").style("stroke", "#000");
    d3.selectAll(".print-bar-chart .c3-axis-y g.tick text tspan").style("font-size", "0.8rem");
    d3.selectAll(".print-bar-chart .c3-axis-y-label").style("font-size", "1.4rem");
  }
}