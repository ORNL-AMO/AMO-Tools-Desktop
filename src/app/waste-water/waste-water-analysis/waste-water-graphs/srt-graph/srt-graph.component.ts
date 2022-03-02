import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../../waste-water-analysis.service';
import { WasteWaterService } from '../../../waste-water.service';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { DataTableVariable } from '../../dataTableVariables';
import { PlotlyService } from 'angular-plotly.js';
import * as Plotly from 'plotly.js-dist';
@Component({
  selector: 'app-srt-graph',
  templateUrl: './srt-graph.component.html',
  styleUrls: ['./srt-graph.component.css']
})
export class SrtGraphComponent implements OnInit {
  @Input()
  analysisGraphItem: AnalysisGraphItem;
  @Input()
  hideActionsMenu: boolean;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  @ViewChild('srtGraphItem', { static: false }) srtGraphItem: ElementRef;


  xAxisHoverSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService, private wasteWaterAnalysisService: WasteWaterAnalysisService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.xAxisHoverSub = this.wasteWaterAnalysisService.xAxisHover.subscribe(val => {
      this.setHover(val);
    });
    if(!this.settings){
      this.settings = this.wasteWaterService.settings.getValue();
    }
  }

  ngOnDestroy() {
    this.xAxisHoverSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.plotChart();
  }

  plotChart(){
    let unitSuffix: string = this.analysisGraphItem.variableY.imperialUnit;
    if (this.settings.unitsOfMeasure == 'Metric') {
      unitSuffix = this.analysisGraphItem.variableY.metricUnit;
    }

    let layout = {
      width: undefined,
      title: this.analysisGraphItem.title,
      showlegend: false,
      font: {
        size: 12,
      },
      yaxis: {
        hoverformat: '.3r',
        title: {
          text: unitSuffix,
        }
        // showticksuffix: 'first',
        // ticksuffix: ' ' + 
      },
      xaxis: {
        title: {
          text: this.setXTitleText(this.analysisGraphItem.variableX),
        },
      },
    };

    if (this.printView) {
      layout.width = 500;
    }

    var configOptions = {
      modeBarButtonsToRemove: [],
      displaylogo: false,
      displayModeBar: !this.printView,
      responsive: true
    };

    if (this.hideActionsMenu) {
      configOptions.modeBarButtonsToRemove = ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'];
    }

    this.plotlyService.newPlot(this.srtGraphItem.nativeElement, this.analysisGraphItem.traces, layout, configOptions).then(chart => {
      chart.on('plotly_hover', (data) => {
        this.wasteWaterAnalysisService.xAxisHover.next(data.points);
      });
      chart.on('plotly_unhover', () => {
        this.wasteWaterAnalysisService.xAxisHover.next([]);
      });
    });
  }

  setXTitleText(xVariable: DataTableVariable) {
    let xAxisText: string;
    if (this.analysisGraphItem.variableX.name == 'SRT') {
      xAxisText = this.analysisGraphItem.variableX.label;
    } else {
      let xUnits = this.settings.unitsOfMeasure == 'Imperial'? this.analysisGraphItem.variableX.imperialUnit : this.analysisGraphItem.variableX.metricUnit;
      xAxisText = `${this.analysisGraphItem.variableX.label} (${xUnits})`
    }
    return xAxisText;
  }

  setHover(points: Array<{ curveNumber: number, pointNumber: number }>) {
    if (this.srtGraphItem && points != undefined) {
      Plotly.Fx.hover(this.srtGraphItem.nativeElement, points)
    }
  }
}
