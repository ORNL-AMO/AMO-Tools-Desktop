import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { BaseChartDirective } from 'ng2-charts';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
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
  options: any = {
    scaleShowVerticalLines: false,
    responsive: true
  }
  graphColors: Array<string>;
  resultData: Array<PhastResultsData>;
  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.reportRollupService.phastResults.subscribe((phasts:Array<PhastResultsData>) => {
      if (phasts.length != 0) {
        this.resultData = phasts;
        console.log(this.resultData);
        this.chartLabels = new Array();;
        this.chartData = [
          {data: new Array(), label: 'Baseline'},
          {data: new Array(), label: 'Modification'}
        ]
        phasts.forEach(val => {
          if(val.modName){
            this.addData(val.name, val.baselineResults.annualEnergyUsed, val.modificationResults.annualEnergyUsed, val.settings);
          }else{
            this.addData(val.name, val.baselineResults.annualEnergyUsed, 0, val.settings);
          }
        });
      }
    })
  }

  addData(label: string, baseNum: number, modNum: number, assessmentSettings: Settings){
    let num1 = this.getConvertedValue(baseNum, assessmentSettings);
    let num2 = this.getConvertedValue(modNum, assessmentSettings);
    this.chartLabels.push(label);
    this.chartData[0].data.push(num1);
    this.chartData[1].data.push(num2);
    if (this.baseChart && this.baseChart.chart) {
      this.baseChart.chart.config.data.labels = this.chartLabels;
      this.baseChart.chart.config.data.datasets = this.chartData;
      this.baseChart.chart.config.data.datasets[0].backgroundColor = this.backgroundColors[0];
      this.baseChart.chart.config.data.datasets[1].backgroundColor = this.backgroundColors[1];
    }
  }

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

}
