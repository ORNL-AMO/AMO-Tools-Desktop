import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { BaseChartDirective } from 'ng2-charts';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { PhastService } from '../../../phast/phast.service';
@Component({
  selector: 'app-phast-rollup-furnace-summary',
  templateUrl: './phast-rollup-furnace-summary.component.html',
  styleUrls: ['./phast-rollup-furnace-summary.component.css']
})
export class PhastRollupFurnaceSummaryComponent implements OnInit {
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
  resultData: Array<PhastResultsData>;

  graphOptions: Array<string> = [
    '% Available Heat',
    'Energy Use',
    'Cost',
    'Energy Intensity'
  ]
  graphOption: string = 'Energy Use';
  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.reportRollupService.phastResults.subscribe((phasts: Array<PhastResultsData>) => {
      if (phasts.length != 0) {
        this.resultData = phasts;
        // phasts.forEach(val => {
        //   if(val.modName){
        //     this.addData(val.name, val.baselineResults.annualEnergyUsed, val.modificationResults.annualEnergyUsed, val.settings);
        //   }else{
        //     this.addData(val.name, val.baselineResults.annualEnergyUsed, 0, val.settings);
        //   }
        // });
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
      if (this.graphOption == '% Available Heat') {
        // num1 = this.phastService.availableHeat(data.assessment)
      } else if (this.graphOption == 'Energy Use') {
        if (i == 1) {
          axisLabel = axisLabel + ' (' + this.settings.phastRollupUnit + '/yr)';
        }
        num1 = this.getConvertedValue(data.baselineResults.annualEnergyUsed, data.settings);
        if (data.modName) {
          num2 = this.getConvertedValue(data.modificationResults.annualEnergyUsed, data.settings);
        }
      } else if (this.graphOption == 'Cost') {
        if (i == 1) {
          axisLabel = axisLabel + ' ($/yr)';
        }
        num1 = data.baselineResults.annualCost;
        if (data.modName) {
          num2 = data.modificationResults.annualCost;
        }
      } else if (this.graphOption == 'Energy Intensity') {
        if (i == 1) {
          if (this.settings.unitsOfMeasure == 'Metric') {
            axisLabel = axisLabel + ' (' + this.settings.phastRollupUnit + '/kg)';
          } else {
            axisLabel = axisLabel + ' (' + this.settings.phastRollupUnit + '/lb)';
          }
        }
        num1 = this.getConvertedValue(data.baselineResults.energyPerMass, data.settings);
        if (data.modName) {
          num2 = this.getConvertedValue(data.modificationResults.energyPerMass, data.settings);
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

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

}
