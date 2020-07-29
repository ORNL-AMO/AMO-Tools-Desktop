import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef, KeyValueDiffers, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

import { SimpleChart } from '../../../../shared/models/plotting';
import * as Plotly from 'plotly.js';
import { SteamPropertiesService, IsobarCoordinates } from '../steam-properties.service';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';


@Component({
  selector: 'app-steam-properties-chart',
  templateUrl: './steam-properties-chart.component.html',
  styleUrls: ['./steam-properties-chart.component.css']
})
export class SteamPropertiesChartComponent implements OnInit, OnChanges {

  @Input()
  settings: Settings;
  @Input()
  steamPropertiesOutput: SteamPropertiesOutput;
  @Input()
  validPlot: boolean;
  @Input()
  toggleReset: boolean;

  // DOM
  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';

  propertiesChart: SimpleChart;
  defaultEntropyUnit: string = 'kJkgK';
  defaultTempUnit: string = 'C';
  defaultPressureUnit: string = 'MPaa';

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;


  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  constructor(private steamPropertiesService: SteamPropertiesService) { }
  
  ngOnInit() {
    this.triggerInitialResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.steamPropertiesOutput && !changes.toggleReset && !changes.steamPropertiesOutput.firstChange) {
        if (this.validPlot && this.steamPropertiesOutput !== undefined) {
          this.updateChart();
        }
    } else if (changes.toggleReset && !changes.toggleReset.firstChange) {
      if (this.propertiesChart.existingPoint) {
        this.removePointTrace();
      } 
    }
    else {
      this.initRenderChart();
    }
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.initRenderChart();
    }, 25)
  }

  save() {
    this.steamPropertiesService.propertiesChart.next(this.propertiesChart);
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    this.initChartSetup();
    this.initIsobarTraces();
    this.initDomeAreaTraces();
    if (this.validPlot && this.steamPropertiesOutput !== undefined) {
      this.plotPoint(this.steamPropertiesOutput.temperature, this.steamPropertiesOutput.specificEntropy);
    }

    let chartLayout = JSON.parse(JSON.stringify(this.propertiesChart.layout));
    Plotly.newPlot(this.currentChartId, this.propertiesChart.data, chartLayout, this.propertiesChart.config)
    this.save();
  }

  updateChart() {
    if (this.validPlot) {
      this.plotPoint(this.steamPropertiesOutput.temperature, this.steamPropertiesOutput.specificEntropy);
    }
    let chartLayout = JSON.parse(JSON.stringify(this.propertiesChart.layout));
    Plotly.update(this.currentChartId, this.propertiesChart.data, chartLayout);
    this.save();
  }

  initChartSetup() {
    this.steamPropertiesService.initChartData();
    this.propertiesChart = this.steamPropertiesService.propertiesChart.getValue();
    this.steamPropertiesService.setChartConfig(this.settings);
  }
  
  initIsobarTraces() {
    this.checkConvertIsobars();
    let isobars: Array<IsobarCoordinates> = this.steamPropertiesService.isobars.getValue();    
    isobars.forEach((line: IsobarCoordinates) => {
      let trace = this.steamPropertiesService.getEmptyTrace();
      trace.x = line.entropy;
      trace.y = line.temp;
      trace.hovertemplate = `Isobar ${line.pressureValue} ${this.settings.steamPressureMeasurement}`;
      this.propertiesChart.data.push(trace);
    });
  }

  checkConvertIsobars() {
    if (this.settings.steamSpecificEntropyMeasurement !== undefined 
      && this.settings.steamSpecificEntropyMeasurement !== this.defaultEntropyUnit) {
      this.steamPropertiesService.convertIsobarEntropy(this.settings, this.defaultEntropyUnit);
    }
    if (this.settings.steamTemperatureMeasurement !== undefined 
      && this.settings.steamTemperatureMeasurement !== this.defaultTempUnit) {
      this.steamPropertiesService.convertIsobarTemperature(this.settings, this.defaultTempUnit);
    }
    if (this.settings.steamPressureMeasurement !== undefined 
      && this.settings.steamPressureMeasurement !== this.defaultPressureUnit) {
      this.steamPropertiesService.convertIsobarPressure(this.settings, this.defaultPressureUnit);
    }
  }

  initDomeAreaTraces() {
    // Fill in 'Liquid Vapor Dome' area
    let domeFillTrace = this.steamPropertiesService.getEmptyTrace();
    domeFillTrace.fill = 'tozeroy';
    domeFillTrace.fillcolor = 'rgba(70,130,180,0.4)';
    domeFillTrace.x = this.steamPropertiesService.entropy;
    domeFillTrace.y = this.steamPropertiesService.temperatures;

    // Black dome outline (envelope)
    let domeOutlineTrace = this.steamPropertiesService.getEmptyTrace();
    domeOutlineTrace.x = this.steamPropertiesService.entropy;
    domeOutlineTrace.y = this.steamPropertiesService.temperatures;
    domeOutlineTrace.line.width = 2;
    domeOutlineTrace.line.color = "#000000";
    domeOutlineTrace.hovertemplate = "Saturated Liquid/Vapor";
    domeOutlineTrace.name = "Saturated Liquid/Vapor";
    
    this.propertiesChart.data.push(domeFillTrace, domeOutlineTrace);
  }

  plotPoint(temperature: number, entropy: number) {
    let pointTrace = this.steamPropertiesService.getPointTrace();
    pointTrace.marker.color = graphColors[0];
    pointTrace.x = [entropy];
    pointTrace.y = [temperature];

    if (this.propertiesChart.existingPoint) {
      this.propertiesChart.data[this.propertiesChart.data.length - 1] = pointTrace;
    } else {
      this.propertiesChart.data.push(pointTrace);
      this.propertiesChart.existingPoint = true;
    }
  }

  removePointTrace() {
    this.propertiesChart.data.splice(this.propertiesChart.data.length - 1, 1);
    this.propertiesChart.existingPoint = false;
    let chartLayout = JSON.parse(JSON.stringify(this.propertiesChart.layout));
    Plotly.update(this.currentChartId, this.propertiesChart.data, chartLayout);
    this.save();
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

  resizeGraph() {
    let expandedChart = this.ngChartContainer.nativeElement;
    if (expandedChart) {
      if (this.expanded) {
        this.currentChartId = this.expandedChartId;
      }
      else {
        this.currentChartId = this.tabPanelChartId;
      }
      this.initRenderChart();
    }
  }

    expandChart() {
      this.expanded = true;
      this.hideTooltip('btnExpandChart');
      this.hideTooltip('btnCollapseChart');
      setTimeout(() => {
        this.resizeGraph();
      }, 200);
    }
  
    contractChart() {
      this.expanded = false;
      this.hideTooltip('btnExpandChart');
      this.hideTooltip('btnCollapseChart');
      setTimeout(() => {
        this.resizeGraph();
      }, 200);
    }

  toggleGrid() {
    let showingGridX: boolean = this.propertiesChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.propertiesChart.layout.yaxis.showgrid;
    this.propertiesChart.layout.xaxis.showgrid = !showingGridX;
    this.propertiesChart.layout.yaxis.showgrid = !showingGridY;
    // this.updateChart();
  }

}
