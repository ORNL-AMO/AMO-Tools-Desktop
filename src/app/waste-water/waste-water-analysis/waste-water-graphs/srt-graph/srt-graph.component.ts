import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AnalysisGraphItem } from '../../waste-water-analysis.service';
import * as Plotly from 'plotly.js';
import { WasteWaterService } from '../../../waste-water.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-srt-graph',
  templateUrl: './srt-graph.component.html',
  styleUrls: ['./srt-graph.component.css']
})
export class SrtGraphComponent implements OnInit {
  @Input()
  analysisGraphItem: AnalysisGraphItem;

  @ViewChild('srtGraphItem', { static: false }) srtGraphItem: ElementRef;

  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let settings: Settings = this.wasteWaterService.settings.getValue();
    let unitSuffix: string = this.analysisGraphItem.dataVariable.imperialUnit;
    if(settings.unitsOfMeasure == 'Metric'){
      unitSuffix = this.analysisGraphItem.dataVariable.metricUnit;
    }


    let layout = {
      title: this.analysisGraphItem.title,
      showlegend: false,
      font: {
        size: 12,
      },
      yaxis: {
        hoverformat: '.3r',
        // title: {
        //   text: this.analysisGraphItem.title,
        // },
        showticksuffix: 'first',
        ticksuffix: ' ' + unitSuffix
      },
      xaxis: {
        title: {
          text: 'SRT Days',
        }
      },
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.newPlot(this.srtGraphItem.nativeElement, this.analysisGraphItem.traces, layout, configOptions);
  }
}
