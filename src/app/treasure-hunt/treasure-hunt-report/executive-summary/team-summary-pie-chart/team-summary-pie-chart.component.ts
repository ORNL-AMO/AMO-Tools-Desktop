import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { PlotlyService } from 'angular-plotly.js';
@Component({
  selector: 'app-team-summary-pie-chart',
  templateUrl: './team-summary-pie-chart.component.html',
  styleUrls: ['./team-summary-pie-chart.component.css']
})
export class TeamSummaryPieChartComponent implements OnInit {
  @Input()
  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  @Input()
  showPrintView: boolean;

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;

  constructor(private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.showPrintView) {
      this.drawPlot();
    } else {
      this.drawPrintPlot();
    }
  }

  ngOnChanges() {
    if (this.plotlyPieChart && !this.showPrintView) {
      // this.setHeight();
      this.drawPlot();
    }else if (this.plotlyPieChart && this.showPrintView) {
      this.drawPrintPlot();
    }
  }

  getValuesAndLabels(): { values: Array<number>, labels: Array<string> } {
    let teamData = _.orderBy(this.teamData, 'costSavings', 'desc');
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    teamData.forEach(team => {
      values.push(team.costSavings);
      labels.push(team.team);
    });
    return { values: values, labels: labels }
  }

  drawPlot() {
    let valuesAndLabels = this.getValuesAndLabels();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: '<b>%{label}: </b>%{value:$,.0f}',
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 115
    }];

    var layout = {
      font: {
        size: 10,
      },
      showlegend: false,
      margin: { t: 60, b: 120, l: 135, r: 135 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  }

  drawPrintPlot() {
    let valuesAndLabels = this.getValuesAndLabels();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      texttemplate: '<b>%{label}: </b>%{value:$,.0f}',
      hoverformat: '.2r',
      direction: "clockwise",
      rotation: 125
    }];
    var layout = {
      height: 800,
      width: 1000,
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 150, b: 150, l: 150, r: 150 }
    };
    var modebarBtns = {
      displaylogo: false,
      displayModeBar: false,
      responsive: true
    };
    this.plotlyService.newPlot(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  }
}
