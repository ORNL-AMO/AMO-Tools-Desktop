import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';
import * as d3 from 'd3';
import * as c3 from 'c3';
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
  @Input()
  modExists: boolean;
  @Input()
  printView: boolean;
  @Input()
  chartContainerWidth: number;
  @Input()
  chartIndex: number;

  chartContainerHeight: number;

  chartData: any = {
    pieChartLabels: new Array<string>(),
    pieChartData: new Array<number>()
  }
  chartColors: Array<any>;

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

  chart: any;
  tmpChartData: Array<any>;


  constructor(private phastReportService: PhastReportService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.getData(this.results, this.resultCats);
    this.getColors();
  }

  ngAfterViewInit() {
    if (!this.printView) {
      if (this.modExists) {
        this.chartContainerWidth = this.chartContainerWidth / 2;
      }
      this.chartContainerHeight = 280;
      this.initChart();
    }
    else {
      this.chartContainerHeight = 500;
      this.chartContainerWidth = 1400;
      this.initPrintCharts();
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes.results.firstChange) {
      this.getData(this.results, this.resultCats);
      this.updateChart();
    }
  }


  initChart() {
    let charts = document.getElementsByClassName('chart');
    let chartId;
    let currentChart;


    if (this.modExists) {
      if (this.isBaseline) {
        currentChart = document.getElementsByClassName('chart')[charts.length - 2];
        currentChart.id = "pie-chart-" + (charts.length - 2);
        currentChart.className = "app-chart";

        this.chart = c3.generate({
          bindto: currentChart,
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
            }
          },
          size: {
            width: this.chartContainerWidth,
            height: this.chartContainerHeight
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
        currentChart = document.getElementsByClassName('chart')[charts.length - 1];
        currentChart.id = "pie-chart-" + (charts.length - 1);
        currentChart.className = "app-chart";

        this.chart = c3.generate({
          bindto: currentChart,
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
            }
          },
          size: {
            width: this.chartContainerWidth,
            height: this.chartContainerHeight
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
    }
    else {
      if (this.isBaseline) {
        currentChart = document.getElementsByClassName("chart")[charts.length - 1];
        currentChart.id = "pie-chart-" + (charts.length - 1);
        currentChart.className = "app-chart";

        this.chart = c3.generate({
          bindto: currentChart,
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
            }
          },
          color: {
            pattern: graphColors
          },
          size: {
            width: this.chartContainerWidth,
            height: this.chartContainerHeight
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

        if (this.resultCats.showFlueGas) {
          this.chart.load({
            columns: [
              ["flue", this.totalFlueGas]
            ],
            labels: true,
            names: {
              flue: "Flue Gas Losses " + this.totalFlueGas + "%"
            }
          });
        }
        if (this.resultCats.showAuxPower) {
          this.chart.load({
            columns: [
              ["aux", this.totalAuxPower]
            ],
            labels: true,
            names: {
              aux: "Total Auxillary Power " + this.totalAuxPower + "%"
            }
          });
        }
        if (this.resultCats.showSlag) {
          this.chart.load({
            columns: [
              ["slag", this.totalSlag]
            ],
            labels: true,
            names: {
              slag: "Total Slag " + this.totalSlag + "%"
            }
          });
        }
        if (this.resultCats.showExGas) {
          this.chart.load({
            columns: [
              ["exGasEAF", this.totalExhaustGasEAF]
            ],
            labels: true,
            names: {
              exGasEAF: "Total Exhaust Gas (EAF) Losses " + this.totalExhaustGasEAF + "%"
            }
          });
        }
        else if (this.resultCats.showEnInput2) {
          this.chart.load({
            columns: [
              ["exGas", this.totalExhaustGas]
            ],
            labels: true,
            names: {
              exGas: "Total Exhaust Gas Losses " + this.totalExhaustGas + "%"
            }
          });
        }
        if (this.resultCats.showSystemEff) {
          this.chart.load({
            columns: [
              ["sys", this.totalSystemLosses]
            ],
            labels: true,
            names: {
              sys: "Total System Losses " + this.totalSystemLosses + "%"
            }
          });
        }
      }
    }
    d3.selectAll(".c3-legend-item").style("font-size", "12px");

    if (this.chart) {
      this.updateChart();
    }
  }

  updateChart() {

    if (this.chart) {

      this.chart.load({
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
        }
      });
      if (this.resultCats.showFlueGas) {
        this.chart.load({
          columns: [
            ["flue", this.totalFlueGas]
          ],
          labels: true,
          names: {
            flue: "Flue Gas Losses " + this.totalFlueGas + "%"
          }
        });
      }
      if (this.resultCats.showAuxPower) {
        this.chart.load({
          columns: [
            ["aux", this.totalAuxPower]
          ],
          labels: true,
          names: {
            aux: "Total Auxillary Power " + this.totalAuxPower + "%"
          }
        });
      }
      if (this.resultCats.showSlag) {
        this.chart.load({
          columns: [
            ["slag", this.totalSlag]
          ],
          labels: true,
          names: {
            slag: "Total Slag " + this.totalSlag + "%"
          }
        });
      }
      if (this.resultCats.showExGas) {
        this.chart.load({
          columns: [
            ["exGasEAF", this.totalExhaustGasEAF]
          ],
          labels: true,
          names: {
            exGasEAF: "Total Exhaust Gas (EAF) Losses " + this.totalExhaustGasEAF + "%"
          }
        });
      }
      else if (this.resultCats.showEnInput2) {
        this.chart.load({
          columns: [
            ["exGas", this.totalExhaustGas]
          ],
          labels: true,
          names: {
            exGas: "Total Exhaust Gas Losses " + this.totalExhaustGas + "%"
          }
        });
      }
      if (this.resultCats.showSystemEff) {
        this.chart.load({
          columns: [
            ["sys", this.totalSystemLosses]
          ],
          labels: true,
          names: {
            sys: "Total System Losses " + this.totalSystemLosses + "%"
          }
        });
      }
      if (!this.printView) {
        d3.selectAll(".c3-legend-item").style("font-size", "13px");
      }
    }
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
    this.totalFlueGas = 0;
    this.totalSlag = 0;
    this.totalExhaustGas = 0;
    this.totalExhaustGasEAF = 0;
    this.totalSystemLosses = 0;

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



  initPrintCharts() {
    let charts = document.getElementsByClassName('chart');
    let currentChart;

    if (this.modExists) {
      if (this.isBaseline) {
        currentChart = document.getElementsByClassName('chart')[0];
        currentChart.className = "print-pie-chart";

        this.chart = c3.generate({
          bindto: currentChart,
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
            }
          },
          size: {
            width: this.chartContainerWidth,
            height: this.chartContainerHeight
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
        currentChart = document.getElementsByClassName('chart')[charts.length - 1];
        currentChart.className = "print-pie-chart";

        this.chart = c3.generate({
          bindto: currentChart,
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
            }
          },
          size: {
            width: this.chartContainerWidth,
            height: this.chartContainerHeight
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
    }
    else {
      currentChart = document.getElementsByClassName('chart')[0];
      currentChart.className = "print-pie-chart";

      this.chart = c3.generate({
        bindto: currentChart,
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
          }
        },
        size: {
          width: this.chartContainerWidth,
          height: this.chartContainerHeight
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



    if (this.chart) {
      this.updateChart();
    }
    
    setTimeout(() => {
      d3.selectAll(".print-pie-chart .c3-legend-item").style("font-size", "1.3rem");
      d3.selectAll(".print-pie-chart g.c3-chart-arc text").style("font-size", "1.3rem");
    }, 300);
  }
}