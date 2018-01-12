import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { BaseChartDirective } from 'ng2-charts';
import { ReportRollupService, PsatResultsData } from '../../report-rollup.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-psat-rollup-pump-summary',
  templateUrl: './psat-rollup-pump-summary.component.html',
  styleUrls: ['./psat-rollup-pump-summary.component.css']
})
export class PsatRollupPumpSummaryComponent implements OnInit {
  @Input()
  settings: Settings

  @ViewChild(BaseChartDirective) private baseChart;

  chartLabels: Array<string>;
  chartData: Array<any>;
  chartColors: Array<any>;
  //chartColorDataSet: Array<any>;
  backgroundColors: Array<string> = graphColors;
  options: any;
  graphColors: Array<string>;
  resultData: Array<PsatResultsData>;
  graphOptions: Array<string> = [
    'Energy Use',
    'Cost'
  ]
  graphOption: string = 'Energy Use';
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.reportRollupService.psatResults.subscribe((psats: Array<PsatResultsData>) => {
      if (psats.length != 0) {
        this.resultData = psats;
        this.buildChartData();
      }
    })
  }


  buildChartData() {
    let axisLabel = this.graphOption;
    this.chartLabels = new Array();;
    this.chartData = [
      { data: new Array(), label: 'Baseline' },
      { data: new Array(), label: 'Modification' }
    ]
    let i = 1;
    this.resultData.forEach(data => {
      let num1 = 0;
      let num2 = 0;
      if (this.graphOption == 'Energy Use') {
        if (i == 1) {
          axisLabel = axisLabel + ' (kWh/yr)';
        }
        num1 = data.baselineResults.annual_energy;
        if (data.modName) {
          num2 = data.modificationResults.annual_energy;
        }
      } else if (this.graphOption == 'Cost') {
        if (i == 1) {
          axisLabel = axisLabel + ' ($/yr)';
        }
        num1 = data.baselineResults.annual_cost;
        if (data.modName) {
          num2 = data.modificationResults.annual_cost;
        }
      }
      i++;
      this.options = {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: axisLabel,
              fontSize: 18,
              fontStyle: 'bold'
            }
          }]
        },
        scaleShowVerticalLines: false,
        responsive: true
      }
      this.addData(data.name, num1, num2);
    })
  }

  addData(label: string, baseNum: number, modNum: number) {
    this.chartLabels.push(label);
    this.chartData[0].data.push(baseNum);
    this.chartData[1].data.push(modNum);
    if (this.baseChart && this.baseChart.chart) {
      this.baseChart.chart.config.data.labels = this.chartLabels;
      this.baseChart.chart.config.data.datasets = this.chartData;
      this.baseChart.chart.config.data.datasets[0].backgroundColor = this.backgroundColors[0];
      this.baseChart.chart.config.data.datasets[1].backgroundColor = this.backgroundColors[1];
      this.baseChart.chart.config.options.scales.yAxes[0].scaleLabel = this.options.scales.yAxes[0].scaleLabel;
    }
  }


  getPayback(modCost: number, baselineCost: number, implementationCost: number){
    if(implementationCost){
      let val = (implementationCost / (baselineCost-modCost)) * 12;
      if(isNaN(val)==false){
        return val;
      }else{
        return 0;
      }
    }else{
      return 0;
    }
  }

  getSavings(modCost: number, baselineCost: number){
    return baselineCost - modCost;
  }
}
