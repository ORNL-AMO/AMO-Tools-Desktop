import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BatchAnalysisService, BatchAnalysisSettings, BatchAnalysisResults } from '../../batch-analysis.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-total-motors-bar-chart',
  templateUrl: './total-motors-bar-chart.component.html',
  styleUrls: ['./total-motors-bar-chart.component.css']
})
export class TotalMotorsBarChartComponent implements OnInit {

  @ViewChild('barChart', { static: false }) barChart: ElementRef;
  batchAnalysisDataItemsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService, private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(val => {
      let data = this.getTraceData(val);
      let layout = {
        title: {
          text: 'Replace/Rewind Summary'
        },
        showlegend: false,
        font: {
          size: 14,
        },
        yaxis: {
          // hoverformat: '.0r',
          title: {
            text: 'Number of Motors',
            font: {
              family: 'Roboto',
              size: 16
            }
          },
          fixedrange: true
        },
        xaxis: {
          fixedrange: true
        }
      };

      var configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      this.plotlyService.newPlot(this.barChart.nativeElement, [data], layout, configOptions);
    });
  }


  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
  }

  getTraceData(batchAnalysisDataItems: Array<BatchAnalysisResults>): { x: Array<any>, y: Array<any>, type: string, marker: { color: Array<string> }, text: Array<string>, textposition: string, hoverinfo: string } {
    let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();
    let counts = _.countBy(batchAnalysisDataItems, 'replaceMotor');
    let xVals = new Array();
    let yVals = new Array();
    let colors = new Array();
    for (let key in counts) {
      if (key == 'undefined') {
        if (batchAnalysisSettings.displayIncompleteMotors == true) {
          xVals.push('Incomplete');
          yVals.push(counts[key]);
          colors.push('#707B7C');
        }
      } else {
        xVals.push(key);
        yVals.push(counts[key]);
        if (key == 'Rewind When Fail') {
          colors.push('#7D3C98')
        } else if (key == 'Replace Now') {
          colors.push('#117A65')
        } else if (key == 'Replace When Fail') {
          colors.push('#2874A6')
        }
      }
    }

    return { x: xVals, y: yVals, type: 'bar', marker: { color: colors }, text: yVals.map(String), textposition: 'auto', hoverinfo: 'none' }
  }
}
