import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BatchAnalysisService } from '../../batch-analysis.service';
import * as Plotly from 'plotly.js';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-energy-cost-pie-chart',
  templateUrl: './energy-cost-pie-chart.component.html',
  styleUrls: ['./energy-cost-pie-chart.component.css']
})
export class EnergyCostPieChartComponent implements OnInit {

  @ViewChild('costPieChart', { static: false }) costPieChart: ElementRef;
  batchAnalysisDataItemsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(batchAnalysisData => {
      var data = [{
        values: batchAnalysisData.map(val => { return val.currentEnergyCost }),
        labels: batchAnalysisData.map(val => { return val.motorName }),
        marker: {
          colors: batchAnalysisData.map(val => {
            if (val.replaceMotor == 'Rewind') {
              return '#7D3C98';
            } else if (val.replaceMotor == 'Replace Now') {
              return '#117A65';
            } else if (val.replaceMotor == 'Replace When Fail') {
              return '#2874A6';
            } else {
              return '#707B7C';
            }
          }),
          line: {
            width: batchAnalysisData.map(val => { return 2 })
          }
        },
        type: 'pie',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        textinfo: 'label+value',
        texttemplate: '%{label}<br>%{value:$,.0f}',
        hoverinfo: 'label+percent',
        hovertemplate: '%{percent:%,.2f} <extra></extra>'
      }];
      let layout = {
        title: {
          text: 'Current Motor Energy Cost'
        },
        showlegend: false,
        font: {
          size: 14,
        },
      };

      var configOptions = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      Plotly.newPlot(this.costPieChart.nativeElement, data, layout, configOptions);
    });
  }


  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
  }
}
