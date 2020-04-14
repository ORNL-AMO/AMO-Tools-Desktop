import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { ReportGraphsService } from '../report-graphs.service';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';

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
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  @ViewChild('ssmtPieChart', { static: false }) ssmtPieChart: ElementRef;
  noData: boolean;
  constructor(private reportGraphsService: ReportGraphsService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    if (!this.printView) {
      this.createChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.ssmtPieChart && !this.printView) {
      this.createChart();
    } else if (this.ssmtPieChart && this.printView) {
      this.createPrintChart();
    }
  }

  createChart() {
    let valuesAndLabels: Array<{ value: number, label: string }>;
    let texttemplate: string;
    if (this.graphType == 'processUsage') {
      valuesAndLabels = this.reportGraphsService.getProcessUsageValuesAndLabels(this.ssmt);
      texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr';

    } else if (this.graphType == 'powerGeneration') {
      valuesAndLabels = this.reportGraphsService.getGenerationValuesAndLabels(this.ssmt);
      texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamPowerMeasurement;
    }
    Plotly.purge(this.ssmtPieChart.nativeElement);
    if (valuesAndLabels.length != 0) {
      this.noData = false;
      this.cd.detectChanges();
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
        texttemplate: texttemplate,
        // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
        hoverinfo: 'label+percent',
        // direction: "clockwise",
        // rotation: 90
      }];
      var layout = {
        font: {
          size: 14,
        },
        showlegend: false,
        margin: { t: 15, b: 15, l: 100, r: 100 },
      };

      var modebarBtns = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      Plotly.react(this.ssmtPieChart.nativeElement, data, layout, modebarBtns);
    } else {
      this.noData = true;
      this.cd.detectChanges();
    }
  }

  createPrintChart(){
    let valuesAndLabels: Array<{ value: number, label: string }>;
    let texttemplate: string;
    if (this.graphType == 'processUsage') {
      valuesAndLabels = this.reportGraphsService.getProcessUsageValuesAndLabels(this.ssmt);
      texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr';

    } else if (this.graphType == 'powerGeneration') {
      valuesAndLabels = this.reportGraphsService.getGenerationValuesAndLabels(this.ssmt);
      texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamPowerMeasurement;
    }
    Plotly.purge(this.ssmtPieChart.nativeElement);
    if (valuesAndLabels.length != 0) {
      this.noData = false;
      this.cd.detectChanges();
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
        texttemplate: texttemplate,
        // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
        hoverinfo: 'label+percent',
        // direction: "clockwise",
        // rotation: 90
      }];
      var layout = {
        width: 500,
        font: {
          size: 14,
        },
        showlegend: false,
        margin: { t: 50, b: 110, l: 125, r: 125 },
      };

      var modebarBtns = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: false
      };
      Plotly.react(this.ssmtPieChart.nativeElement, data, layout, modebarBtns);
    } else {
      this.noData = true;
      this.cd.detectChanges();
    }
  }

}
