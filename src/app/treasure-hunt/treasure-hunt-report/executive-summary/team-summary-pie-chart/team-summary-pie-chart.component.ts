import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
@Component({
  selector: 'app-team-summary-pie-chart',
  templateUrl: './team-summary-pie-chart.component.html',
  styleUrls: ['./team-summary-pie-chart.component.css']
})
export class TeamSummaryPieChartComponent implements OnInit {
  @Input()
  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.drawPlot();
  // }

  chartHeight: number;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // if (!this.isPrint) {
    this.setHeight();
    this.drawPlot();
    // } else {
    //   this.drawPrintPlot();
    // }
  }

  setHeight() {
    //height will match team summary table or set to 300
    this.chartHeight = this.plotlyPieChart.nativeElement.clientHeight + 100;
    // console.log(this.chartHeight);
    if (this.chartHeight < 300) {
      this.chartHeight = 300;
    }
  }

  ngOnChanges() {
    if (this.plotlyPieChart) {
      // Plotly.purge(this.plotlyPieChart.nativeElement);
      // if (!this.isPrint) {
      this.drawPlot();
      // } else {
      //   this.drawPrintPlot();
      // }
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
    Plotly.purge(this.plotlyPieChart.nativeElement)
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
      texttemplate: '<b>%{label}</b> <br> %{value:$,.0f}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 135
    }];
    // console.log();

    let marginVal: number = 50;
    let fontSize: number = 10;
    // if(this.teamData.length > 4){
    //   // marginVal = 150;
    //   fontSize = 10;
    // }

    var layout = {
      updatemenus: [],
      // height: this.chartHeight,
      font: {
        size: fontSize,
      },
      showlegend: false,
      margin: { t: 30, b: 30, l: 135, r: 135 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  }

  // drawPrintPlot() {
  //   let valuesAndLabels = this.getValuesAndLabels();
  //   var data = [{
  //     values: valuesAndLabels.values,
  //     labels: valuesAndLabels.labels,
  //     marker: {
  //       colors: graphColors
  //     },
  //     type: 'pie',
  //     textposition: 'auto',
  //     insidetextorientation: "horizontal",
  //     // automargin: true,
  //     textinfo: 'label+percent',
  //     hoverformat: '.2r',
  //     text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
  //     hoverinfo: 'text'
  //   }];

  //   var layout = {
  //     width: this.plotlyPieChart.nativeElement.clientWidth,
  //     font: {
  //       size: 16,
  //     },
  //     showlegend: false,
  //     margin: { t: 0, b: 0 }
  //   };
  //   var modebarBtns = {
  //     displaylogo: false,
  //     displayModeBar: false
  //   };
  //   Plotly.react(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  // }
}
