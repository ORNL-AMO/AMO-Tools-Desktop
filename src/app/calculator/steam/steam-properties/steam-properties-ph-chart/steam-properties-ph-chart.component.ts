import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

import { SimpleChart } from '../../../../shared/models/plotting';
import * as Plotly from 'plotly.js';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { SaturatedPropertiesService, IsothermCoordinates } from '../../saturated-properties.service';
import { SaturatedPropertiesConversionService } from '../../saturated-properties-conversion.service';



@Component({
  selector: 'app-steam-properties-ph-chart',
  templateUrl: './steam-properties-ph-chart.component.html',
  styleUrls: ['./steam-properties-ph-chart.component.css']
})
export class SteamPropertiesPhChartComponent implements OnInit {

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

  enthalpyChart: SimpleChart;
  defaultEnthalpyUnit: string = 'kJkg';
  defaultPressureUnit: string = 'MPaa';
  convertPressureUnit: string;

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

  // Use shared SaturatedPropertiesService to supply isotherm, isobar, and dome objects/rendering
  constructor(private saturatedPropertiesService: SaturatedPropertiesService, 
    private saturatedPropertiesConversionService: SaturatedPropertiesConversionService) { }
  
  ngOnInit() {
    this.triggerInitialResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.steamPropertiesOutput && !changes.toggleReset && !changes.steamPropertiesOutput.firstChange) {
        if (this.validPlot && this.steamPropertiesOutput !== undefined) {
          this.updateChart();
        }
    } else if (changes.toggleReset && !changes.toggleReset.firstChange) {
      if (this.enthalpyChart.existingPoint) {
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
    this.saturatedPropertiesService.enthalpyChart.next(this.enthalpyChart);
  }
  
  // Force specified conversions to avoid rendering problems
  initConvertPressureUnit() {
    if (this.defaultPressureUnit == this.settings.steamPressureMeasurement) {
      this.convertPressureUnit = this.defaultPressureUnit;
    } else if (this.settings.steamPressureMeasurement.includes('psi')) {
      this.convertPressureUnit = 'psia';
    } else if (this.settings.steamPressureMeasurement.includes('Pa') || this.settings.steamPressureMeasurement.includes('bar')) {
      this.convertPressureUnit = 'bara';
    } 
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    this.initChartSetup();
    this.initIsothermTraces();
    this.initVaporQualityTraces();
    this.initDomeAreaTraces();
    if (this.validPlot && this.steamPropertiesOutput !== undefined) {
      this.plotPoint(this.steamPropertiesOutput.pressure, this.steamPropertiesOutput.specificEnthalpy);
    }

    let chartLayout = JSON.parse(JSON.stringify(this.enthalpyChart.layout));
    Plotly.newPlot(this.currentChartId, this.enthalpyChart.data, chartLayout, this.enthalpyChart.config)
    this.save();
  }

  updateChart() {
    if (this.validPlot) {
      this.plotPoint(this.steamPropertiesOutput.pressure, this.steamPropertiesOutput.specificEnthalpy);
    }
    let chartLayout = JSON.parse(JSON.stringify(this.enthalpyChart.layout));
    Plotly.update(this.currentChartId, this.enthalpyChart.data, chartLayout);
    this.save();
  }

  initChartSetup() {
    this.initConvertPressureUnit();
    this.saturatedPropertiesService.initEnthalpyChartData();
    this.enthalpyChart = this.saturatedPropertiesService.enthalpyChart.getValue();
    this.saturatedPropertiesService.setEnthalpyChartConfig(this.settings);
  }
  
  initIsothermTraces() {
    this.checkConvertIsotherms();
    let isotherms: Array<IsothermCoordinates> = this.saturatedPropertiesService.isotherms.getValue();    
    isotherms.forEach((line: IsothermCoordinates) => {
      let trace = this.saturatedPropertiesService.getEmptyTrace();
      trace.x = line.enthalpy;
      trace.y = line.pressure;
      let temperatureUnit = this.saturatedPropertiesService.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      trace.hovertemplate = `Isotherm ${line.temperature} ${temperatureUnit}`;
      this.enthalpyChart.data.push(trace);
    });
  }

  initVaporQualityTraces() {
    let vaporQualities: Array<IsothermCoordinates> = this.saturatedPropertiesService.vaporQualities.getValue();    
    vaporQualities.forEach((line: IsothermCoordinates) => {
      let trace = this.saturatedPropertiesService.getEmptyTrace();
      trace.x = line.enthalpy;
      trace.y = line.pressure;
      trace.hovertemplate = this.saturatedPropertiesService.getHoverTemplate(this.settings.steamSpecificEnthalpyMeasurement, this.settings.steamPressureMeasurement, true);
      this.enthalpyChart.data.push(trace);
    });
  }

  checkConvertIsotherms() {
    if (this.settings.steamSpecificEnthalpyMeasurement !== undefined 
      && this.settings.steamSpecificEnthalpyMeasurement !== this.defaultEnthalpyUnit) {
      this.saturatedPropertiesConversionService.convertIsothermEnthalpy(this.settings, this.defaultEnthalpyUnit);
      this.saturatedPropertiesConversionService.convertVaporQualities(this.defaultEnthalpyUnit, this.settings.steamSpecificEnthalpyMeasurement);
    }
    if (this.settings.steamPressureMeasurement !== undefined 
      && this.settings.steamPressureMeasurement !== this.defaultPressureUnit) {
      this.saturatedPropertiesConversionService.convertIsothermPressure(this.settings, this.defaultPressureUnit, this.convertPressureUnit);
      this.saturatedPropertiesConversionService.convertVaporQualities(this.defaultPressureUnit, this.convertPressureUnit, true);
    }
  }

  initDomeAreaTraces() {
    // Fill in 'Liquid Vapor Dome' area
    let domeFillTrace = this.saturatedPropertiesService.getEmptyTrace();
    domeFillTrace.fill = 'toself';
    domeFillTrace.fillcolor = 'rgba(70,130,180,0.4)';
    domeFillTrace.x = this.saturatedPropertiesService.enthalpy;
    domeFillTrace.y = this.saturatedPropertiesService.pressures;

    // Black dome outline (envelope)
    let domeOutlineTrace = this.saturatedPropertiesService.getEmptyTrace();
    domeOutlineTrace.x = this.saturatedPropertiesService.enthalpy;
    domeOutlineTrace.y = this.saturatedPropertiesService.pressures;
    domeOutlineTrace.line.width = 2;
    domeOutlineTrace.line.color = "#000000";
    domeOutlineTrace.name = "Saturated"
    domeOutlineTrace.hovertemplate = this.saturatedPropertiesService.getHoverTemplate(this.settings.steamSpecificEnthalpyMeasurement, this.settings.steamPressureMeasurement, true);
    
    this.enthalpyChart.data.push(domeFillTrace, domeOutlineTrace);
  }

  plotPoint(pressure: number, enthalpy: number) {
    let convertedPressure = pressure;
    if (this.convertPressureUnit) {
      convertedPressure = this.saturatedPropertiesConversionService.convertVal(pressure, this.settings.steamPressureMeasurement, this.convertPressureUnit);
    }
    let pointTrace = this.saturatedPropertiesService.getPointTrace();
    pointTrace.marker.color = graphColors[0];
    pointTrace.x = [enthalpy];
    pointTrace.y = [convertedPressure];
    pointTrace.hovertemplate = this.saturatedPropertiesService.getHoverTemplate(this.settings.steamSpecificEnthalpyMeasurement, this.settings.steamPressureMeasurement, true);

    if (this.enthalpyChart.existingPoint) {
      this.enthalpyChart.data[this.enthalpyChart.data.length - 1] = pointTrace;
    } else {
      this.enthalpyChart.data.push(pointTrace);
      this.enthalpyChart.existingPoint = true;
    }
  }

  removePointTrace() {
    this.enthalpyChart.data.splice(this.enthalpyChart.data.length - 1, 1);
    this.enthalpyChart.existingPoint = false;
    let chartLayout = JSON.parse(JSON.stringify(this.enthalpyChart.layout));
    Plotly.update(this.currentChartId, this.enthalpyChart.data, chartLayout);
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
    let showingGridX: boolean = this.enthalpyChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.enthalpyChart.layout.yaxis.showgrid;
    this.enthalpyChart.layout.xaxis.showgrid = !showingGridX;
    this.enthalpyChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }

}
