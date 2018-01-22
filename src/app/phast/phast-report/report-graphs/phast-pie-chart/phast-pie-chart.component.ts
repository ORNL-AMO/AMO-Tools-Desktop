import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { DOCUMENT } from '@angular/common/src/dom_tokens';
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

  totalWallLoss: number;
  totalAtmosphereLoss: number;
  totalOtherLoss: number;
  totalCoolingLoss: number;
  totalOpeningLoss: number;
  totalFixtureLoss: number;
  totalLeakageLoss: number;
  totalExtSurfaceLoss: number;
  totalChargeMaterialLoss: number;
  totalFlueGas: number;
  totalAuxPower: number;
  totalSlag: number;
  totalExhaustGasEAF: number;
  totalExhaustGas: number;
  totalSystemLosses: number;

  doc: any;
  window: any;
  resultsWidth: number;
  chartContainerWidth: number;

  chart: any;
  tmpChartData: Array<any>;


  // @ViewChild(BaseChartDirective) private baseChart;

  constructor(private phastReportService: PhastReportService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.getData(this.results, this.resultCats);
    this.getColors();
    // this.initChart();
    // this.initChart();
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.resultsWidth = this.doc.getElementsByClassName('results')[0].clientWidth;
    this.chartContainerWidth = this.resultsWidth / 2;
    this.window.onresize = () => { this.setValueMargin() };
    // this.initChart();
    //let object render before resizing initially
    setTimeout(() => {
      this.setValueMargin();
    }, 1500);
  }

  ngOnDestroy() {
    this.window.onresize = null;
  }


  setValueMargin() {
    this.doc = this.windowRefService.getDoc();
    this.resultsWidth = this.doc.getElementsByClassName('results')[0].clientWidth;
    this.chartContainerWidth = this.resultsWidth / 2;
    // console.log(this.chartContainerWidth);
    console.log("baseline = " + this.isBaseline);
    this.initChart();
    // this.resizeChart();

  }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes.results.firstChange) {
      this.getData(this.results, this.resultCats);
      this.updateChart();
    }
  }


  initChart() {
    var charts = document.getElementsByClassName('chart');
    // console.log("initChart() charts.length = " + charts.length);
    // console.log("initChart() this.chartContainerWidth = " + this.chartContainerWidth);

    if (this.isBaseline) {
      this.chart = c3.generate({
        bindto: charts[0],
        data: {
          columns: [
            ["wall", this.totalWallLoss],
            ["atmosphere", this.totalAtmosphereLoss],
            ["other", this.totalOtherLoss],
            ["cooling", this.totalCoolingLoss],
            ["opening", this.totalOpeningLoss],
            ["fixture", this.totalFixtureLoss],
            ["leakage", this.totalLeakageLoss],
            ["extSurface", this.totalExtSurfaceLoss],
            ["charge", this.totalChargeMaterialLoss],
            ["flue", this.totalFlueGas]
          ],
          type: 'pie',
          labels: true,
          names: {
            wall: "Wall Losses " + this.totalWallLoss + "%",
            atmosphere: "Atmosphere Losses " + this.totalAtmosphereLoss + "%",
            other: "Other Losses " + this.totalOtherLoss + "%",
            cooling: "Cooling Losses " + this.totalCoolingLoss + "%",
            opening: "Opening Losses " + this.totalOpeningLoss + "%",
            fixture: "Fixture Losses " + this.totalFixtureLoss + "%",
            leakage: "Leakage Losses " + this.totalLeakageLoss + "%",
            extSurface: "Extended Surface Losses " + this.totalExtSurfaceLoss + "%",
            charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
            flue: "Flue Gas Losses " + this.totalFlueGas + "%"
          }
        },
        size: {
          width: this.chartContainerWidth
        },
        color: {
          pattern: graphColors
        },
        legend: {
          position: 'right'
        },
        tooltip: {
          contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
            let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
            let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
            return html;
          }
        }
      });
    }
    else {
      this.chart = c3.generate({
        bindto: charts[1],
        data: {
          columns: [
            ["wall", this.totalWallLoss],
            ["atmosphere", this.totalAtmosphereLoss],
            ["other", this.totalOtherLoss],
            ["cooling", this.totalCoolingLoss],
            ["opening", this.totalOpeningLoss],
            ["fixture", this.totalFixtureLoss],
            ["leakage", this.totalLeakageLoss],
            ["extSurface", this.totalExtSurfaceLoss],
            ["charge", this.totalChargeMaterialLoss],
            ["flue", this.totalFlueGas]
          ],
          type: 'pie',
          labels: true,
          names: {
            wall: "Wall Losses " + this.totalWallLoss + "%",
            atmosphere: "Atmosphere Losses " + this.totalAtmosphereLoss + "%",
            other: "Other Losses " + this.totalOtherLoss + "%",
            cooling: "Cooling Losses " + this.totalCoolingLoss + "%",
            opening: "Opening Losses " + this.totalOpeningLoss + "%",
            fixture: "Fixture Losses " + this.totalFixtureLoss + "%",
            leakage: "Leakage Losses " + this.totalLeakageLoss + "%",
            extSurface: "Extended Surface Losses " + this.totalExtSurfaceLoss + "%",
            charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
            flue: "Flue Gas Losses " + this.totalFlueGas + "%"
          }
        },
        size: {
          width: this.chartContainerWidth
        },
        color: {
          pattern: graphColors
        },
        legend: {
          position: 'right'
        },
        tooltip: {
          contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
            let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
            let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
            return html;
          }
        }
      });
    }

    d3.selectAll(".c3-legend-item").style("font-size", "13px");

    if (this.chart) {
      // console.log("initChart, this.chart = " + this.chart);
      // this.chart.resize();
      this.updateChart();
    }
  }

  updateChart() {
    // console.log("updateChart, this.chart = " + this.chart);
    // console.log("updateChart() isBaseline = " + this.isBaseline);
    if (this.chart) {

      this.chart.load({
        // unload: true,
        columns: [
          ["wall", this.totalWallLoss],
          ["atmosphere", this.totalAtmosphereLoss],
          ["other", this.totalOtherLoss],
          ["cooling", this.totalCoolingLoss],
          ["opening", this.totalOpeningLoss],
          ["fixture", this.totalFixtureLoss],
          ["leakage", this.totalLeakageLoss],
          ["extSurface", this.totalExtSurfaceLoss],
          ["charge", this.totalChargeMaterialLoss],
          ["flue", this.totalFlueGas]
        ],
        labels: true,
        names: {
          wall: "Wall Losses " + this.totalWallLoss + "%",
          atmosphere: "Atmosphere Losses " + this.totalAtmosphereLoss + "%",
          other: "Other Losses " + this.totalOtherLoss + "%",
          cooling: "Cooling Losses " + this.totalCoolingLoss + "%",
          opening: "Opening Losses " + this.totalOpeningLoss + "%",
          fixture: "Fixture Losses " + this.totalFixtureLoss + "%",
          leakage: "Leakage Losses " + this.totalLeakageLoss + "%",
          extSurface: "Extended Surface Losses " + this.totalExtSurfaceLoss + "%",
          charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
          flue: "Flue Gas Losses " + this.totalFlueGas + "%"
        }
      });
      // this.chart.load({
      //   // unload: true,
      //   columns: [
      //     ["Wall Losses ", this.totalWallLoss],
      //     ["Atmosphere Losses ", this.totalAtmosphereLoss],
      //     ["Other Losses ", this.totalOtherLoss],
      //     ["Cooling Losses ", this.totalCoolingLoss],
      //     ["Opening Losses ", this.totalOpeningLoss],
      //     ["Fixture Losses ", this.totalFixtureLoss],
      //     ["Leakage Losses ", this.totalLeakageLoss],
      //     ["Extended Surface Losses ", this.totalExtSurfaceLoss],
      //     ["Charge Materials ", this.totalChargeMaterialLoss],
      //     ["Flue Gas Losses ", this.totalFlueGas]
      //   ]
      // });
    }
  }


  resizeChart() {

    console.log("resizing chart, isBaseline = " + this.isBaseline);
  }


  getData(phastResults: PhastResults, resultCats: ShowResultsCategories) {
    this.totalWallLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalWallLoss);
    this.totalAtmosphereLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAtmosphereLoss);
    this.totalOtherLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOtherLoss);
    this.totalCoolingLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalCoolingLoss);
    this.totalOpeningLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOpeningLoss);
    this.totalFixtureLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFixtureLoss);
    this.totalLeakageLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalLeakageLoss);
    this.totalExtSurfaceLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExtSurfaceLoss);
    this.totalChargeMaterialLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalChargeMaterialLoss);
    if (resultCats.showFlueGas) {
      this.totalFlueGas = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFlueGas);
    }
    if (resultCats.showAuxPower) {
      this.totalAuxPower = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAuxPower);
    }
    if (resultCats.showSlag) {
      this.totalSlag = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSlag);
    }
    if (resultCats.showExGas) {
      this.totalExhaustGasEAF = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExhaustGasEAF);
    }
    if (resultCats.showEnInput2) {
      this.totalExhaustGas = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExhaustGas);
    }
    if (resultCats.showSystemEff) {
      this.totalSystemLosses = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSystemLosses);
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
    ];
  }
}





// import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
// import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
// import { BaseChartDirective } from 'ng2-charts';
// import { graphColors } from '../graphColors';
// import { PhastReportService } from '../../phast-report.service';
// @Component({
//   selector: 'app-phast-pie-chart',
//   templateUrl: './phast-pie-chart.component.html',
//   styleUrls: ['./phast-pie-chart.component.css']
// })
// export class PhastPieChartComponent implements OnInit {
//   @Input()
//   results: PhastResults;
//   @Input()
//   resultCats: ShowResultsCategories;
//   @Input()
//   isBaseline: boolean;

//   chartData: any = {
//     pieChartLabels: new Array<string>(),
//     pieChartData: new Array<number>()
//   }

//   chartColors: Array<any>;
//   //chartColorDataSet: Array<any>;

//   options: any = {
//     legend: {
//       display: false
//     }
//   }

//   // @ViewChild(BaseChartDirective) private baseChart;

//   constructor(private phastReportService: PhastReportService) { }

//   ngOnInit() {
//     this.getData(this.results, this.resultCats);
//     this.getColors();
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     if (!changes.results.firstChange) {
//       this.getData(this.results, this.resultCats);
//     }
//   }

//   getData(phastResults: PhastResults, resultCats: ShowResultsCategories) {
//     this.chartData.pieChartData = new Array<number>();
//     this.chartData.pieChartLabels = new Array<string>();

//     let totalWallLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalWallLoss);
//     this.chartData.pieChartData.push(totalWallLoss);
//     this.chartData.pieChartLabels.push('Wall Losses' + " " + totalWallLoss + "%");

//     let totalAtmosphereLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAtmosphereLoss);
//     this.chartData.pieChartData.push(totalAtmosphereLoss);
//     this.chartData.pieChartLabels.push('Atmosphere Losses' + " " + totalAtmosphereLoss + "%");

//     let totalOtherLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOtherLoss);
//     this.chartData.pieChartData.push(totalOtherLoss);
//     this.chartData.pieChartLabels.push('Other Losses' + " " + totalOtherLoss + "%");

//     let totalCoolingLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalCoolingLoss);
//     this.chartData.pieChartData.push(totalCoolingLoss);
//     this.chartData.pieChartLabels.push('Cooling Losses' + " " + totalCoolingLoss + "%");

//     let totalOpeningLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalOpeningLoss);
//     this.chartData.pieChartData.push(totalOpeningLoss);
//     this.chartData.pieChartLabels.push('Opening Losses' + " " + totalOpeningLoss + "%");

//     let totalFixtureLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFixtureLoss);
//     this.chartData.pieChartData.push(totalFixtureLoss);
//     this.chartData.pieChartLabels.push('Fixture Losses' + " " + totalFixtureLoss + "%" );

//     let totalLeakageLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalLeakageLoss);
//     this.chartData.pieChartData.push(totalLeakageLoss);
//     this.chartData.pieChartLabels.push('Leakage Losses' + " " + totalLeakageLoss + "%");

//     let totalExtSurfaceLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExtSurfaceLoss);
//     this.chartData.pieChartData.push(totalExtSurfaceLoss);
//     this.chartData.pieChartLabels.push('Extended Surface Losses' + " " + totalExtSurfaceLoss + "%");

//     let totalChargeMaterialLoss = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalChargeMaterialLoss);
//     this.chartData.pieChartData.push(totalChargeMaterialLoss);
//     this.chartData.pieChartLabels.push('Charge Materials' + " " + totalChargeMaterialLoss + "%");

//     if (resultCats.showFlueGas) {
//       let totalFlueGas = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalFlueGas);
//       this.chartData.pieChartData.push(totalFlueGas);
//       this.chartData.pieChartLabels.push('Flue Gas Losses' + " " + totalFlueGas + "%");
//     }

//     if (resultCats.showAuxPower) {
//       let totalAuxPower = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalAuxPower);
//       this.chartData.pieChartData.push(totalAuxPower);
//       this.chartData.pieChartLabels.push('Auxiliary Power Losses' + " " + totalAuxPower + "%");
//     }

//     if (resultCats.showSlag) {
//       let totalSlag = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSlag);
//       this.chartData.pieChartData.push(totalSlag);
//       this.chartData.pieChartLabels.push('Slag Losses' + " " + totalSlag + "%");
//     }
//     if (resultCats.showExGas) {
//       let totalExhaustGasEAF = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExhaustGasEAF);
//       this.chartData.pieChartData.push(totalExhaustGasEAF);
//       this.chartData.pieChartLabels.push('Exhaust Gas Losses' + " " + totalExhaustGasEAF + "%");
//     }
//     if (resultCats.showEnInput2) {
//       let totalExhaustGas = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalExhaustGas);
//       this.chartData.pieChartData.push(totalExhaustGas);
//       this.chartData.pieChartLabels.push('Exhaust Gas Losses' + " " + totalExhaustGas + "%");
//     }
//     if (resultCats.showSystemEff) {
//       let totalSystemLosses = this.getLossPercent(phastResults.grossHeatInput, phastResults.totalSystemLosses);
//       this.chartData.pieChartData.push(totalSystemLosses);
//       this.chartData.pieChartLabels.push('System Losses' + " " + totalSystemLosses + "%");
//     }
//     if (this.isBaseline) {
//       this.phastReportService.baselineChartLabels.next(this.chartData.pieChartLabels);
//     } else {
//       this.phastReportService.modificationChartLabels.next(this.chartData.pieChartLabels);
//     }
//   }

//   getLossPercent(totalLosses: number, loss: number): number {
//     let num = (loss / totalLosses) * 100;
//     let percent = this.roundVal(num, 0);
//     return percent;
//   }
//   roundVal(val: number, digits: number) {
//     return Number((Math.round(val * 100) / 100).toFixed(digits))
//   }

//   getColors() {
//     this.chartColors = [
//       {
//         backgroundColor: graphColors
//       }
//     ]
//   }
// }
