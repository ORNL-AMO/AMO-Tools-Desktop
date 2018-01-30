import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { PhastService } from '../../../phast/phast.service';
import { PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { PhastResultsService } from '../../../phast/phast-results.service';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-phast-rollup-furnace-summary',
  templateUrl: './phast-rollup-furnace-summary.component.html',
  styleUrls: ['./phast-rollup-furnace-summary.component.css']
})
export class PhastRollupFurnaceSummaryComponent implements OnInit {
  @Input()
  settings: Settings

  //chart element
  chart: any;
  chartContainerWidth: number;

  //chart text
  chartLabels: Array<string>;
  axisLabel: string;
  unit: string;

  //chart data
  dataColumns: Array<any>;
  baselineColumns: Array<any>;
  modColumns: Array<any>;

  //chart color
  graphColors: Array<string>;

  resultData: Array<PhastResultsData>;
  graphOptions: Array<string> = [
    '% Available Heat',
    'Energy Use',
    'Cost',
    'Energy Intensity'
  ]
  graphOption: string = 'Energy Use';
  constructor(private reportRollupService: ReportRollupService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.chartContainerWidth = (window.innerWidth - 30) * .55;
    this.reportRollupService.phastResults.subscribe((phasts: Array<PhastResultsData>) => {
      if (phasts.length != 0) {
        this.resultData = phasts;
        this.buildChartData();
      }
    })
  }

  ngAfterViewInit() {
    this.initChart();
  }

  buildChartData() {
    //init arrays
    this.dataColumns = new Array<any>();
    this.baselineColumns = new Array<any>();
    this.baselineColumns.push("Baseline");
    this.modColumns = new Array<any>();
    this.modColumns.push("Modification");

    this.axisLabel = this.graphOption;
    this.chartLabels = new Array();
    let i = 1;
    this.resultData.forEach(data => {
      let num1 = 0;
      let num2 = 0;
      if (this.graphOption == '% Available Heat') {
        this.unit = "%";
        num1 = this.getAvailableHeat(data.baselineResultData, data.settings)
        if (data.modName) {
          num2 = this.getAvailableHeat(data.modificationResultData, data.settings)
        }
      } else if (this.graphOption == 'Energy Use') {
        if (i == 1) {
          this.unit = this.settings.phastRollupUnit + '/yr';
          this.axisLabel = this.axisLabel + ' (' + this.unit + ')';
        }
        num1 = this.getConvertedValue(data.baselineResults.annualEnergyUsed, data.settings);
        if (data.modName) {
          num2 = this.getConvertedValue(data.modificationResults.annualEnergyUsed, data.settings);
        }
      } else if (this.graphOption == 'Cost') {
        if (i == 1) {
          this.unit = "$/yr";
          this.axisLabel = this.axisLabel + ' (' + this.unit + ')';
        }
        num1 = data.baselineResults.annualCost;
        if (data.modName) {
          num2 = data.modificationResults.annualCost;
        }
      } else if (this.graphOption == 'Energy Intensity') {
        if (i == 1) {
          if (this.settings.unitsOfMeasure == 'Metric') {
            this.unit = this.settings.phastRollupUnit + '/kg';
            this.axisLabel = this.axisLabel + ' (' + this.unit + ')';
          } else {
            this.unit = this.settings.phastRollupUnit + '/lb';
            this.axisLabel = this.axisLabel + ' (' + this.unit + ')';
          }
        }
        num1 = this.getConvertedValue(data.baselineResults.energyPerMass, data.settings);
        if (data.modName) {
          num2 = this.getConvertedValue(data.modificationResults.energyPerMass, data.settings);
        }
      }
      i++;
      //sigFigs
      let num1SigFigs = this.reportRollupService.transform(num1, 4, true);
      let num2SigFigs = this.reportRollupService.transform(num2, 4, true);
      this.addData(data.name, num1SigFigs, num2SigFigs);
    });

    this.initChart();
  }


  addData(label: string, baseNum: number, modNum: number) {
    this.chartLabels.push(label);
    this.baselineColumns.push(baseNum);
    this.modColumns.push(modNum);
  }

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

  getAvailableHeat(data: PhastResults, settings: Settings) {
    let resultCategories: ShowResultsCategories = this.phastResultsService.getResultCategories(settings);
    if (resultCategories.showFlueGas) {
      return data.flueGasAvailableHeat;
    }

    if (resultCategories.showSystemEff) {
      return data.heatingSystemEfficiency;
    }

    if (resultCategories.showEnInput2) {
      return data.availableHeatPercent;
    }

    if (resultCategories.showExGas) {
      return (1 - (data.totalExhaustGasEAF / data.grossHeatInput)) * 100
    }
  }


  initChart() {
    let charts = document.getElementsByClassName("phast-rollup-bar-chart");
    let currentChart = charts[0];
    let unit = this.unit;

    this.chart = c3.generate({
      bindto: currentChart,
      data: {
        columns: [
          this.baselineColumns,
          this.modColumns
        ],
        type: 'bar',
      },
      axis: {
        x: {
          type: 'category',
          categories: this.chartLabels
        },
        y: {
          label: {
            text: this.graphOption,
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
        height: 320
      },
      padding: {
        bottom: 20
      },
      color: {
        pattern: this.graphColors
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

    //formatting chart
    d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
    d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
    d3.selectAll(".c3-texts").style("font-size", "10px");
    d3.selectAll(".c3-legend-item text").style("font-size", "11px");
    d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
  }

  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: [
          this.baselineColumns,
          this.modColumns
        ]
      });
    }
  }
}
