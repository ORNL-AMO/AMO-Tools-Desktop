import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as Plotly from 'plotly.js';
import { PieChartDataItem } from '../../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';

@Component({
  selector: 'app-report-summary-pie-chart',
  templateUrl: './report-summary-pie-chart.component.html',
  styleUrls: ['./report-summary-pie-chart.component.css']
})
export class ReportSummaryPieChartComponent implements OnInit {

  @Input()
  pieChartData: Array<PieChartDataItem>;
  @Input()
  titleStr: string;
  @Input()
  dataOption: string;
  @Input()
  energyUnit: string; 
  
  @ViewChild('reportSummaryPieChart', { static: false }) reportSummaryPieChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.drawPlot();   
  }

  gOnChanges() {
    if(this.reportSummaryPieChart){
      Plotly.purge(this.reportSummaryPieChart.nativeElement);
    }
    if (this.reportSummaryPieChart) {
      // this.setHeight();
      this.drawPlot();
    } 
  }

  drawPlot() {
    let valuesArr: Array<number>;
    let textTemplate: string;
    if (this.dataOption == 'energy') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.energyUsed
      });
      textTemplate = '%{label}:<br>%{value:,.0f} ' + this.energyUnit;
    }
    else if (this.dataOption == 'cost') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.annualCost
      });
      textTemplate = `%{label}:<br>%{value:$,.0f}${this.pieChartData[0].currencyUnit !== '$'? 'k' : ''}`;
    }
    else if (this.dataOption == 'energySavings') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.energySavings
      });
      textTemplate = '%{label}:<br>%{value:,.0f} ' + this.energyUnit;
    }
    else if (this.dataOption == 'costSavings') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.costSavings
      });
      textTemplate = `%{label}:<br>%{value:$,.0f}${this.pieChartData[0].currencyUnit !== '$'? 'k' : ''}`;
    }
    var data = [{
      values: valuesArr,
      labels: this.pieChartData.map(dataItem => { return dataItem.equipmentName }),
      marker: {
        colors: this.pieChartData.map(dataItem => { return dataItem.color })
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: textTemplate,
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];

    var layout = {
      title: this.titleStr,
      font: {
        size: 14,
      },
      showlegend: false,
      margin: { autoexpand: true },
      autosize: true
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.newPlot(this.reportSummaryPieChart.nativeElement, data, layout, modebarBtns);
  }


}
