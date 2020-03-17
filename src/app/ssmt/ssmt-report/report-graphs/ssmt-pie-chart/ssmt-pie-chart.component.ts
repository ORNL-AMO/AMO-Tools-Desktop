import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { ReportGraphsService } from '../report-graphs.service';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-ssmt-pie-chart',
  templateUrl: './ssmt-pie-chart.component.html',
  styleUrls: ['./ssmt-pie-chart.component.css']
})
export class SsmtPieChartComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  graphType: string;

  @ViewChild('ssmtPieChart', { static: false }) ssmtPieChart: ElementRef;

  constructor(private reportGraphsService: ReportGraphsService) { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    // if (!this.showPrint) {
    this.createChart();
    // } else {
    //   this.createPrintChart();
    // }
  }

  ngOnChanges() {
    if (this.ssmtPieChart) {
      this.createChart();
      // } else if (this.costPieChart && this.showPrint) {
      //   this.createPrintChart();
    }
  }

  createChart() {
    let valuesAndLabels
    if(this.graphType == 'processUsage'){
      valuesAndLabels  = this.reportGraphsService.getProcessUsageValuesAndLabels(this.ssmt);
    }else if(this.graphType == 'powerGeneration'){
      valuesAndLabels  = this.reportGraphsService.getGenerationValuesAndLabels(this.ssmt);
    }
    Plotly.purge(this.ssmtPieChart.nativeElement);
    var data = [{
      values: valuesAndLabels.map(val => { return val.value }),
      labels: valuesAndLabels.map(val => { return val.label }),
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: '<b>%{label}:</b> %{value:,.0f}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      // direction: "clockwise",
      // rotation: 90
    }];
    var layout = {
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 50, b: 50, l: 50, r: 50 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.ssmtPieChart.nativeElement, data, layout, modebarBtns);
  }


}
