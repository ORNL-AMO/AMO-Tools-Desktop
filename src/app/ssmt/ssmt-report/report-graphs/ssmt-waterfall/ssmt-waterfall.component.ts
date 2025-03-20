import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SSMT, SsmtValid } from '../../../../shared/models/steam/ssmt';
import { SSMTLosses } from '../../../../shared/models/steam/steam-outputs';
import { ReportGraphsService } from '../report-graphs.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-ssmt-waterfall',
    templateUrl: './ssmt-waterfall.component.html',
    styleUrls: ['./ssmt-waterfall.component.css'],
    standalone: false
})
export class SsmtWaterfallComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  // @Input()
  // selectedSsmt2: SSMT;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string, valid: SsmtValid }>;
  @Input()
  settings: Settings;
  @Input()
  xAxisRange: number;
  @Input()
  printView: boolean;

  @ViewChild('ssmtWaterfall', { static: false }) ssmtWaterfall: ElementRef;

  constructor(private reportGraphsService: ReportGraphsService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    if (this.ssmt.valid.isValid) {
      if (!this.printView) {
        this.createChart();
      } else {
        this.createPrintChart();
      }
    }
  }

  ngOnChanges() {
    if (this.ssmt.valid.isValid) {
      if (this.ssmtWaterfall && !this.printView) {
        this.createChart();
      } else if (this.ssmtWaterfall && this.printView) {
        this.createPrintChart();
      }
    }
  }

  createChart() {
    let labelsAndValues: Array<{ value: number, label: string, stackTraceValue: number, color: string }> = this.getSsmtWatefallData(this.ssmt);
    let stackTraces = {
      x: labelsAndValues.map(val => { return val.stackTraceValue }),
      y: labelsAndValues.map(val => { return val.label }),
      hoverinfo: 'none',
      // hovertemplate: '%{y:$,.0f}<extra></extra>',
      // name: "Projected Costs",
      type: "bar",
      marker: {
        color: 'rgba(0,0,0,0)',
        width: .8
      },
      orientation: 'h'
    };

    let texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr';
    let energyTraces = {
      x: labelsAndValues.map(val => { return val.value }),
      y: labelsAndValues.map(val => { return val.label }),
      hoverinfo: 'none',
      // hovertemplate: '%{x:,.0f}<extra></extra>',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      texttemplate: texttemplate,
      name: "Energy Usage",
      type: "bar",
      marker: {
        color: labelsAndValues.map(val => { return val.color }),
        width: .8
      },
      orientation: 'h'
    };

    var data = [stackTraces, energyTraces];
    var layout = {
      barmode: 'stack',
      showlegend: false,
      font: {
        size: 12,
      },
      yaxis: {
        fixedrange: true
      },
      xaxis: {
        range: [0, this.xAxisRange + 50],
        automargin: true
      },
      margin: { t: 30, b: 40, r: 50, l: 150 },
      clickmode: 'none',
      dragmode: false
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    this.plotlyService.newPlot(this.ssmtWaterfall.nativeElement, data, layout, configOptions);
  }

  getSsmtWatefallData(ssmt: SSMT): Array<{ value: number, label: string, stackTraceValue: number, color: string }> {
    let ssmtLosses: SSMTLosses;
    if (ssmt.name == 'Baseline') {
      ssmtLosses = this.baselineLosses;
    } else {
      ssmtLosses = this.modificationLosses.find(lossObj => { return lossObj.name == ssmt.name }).outputData;
    }
    let labelsAndValues: Array<{ value: number, label: string, stackTraceValue: number, color: string }> = this.reportGraphsService.getWaterfallLabelsAndValues(ssmtLosses);
    return labelsAndValues
  }

  createPrintChart() {
    let labelsAndValues: Array<{ value: number, label: string, stackTraceValue: number, color: string }> = this.getSsmtWatefallData(this.ssmt);
    let stackTraces = {
      x: labelsAndValues.map(val => { return val.stackTraceValue }),
      y: labelsAndValues.map(val => { return val.label }),
      hoverinfo: 'none',
      // hovertemplate: '%{y:$,.0f}<extra></extra>',
      // name: "Projected Costs",
      type: "bar",
      marker: {
        color: 'rgba(0,0,0,0)',
        width: .8
      },
      orientation: 'h'
    };

    let texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr';
    let energyTraces = {
      x: labelsAndValues.map(val => { return val.value }),
      y: labelsAndValues.map(val => { return val.label }),
      hoverinfo: 'none',
      // hovertemplate: '%{x:,.0f}<extra></extra>',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      texttemplate: texttemplate,
      name: "Energy Usage",
      type: "bar",
      marker: {
        color: labelsAndValues.map(val => { return val.color }),
        width: .8
      },
      orientation: 'h'
    };

    var data = [stackTraces, energyTraces];
    var layout = {
      width: 1100,
      barmode: 'stack',
      showlegend: false,
      font: {
        size: 12,
      },
      yaxis: {
        fixedrange: true
      },
      xaxis: {
        range: [0, this.xAxisRange + 50],
        automargin: true
      },
      margin: { t: 30, b: 40, r: 50, l: 150 },
      clickmode: 'none',
      dragmode: false
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false
    };

    this.plotlyService.newPlot(this.ssmtWaterfall.nativeElement, data, layout, configOptions);
  }

}
