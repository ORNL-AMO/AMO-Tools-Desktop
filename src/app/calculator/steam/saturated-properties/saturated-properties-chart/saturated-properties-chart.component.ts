import { Component, Input, ViewChild, ElementRef, HostListener, SimpleChanges, OnChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SaturatedPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { SimpleChart } from '../../../../shared/models/plotting';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { SaturatedPropertiesService, IsobarCoordinates } from '../../saturated-properties.service';
import { SaturatedPropertiesConversionService } from '../../saturated-properties-conversion.service';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-saturated-properties-chart',
    templateUrl: './saturated-properties-chart.component.html',
    styleUrls: ['./saturated-properties-chart.component.css'],
    standalone: false
})
export class SaturatedPropertiesChartComponent implements OnChanges {

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

  entropyChart: SimpleChart;
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

  constructor(private saturatedPropertiesService: SaturatedPropertiesService,
    private saturatedPropertiesConversionService: SaturatedPropertiesConversionService,
    private plotlyService: PlotlyService) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.saturatedPropertiesOutput && !changes.toggleReset && !changes.saturatedPropertiesOutput.firstChange) {
      if (this.validPlot && this.saturatedPropertiesOutput !== undefined) {
        this.updateChart();
      }
    } else if (changes.toggleReset && !changes.toggleReset.firstChange) {
      if (this.entropyChart.existingPoint) {
        this.removePointTrace();
      }
    }
    else {
      this.initRenderChart();
    }
  }
  
  ngAfterViewInit(){
    this.initRenderChart();
  }

  save() {
    this.saturatedPropertiesService.entropyChart.next(this.entropyChart);
  }

  initRenderChart() {

    this.initChartSetup();
    this.initIsobarTraces();
    this.initDomeAreaTraces();
    if (this.validPlot && this.saturatedPropertiesOutput !== undefined) {
      this.plotSegment();
    }

    let chartLayout = JSON.parse(JSON.stringify(this.entropyChart.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.entropyChart.data, chartLayout, this.entropyChart.config)
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.entropyChart.data, chartLayout, this.entropyChart.config)
    }
    this.save();
  }

  updateChart() {
    if (this.validPlot) {
      this.plotSegment();
    }
    let chartLayout = JSON.parse(JSON.stringify(this.entropyChart.layout));
    if (this.expanded) {
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.entropyChart.data, chartLayout);
    } else {
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.entropyChart.data, chartLayout);
    }
    this.save();
  }

  initChartSetup() {
    this.saturatedPropertiesService.initEntropyChartData();
    this.entropyChart = this.saturatedPropertiesService.entropyChart.getValue();
    this.saturatedPropertiesService.setEntropyChartConfig(this.settings);
  }

  initIsobarTraces() {
    this.checkConvertIsobars();
    let isobars: Array<IsobarCoordinates> = this.saturatedPropertiesService.isobars.getValue();
    isobars.forEach((line: IsobarCoordinates) => {
      let trace = this.saturatedPropertiesService.getEmptyTrace();
      trace.x = line.entropy;
      trace.y = line.temp;
      trace.hovertemplate = `Isobar ${line.pressureValue} ${this.settings.steamPressureMeasurement}`;
      this.entropyChart.data.push(trace);
    });
  }

  checkConvertIsobars() {
    if (this.settings.steamSpecificEntropyMeasurement !== undefined
      && this.settings.steamSpecificEntropyMeasurement !== this.defaultEntropyUnit) {
      this.saturatedPropertiesConversionService.convertIsobarEntropy(this.settings, this.defaultEntropyUnit);
    }
    if (this.settings.steamTemperatureMeasurement !== undefined
      && this.settings.steamTemperatureMeasurement !== this.defaultTempUnit) {
      this.saturatedPropertiesConversionService.convertIsobarTemperature(this.settings, this.defaultTempUnit);
    }
    if (this.settings.steamPressureMeasurement !== undefined
      && this.settings.steamPressureMeasurement !== this.defaultPressureUnit) {
      this.saturatedPropertiesConversionService.convertIsobarPressure(this.settings, this.defaultPressureUnit);
    }
  }

  initDomeAreaTraces() {
    // Fill in 'Liquid Vapor Dome' area
    let domeFillTrace = this.saturatedPropertiesService.getEmptyTrace();
    domeFillTrace.fill = 'tozeroy';
    domeFillTrace.fillcolor = 'rgba(70,130,180,0.4)';
    domeFillTrace.x = this.saturatedPropertiesService.entropy;
    domeFillTrace.y = this.saturatedPropertiesService.temperatures;

    // Black dome outline (envelope)
    let domeOutlineTrace = this.saturatedPropertiesService.getEmptyTrace();
    domeOutlineTrace.x = this.saturatedPropertiesService.entropy;
    domeOutlineTrace.y = this.saturatedPropertiesService.temperatures;
    domeOutlineTrace.line.width = 2;
    domeOutlineTrace.line.color = "#000000";
    domeOutlineTrace.name = "Saturated";
    domeOutlineTrace.hovertemplate = this.saturatedPropertiesService.getHoverTemplate(this.settings.steamSpecificEntropyMeasurement, this.settings.steamTemperatureMeasurement, true);

    this.entropyChart.data.push(domeFillTrace, domeOutlineTrace);
  }

  plotSegment() {
    let x = [this.saturatedPropertiesOutput.liquidEntropy, this.saturatedPropertiesOutput.gasEntropy];
    let y = [this.saturatedPropertiesOutput.saturatedTemperature, this.saturatedPropertiesOutput.saturatedTemperature];
    let lineTrace = this.saturatedPropertiesService.getLineTrace(x, y);
    lineTrace.marker.color = graphColors[0];
    lineTrace.marker.line.color = graphColors[0];
    lineTrace.hovertemplate = this.saturatedPropertiesService.getHoverTemplate(this.settings.steamSpecificEntropyMeasurement, this.settings.steamTemperatureMeasurement, true);

    if (this.entropyChart.existingPoint) {
      this.entropyChart.data[this.entropyChart.data.length - 1] = lineTrace;
    } else {
      this.entropyChart.data.push(lineTrace);
      this.entropyChart.existingPoint = true;
    }
  }

  removePointTrace() {
    this.entropyChart.data.splice(this.entropyChart.data.length - 1, 1);
    this.entropyChart.existingPoint = false;
    let chartLayout = JSON.parse(JSON.stringify(this.entropyChart.layout));
    if (this.expanded) {
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.entropyChart.data, chartLayout);
    } else {
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.entropyChart.data, chartLayout);
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
    let showingGridX: boolean = this.entropyChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.entropyChart.layout.yaxis.showgrid;
    this.entropyChart.layout.xaxis.showgrid = !showingGridX;
    this.entropyChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }


}
