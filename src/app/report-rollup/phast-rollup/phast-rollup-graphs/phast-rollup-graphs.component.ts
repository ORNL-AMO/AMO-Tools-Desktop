import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { SigFigsPipe } from '../../../shared/sig-figs.pipe';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-phast-rollup-graphs',
  templateUrl: './phast-rollup-graphs.component.html',
  styleUrls: ['./phast-rollup-graphs.component.css']
})
export class PhastRollupGraphsComponent implements OnInit {
  @Input()
  settings: Settings

  furnaceSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  results: Array<any>;

  pieChart: any;
  barChart: any;
  chartContainerWidth: number;

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
  resultData: Array<PhastResultsData>;
  dataOption: string = 'cost';
  totalSteamEnergyUsed: number = 0;
  totalElectricalEnergyUsed: number = 0;
  totalFuelEnergyUsed: number = 0;
  totalFuelCost: number = 0;
  totalSteamCost: number = 0;
  totalElectricalCost: number = 0;
  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.reportRollupService.phastResults.subscribe(val => {
      if (val.length != 0) {
        this.initTotals();
        this.calcPhastSums(val);
        this.getResults(val);
        this.getData();
        this.resultData = val;
      }
    })
  }

  ngAfterViewInit() {
    this.initChart();
  }

  initTotals() {
    this.totalSteamEnergyUsed = 0;
    this.totalElectricalEnergyUsed = 0;
    this.totalFuelEnergyUsed = 0;
    this.totalFuelCost = 0;
    this.totalSteamCost = 0;
    this.totalElectricalCost = 0;
  }

  calcPhastSums(resultsData: Array<PhastResultsData>) {
    this.results = new Array();
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    resultsData.forEach(result => {
      let tmpAnnualEnergyUsed = this.getConvertedValue(result.baselineResults.annualEnergyUsed, result.settings)
      let diffEnergy = this.getConvertedValue(result.baselineResults.annualEnergySavings, result.settings)
      let diffCost = result.baselineResults.annualCost;
      if (result.settings.energySourceType == 'Fuel') {
        this.totalFuelCost += result.baselineResults.annualCost;
        this.totalFuelEnergyUsed += tmpAnnualEnergyUsed;
      } else if (result.settings.energySourceType == 'Steam') {
        this.totalSteamCost += result.baselineResults.annualCost;
        this.totalSteamEnergyUsed += tmpAnnualEnergyUsed;
      } else if (result.settings.energySourceType == 'Electricity') {
        this.totalElectricalCost += result.baselineResults.annualCost;
        this.totalElectricalEnergyUsed += tmpAnnualEnergyUsed;
      }
      sumSavings += diffCost;
      sumCost += result.baselineResults.annualCost;
      sumEnergySavings += diffEnergy;
      sumEnergy += tmpAnnualEnergyUsed;
    })
    this.furnaceSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

  setDataOption(str: string) {
    this.dataOption = str;
    this.getResults(this.resultData);
    this.getData();

    this.updateChart();
  }

  getResults(resultsData: Array<PhastResultsData>) {
    this.results = new Array();
    let i = 0;
    resultsData.forEach(val => {
      let percent;
      if (this.dataOption == 'cost') {
        // console.log("cost");
        percent = this.getResultPercent(val.baselineResults.annualCost, this.totalCost)
      } else {
        // console.log("not cost");
        let energyUsed = this.getConvertedValue(val.baselineResults.annualEnergyUsed, val.settings);
        percent = this.getResultPercent(energyUsed, this.totalEnergy);
      }
      this.results.push({
        name: val.name,
        percent: percent,
        color: graphColors[i],
        settings: val.settings
      })
      i++;
    });
  }

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

  getResultPercent(value: number, sum: number): number {
    let percent = (value / sum) * 100;
    let val = this.reportRollupService.transform(percent, 4)
    return val;
  }

  getConvertedPercent(value: number, sum: number, settings: Settings) {
    let convertVal = this.getConvertedValue(value, settings);
    let percent = (convertVal / sum) * 100;
    let val = this.reportRollupService.transform(percent, 4)
    return val;
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
    // let charts = document.getElementsByClassName('rollup-chart');
    let currentChart = document.getElementsByClassName('phast-rollup-chart')[0];
    currentChart.className = "phast-app-chart";

    // console.log("pieChartLabels.length = " + this.pieChartLabels.length);
    // for (let i = 0; i < this.pieChartLabels.length; i++) {
    //   console.log("pieChartLabels[" + i + "] = " + this.pieChartLabels[i]);
    // }

    this.chartContainerWidth = (window.innerWidth - 30) * .28;
    console.log("windowWidth = " + window.innerWidth);
    console.log("chartContainerWidth = " + this.chartContainerWidth);

    this.pieChart = c3.generate({
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

      // console.log("this.resultData[" + j + "] = " + this.results[j].name + ", " + this.results[j].percent);

      this.pieChart.load({
        columns: [
          [this.results[j].name, this.results[j].percent]
        ],
        labels: true
      });
    }
  }

  updateChart() {
    // console.log("updateChart()");

    if (this.pieChart) {

      // this.pieChart.unload();

      for (let i = 0; i < this.results.length; i++) {
        this.pieChart.load({
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







// import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
// import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
// import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
// import { Settings } from '../../../shared/models/settings';
// import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
// import { SigFigsPipe } from '../../../shared/sig-figs.pipe';
// import * as d3 from 'd3';
// import * as c3 from 'c3';
// @Component({
//   selector: 'app-phast-rollup-graphs',
//   templateUrl: './phast-rollup-graphs.component.html',
//   styleUrls: ['./phast-rollup-graphs.component.css']
// })
// export class PhastRollupGraphsComponent implements OnInit {
//   @Input()
//   settings: Settings

//   furnaceSavingsPotential: number = 0;
//   energySavingsPotential: number = 0;
//   totalCost: number = 0;
//   totalEnergy: number = 0;
//   results: Array<any>;

//   pieChartLabels: Array<string>;
//   pieChartData: Array<number>;
//   chartColors: Array<any>;
//   //chartColorDataSet: Array<any>;
//   backgroundColors: Array<string>;
//   options: any = {
//     legend: {
//       display: false
//     }
//   }
//   graphColors: Array<string>;
//   resultData: Array<PhastResultsData>;
//   dataOption: string = 'cost';
//   totalSteamEnergyUsed: number = 0;
//   totalElectricalEnergyUsed: number = 0;
//   totalFuelEnergyUsed: number = 0;
//   totalFuelCost: number = 0;
//   totalSteamCost: number = 0;
//   totalElectricalCost: number = 0;
//   constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

//   ngOnInit() {
//     this.graphColors = graphColors;
//     this.reportRollupService.phastResults.subscribe(val => {
//       if (val.length != 0) {
//         this.initTotals();
//         this.calcPhastSums(val);
//         this.getResults(val);
//         this.getData();
//         this.resultData = val;
//       }
//     })

//     console.log("pieChartData.length = " + this.pieChartData.length);

//     for (let i = 0; i < this.pieChartData.length; i++) {
//       console.log("pieChartData[" + i + "] = " + this.pieChartData[i]);
//     }
//   }

//   initTotals() {
//     this.totalSteamEnergyUsed = 0;
//     this.totalElectricalEnergyUsed = 0;
//     this.totalFuelEnergyUsed = 0;
//     this.totalFuelCost = 0;
//     this.totalSteamCost = 0;
//     this.totalElectricalCost = 0;
//   }

//   calcPhastSums(resultsData: Array<PhastResultsData>) {
//     this.results = new Array();
//     let sumSavings = 0;
//     let sumEnergy = 0;
//     let sumCost = 0;
//     let sumEnergySavings = 0;
//     resultsData.forEach(result => {
//       let tmpAnnualEnergyUsed = this.getConvertedValue(result.baselineResults.annualEnergyUsed, result.settings)
//       let diffEnergy = this.getConvertedValue(result.baselineResults.annualEnergySavings, result.settings)
//       let diffCost = result.baselineResults.annualCost;
//       if (result.settings.energySourceType == 'Fuel') {
//         this.totalFuelCost += result.baselineResults.annualCost;
//         this.totalFuelEnergyUsed += tmpAnnualEnergyUsed;
//       } else if (result.settings.energySourceType == 'Steam') {
//         this.totalSteamCost += result.baselineResults.annualCost;
//         this.totalSteamEnergyUsed += tmpAnnualEnergyUsed;
//       } else if (result.settings.energySourceType == 'Electricity') {
//         this.totalElectricalCost += result.baselineResults.annualCost;
//         this.totalElectricalEnergyUsed += tmpAnnualEnergyUsed;
//       }
//       sumSavings += diffCost;
//       sumCost += result.baselineResults.annualCost;
//       sumEnergySavings += diffEnergy;
//       sumEnergy += tmpAnnualEnergyUsed;
//     })
//     this.furnaceSavingsPotential = sumSavings;
//     this.energySavingsPotential = sumEnergySavings;
//     this.totalCost = sumCost;
//     this.totalEnergy = sumEnergy;
//   }

//   setDataOption(str: string) {
//     this.dataOption = str;
//     this.getResults(this.resultData);
//     this.getData();
//   }

//   getResults(resultsData: Array<PhastResultsData>) {
//     this.results = new Array();
//     let i = 0;
//     resultsData.forEach(val => {
//       let percent;
//       if (this.dataOption == 'cost') {
//         percent = this.getResultPercent(val.baselineResults.annualCost, this.totalCost)
//       } else {
//         let energyUsed = this.getConvertedValue(val.baselineResults.annualEnergyUsed, val.settings);
//         percent = this.getResultPercent(energyUsed, this.totalEnergy)
//       }
//       this.results.push({
//         name: val.name,
//         percent: percent,
//         color: graphColors[i],
//         settings: val.settings
//       })
//       i++;
//     })
//   }

//   getConvertedValue(val: number, settings: Settings) {
//     return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
//   }

//   getResultPercent(value: number, sum: number): number {
//     let percent = (value / sum) * 100;
//     let val = this.reportRollupService.transform(percent, 4)
//     return val;
//   }

//   getConvertedPercent(value: number, sum: number, settings: Settings) {
//     let convertVal = this.getConvertedValue(value, settings);
//     let percent = (convertVal / sum) * 100;
//     let val = this.reportRollupService.transform(percent, 4)
//     return val;
//   }

//   getData() {
//     this.pieChartData = new Array();
//     this.pieChartLabels = new Array();
//     this.backgroundColors = new Array();
//     this.results.forEach(val => {
//       this.pieChartLabels.push(val.name + ' (%)');
//       this.pieChartData.push(val.percent);
//       this.backgroundColors.push(val.color);
//     })
//     // if (this.baseChart && this.baseChart.chart) {
//     //   this.baseChart.chart.config.data.labels = this.pieChartLabels;
//     //   this.baseChart.chart.config.data.datasets[0].backgroundColor = this.backgroundColors;
//     // }
//     this.getColors();
//   }

//   getColors() {
//     this.chartColors = [
//       {
//         backgroundColor: this.backgroundColors
//       }
//     ]
//   }
// }
