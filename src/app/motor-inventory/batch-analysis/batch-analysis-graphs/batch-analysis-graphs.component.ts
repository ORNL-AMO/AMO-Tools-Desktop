import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BatchAnalysisService, BatchAnalysisSettings, BatchAnalysisResults } from '../batch-analysis.service';
import * as Plotly from 'plotly.js';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-batch-analysis-graphs',
  templateUrl: './batch-analysis-graphs.component.html',
  styleUrls: ['./batch-analysis-graphs.component.css']
})
export class BatchAnalysisGraphsComponent implements OnInit {

  @ViewChild('barChart', { static: false }) barChart: ElementRef;
  batchAnalysisDataItemsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(val => {
      let data = this.getTraceData(val);
      let layout = {
        width: this.barChart.nativeElement.clientWidth,
        showlegend: false,
        font: {
          size: 16,
        },
        yaxis: {
          // hoverformat: '.0r',
          title: {
            text: 'Number of Motors',
            font: {
              family: 'Arial',
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
      Plotly.react(this.barChart.nativeElement, [data], layout, configOptions);
    });
  }


  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
  }

  getTraceData(batchAnalysisDataItems: Array<BatchAnalysisResults>): { x: Array<any>, y: Array<any>, type: string, marker: { color: Array<string> } } {
    let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();
    let counts = _.countBy(batchAnalysisDataItems, 'replaceMotor');
    let xVals = new Array();
    let yVals = new Array();
    let colors = new Array();
    for (let key in counts) {
      if (key == 'undefined') {
        if (batchAnalysisSettings.displayIncompleteMotors == true) {
          xVals.push('N/A');
          yVals.push(counts[key]);
          colors.push('#707B7C');
        }
      } else {
        xVals.push(key);
        yVals.push(counts[key]);
        if (key == 'Rewind') {
          colors.push('#7D3C98')
        } else if (key == 'Replace') {
          colors.push('#117A65')
        } else if (key == 'Replace When Fail') {
          colors.push('#2874A6')
        }
      }
    }

    return { x: xVals, y: yVals, type: 'bar', marker: { color: colors } }
  }

}
