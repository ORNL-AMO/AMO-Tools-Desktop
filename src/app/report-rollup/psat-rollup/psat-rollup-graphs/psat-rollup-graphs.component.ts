import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PsatResultsData } from '../../report-rollup.service';
import { PsatService } from '../../../psat/psat.service';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';

@Component({
  selector: 'app-psat-rollup-graphs',
  templateUrl: './psat-rollup-graphs.component.html',
  styleUrls: ['./psat-rollup-graphs.component.css']
})
export class PsatRollupGraphsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild(BaseChartDirective) private baseChart;
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
      }
    })
  }

  setDataOption(str: string) {
    this.dataOption = str;
    this.getResults(this.resultData);
    this.getData();
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
    })
    if (this.baseChart && this.baseChart.chart) {
      this.baseChart.chart.config.data.labels = this.pieChartLabels;
      this.baseChart.chart.config.data.datasets[0].backgroundColor = this.backgroundColors;
    }
    this.getColors();
  }

  getColors() {
    this.chartColors = [
      {
        backgroundColor: this.backgroundColors
      }
    ]
  }
}
