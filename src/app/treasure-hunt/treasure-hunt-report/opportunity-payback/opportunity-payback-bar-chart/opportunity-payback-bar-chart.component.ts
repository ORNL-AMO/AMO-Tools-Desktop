import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild
} from "@angular/core";
import { OpportunitiesPaybackDetails } from "../../../../shared/models/treasure-hunt";
import * as Plotly from 'plotly.js';
import { graphColors } from "../../../../phast/phast-report/report-graphs/graphColors";

@Component({
  selector: "app-opportunity-payback-bar-chart",
  templateUrl: "./opportunity-payback-bar-chart.component.html",
  styleUrls: ["./opportunity-payback-bar-chart.component.css"]
})
export class OpportunityPaybackBarChartComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  showPrint: boolean;

  @ViewChild("paybackBarChart", { static: false }) paybackBarChart: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.createBarChart();
  }

  ngOnChanges() {
    if (this.paybackBarChart) {
      this.createBarChart();
    }
  }

  createBarChart() {
    let labelsAndData = this.getLabelsAndData();

    let traces = new Array();
    let tracesIndex: number = 0;
    labelsAndData.forEach(item => {
      traces.push({
        x: [item.label],
        y: [item.data],
        textposition: 'auto',
        hoverinfo: 'none',
        type: 'bar',
        marker: {
          color: graphColors[tracesIndex]
        },
        texttemplate: '%{y:$,.0f}'
      });
      tracesIndex++;
    })
    let layout = {
      width: this.paybackBarChart.nativeElement.clientWidth,
      showlegend: false,
      legend: { "orientation": "h" },
      font: {
        size: 16,
      },
      yaxis: {
        hoverformat: '$.2s',
        tickformat: '$.2s',
        title: {
          // text: this.yAxisLabel,
          font: {
            family: 'Arial',
            size: 16
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      margin: { t: 0, b: 100 }
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.paybackBarChart.nativeElement, traces, layout, configOptions);

  }

  getLabelsAndData(): Array<{ label: string, data: number }> {
    return [
      {
        label: "Less than 1 Year",
        data: this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings
      },
      {
        label: "1 to 2 Years",
        data: this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings
      },
      {
        label: "2 to 3 Years",
        data: this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings
      },
      {
        label: "More than 3 Years",
        data: this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
      }
    ]
  }


  // initChart() {
  //   if (this.showPrint) {
  //     this.chart = c3.generate({
  //       bindto: this.barChartElement.nativeElement,
  //       data: {
  //         type: "bar",
  //         columns: [
  //           [
  //             "Less than 1 Year",
  //             this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings
  //           ],
  //           [
  //             "1 to 2 Years ",
  //             this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings
  //           ],
  //           [
  //             "2 to 3 Years ",
  //             this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings
  //           ],
  //           [
  //             "More than 3 Years ",
  //             this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
  //           ]
  //         ]
  //       },
  //       axis: {
  //         // x: {
  //         //   label: {
  //         //     show: false
  //         //   },
  //         //   tick: {
  //         //     type: 'category',
  //         //     categories:  ['Payback Period']
  //         //   }
  //         // },
  //         y: {
  //           label: {
  //             text: "Cost Savings",
  //             position: "outer-middle"
  //           },
  //           tick: {
  //             format: function(d) {
  //               const localeOptions = {
  //                 style: "currency",
  //                 currency: "USD",
  //                 minimumFractionDigits: 0,
  //                 maximumFractionDigits: 0
  //               };
  //               return d.toLocaleString("en-US", localeOptions);
  //             }
  //           }
  //         }
  //       },
  //       grid: {
  //         y: {
  //           show: true
  //         }
  //       },
  //       tooltip: {
  //         show: false
  //       },
  //       size: {
  //         width: 850,
  //         height: 400
  //       }
  //     });
  //   } else {
  //     this.chart = c3.generate({
  //       bindto: this.barChartElement.nativeElement,
  //       data: {
  //         type: "bar",
  //         columns: [
  //           [
  //             "Less than 1 Year ",
  //             this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings
  //           ],
  //           [
  //             "1 to 2 Years ",
  //             this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings
  //           ],
  //           [
  //             "2 to 3 Years ",
  //             this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings
  //           ],
  //           [
  //             "More than 3 Years ",
  //             this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
  //           ]
  //         ]
  //       },
  //       axis: {
  //         // x: {
  //         //   label: {
  //         //     show: false
  //         //   },
  //         //   tick: {
  //         //     type: 'category',
  //         //     categories:  ['Payback Period']
  //         //   }
  //         // },
  //         y: {
  //           label: {
  //             text: "Cost Savings",
  //             position: "outer-middle"
  //           },
  //           tick: {
  //             format: function(d) {
  //               const localeOptions = {
  //                 style: "currency",
  //                 currency: "USD",
  //                 minimumFractionDigits: 0,
  //                 maximumFractionDigits: 0
  //               };
  //               return d.toLocaleString("en-US", localeOptions);
  //             }
  //           }
  //         }
  //       },
  //       grid: {
  //         y: {
  //           show: true
  //         }
  //       },
  //       tooltip: {
  //         show: false
  //       }
  //     });
  //   }
  // }
}
