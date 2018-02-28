import { Component, OnInit, Input, ViewChild, SimpleChanges, ElementRef } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
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

  @ViewChild("ngChart") ngChart: ElementRef;
  @ViewChild('btnDownload') btnDownload: ElementRef;

  exportName: string;

  chartContainerHeight: number;

  chartData: any = {
    pieChartLabels: new Array<string>(),
    pieChartData: new Array<number>()
  }

  pieChartData: Array<Array<any>>;

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


  constructor(private phastReportService: PhastReportService, private windowRefService: WindowRefService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.getData(this.results, this.resultCats);
    this.getColors();
  }

  ngAfterViewInit() {
    if (!this.printView) {
      if (this.modExists) {
        this.chartContainerWidth = this.chartContainerWidth / 2;
      }
      this.chartContainerHeight = 300;
    }
    else {
      this.chartContainerHeight = 450;
      this.chartContainerWidth = 1000;
    }
    this.initChart();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes.results.firstChange) {
      this.getData(this.results, this.resultCats);
      this.updateChart();
    }
  }


  initChart() {

    if (this.printView) {
      this.ngChart.nativeElement.className = 'print-pie-chart';
    }

    //debug
    this.chart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: this.pieChartData,
        type: 'pie',
        labels: true,
        order: null
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

    if (!this.printView) {
      setTimeout(() => {

        //debug
        this.chart.load({
          names: {
            wall: "Wall " + this.totalWallLoss + "%",
            atmosphere: "Atmosphere " + this.totalAtmosphereLoss + "%",
            other: "Other Loss " + this.totalOtherLoss + "%",
            cooling: "Cooling " + this.totalCoolingLoss + "%",
            opening: "Opening " + this.totalOpeningLoss + "%",
            fixture: "Fixture " + this.totalFixtureLoss + "%",
            leakage: "Leakage " + this.totalLeakageLoss + "%",
            extSurface: "Extended Surface " + this.totalExtSurfaceLoss + "%",
            charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
            flue: "Flue Gas " + this.totalFlueGas + "%",
            aux: "Auxillary Power " + this.totalAuxPower + "%",
            slag: "Slag " + this.totalSlag + "%",
            exGasEAF: "Exhaust Gas (EAF) " + this.totalExhaustGasEAF + "%",
            exGas: "Exhaust Gas " + this.totalExhaustGas + "%",
            sys: "System " + this.totalSystemLosses + "%"
          },
        });


        //real version
        // this.chart.load({
        //   names: {
        //     wall: "Wall Losses " + this.totalWallLoss + "%",
        //     atmosphere: "Atmosphere Losses " + this.totalAtmosphereLoss + "%",
        //     other: "Other Losses " + this.totalOtherLoss + "%",
        //     cooling: "Cooling Losses " + this.totalCoolingLoss + "%",
        //     opening: "Opening Losses " + this.totalOpeningLoss + "%",
        //     fixture: "Fixture Losses " + this.totalFixtureLoss + "%",
        //     leakage: "Leakage Losses " + this.totalLeakageLoss + "%",
        //     extSurface: "Extended Surface Losses " + this.totalExtSurfaceLoss + "%",
        //     charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
        //     flue: "Flue Gas Losses " + this.totalFlueGas + "%",
        //     aux: "Auxillary Power " + this.totalAuxPower + "%",
        //     slag: "Slag " + this.totalSlag + "%",
        //     exGasEAF: "Exhaust Gas (EAF) Losses " + this.totalExhaustGasEAF + "%",
        //     exGas: "Exhaust Gas Losses " + this.totalExhaustGas + "%",
        //     sys: "System Losses " + this.totalSystemLosses + "%"
        //   },
        // });

        d3.selectAll(".c3-chart-arcs").attr("width", this.chartContainerWidth).attr("height", this.chartContainerHeight);
        d3.selectAll(".pie-chart .c3-legend-item text").style("font-size", "13px");
        d3.selectAll(".pie-chart .c3-legend-item rect").attr("height", "18");
      }, 500);
    }
    else {

      //debug
      this.chart.load({
        names: {
          wall: "Wall " + this.totalWallLoss + "%",
          atmosphere: "Atmosphere " + this.totalAtmosphereLoss + "%",
          other: "Other " + this.totalOtherLoss + "%",
          cooling: "Cooling " + this.totalCoolingLoss + "%",
          opening: "Opening " + this.totalOpeningLoss + "%",
          fixture: "Fixture " + this.totalFixtureLoss + "%",
          leakage: "Leakage " + this.totalLeakageLoss + "%",
          extSurface: "Extended Surface " + this.totalExtSurfaceLoss + "%",
          charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
          flue: "Flue Gas " + this.totalFlueGas + "%",
          aux: "Auxillary Power " + this.totalAuxPower + "%",
          slag: "Slag " + this.totalSlag + "%",
          exGasEAF: "Exhaust Gas (EAF) " + this.totalExhaustGasEAF + "%",
          exGas: "Exhaust Gas " + this.totalExhaustGas + "%",
          sys: "System " + this.totalSystemLosses + "%"
        },
      });

      //real version
      // this.chart.load({
      //   names: {
      //     wall: "Wall Losses " + this.totalWallLoss + "%",
      //     atmosphere: "Atmosphere Losses " + this.totalAtmosphereLoss + "%",
      //     other: "Other Losses " + this.totalOtherLoss + "%",
      //     cooling: "Cooling Losses " + this.totalCoolingLoss + "%",
      //     opening: "Opening Losses " + this.totalOpeningLoss + "%",
      //     fixture: "Fixture Losses " + this.totalFixtureLoss + "%",
      //     leakage: "Leakage Losses " + this.totalLeakageLoss + "%",
      //     extSurface: "Extended Surface Losses " + this.totalExtSurfaceLoss + "%",
      //     charge: "Charge Materials " + this.totalChargeMaterialLoss + "%",
      //     flue: "Flue Gas Losses " + this.totalFlueGas + "%",
      //     aux: "Auxillary Power " + this.totalAuxPower + "%",
      //     slag: "Slag " + this.totalSlag + "%",
      //     exGasEAF: "Exhaust Gas (EAF) Losses " + this.totalExhaustGasEAF + "%",
      //     exGas: "Exhaust Gas Losses " + this.totalExhaustGas + "%",
      //     sys: "System Losses " + this.totalSystemLosses + "%"
      //   },
      // });
      d3.selectAll(".print-pie-chart .c3-legend-item text").style("font-size", "1.2rem");
      d3.selectAll(".print-pie-chart g.c3-chart-arc text").style("font-size", "1rem");
      d3.selectAll(".c3-chart-arcs").attr("width", this.chartContainerWidth).attr("height", this.chartContainerHeight);
      // d3.selectAll(".pie-chart .c3-legend-item text").style("font-size", "14px");
      // d3.selectAll(".pie-chart .c3-legend-item rect").attr("height", "18");
    }
  }

  updateChart() {

    if (this.chart) {

      this.chart.load({
        columns: this.pieChartData,
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
          flue: "Flue Gas Losses " + this.totalFlueGas + "%",
          aux: "Auxillary Power " + this.totalAuxPower + "%",
          slag: "Slag " + this.totalSlag + "%",
          exGasEAF: "Exhaust Gas (EAF) Losses " + this.totalExhaustGasEAF + "%",
          exGas: "Exhaust Gas Losses " + this.totalExhaustGas + "%",
          sys: "System Losses " + this.totalSystemLosses + "%"
        },
        order: null
      });

      setTimeout(() => {
        this.chart.load({
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
            flue: "Flue Gas Losses " + this.totalFlueGas + "%",
            aux: "Auxillary Power " + this.totalAuxPower + "%",
            slag: "Slag " + this.totalSlag + "%",
            exGasEAF: "Exhaust Gas (EAF) Losses " + this.totalExhaustGasEAF + "%",
            exGas: "Exhaust Gas Losses " + this.totalExhaustGas + "%",
            sys: "System Losses " + this.totalSystemLosses + "%"
          },
        });
      }, 300)

      if (!this.printView) {
        setTimeout(() => {
          d3.selectAll(".c3-chart-arcs").attr("width", this.chartContainerWidth).attr("height", this.chartContainerHeight);
          d3.selectAll(".pie-chart .c3-legend-item text").style("font-size", "13px");
          d3.selectAll(".pie-chart .c3-legend-item rect").attr("height", "18");
        }, 500);
      }
      else {
        setTimeout(() => {
          d3.selectAll(".print-pie-chart .c3-legend-item").style("font-size", "1.2rem");
          d3.selectAll(".print-pie-chart g.c3-chart-arc text").style("font-size", "1.2rem");
        }, 800);
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
    this.totalAuxPower = 0;
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

    this.pieChartData = new Array<Array<any>>();
    let tmpArray = new Array<any>();

    tmpArray = new Array<any>();
    tmpArray.push("flue");
    tmpArray.push(this.totalFlueGas);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("charge");
    tmpArray.push(this.totalChargeMaterialLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("opening");
    tmpArray.push(this.totalOpeningLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("wall");
    tmpArray.push(this.totalWallLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("atmosphere");
    tmpArray.push(this.totalAtmosphereLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("cooling");
    tmpArray.push(this.totalCoolingLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("fixture");
    tmpArray.push(this.totalFixtureLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("leakage");
    tmpArray.push(this.totalLeakageLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("extSurface");
    tmpArray.push(this.totalExtSurfaceLoss);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("exGasEAF");
    tmpArray.push(this.totalExhaustGasEAF);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("exGas");
    tmpArray.push(this.totalExhaustGas);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("sys");
    tmpArray.push(this.totalSystemLosses);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("slag");
    tmpArray.push(this.totalSlag);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("aux");
    tmpArray.push(this.totalAuxPower);
    this.pieChartData.push(tmpArray);

    tmpArray = new Array<any>();
    tmpArray.push("other");
    tmpArray.push(this.totalOtherLoss);
    this.pieChartData.push(tmpArray);
  }

  //insertion sort
  sortPieChartData() {
    let k = this.pieChartData.length;
    for (let i = 0; i < k; i++) {
      let j = i;
      while (j > 0 && this.pieChartData[j - 1][1] < this.pieChartData[j][1]) {
        let tmpA = this.pieChartData[j][0];
        let tmpB = this.pieChartData[j][1];
        this.pieChartData[j][0] = this.pieChartData[j - 1][0];
        this.pieChartData[j][1] = this.pieChartData[j - 1][1];
        this.pieChartData[j - 1][0] = tmpA;
        this.pieChartData[j - 1][1] = tmpB;
        j = j - 1;
      }
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

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "phast-report-pie-graph-" + this.chartIndex;
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}