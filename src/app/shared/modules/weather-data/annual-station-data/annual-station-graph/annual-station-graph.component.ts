// import { Component, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
// import { PlotlyService } from 'angular-plotly.js';
// import { AnnualStationDataSummary } from '../annual-station-data.component';

// @Component({
//     selector: 'app-annual-station-graph',
//     templateUrl: './annual-station-graph.component.html',
//     styleUrls: ['./annual-station-graph.component.css'],
//     standalone: false
// })
// export class AnnualStationGraphComponent {
//   @Input()
//   yearSummaryData: Array<AnnualStationDataSummary>;
//   @Input()
//   selectedYear: number;
//   @Input()
//   weatherDataSelection: WeatherDataSelection;


//   @ViewChild('degreeDaysChart', { static: false }) degreeDaysChart: ElementRef;
//   constructor(private plotlyService: PlotlyService) {

//   }

//   ngAfterViewInit() {
//     this.drawChart();
//   }

//   ngOnChanges(change: SimpleChanges) {
//     if ((change.yearSummaryData && !change.yearSummaryData.isFirstChange()) || (change.weatherDataSelection && !change.weatherDataSelection.isFirstChange())) {
//       this.drawChart();
//     }
//   }

//   drawChart() {
//     if (this.degreeDaysChart) {
//       let traceData = [];
//       if (this.weatherDataSelection == 'HDD' || this.weatherDataSelection == 'degreeDays') {
//         traceData.push({
//           x: this.yearSummaryData.map(data => { return Months[data.date.getMonth()].name }),
//           y: this.yearSummaryData.map(data => { return data.heatingDegreeDays }),
//           type: 'bar',
//           name: 'Heating Degree Days',
//           marker: {
//             color: '#C0392B'
//           }
//         })
//       }

//       if (this.weatherDataSelection == 'CDD' || this.weatherDataSelection == 'degreeDays') {
//         traceData.push({
//           x: this.yearSummaryData.map(data => { return Months[data.date.getMonth()].name }),
//           y: this.yearSummaryData.map(data => { return data.coolingDegreeDays }),
//           type: 'bar',
//           name: 'Cooling Degree Days',
//           marker: {
//             color: '#2980B9'
//           }
//         })
//       }

//       let chartTitle: string = 'Monthly Degree Days <br>(' + this.selectedYear + ')';

//       if (this.weatherDataSelection == 'relativeHumidity') {
//         chartTitle = 'Relative Humidity <br>(' + this.selectedYear + ')'
//         traceData.push({
//           x: this.yearSummaryData.map(data => { return Months[data.date.getMonth()].name }),
//           y: this.yearSummaryData.map(data => { return data.relativeHumidity }),
//           type: 'bar',
//           name: 'Relative Humidity',
//           marker: {
//             color: '#6c3483'
//           }
//         })
//       }

//       if (this.weatherDataSelection == 'dryBulbTemp') {
//         chartTitle = 'Dry Bulb Temp. <br>(' + this.selectedYear + ')'
//         traceData.push({
//           x: this.yearSummaryData.map(data => { return Months[data.date.getMonth()].name }),
//           y: this.yearSummaryData.map(data => { return data.dryBulbTemp }),
//           type: 'bar',
//           name: 'Dry Bulb Temp',
//           marker: {
//             color: '#a04000'
//           }
//         })
//       }

//       var layout = {
//         legend: {
//           orientation: "h"
//         },
//         barmode: 'group',
//         title: {
//           text: chartTitle,
//           font: {
//             size: 18
//           },
//         },
//         xaxis: {
//           automargin: true,
//         },
//         yaxis: {
//           automargin: true,
//         },
//         // margin: { "t": 0, "b": 0, "l": 0, "r": 0 },
//       };

//       let config = {
//         modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
//         displaylogo: false,
//         responsive: true,
//       };
//       this.plotlyService.newPlot(this.degreeDaysChart.nativeElement, traceData, layout, config);
//     }
//   }
// }
