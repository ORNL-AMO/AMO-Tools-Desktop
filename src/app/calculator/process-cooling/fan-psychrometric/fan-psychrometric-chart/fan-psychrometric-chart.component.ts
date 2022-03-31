
import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';

@Component({
  selector: 'app-fan-psychrometric-chart',
  templateUrl: './fan-psychrometric-chart.component.html',
  styleUrls: ['./fan-psychrometric-chart.component.css']
})
export class FanPsychrometricChartComponent implements OnInit {
 
  @Input()
  gasDensityForm: FormGroup;
  // ** remove above if we don't end up using

  @Input()
  settings: Settings;


  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;
  ngChartContainer: ElementRef;
  chart: SimpleChart;

  expanded: boolean = false;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  hoverBtnGridLines: boolean;
  displayCollapseTooltip: boolean;
  displayGridLinesTooltip: boolean;

  constructor(private plotlyService: PlotlyService, private psychrometricService: FanPsychrometricService, private convertUnitsService: ConvertUnitsService) {}

  ngOnInit() {
    this.triggerInitialResize();
    // If we get results from a subscription (i.e. psychrometricService.calculatedBaseGasDensity)
    // Then set results and this.initRenderChart() here, otherwise see onChanges 
    


    // Remove this when done
    this.initRenderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    // If we're getting results from @Input() 
    // then Check for form changes here and render chart
    if (changes.gasDensityForm && !changes.gasDensityForm.firstChange) {
      this.initRenderChart();
    }
  }

  initRenderChart() {
    this.chart = this.getEmptyChart();
    // Pass changing information to this method, i.e. labels, ticks, etc
    this.chart.layout = this.getLayout()

    // Chart trace/coordinates
    this.addBlueTraces();
    this.addRedTraces();
    this.addGridTraces();
    this.addTopAxisTrace();

    // pass chart data to plotly for rendering at div
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)

    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)
    }
  }

  addBlueTraces() {
    // see interface at bottom of file


    // let blueLines = get your constants 
    // blueLines = this.convertAxisTemperatures(blueLines);
    
    // blueLines.forEach((lineTrace => {
    //   let trace = this.getEmptyTrace();
    //   // dry bulb
    //   trace.x = lineTrace.temp;
    //   // rel humidity
    //   trace.y = lineTrace.relativeHumidity;
    //   trace.hovertemplate = `Relative Humidity ${line.relativeHumidity} ${units}`;
    //   this.chart.data.push(trace);
    // });
  }


  addRedTraces() {}

  addGridTraces() {}

  addTopAxisTrace() {
    // We need a trace for the line/axis
    // and also for the points along it. 
  }

  convertAxisTemperatures(lineTraces) {
    // if this.settings.unitsOfmeasure change 
    // then below

    // lineTraces.map(line => {
    //   line.temp = this.convertArray(line.temp, old unit, new unit);
    // });


  }

  convertArray(oldArray: Array<number>, from: string, to: string): Array<number> {
    let convertedArray = new Array<number>();
    for (let i = 0; i < oldArray.length; i++) {
      convertedArray.push(this.convertVal(oldArray[i], from, to));
    }
    return convertedArray;
  }

  convertVal(val: number, from: string, to: string) {
    if (val !== undefined) {
      val = this.convertUnitsService.value(val).from(from).to(to);
    }
    return val;
  }


  // Charlotte work
  // buildLineData(gasDensityForm: FormGroup, settings: Settings): Array<TraceCoordinates> {
  //   let relHumidity20: TraceCoordinates = {x: [], y: []};
  //   let relHumidity40: TraceCoordinates = {x: [], y: []};
  //   let relHumidity60: TraceCoordinates = {x: [], y: []};
  //   let relHumidity80: TraceCoordinates = {x: [], y: []};
  //   let relHumidity100: TraceCoordinates = {x: [], y: []};

  //   for (let i = 35; i <= 130; i = i + 5) {
  //     let barometricPressure = this.psychrometricResults.barometricPressure;
  //     let relativeHumidity = this.psychrometricResults.relativeHumidity;

  //     relHumidity20.x.push(i);
  //     relHumidity20.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
  //     relHumidity40.x.push(i);
  //     relHumidity40.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
  //     relHumidity60.x.push(i);
  //     relHumidity60.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
  //     relHumidity80.x.push(i);
  //     relHumidity80.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
  //     relHumidity100.x.push(i);
  //     relHumidity100.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
  //   }
  //   return [relHumidity20, relHumidity40, relHumidity60, relHumidity80, relHumidity100];
  // }


  calculateHumidityRatio(dryBulbTemp: number, relativeHumidity: number, barometricPressure: number) {
    const c8 = -1.0440397e4;
    const c9 = -1.129465e1;
    const c10 = -2.7022355e-2;
    const c11 = 1.289036e-5;
    const c12 = -2.4780681e-9;
    const c13 = 6.5459673;

    var t = dryBulbTemp + 459.67;
    var lnOfSatPress = c8 / t + c9 + c10 * t + c11 * Math.pow(t, 2) + c12 * Math.pow(t, 3) + c13 * Math.log(t);
    var satPress = Math.exp(lnOfSatPress);
    var humidRatio = (0.621945 * satPress) / (barometricPressure - satPress);
    return humidRatio;
  }
// End charlotte work




   
  getEmptyTrace(): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: '',
      showlegend: false,
      type: 'scatter',
      mode: 'lines',
      hovertemplate: '',
      line: {
        shape: 'spline',
        color: '#FFA500',
        width: 1,
      },
    };
    return trace;
  }

  getLayout() {
    // Convert tick values here or convert them and pass them in here
    return  {
      legend: {
        orientation: 'h',
        font: {
          size: 12,
        },
        x: 0,
        y: -.25
      },
      hovermode: 'x',
      xaxis: {
        autorange: false,
        showgrid: false,
        title: {
          text:"Dry Bulb Temperature (F)"
        },
        showticksuffix: 'all',
        tickangle: 0,
        tickmode: 'array',
        // Change hoverFormat.. wrong or deprecated
        // hoverformat: '%{x}%',
        range: [35, 130],
        tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
      },
      xaxis2: {
        autorange: false,
        showgrid: false,
        title: {
          text:"Wet Bulb (F)"
        },
        side: 'left',
        anchor: 'free',
        overlaying: 'x',
        xaxis: 'x2',
        showticksuffix: 'all',
        tickmode: 'array',
        // hoverformat: '%{x}%',
        range: [30, 130],
        tickvals: [30, 40, 50 , 60, 70, 80, 90, 100, 110, 120, 130]
        // tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
      },
      yaxis: {
        autorange: true,
        type: 'linear',
        showgrid: false,
        side: 'right',
        title: {
          text: "Humidity Ratio(Lbv/Lba)"
        },
        range: [0, 0.1],
        tickvals: [0, 0.004, 0.008, 0.012, 0.016, 0.020, 0.024, 0.028],
        //ticktext: ['0', '20%', '40%', '60%', '80%', '100%', '120%'],
        rangemode: 'tozero',
        showticksuffix: 'all'
      },
      margin: {
        t: 50,
        b: 75,
        l: 75,
        r: 50
      }
    }
  }

  getEmptyChart() {
    return {
      name: 'Psychrometric Chart',
      data: [],
      // Empty layout or set it to the default
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: false,
          type: 'auto',
          showgrid: true,
          title: {
            text: ``
          },
          showticksuffix: 'all',
        },
        yaxis: {
          autorange: false,
          type: 'auto',
          showgrid: true,
          showticksuffix: 'all',
          title: {
            text: ``
          },
        },
        margin: {
          t: 50,
          b: 75,
          l: 75,
          r: 50
        }
      },
      config: {
        modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };
  }



  // Ignore below
  // Utilities


  toggleGrid() {
    let showingGridX: boolean = this.chart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.chart.layout.yaxis.showgrid;
    this.chart.layout.xaxis.showgrid = !showingGridX;
    this.chart.layout.yaxis.showgrid = !showingGridY;
    this.initRenderChart();
  }


  triggerInitialResize() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      this.initRenderChart();
    }, 100);
  }

  @HostListener("document:keyup", ["$event"])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === "Escape") {
        this.contractChart();
      }
    }
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
    }, 200);
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
}




export interface BlueLine {
  x: number[],
  y: number[],
}


// Use better name
const blueLines: Array<BlueLine> = [
  // Dummy vals
  {
      x:  [3.27, 6.576, 9.927, 13.322, 16.762, 20.245, 23.773, 27.344, 30.959, 34.619, 38.324, 42.073, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.989, 54.375, 63.045, 71.971, 81.146, 90.569, 100.241, 110.163, 120.337, 130.766, 141.452, 152.397, 163.604, 175.075, 186.814, 198.824, 211.106, 223.665, 236.504, 249.624, 263.03, 276.723, 290.708, 304.986, 319.561, 334.435, 349.61, 365.089, 380.875, 396.969, 413.373, 430.089, 447.12, 464.465, 482.128, 500.109, 518.409, 537.03],
      y:  [3.27, 6.576, 9.927, 13.322, 16.762, 20.245, 23.773, 27.344, 30.959, 34.619, 38.324, 42.073, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.989, 54.375, 63.045, 71.971, 81.146, 90.569, 100.241, 110.163, 120.337, 130.766, 141.452, 152.397, 163.604, 175.075, 186.814, 198.824, 211.106, 223.665, 236.504, 249.624, 263.03, 276.723, 290.708, 304.986, 319.561, 334.435, 349.61, 365.089, 380.875, 396.969, 413.373, 430.089, 447.12, 464.465, 482.128, 500.109, 518.409, 537.03]
  },
  {
    x:  [3.27, 6.576, 9.927, 13.322, 16.762, 20.245, 23.773, 27.344, 30.959, 34.619, 38.324, 42.073, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.989, 54.375, 63.045, 71.971, 81.146, 90.569, 100.241, 110.163, 120.337, 130.766, 141.452, 152.397, 163.604, 175.075, 186.814, 198.824, 211.106, 223.665, 236.504, 249.624, 263.03, 276.723, 290.708, 304.986, 319.561, 334.435, 349.61, 365.089, 380.875, 396.969, 413.373, 430.089, 447.12, 464.465, 482.128, 500.109, 518.409, 537.03],
    y:  [3.27, 6.576, 9.927, 13.322, 16.762, 20.245, 23.773, 27.344, 30.959, 34.619, 38.324, 42.073, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.808, 45.989, 54.375, 63.045, 71.971, 81.146, 90.569, 100.241, 110.163, 120.337, 130.766, 141.452, 152.397, 163.604, 175.075, 186.814, 198.824, 211.106, 223.665, 236.504, 249.624, 263.03, 276.723, 290.708, 304.986, 319.561, 334.435, 349.61, 365.089, 380.875, 396.969, 413.373, 430.089, 447.12, 464.465, 482.128, 500.109, 518.409, 537.03],
},
 // etc...
];



