import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-report-summary-pie-chart',
    templateUrl: './report-summary-pie-chart.component.html',
    styleUrls: ['./report-summary-pie-chart.component.css'],
    standalone: false
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
  @Input()
  printView: boolean;
  @Input()
  carbonEmissionsUnit: string;


  @ViewChild('reportSummaryPieChart', { static: false }) reportSummaryPieChart: ElementRef;

  constructor(private plotlyService: PlotlyService) { }

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
    if (this.reportSummaryPieChart) {
      if (!this.printView) {
        this.drawPlot();
      } else {
        this.drawPrintPlot();
      }
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
      textTemplate = `%{label}:<br>%{value:$,.0f}${this.pieChartData[0].currencyUnit !== '$' ? 'k' : ''}`;
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
      textTemplate = `%{label}:<br>%{value:$,.0f}${this.pieChartData[0].currencyUnit !== '$' ? 'k' : ''}`;
    }
    else if (this.dataOption == 'carbon') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.carbonEmissions
      });
      textTemplate = '%{label}:<br>%{value:,.0f} ' + this.carbonEmissionsUnit;
    }
    let data = [{
      values: valuesArr,
      labels: this.pieChartData.map(dataItem => { return dataItem.equipmentName }),
      marker: {
        colors: this.pieChartData.map(dataItem => { return dataItem.color })
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      automargin: true,
      hoverformat: '.2r',
      texttemplate: textTemplate,
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];

    let layout = {
      title: this.titleStr,
      font: {
        size: 12,
      },
      showlegend: false,
      // margin: { autoexpand: true },
      // autosize: true
    };

    let modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.reportSummaryPieChart.nativeElement, data, layout, modebarBtns);
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
    else if (this.dataOption == 'carbon') {
      valuesArr = this.pieChartData.map(dataItem => {
        return dataItem.carbonEmissions
      });
      textTemplate = '%{label}:<br>%{value:,.0f} ' + this.carbonEmissionsUnit;
    }
    let data = [{
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
    let layout = {
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 0, b: 0 },
      width: 500
    };
    let modebarBtns = {
      displaylogo: false,
      displayModeBar: false
    };
    this.plotlyService.newPlot(this.reportSummaryPieChart.nativeElement, data, layout, modebarBtns);
  }


}
