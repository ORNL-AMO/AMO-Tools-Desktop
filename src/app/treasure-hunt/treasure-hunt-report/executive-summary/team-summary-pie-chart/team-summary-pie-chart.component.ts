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


  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // if (!this.isPrint) {
    this.drawPlot();
    // } else {
    //   this.drawPrintPlot();
    // }
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
    console.log(this.teamData);
    let teamData = _.orderBy(this.teamData, 'costSavings', 'asc');
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
    console.log(valuesAndLabels)
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
      // direction: "clockwise",
      // rotation: 180
    }];
    // console.log();
    let marginVal: number = 10 * this.teamData.length;
    console.log(marginVal);
    var layout = {
      updatemenus: [],
      height: this.plotlyPieChart.nativeElement.clientHeight + 100,
      font: {
        size: 12,
      },
      showlegend: false,
      margin: {t: 30, b: marginVal, l: marginVal, r: marginVal},
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      // responsive: true
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
