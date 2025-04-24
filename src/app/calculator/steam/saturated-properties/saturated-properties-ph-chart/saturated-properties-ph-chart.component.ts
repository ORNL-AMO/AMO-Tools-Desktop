import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, HostListener, OnChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SimpleChart } from '../../../../shared/models/plotting';
import { SaturatedPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { SaturatedPropertiesConversionService } from '../../saturated-properties-conversion.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { SaturatedPropertiesService, IsothermCoordinates } from '../../saturated-properties.service';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-saturated-properties-ph-chart',
    templateUrl: './saturated-properties-ph-chart.component.html',
    styleUrls: ['./saturated-properties-ph-chart.component.css'],
    standalone: false
})
export class SaturatedPropertiesPhChartComponent implements OnInit, OnChanges {
  @Input()
  settings: Settings;
  @Input()
  saturatedPropertiesOutput: SaturatedPropertiesOutput;
  @Input()
  validPlot: boolean;
  @Input()
  toggleReset: boolean;

  // DOM
  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;

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

  constructor(private saturatedPropertiesService: SaturatedPropertiesService,
    private saturatedPropertiesConversionService: SaturatedPropertiesConversionService,
    private plotlyService: PlotlyService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.triggerInitialResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saturatedPropertiesOutput && !changes.toggleReset && !changes.saturatedPropertiesOutput.firstChange) {
      if (this.validPlot && this.saturatedPropertiesOutput !== undefined) {
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
    this.initChartSetup();
    this.initIsothermTraces();
    this.initVaporQualityTraces();
    this.initDomeAreaTraces();
    if (this.validPlot && this.saturatedPropertiesOutput !== undefined) {
      this.plotSegment();
    }

    let chartLayout = JSON.parse(JSON.stringify(this.enthalpyChart.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.enthalpyChart.data, chartLayout, this.enthalpyChart.config)
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.enthalpyChart.data, chartLayout, this.enthalpyChart.config)
    }
    this.save();
  }

  updateChart() {
    if (this.validPlot) {
      this.plotSegment();
    }
    let chartLayout = JSON.parse(JSON.stringify(this.enthalpyChart.layout));
    if (this.expanded) {
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.enthalpyChart.data, chartLayout);
    } else {
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.enthalpyChart.data, chartLayout);
    }
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

  plotSegment() {
    let liquidEnthalpy = this.saturatedPropertiesOutput.liquidEnthalpy;
    let gasEnthalpy = this.saturatedPropertiesOutput.gasEnthalpy;

    let convertedPressure = this.saturatedPropertiesOutput.saturatedPressure;
    if (this.convertPressureUnit) {
      convertedPressure = this.saturatedPropertiesConversionService.convertVal(convertedPressure, this.settings.steamPressureMeasurement, this.convertPressureUnit);
    }

    let x = [liquidEnthalpy, gasEnthalpy];
    let y = [convertedPressure, convertedPressure];
    let lineTrace = this.saturatedPropertiesService.getLineTrace(x, y);
    lineTrace.marker.color = graphColors[0];
    lineTrace.marker.line.color = graphColors[0];
    lineTrace.hovertemplate = this.saturatedPropertiesService.getHoverTemplate(this.settings.steamSpecificEntropyMeasurement, this.settings.steamTemperatureMeasurement, true);

    if (this.enthalpyChart.existingPoint) {
      this.enthalpyChart.data[this.enthalpyChart.data.length - 1] = lineTrace;
    } else {
      this.enthalpyChart.data.push(lineTrace);
      this.enthalpyChart.existingPoint = true;
    }
  }

  removePointTrace() {
    this.enthalpyChart.data.splice(this.enthalpyChart.data.length - 1, 1);
    this.enthalpyChart.existingPoint = false;
    let chartLayout = JSON.parse(JSON.stringify(this.enthalpyChart.layout));
    if (this.expanded) {
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.enthalpyChart.data, chartLayout);
    } else {
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.enthalpyChart.data, chartLayout);
    }
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

  toggleGrid() {
    let showingGridX: boolean = this.enthalpyChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.enthalpyChart.layout.yaxis.showgrid;
    this.enthalpyChart.layout.xaxis.showgrid = !showingGridX;
    this.enthalpyChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }

}
