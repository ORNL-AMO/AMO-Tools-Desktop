
import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SimpleChart, TraceData, TraceCoordinates } from '../../../../shared/models/plotting';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';

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

  psychrometricResults: PsychrometricResults;
  calculatedBaseGasDensitySubscription: Subscription;
  inputData: BaseGasDensity;
  formValid: boolean;
  expanded: boolean = false;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  hoverBtnGridLines: boolean;
  displayCollapseTooltip: boolean;
  displayGridLinesTooltip: boolean;
  temperatureUnits: string = 'F';
  useImperialUnits: boolean = true;
  lineCreationData: LineCreationData = ImperialLineData;

  constructor(private plotlyService: PlotlyService, private psychrometricService: FanPsychrometricService, private convertUnitsService: ConvertUnitsService) {}

  ngOnInit() {
    this.triggerInitialResize();
    this.setChartUnits();
    this.calculatedBaseGasDensitySubscription = this.psychrometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychrometricResults = results;
      this.inputData = this.psychrometricService.baseGasDensityData.getValue();
      this.initRenderChart();
    });
  }

  initRenderChart() {
    // Set base chart object
    this.chart = this.getEmptyChart();

    // Chart trace/coordinates
    //gas density form is always undefined need to fetch form form service maybe?
    this.formValid = this.psychrometricService.formValid.getValue();
    if (this.formValid) {
      let blueTraces: Array<TraceData> = this.addBlueTraces();
      let redTraces: Array<TraceData> = this.addRedTraces();

      // this.drawVerticalGridLines(blueTraces[5]);

      if (this.inputData.dryBulbTemp && this.psychrometricResults && this.psychrometricResults.humidityRatio !== undefined) {
          this.addUserPoint();
      }
      this.addTopAxisTrace(blueTraces);
      this.newVerticalLines(blueTraces[5]);
    }



    // pass chart data to plotly for rendering at div
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)

    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)
    }
  }


  addBlueTraces(): Array<TraceData> {
    // List 2: Dry Bulb 
    let xCoordinates = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      xCoordinates.push(i);
    }
    // List 1: Relative Humidity 
    let relativeHumidities: Array<number> = [];
    for (let i = 0; i <= 100; i += 20) {
      relativeHumidities.push(i);
    }

    let blueTraces: Array<TraceData> = [];
    // Calculated humidity ratio will be Y values
    let humidityRatios: Array<number>;
    //for making new line to intersect at point use result form results table instead of array
    relativeHumidities.forEach(relativeHumidity => {
      let trace = this.getEmptyTrace('Relative Humidity', 'blue');
      trace.x = xCoordinates;
      humidityRatios = []; 
      xCoordinates.forEach(x => {
        // Default data from psych
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.relativeHumidity = relativeHumidity;
        relativeHumidityInput.inputType = 'relativeHumidity';
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        if (relativeHumidityInput.dryBulbTemp && relativeHumidityInput.relativeHumidity && relativeHumidityInput.barometricPressure) {
          let results: PsychrometricResults = this.psychrometricService.calcDensityRelativeHumidity(relativeHumidityInput, this.settings, true);
          if (results) {
            humidityRatios.push(results.humidityRatio);
          }

        }
      });
      // trace.hovertemplate = `Relative Humidity ${trace.y}%`;
      trace.y = humidityRatios;
      this.chart.data.push(trace);

      blueTraces.push(trace);
    });

    return blueTraces;
  }

  addUserBlueTrace(): Array<TraceData> {
    // List 2: Dry Bulb 
    let xCoordinates = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      xCoordinates.push(i);
    }
    // List 1: Relative Humidity 
    let relativeHumidities: Array<number> = [];
    for (let i = 0; i <= 100; i += 20) {
      relativeHumidities.push(i);
    }

    let blueTraces: Array<TraceData> = [];
    // Calculated humidity ratio will be Y values
    // let humidityRatios: Array<number>;
    //for making new line to intersect at point use result form results table instead of array
    relativeHumidities.forEach(relativeHumidity => {

      let trace = this.getEmptyTrace('Relative Humidity', 'blue');
      trace.x = xCoordinates;
      let humidityRatios = []; 
      xCoordinates.forEach(x => {
        // Default data from psych
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.relativeHumidity = this.psychrometricResults.relativeHumidity;
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        relativeHumidityInput.inputType = 'relativeHumidity';
        let results: PsychrometricResults = this.psychrometricService.calcDensityRelativeHumidity(relativeHumidityInput, this.settings, true);
        if (results) {
          humidityRatios.push(results.humidityRatio);
        }
      });
      // trace.hovertemplate = `Relative Humidity ${trace.y}%`;
      trace.y = humidityRatios;
      this.chart.data.push(trace);

      blueTraces.push(trace);
    });
    // console.log('blueTraces', blueTraces);
    return blueTraces;
  
}

  addRedTraces(): Array<TraceData> {
    // List 1: Wet Bulb = sequence(35 , 130, by 5) (may want to change to by 10 if too crowded)
    let wetBulbTemps: Array<number> = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      wetBulbTemps.push(i);
    }
    
    let redTraces: Array<TraceData> = [];
    // Calculated humidity ratio will be Y values
    let humidityRatios: Array<number> = [];
    let xCoordinates: Array<number> = [];
    wetBulbTemps.forEach(wetBulbTemp => {
      // List 2: Dry Bulb 
      xCoordinates = [];
      for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
        if (i >= wetBulbTemp) {
          xCoordinates.push(i);
        }
      }
      let trace = this.getEmptyTrace('Wet Bulb', 'red');
      //use wet bulb result from results table when creating intersecting line at point/plot instead of the array
      humidityRatios = [];
      let invalidIndicies: Array<number> = [];
      xCoordinates.forEach(x => {
        let wetBulb: number = wetBulbTemp;
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.wetBulbTemp = wetBulb;
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        relativeHumidityInput.inputType = 'wetBulb';
        let results: PsychrometricResults = this.psychrometricService.calcDensityWetBulb(relativeHumidityInput, this.settings, true);
        if (results) {
          humidityRatios.push(results.humidityRatio);
        }
      });
      
      // Filter out invalid
      humidityRatios = humidityRatios.filter((ratio: number, index: number) => {
        if (ratio < 0) {
          invalidIndicies.push(index);
        } else {
          return ratio;
        }
      });
      xCoordinates = xCoordinates.filter((x: number, index: number) => !invalidIndicies.includes(index));
      
      // trace.hovertemplate = `Wet Bulb ${trace.y} ${this.temperatureUnits}`;
      trace.x = xCoordinates;
      trace.y = humidityRatios;
      
      redTraces.push(trace);
    });
    redTraces.forEach(trace => this.chart.data.push(trace));
    // console.log('redtraces', redTraces);
    this.chart.layout = this.getLayout(xCoordinates, humidityRatios);
    return redTraces;
  }

  addUserRedTrace(): Array<TraceData> {
    // List 1: Wet Bulb = sequence(35 , 130, by 5) (may want to change to by 10 if too crowded)
    let wetBulbTemps: Array<number> = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      wetBulbTemps.push(i);
    }
    
    let redTraces: Array<TraceData> = [];
    // Calculated humidity ratio will be Y values
    let humidityRatios: Array<number> = [];
    let xCoordinates: Array<number> = [];
    wetBulbTemps.forEach(wetBulbTemp => {
      // List 2: Dry Bulb 
      xCoordinates = [];
      for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
        if (i >= this.psychrometricResults.wetBulbTemp) {
          xCoordinates.push(i);
        }
      }
      let trace = this.getEmptyTrace('Wet Bulb', 'red');
      //use wet bulb result from results table when creating intersecting line at point/plot instead of the array
      humidityRatios = [];
      let invalidIndicies: Array<number> = [];
      xCoordinates.forEach(x => {
        let wetBulb: number = this.psychrometricResults.wetBulbTemp;
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.wetBulbTemp = wetBulb;
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        relativeHumidityInput.inputType = 'wetBulb';
        let results: PsychrometricResults = this.psychrometricService.calcDensityWetBulb(relativeHumidityInput, this.settings, true);
        if (results) {
          humidityRatios.push(results.humidityRatio);
        }
      });
      
      // Filter out invalid
      humidityRatios = humidityRatios.filter((ratio: number, index: number) => {
        if (ratio < 0) {
          invalidIndicies.push(index);
        } else {
          return ratio;
        }
      });
      xCoordinates = xCoordinates.filter((x: number, index: number) => !invalidIndicies.includes(index));
      
      // trace.hovertemplate = `Wet Bulb ${trace.y} ${this.temperatureUnits}`;
      trace.x = xCoordinates;
      trace.y = humidityRatios;
      
      redTraces.push(trace);
    });
    redTraces.forEach(trace => this.chart.data.push(trace));
    // console.log('redtraces', redTraces);
    this.chart.layout = this.getLayout(xCoordinates, humidityRatios);
    return redTraces;
  }

  addTopAxisTrace(blueTraces: Array<TraceData>) {
    // We need a trace or text/labels for this psuedo axis
    // Should be able to index into blue lines array, copy the last trace, modify styling and add markers (see 'text' and 'customdata' property and usage)  and add to chart

    //below variables will eventually be used for annotation coordinates
    // let xCoordinates = blueTraces[5].x;
    // let yCoordinates = blueTraces[5].y;

    let trace = {
      //current x and y coordinates are hard-coded based on the top blue trace. will eventually use the values from the blueTraces parameter being passed in
      x: [40, 50, 60, 70, 80, 90, 100, 110, 120, 130],
      y: [0.005195123704269834, 0.007631013371269642, 0.011042711334813505, 0.01576586057214435, 0.02224224917938616, 0.031058314712040406,  0.04300391773481307, 0.05916577350446308, 0.08108245084506918, 0.11101404514918507],
      mode: 'text',
      text: ['40', '50', '60', '70', '80', '90', '100', '110', '120', '130'],
      textposition: 'top',
      type: 'scatter',
      showlegend: false
    }
    this.chart.data.push(trace);
  }

  addUserPoint() {

    // This will get the y (humidity ratio)  for user point

    let trace = this.getEmptyPointTrace('user point', 'black');
    let dryBulbTemperature = this.inputData.dryBulbTemp;
    trace.x.push(dryBulbTemperature);
    trace.y.push(this.psychrometricResults.humidityRatio); //returning undefined, does return valid value when you generate example though
    this.chart.data.push(trace);

    this.addUserBlueTrace();
    this.addUserRedTrace();
  }

  newVerticalLines(blueTraces) {
    let trace = this.getEmptyTrace('', 'black');
    let blackTraces: Array<TraceData> = [];
    let xCoordinates: Array<number> = [];
    let wetBulbTemps: Array<number> = [];
    let humidityRatios: Array<number> = [];
    let index = 0;

    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      wetBulbTemps.push(i);
    }
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      xCoordinates.push(i);
    }
      let newTrace = this.getEmptyTrace('Trace', 'black');
      // wetBulbTemps.forEach((index) => {
        for (let index = 0; index < wetBulbTemps.length; index++) {
          let xValues: Array<number> = [];
          let yValues: Array<number> = [];

          xValues.push(xCoordinates[index], xCoordinates[index]);
          yValues.push(0, blueTraces.y[index]);
            
          newTrace.x = xValues;
          newTrace.y = yValues;
          newTrace.name = 'Name' + index;
  
          blackTraces.push(newTrace);
        }
      // })
      
    blackTraces.forEach(trace => this.chart.data.push(trace));
    // this.chart.layout = this.getLayout(xCoordinates, humidityRatios)
  }

  setChartUnits() {
    if (this.settings.fanTemperatureMeasurement === 'C' || this.settings.fanTemperatureMeasurement === 'K') {
      this.lineCreationData = MetricLineData;
        // If Kelvin (K)- just use the metric graph (C), if Rankine (R), just use the imperial graph (F)
    // check fanTemperatureMeasurement and set this.temperatureUnits to the string (or the UNICODE) that should display 

     // 'F'"     &#8457;</span>
    // 'C'"     &#8451;</span>
    // 'K'"     &#8490;</span>
    // 'R'"     &#176;R</span>
      this.temperatureUnits = 'C';
    } 
  }

  convertTemperatures(XYValues: Array<number>) {
    if (this.settings.fanTemperatureMeasurement === 'C' || this.settings.fanTemperatureMeasurement === 'K') {
      XYValues = this.convertUnitsService.convertArray(XYValues, 'F', 'C');
    }
    return XYValues;
  }

  getEmptyTrace(name: string, color: string): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: name,
      showlegend: false,
      type: 'scatter',
      mode: 'lines',
      hovertemplate: '',
      line: {
        shape: 'spline',
        color: color,
        width: 1,
      },
    };
    return trace;
  }

  getEmptyPointTrace(name: string, color: string): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: name,
      showlegend: false,
      type: 'scatter',
      mode: 'markers',
      hovertemplate: '',
      line: {
        shape: 'spline',
        color: color,
        width: 1,
      },
      marker: {
        size: 10
      }
    };
    return trace;
  }

  getLayout(xticks: Array<number>, yticks: Array<number>) {
    let xTicks = [40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
    return  {
      legend: {
        orientation: 'h',
        font: {
          size: 12,
        },
        // x: 0,
        // y: -.25
      },
      hovermode: 'false',
      xaxis: {
        autorange: true,
        showgrid: false,
        title: {
          text:"Dry Bulb Temperature (F)"
        },
        showticksuffix: 'all',
        tickangle: 0,
        tickmode: 'array',
        tickvals: xTicks
        // Change hoverFormat.. wrong or deprecated
        // hoverformat: '%{x}%',
        // range: [35, 130],
        // tickvals: xticks,
      },
      yaxis: {
        autorange: true,
        // type: 'linear',
        showgrid: false,
        side: 'right',
        title: {
          text: "Humidity Ratio(Lbv/Lba)"
        },
        // range: [0, .1],
        autotick: true,
        // tickmode: 'array',
        // tickvals: yticks,
        rangemode: 'tozero',
        showticksuffix: 'all'
      },
      margin: {
        t: 50,
        b: 75,
        l: 25,
        r: 75
      },
      annotations: [{
        x: 85,
        y: .05,
        xref: 'x',
        yref: 'y',
        text: 'Wet Bulb Temperature (F)',
        showarrow: false,
        textangle: -35
      }
      ]
    }
  }

  getEmptyChart() {
    return {
      name: 'Psychrometric Chart',
      data: [],
      // Empty layout or set it to the default
      layout: {
        hovermode: 'false',
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

  ngOnDestroy() {
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }
}


export const ImperialLineData: LineCreationData = {
    start: 35,
    end: 130,
    increment: 5
}

export const MetricLineData: LineCreationData = {
  start: 3,
  end: 60,
  increment: 3
}

interface LineCreationData {
    start: number,
    end: number,
    increment: number
}