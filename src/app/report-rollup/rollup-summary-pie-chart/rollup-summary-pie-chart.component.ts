import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-rollup-summary-pie-chart',
  templateUrl: './rollup-summary-pie-chart.component.html',
  styleUrls: ['./rollup-summary-pie-chart.component.css']
})
export class RollupSummaryPieChartComponent implements OnInit {
  @Input()
  pieChartData: Array<PieChartDataItem>;
  @Input()
  printView: boolean;
  @Input()
  dataOption: string;
  @Input()
  energyUnit: string; 
  

  @ViewChild('rollupSummaryPieChart', { static: false }) rollupSummaryPieChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.printView) {
      this.drawPlot();
    } else {
      this.drawPrintPlot();
    }
  }

  ngOnChanges() {
    if(this.rollupSummaryPieChart){
      Plotly.purge(this.rollupSummaryPieChart.nativeElement);
    }
    if (this.rollupSummaryPieChart && !this.printView) {
      // this.setHeight();
      this.drawPlot();
    } else if (this.rollupSummaryPieChart && this.printView) {
      this.drawPrintPlot();
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
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: textTemplate,
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];

    var layout = {
      font: {
        size: 14,
      },
      showlegend: false,
      // margin: {t: 10, b: 10, l: 30, r: 30}
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.newPlot(this.rollupSummaryPieChart.nativeElement, data, layout, modebarBtns);
  }

  drawPrintPlot() {
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
      textTemplate = '%{label}:<br>%{value:$,.0f}';
    }
    else if (this.dataOption == 'energySavings') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.energySavings
      });
      textTemplate = '%{label}:<br>%{value:$,.0f}' + this.energyUnit;
    }
    else if (this.dataOption == 'costSavings') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.costSavings
      });
      textTemplate = '%{label}:<br>%{value:$,.0f}';
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
      texttemplate: textTemplate,
      hoverformat: '.2r',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 0, b: 0}
    };
    var modebarBtns = {
      displaylogo: false,
      displayModeBar: false
    };
    Plotly.newPlot(this.rollupSummaryPieChart.nativeElement, data, layout, modebarBtns);
  }
}

export interface PieChartDataItem {
  equipmentName: string,
  energyUsed: number,
  annualCost: number,
  energySavings: number,
  costSavings: number,
  percentCost: number,
  percentEnergy: number,
  color: string,
  furnaceType?: string
  currencyUnit?: string
}