import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { O2UtilizationDataPoints, O2UtilizationRateService } from '../o2-utilization-rate.service';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-o2-utilization-rate-graph',
  templateUrl: './o2-utilization-rate-graph.component.html',
  styleUrls: ['./o2-utilization-rate-graph.component.css']
})
export class O2UtilizationRateGraphComponent implements OnInit {


  @ViewChild("o2UtilizationChart", { static: false }) o2UtilizationChart: ElementRef;
  inputDataPoints: Array<O2UtilizationDataPoints>;
  inputDataPointsSub: Subscription;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;
  showGridLines: boolean = true;
  constructor(private o2UtilizationRateService: O2UtilizationRateService) { }

  ngOnInit(): void {
    this.inputDataPointsSub = this.o2UtilizationRateService.inputDataPoints.subscribe(val => {
      this.inputDataPoints = val;
      this.drawGraph();
    });
  }

  ngOnDestroy() {
    this.inputDataPointsSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.drawGraph();      
    }, 100)
  }

  drawGraph() {
    if (this.o2UtilizationChart) {
      Plotly.purge(this.o2UtilizationChart.nativeElement);
      let trace = {
        x: this.inputDataPoints.map(dataPoint => { return dataPoint.time }),
        y: this.inputDataPoints.map(dataPoint => { return dataPoint.dissolvedOxygen }),
        type: 'scatter',
      };

      let layout = {
        xaxis: {
          // autorange: false,
          // type: 'linear',
          showgrid: this.showGridLines,
          title: {
            text: "Time (seconds)"
          },
          rangemode: 'tozero',
          tickvals: this.inputDataPoints.map(dataPoint => { return dataPoint.time })
        },
        yaxis: {
          // autorange: false,
          showgrid: this.showGridLines,
          title: {
            text: "Dissolved Oxygen (mg/L)"
          },
          rangemode: 'tozero'
        },
        margin: {
          t: 50,
          r: 50
        }
      };
      let config = {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'toggleSpikelines', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      }
      Plotly.newPlot(this.o2UtilizationChart.nativeElement, [trace], layout, config);
    }
  }

  
  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.drawGraph();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.drawGraph();
    }, 100);
  }
  

  hideTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 200);
  }

  checkHover(btnType: string) {
    if (btnType === 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
      }
    }
    else if (btnType === 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
      }
    }
    else if (btnType === 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }

  toggleGrid() {
    this.showGridLines = !this.showGridLines;
    this.drawGraph();
  }

}
