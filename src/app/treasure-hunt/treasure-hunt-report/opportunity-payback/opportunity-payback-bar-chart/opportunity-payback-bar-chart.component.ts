import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import { OpportunitiesPaybackDetails } from "../../../../shared/models/treasure-hunt";
import { graphColors } from "../../../../phast/phast-report/report-graphs/graphColors";
import { Settings } from '../../../../shared/models/settings';
import { PlotlyService } from "angular-plotly.js";

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
  @Input()
  settings: Settings;

  @ViewChild("paybackBarChart", { static: false }) paybackBarChart: ElementRef;
  constructor(private plotlyService: PlotlyService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (!this.showPrint) {
      this.createBarChart();
    } else if (this.showPrint) {
      this.createPrintBarChart();
    }
  }

  ngOnChanges() {
    if (this.paybackBarChart && !this.showPrint) {
      this.createBarChart();
    } else if (this.paybackBarChart && this.showPrint) {
      this.createPrintBarChart();
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
        texttemplate: '%{y:,.0f}'
      });
      tracesIndex++;
    })
    let layout = {
      // width: this.paybackBarChart.nativeElement.clientWidth * .95,
      showlegend: false,
      legend: { "orientation": "h" },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.2s',
        tickformat: '.2s',
        title: {
          // text: this.yAxisLabel,
          font: {
            family: 'Roboto',
            size: 14
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      margin: { t: 20, b: 100, l: 80, r: 30 }
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.paybackBarChart.nativeElement, traces, layout, configOptions);

  }

  createPrintBarChart() {
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
        texttemplate: '%{y:,.0f}'
      });
      tracesIndex++;
    })
    let layout = {
      width: 1000,
      showlegend: false,
      legend: { "orientation": "h" },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.2s',
        tickformat: '.2s',
        title: {
          // text: this.yAxisLabel,
          font: {
            family: 'Roboto',
            size: 14
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      margin: { t: 20, b: 100 }
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false
    };
    this.plotlyService.newPlot(this.paybackBarChart.nativeElement, traces, layout, configOptions);
  }

  getLabelsAndData(): Array<{ label: string, data: number }> {
    return [
      {
        label: "< 1 yr (" + this.settings.currency + ")",
        data: this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings
      },
      {
        label: "1-2 ysr (" + this.settings.currency + ")",
        data: this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings
      },
      {
        label: "2-3 yrs (" + this.settings.currency + ")",
        data: this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings
      },
      {
        label: "> 3 yrs (" + this.settings.currency + ")",
        data: this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
      }
    ]
  }
}
