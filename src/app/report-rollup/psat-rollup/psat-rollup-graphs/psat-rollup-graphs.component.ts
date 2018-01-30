import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PsatResultsData } from '../../report-rollup.service';
import { PsatService } from '../../../psat/psat.service';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-psat-rollup-graphs',
  templateUrl: './psat-rollup-graphs.component.html',
  styleUrls: ['./psat-rollup-graphs.component.css']
})
export class PsatRollupGraphsComponent implements OnInit {
  pieChartLabels: Array<string>;
  pieChartData: Array<number>;
  chartColors: Array<any>;
  //chartColorDataSet: Array<any>;
  backgroundColors: Array<string>;
  options: any = {
    legend: {
      display: false
    }
  }

  chart: any;
  chartContainerWidth: number;

  graphColors: Array<string>;
  resultData: Array<PsatResultsData>;
  dataOption: string = 'cost';
  totalEnergyUse: number = 0;
  totalCost: number = 0;
  results: Array<any>;
  constructor(private reportRollupService: ReportRollupService, private psatService: PsatService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.reportRollupService.psatResults.subscribe((psats: Array<PsatResultsData>) => {
      if (psats.length != 0) {
        this.totalEnergyUse = _.sumBy(psats, (psat) => { return psat.baselineResults.annual_energy });
        this.totalCost = _.sumBy(psats, (psat) => { return psat.baselineResults.annual_cost });
        this.resultData = psats;
        this.getResults(this.resultData);
        this.getData();
        this.initChart();
      }
    })
  }
  

  setDataOption(str: string) {
    this.dataOption = str;
    this.getResults(this.resultData);
    this.getData();

    this.updateChart();
  }
  
  getResults(resultsData: Array<PsatResultsData>){
    this.results = new Array();
    let i = 0;
    resultsData.forEach(val => {
      let percent;
      if(this.dataOption == 'cost'){
        percent = this.getTotalCostPercent(val.baselineResults.annual_cost);
      }else{
        percent = this.getTotalEnergyPercent(val.baselineResults.annual_energy);
      }
      this.results.push({
        name: val.name,
        percent: percent,
        color: graphColors[i]
      })
      i++;
    })
  }

  getTotalCostPercent(val: number) {
    if (this.totalCost) {
      let percent = (val / this.totalCost) * 100;
      return percent;
    }
  }

  getTotalEnergyPercent(val: number) {
    if (this.totalEnergyUse) {
      let percent = (val / this.totalEnergyUse) * 100;
      return percent;
    }
  }

  getData() {
    this.pieChartData = new Array();
    this.pieChartLabels = new Array();
    this.backgroundColors = new Array();
    this.results.forEach(val => {
      this.pieChartLabels.push(val.name + ' (%)');
      this.pieChartData.push(val.percent);
      this.backgroundColors.push(val.color);
    });
    this.getColors();
  }

  getColors() {
    this.chartColors = [
      {
        backgroundColor: this.backgroundColors
      }
    ]
  }


  initChart() {

    let currentChart = document.getElementsByClassName("psat-rollup-chart")[0];
    currentChart.className = "psat-app-chart";

    this.chartContainerWidth = (window.innerWidth - 30) * 0.28;

    this.chart = c3.generate({
      bindto: currentChart,
      data: {
        columns: [

        ],
        type: 'pie',
        labels: true,
      },
      legend: {
        show: false
      },
      color: {
        pattern: this.graphColors
      },
      size: {
        width: this.chartContainerWidth,
        height: 280
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
          let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
          return html;
        }
      }
    });

    for (let j = 0; j < this.pieChartData.length; j++) {

      this.chart.load({
        columns: [
          [this.results[j].name, this.results[j].percent]
        ],
        labels: true
      })
    }
  }

  updateChart() {
    if (this.chart) {
      for (let i = 0; i < this.results.length; i++) {
        this.chart.load({
          columns: [
            [this.results[i].name, this.results[i].percent]
          ],
          type: 'pie',
          labels: true
        });
      }
    }
  }
}