import { Component, OnInit, Input, ViewChild, SimpleChanges, ElementRef } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
// import * as c3 from 'c3';
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



  host: d3.Selection<any>;
  svg: d3.Selection<any>;
  chartContainerHeight: number;
  width: number;
  height: number;
  legendWidthFactor: number;
  legendWidth: number;
  radius: number;
  htmlElement: any;
  data: Array<number>;
  labels: Array<string>;

  chartData: any = {
    pieChartLabels: new Array<string>(),
    pieChartData: new Array<number>()
  }

  pieChartData: Array<Array<any>>;

  pieData: Array<{ label: string, val: number }>;

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
    this.printPieData();
    this.setupChart();
    this.buildPie();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes.results.firstChange) {
      this.getData(this.results, this.resultCats);
      // this.updateChart();
      this.buildPie();
    }
  }


  //debug - native d3
  printPieData(): void {
    for (let i = 0; i < this.pieData.length; i++) {
      console.log("pieData[" + i + "] = " + this.pieData[i].label + ", " + this.pieData[i].val);
    }
  }

  setupChart(): void {
    this.htmlElement = this.ngChart.nativeElement;
    this.host = d3.select(this.htmlElement);

    if (!this.printView) {
      if (this.modExists) {
        this.chartContainerWidth = this.chartContainerWidth / 2;
      }
      this.chartContainerHeight = 400;
    }
    else {
      this.chartContainerHeight = 450;
      this.chartContainerWidth = 1000;
    }



    //init % of container width that will be dedicated to legend
    this.legendWidthFactor = 0.4;
    //factor space for the legend
    this.legendWidth = this.chartContainerWidth * 0.4;

    this.height = this.chartContainerHeight - 100;
    this.width = this.chartContainerWidth - this.legendWidth;

    //set radius to limiting factor: height or width
    this.radius = Math.min(this.height, this.width) / 2;

    console.log("radius = " + this.radius);
  }

  midAngle(d): number {
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

  buildPie(): void {
    this.host.html('');
    let innerRadius = this.radius - 50;
    let outerRadius = this.radius - 10;
    let xTrans = this.chartContainerWidth / 2;
    // let xTrans = this.chartContainerWidth * (1 - this.legendWidthFactor) / 2;
    let yTrans = this.chartContainerHeight / 2;
    let viewBoxString = '0 0 ' + this.chartContainerWidth.toFixed(0) + ' ' + this.chartContainerHeight.toFixed(0);
    this.svg = this.host.append('svg')
      .attr('viewBox', viewBoxString)
      .data([this.pieData])
      .attr('width', this.chartContainerWidth)
      .attr('height', this.chartContainerHeight)
      .append('g')
      .attr('transform', 'translate(' + xTrans + ', ' + yTrans + ')');

    this.svg.append('g')
      .attr('class', 'labels');
    this.svg.append('g')
      .attr('class', 'lines');


    console.log(this.pieData);

    let pie = d3.pie().value((function (d) { return d }));
    let path = d3.arc().outerRadius(this.radius - 10).innerRadius(0);
    let innerLabel = d3.arc().outerRadius(this.radius - 30).innerRadius(this.radius - 30);
    let outerLabel = d3.arc().outerRadius(this.radius + 35).innerRadius(this.radius + 35);

    let values = this.pieData.map(datas => datas.val);




    let arc = this.svg.selectAll('.arc')
      .data(pie(values))
      .enter()
      .append('g')
      .attr('class', 'arc');

    let pieColor = d3.scaleOrdinal(graphColors);

    arc.append('path')
      .attr('d', path)
      .attr('fill', function (d, i) {
        return pieColor(i);
      });

    arc.append('text')
      .attr('transform', (datum: any, index) => {
        datum.innerRadius = 0;
        datum.outerRadius = this.radius;
        return 'translate(' + outerLabel.centroid(datum) + ')';
      })
      .text((datum, index) => {
        if (this.pieData[index].val > 0) {
          return this.pieData[index].label;
        }
      })
      .style('text-anchor', 'middle')
      .style('font-size', '12px');

    let polyline = this.svg.select('.lines').selectAll('polyline')
      .data([this.pieData]);

    polyline.enter()
      .append('polyline');

    polyline.transition().duration(1000)
      .attrTween('points', function (d) {
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          let d2 = interpolate(t);
          let pos = outerLabel.centroid(d2);
          pos[0] = this.radius * 0.95 * (this.midAngle(d2) < Math.PI ? 1: -1);
          return [path.centroid(d2), outerLabel.centroid(d2), pos];
        }
      })

    // let polyline = this.svg.select()


    // let gLabels = this.svg.append('g')
    //   .attr('class', 'labels')
    //   .data([this.pieData])
    //   .enter();

    // let gLabel = gLabels.append('g')
    //   .attr('class', 'label');

    // gLabel.append('circle')
    //   .attr({
    //     x: 0,
    //     y: 0,
    //     r: 2,
    //     fill: "#000",
    //     transform: function (d, i) {
    //       let centroid = this.pieData.centroid(d);
    //       return "translate(" + this.pieData.centroid()
    //     }
    //   });
  }


  updateChart(): void {

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
    this.pieData = new Array<{ label: string, val: number }>();

    this.pieData.push({ label: "Flue Gas: " + this.totalFlueGas.toFixed(0) + "%", val: this.totalFlueGas });
    this.pieData.push({ label: "Charge Material: " + this.totalChargeMaterialLoss.toFixed(0) + "%", val: this.totalChargeMaterialLoss });
    this.pieData.push({ label: "Opening: " + this.totalOpeningLoss.toFixed(0) + "%", val: this.totalOpeningLoss });
    this.pieData.push({ label: "Wall: " + this.totalWallLoss.toFixed(0) + "%", val: this.totalWallLoss });
    this.pieData.push({ label: "Atmosphere: " + this.totalAtmosphereLoss.toFixed(0) + "%", val: this.totalAtmosphereLoss });
    this.pieData.push({ label: "Cooling: " + this.totalCoolingLoss.toFixed(0) + "%", val: this.totalCoolingLoss });
    this.pieData.push({ label: "Fixture: " + this.totalFixtureLoss.toFixed(0) + "%", val: this.totalFixtureLoss });
    this.pieData.push({ label: "Leakage: " + this.totalLeakageLoss.toFixed(0) + "%", val: this.totalLeakageLoss });
    this.pieData.push({ label: "Extended Surface: " + this.totalExtSurfaceLoss.toFixed(0) + "%", val: this.totalExtSurfaceLoss });
    this.pieData.push({ label: "Exhaust Gas (EAF): " + this.totalExhaustGasEAF.toFixed(0) + "%", val: this.totalExhaustGasEAF });
    this.pieData.push({ label: "Exhaust Gas: " + this.totalExhaustGas.toFixed(0) + "%", val: this.totalExhaustGas });
    this.pieData.push({ label: "System: " + this.totalSystemLosses.toFixed(0) + "%", val: this.totalSystemLosses });
    this.pieData.push({ label: "Slag: " + this.totalSlag.toFixed(0) + "%", val: this.totalSlag });
    this.pieData.push({ label: "Auxiliary: " + this.totalAuxPower.toFixed(0) + "%", val: this.totalAuxPower });
    this.pieData.push({ label: "Other: " + this.totalFlueGas.toFixed(0) + "%", val: this.totalOtherLoss });
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