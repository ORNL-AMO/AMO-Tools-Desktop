import { Component, OnInit, Input, SimpleChange, ViewChild } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { BaseChartDirective } from 'ng2-charts';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-percent-graph',
  templateUrl: './percent-graph.component.html',
  styleUrls: ['./percent-graph.component.css']
})
export class PercentGraphComponent implements OnInit {
  @Input()
  value: number;
  @Input()
  title: string;
  @Input()
  valueDescription: string;
  @Input()
  titlePlacement: string;
  @Input()
  fontStyle: string;
  @Input()
  fontSize: number;
  @Input()
  unit: string;

  // @ViewChild(BaseChartDirective) private baseChart;

  doughnutChartLabels: string[];
  doughnutChartData: number[];
  doughnutChartType: string = 'doughnut';
  chartOptions: any;
  chartColors: Array<any> = [{}];
  chartColorDataSet: Array<any>;
  chart: any;

  potential: number = 0;

  doc: any;
  window: any;

  constructor(private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.initChart();
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.window.onresize = () => { this.setValueMargin() };
    //let object render before resizing initially
    setTimeout(() => {
      this.setValueMargin();
    }, 1500)
  }

  ngOnDestroy() {
    this.window.onresize = null;
  }

  setValueMargin() {
    let div = this.doc.getElementsByClassName('chart-container')
    let valueClass = this.doc.getElementsByClassName('value');
    let chartDiv = div[0];
    if (chartDiv) {
      if (chartDiv.clientWidth < 350 && chartDiv.clientWidth > 200) {
        for (let i = 0; i < valueClass.length; i++) {
          valueClass[i].style.fontSize = '24px';
        }
      } else if (chartDiv.clientWidth < 200) {
        for (let i = 0; i < valueClass.length; i++) {
          valueClass[i].style.fontSize = '16px';
        }
      } else {
        for (let i = 0; i < valueClass.length; i++) {
          valueClass[i].style.fontSize = '32px';
        }
      }
      let percentValue = this.doc.getElementById('percent');
      if (percentValue) {
        let marginTop = ((chartDiv.clientWidth / 2) - (percentValue.clientHeight / 2)) / 2;
        let marginLeft = (chartDiv.clientWidth / 2) - (percentValue.clientWidth / 2);
        for (let i = 0; i < valueClass.length; i++) {
          valueClass[i].style.marginTop = marginTop + 'px';
          valueClass[i].style.marginLeft = marginLeft + 'px';
        }
      }
    }
  }

  ngOnChanges() {
    this.updateChart();
  }


  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: [
          ['show', this.value],
        ]
      });
      d3.select('#chart .c3-chart-arcs-title').node().innerHTML = this.value.toFixed(0) + "%";
      d3.select('#chart .c3-chart-arcs-title').style("padding-bottom", "20px").style("font-size","26px");
      d3.selectAll(".c3-gauge-value").style("display", "none");
    }
    else {
      this.initChart();
    }
  }

  initChart() {
    this.chart = c3.generate({
      data: {
        columns: [
          ['data', 0]
        ],
        type: 'gauge',
      },
      gauge: {
        width: 30,
        label: {
          show: false
        }
      },
      color: {
        pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
        threshold: {
          values: [25, 50, 75, 101]
        }
      },
      tooltip: {
        show: false
      },
    });
    d3.selectAll(".c3-gauge-value").style("display", "none");
    d3.selectAll(".c3-axis.c3-axis-x .tick text").style("display", "none");
    d3.select("#chart .c3-chart-arcs-background").style("fill", "#e0e0e0");
    if (this.value && this.chart) {
      this.updateChart();
    }
  }
}


// import { Component, OnInit, Input, SimpleChange, ViewChild } from '@angular/core';
// import { WindowRefService } from '../../indexedDb/window-ref.service';
// import { BaseChartDirective } from 'ng2-charts';
// import * as d3 from 'd3';
// @Component({
//   selector: 'app-percent-graph',
//   templateUrl: './percent-graph.component.html',
//   styleUrls: ['./percent-graph.component.css']
// })
// export class PercentGraphComponent implements OnInit {
//   @Input()
//   value: number;
//   @Input()
//   title: string;
//   @Input()
//   valueDescription: string;
//   @Input()
//   titlePlacement: string;
//   @Input()
//   fontStyle: string;
//   @Input()
//   fontSize: number;
//   @Input()
//   unit: string;

//   @ViewChild(BaseChartDirective) private baseChart;

//   doughnutChartLabels: string[];
//   doughnutChartData: number[];
//   doughnutChartType: string = 'doughnut';
//   chartOptions: any;
//   chartColors: Array<any> = [{}];
//   chartColorDataSet: Array<any>;

//   potential: number = 0;

//   doc: any;
//   window: any;

//   constructor(private windowRefService: WindowRefService) { }

//   ngOnInit() {
//     this.initChart();
//   }

//   ngAfterViewInit() {
//     this.doc = this.windowRefService.getDoc();
//     this.window = this.windowRefService.nativeWindow;
//     this.window.onresize = () => { this.setValueMargin() };
//     //let object render before resizing initially
//     setTimeout(() => {
//       this.setValueMargin();
//     }, 1500)
//   }

//   ngOnDestroy() {
//     this.window.onresize = null;
//   }

//   setValueMargin() {
//     let div = this.doc.getElementsByClassName('chart-container')
//     let valueClass = this.doc.getElementsByClassName('value');
//     let chartDiv = div[0];
//     if (chartDiv) {
//       if (chartDiv.clientWidth < 350 && chartDiv.clientWidth > 200) {
//         for (let i = 0; i < valueClass.length; i++) {
//           valueClass[i].style.fontSize = '24px';
//         }
//       } else if (chartDiv.clientWidth < 200) {
//         for (let i = 0; i < valueClass.length; i++) {
//           valueClass[i].style.fontSize = '16px';
//         }
//       } else {
//         for (let i = 0; i < valueClass.length; i++) {
//           valueClass[i].style.fontSize = '32px';
//         }
//       }
//       let percentValue = this.doc.getElementById('percent');
//       if (percentValue) {
//         let marginTop = ((chartDiv.clientWidth / 2) - (percentValue.clientHeight / 2)) / 2;
//         let marginLeft = (chartDiv.clientWidth / 2) - (percentValue.clientWidth / 2);
//         for (let i = 0; i < valueClass.length; i++) {
//           valueClass[i].style.marginTop = marginTop + 'px';
//           valueClass[i].style.marginLeft = marginLeft + 'px';
//         }
//       }
//     }
//   }

//   ngOnChanges() {
//     this.initChart();
//   }

//   initChart() {
//     if (this.title) {
//       this.chartOptions = {
//         legend: {
//           display: false
//         },
//         title: {
//           text: this.title,
//           display: true,
//           position: this.titlePlacement || "bottom",
//           fontStyle: this.fontStyle || "bold",
//           fontSize: this.fontSize || 22
//         },
//         tooltips: {
//           enabled: false
//         }
//       }
//     } else {
//       this.chartOptions = {
//         legend: {
//           display: false
//         },
//         tooltips: {
//           enabled: false
//         }
//       };
//     }
//     this.doughnutChartLabels = [this.valueDescription, 'Potential']
//     if (this.value <= 100 && this.value > 0) {
//       this.potential = 100 - this.value;
//     } else if (this.value < 0) {
//       this.potential = 100 + this.value;
//     } else {
//       this.potential = 0;
//     }
//     this.doughnutChartData = [this.value, this.potential];
//     if (this.value >= 11 && this.value <= 100) {
//       this.chartColorDataSet = [
//         {
//           options: this.chartOptions,
//           data: this.doughnutChartData,
//           backgroundColor: [
//             "#27AE60", //green
//             "#CCD1D1"
//           ],
//           hoverBackground: [
//             "#229954",
//             "#B2BABB"
//           ]
//         }
//       ]
//     } else if (this.value <= 10 && this.value >= 5) {
//       this.chartColorDataSet = [
//         {
//           options: this.chartOptions,
//           data: this.doughnutChartData,
//           backgroundColor: [
//             "#3498DB",  //blue
//             "#CCD1D1"

//           ],
//           hoverBackground: [
//             "#DC7633",
//             "#B2BABB"
//           ]
//         }
//       ]

//       // this.chartColorDataSet = [
//       //   {
//       //     options: this.chartOptions,
//       //     data: this.doughnutChartData,
//       //     backgroundColor: [
//       //       "#EB984E", //orange
//       //       "#CCD1D1"

//       //     ],
//       //     hoverBackground: [
//       //       "#DC7633",
//       //       "#B2BABB"
//       //     ]
//       //   }
//       // ]
//     } else if (this.value > 100) {
//       this.chartColorDataSet = [
//         {
//           options: this.chartOptions,
//           data: this.doughnutChartData,
//           backgroundColor: [
//             "#E74C3C",  //red
//             "#CCD1D1"

//           ],
//           hoverBackground: [
//             "#DC7633",
//             "#CB4335"
//           ]
//         }
//       ]

//       // this.chartColorDataSet = [
//       //   {
//       //     options: this.chartOptions,
//       //     data: this.doughnutChartData,
//       //     backgroundColor: [
//       //       "#3498DB", //blue
//       //       "#CCD1D1"

//       //     ],
//       //     hoverBackground: [
//       //       "#DC7633",
//       //       "#B2BABB"
//       //     ]
//       //   }
//       // ]
//     } else {  // < 5%

//       this.chartColorDataSet = [
//         {
//           options: this.chartOptions,
//           data: this.doughnutChartData,
//           backgroundColor: [
//             "#52489C",  //purple
//             "#CCD1D1"

//           ],
//           hoverBackground: [
//             "#DC7633",
//             "#B2BABB"
//           ]
//         }
//       ]

//       // this.chartColorDataSet = [
//       //   {
//       //     options: this.chartOptions,
//       //     data: this.doughnutChartData,
//       //     backgroundColor: [
//       //       "#E74C3C",   //red
//       //       "#CCD1D1"

//       //     ],
//       //     hoverBackground: [
//       //       "#DC7633",
//       //       "#CB4335"
//       //     ]
//       //   }
//       // ]
//     }
//     if (this.baseChart.chart) {
//       this.baseChart.chart.config.data.datasets[0].backgroundColor = this.chartColorDataSet[0].backgroundColor;
//     }
//   }
// }
