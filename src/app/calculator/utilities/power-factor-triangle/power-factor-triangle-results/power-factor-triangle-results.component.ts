import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { PowerFactorTriangleOutputs } from '../../../../shared/models/standalone';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-power-factor-triangle-results',
  templateUrl: './power-factor-triangle-results.component.html',
  styleUrls: ['./power-factor-triangle-results.component.css']
})
export class PowerFactorTriangleResultsComponent implements OnInit {
  @Input()
  results: PowerFactorTriangleOutputs;
  @ViewChild("powerFactorTiangle", { static: false }) powerFactorTiangle: ElementRef;
  
  constructor(private plotlyService: PlotlyService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results && !changes.results.firstChange) {
      this.renderChart();
    }
  }

  renderChart() {
    var data = [
      {
        x: [0, this.results.realPower],
        y: [0, 0],
        marker: {
          colors: '#1E7640'
        },
        type: 'scatter',
        mode: 'lines+markers',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        hoverformat: '.2r',
        name: 'Real Power'
      },
      {
        x: [this.results.realPower, this.results.realPower],
        y: [0, this.results.reactivePower],
        marker: {
          colors: '#2ABDDA'
        },
        type: 'scatter',
        mode: 'lines+markers',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        hoverformat: '.2r',
        name: 'Reactive Power'
      },
      {
        x: [this.results.realPower, 0],
        y: [this.results.reactivePower, 0],
        marker: {
          colors: '#84B641'
        },
        type: 'scatter',
        mode: 'lines+markers',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        hoverformat: '.2r',
        name: 'Apparent Power'
      }
    ];
    var layout = {
      font: {
        size: 12,
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: -0.2
      },
      margin: { t: 25, b: 25, l: 25, r: 25 },
    };

    var modebarBtns = {
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.powerFactorTiangle.nativeElement, data, layout, modebarBtns);
  }



}
