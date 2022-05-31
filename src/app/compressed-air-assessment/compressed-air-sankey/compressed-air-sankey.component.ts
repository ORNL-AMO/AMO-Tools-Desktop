import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';

import { CompressedAirSankeyNode, CompressedAirSankeyResults, CompressedAirSankeyService, SankeySystemInputs } from './compressed-air-sankey.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { CompressedAirAssessment, CompressedAirDayType, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';


@Component({
  selector: 'app-compressed-air-sankey',
  templateUrl: './compressed-air-sankey.component.html',
  styleUrls: ['./compressed-air-sankey.component.css']
})
export class CompressedAirSankeyComponent implements OnInit {
  @Input()
  appBackground: boolean = true;
  @Input()
  printView: boolean;

  @ViewChild("ngChart", { static: false }) 
  ngChart: ElementRef;
  
  labelStyle: string;
  settings: Settings;
  results;
  links: Array<{ source: number, target: number }>;
  nodes: Array<CompressedAirSankeyNode> = [];
  powerSankeyInputs: SankeySystemInputs = {
    ambientAirTemperature: undefined,
    CFMLeakSystem: undefined,
    selectedDayTypeId: undefined,
  };

  powerSankeyInputForm: FormGroup;

  gradientStartColorPurple: string = 'rgba(112, 48, 160, .85)';
  gradientEndColorPurple: string = 'rgb(187, 142, 221)';


  connectingNodes: Array<number>;
  gradientLinkPaths: Array<number>;
  minLosses: Array<string> = [];
  units: string = 'kW';

  // node/link not rendered or too small to see
  minPlotlyDisplayValue = .2;
  hasLowPressureVentLoss: boolean;
  compressedAirAssessment: CompressedAirAssessment;
  compressedAirAssessmentSub: Subscription;
  sankeyResults: CompressedAirSankeyResults;

  compressedAirAssessmentOptions: Array<SankeyOption>;
  selectedSankeyOption: SankeyOption;
  showSankeyLabelOptions: boolean;
  sankeyLabelStyle: string = 'both';

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private compressedAirSankeyService: CompressedAirSankeyService,
    private resultsService: CompressedAirAssessmentResultsService,
    private plotlyService: PlotlyService
  ) { }

  ngOnInit() {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.initForm();
    this.initSankeyList();
  }

  ngAfterViewInit() {
    this.renderSankey();
  }

  ngOnChanges() {
    this.renderSankey();
  }

  focusField() {}

  saveUserInputChange() {
    let powerSankeyInputs: SankeySystemInputs = this.compressedAirSankeyService.getPowerSankeyInputs(this.powerSankeyInputForm);
    let baselineResults: BaselineResults = this.getBaselineResults(powerSankeyInputs.selectedDayTypeId);
    this.powerSankeyInputForm = this.compressedAirSankeyService.setSankeyInputValidators(this.powerSankeyInputForm, baselineResults, this.settings);
    this.compressedAirAssessment.powerSankeyInputs = powerSankeyInputs;
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
    this.renderSankey();
  }

  initForm() {
    let selectedDayTypeId: string = this.compressedAirAssessment.compressedAirDayTypes[0].dayTypeId;
    if (this.compressedAirAssessment.powerSankeyInputs) {
      selectedDayTypeId = this.compressedAirAssessment.powerSankeyInputs.selectedDayTypeId;
      let baselineResults: BaselineResults = this.getBaselineResults(selectedDayTypeId);
      this.powerSankeyInputForm = this.compressedAirSankeyService.getPowerSankeyForm(this.compressedAirAssessment.powerSankeyInputs, baselineResults, this.settings);
    } else {
      let baselineResults: BaselineResults = this.getBaselineResults(selectedDayTypeId);
      this.powerSankeyInputForm = this.compressedAirSankeyService.getEmptyForm(baselineResults, selectedDayTypeId, this.settings);
      this.compressedAirAssessment.powerSankeyInputs = this.compressedAirSankeyService.getPowerSankeyInputs(this.powerSankeyInputForm);
    }
  }

  getBaselineResults(selectedDayTypeId: string) {
    let dayTypeProfileSummaries: Array<{dayTypeId: string, profileSummary: Array<ProfileSummary>}> = [];
    let selectedDayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => dayType.dayTypeId === selectedDayTypeId);
    let baselineProfileSummaries: Array<ProfileSummary> = this.resultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, selectedDayType, this.settings);
    dayTypeProfileSummaries.push(
      {
        dayTypeId: selectedDayType.dayTypeId,
        profileSummary: baselineProfileSummaries
      }
    )
    return this.resultsService.calculateBaselineResults(this.compressedAirAssessment, this.settings, undefined);
  }

  initSankeyList() {
    this.compressedAirAssessmentOptions = new Array<{ name: string, compressedAirAssessment: CompressedAirAssessment }>();
    this.compressedAirAssessmentOptions.push({ name: 'Baseline', compressedAirAssessment: this.compressedAirAssessment });
    this.selectedSankeyOption = this.compressedAirAssessmentOptions[0];
    this.showSankeyLabelOptions = ((this.selectedSankeyOption.compressedAirAssessment.name == 'Baseline' || this.selectedSankeyOption.compressedAirAssessment.name == 'Baseline' == null) && this.selectedSankeyOption.compressedAirAssessment.setupDone);
  }

  setSankeyLabelStyle(style: string) {
    this.sankeyLabelStyle = style;
    this.renderSankey();
  }


  renderSankey() {
    this.nodes = [];
    this.connectingNodes = [];
    this.minLosses = [];
    
    if (this.compressedAirAssessment && this.compressedAirAssessment.setupDone && this.powerSankeyInputForm.valid) {
      this.sankeyResults = this.compressedAirSankeyService.getSankeyResults(this.compressedAirAssessment, undefined, this.settings);
      this.gradientLinkPaths = [3,4,6,7];
      this.buildNodes();
    }
    
    this.links = [
      { source: 0, target: 1},
      { source: 0, target: 2},
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 },
      { source: 2, target: 5 },
      { source: 5, target: 6 },
      { source: 5, target: 7 }
    ];

    let sankeyLink = {
      value: this.nodes.map(node => node.value),
      source: this.links.map(link => link.source),
      target: this.links.map(link => link.target),
      hoverinfo: 'none',
      line: {
        color: this.gradientStartColorPurple,
        width: 0
      },
    };

    let sankeyData = {
      type: "sankey",
      orientation: "h",
      valuesuffix: "%",
      ids: this.nodes.map(node => node.id),
      textfont: {
        color: 'rgba(0, 0, 0)',
        size: 14
      },
      arrangement: 'freeform',
      node: {
        pad: 50,
        line: {
          color: this.gradientStartColorPurple,
        },
        label: this.nodes.map(node => node.name),
        x: this.nodes.map(node => node.x),
        y: this.nodes.map(node => node.y),
        color: this.nodes.map(node => node.nodeColor),
        hoverinfo: 'all',
        hovertemplate: '%{value}<extra></extra>',
        hoverlabel: {
          font: {
            size: 14,
            color: 'rgba(255, 255, 255)'
          },
          align: 'auto',
        },
        showgrid: false,
      },
      link: sankeyLink
    };

    let layout = {
      autosize: true,
      height: 500,
      paper_bgcolor: undefined,
      plot_bgcolor: undefined,
      margin: {
        l: 50,
        t: 25,
      },
      xaxis: {
        showgrid: false,
        showticklabels:false,
        showline:false,
      },
      yaxis: {
        showgrid: false,
        showticklabels:false,
        showline:false,
      },
    };

    if (this.appBackground) {
      layout.paper_bgcolor = 'ececec';
      layout.plot_bgcolor = 'ececec';
    }

    let config = {
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
      responsive: true,
      displayModeBar: true,
      displaylogo: true
    };
    if (this.printView) {
        config.displaylogo = false;
        config.displayModeBar = false;
        config.responsive = false
    }

    this.plotlyService.newPlot(this.ngChart.nativeElement, [sankeyData], layout, config)
    .then(chart => {
      this.addGradientElement();
      this.buildSvgArrows();
      chart.on('plotly_restyle', () => {
        this.setGradient();
      });
      chart.on('plotly_afterplot', () => {
        this.setGradient();
      });
      chart.on('plotly_hover', () => {
        this.setGradient();
      });
      chart.on('plotly_unhover', () => {
        this.setGradient();
      });
      chart.on('plotly_relayout', () => {
        this.setGradient();
      });
    });
  }

  buildNodes() {
    let originConnectorValue: number = this.sankeyResults.kWInSystem - this.sankeyResults.kWMechSystem;
    let originConnectorPercentage: number = (originConnectorValue / this.sankeyResults.kWInSystem) * 100;
    let secondaryConnectorValue: number = originConnectorValue - this.sankeyResults.kWHeatOfcompressionSystem;
    let secondaryConnectorPercentage: number = (secondaryConnectorValue / this.sankeyResults.kWInSystem) * 100;
    this.connectingNodes = [0,1,2,5];
    
    let kWMechPercentage = (this.sankeyResults.kWMechSystem / this.sankeyResults.kWInSystem) * 100;
    let kwHocSysPercentage = (this.sankeyResults.kWHeatOfcompressionSystem / this.sankeyResults.kWInSystem) * 100;
    let kwLeakSysPercentage = (this.sankeyResults.kWLeakSystem / this.sankeyResults.kWInSystem) * 100;
    let kwAirSysPercentage = (this.sankeyResults.kWAirSystem / this.sankeyResults.kWInSystem) * 100;
    this.checkHasMinimumDisplayableEnergy("Motor and Drive Efficiency", this.sankeyResults.kWMechSystem, kWMechPercentage);
    this.checkHasMinimumDisplayableEnergy("Heat of Compression", this.sankeyResults.kWHeatOfcompressionSystem, kwHocSysPercentage);
    this.checkHasMinimumDisplayableEnergy("System Leakage", this.sankeyResults.kWLeakSystem, kwLeakSysPercentage);
    this.checkHasMinimumDisplayableEnergy("Productive Use", this.sankeyResults.kWAirSystem, kwAirSysPercentage);

    // console.log('originConnectorPercentage', originConnectorPercentage);
    // console.log('secondaryConnectorPercentage', secondaryConnectorPercentage);
    // console.log('kWMechPercentage', kWMechPercentage);
    // console.log('kwHocSysPercentage', kwHocSysPercentage);
    // console.log('kwLeakSysPercentage', kwLeakSysPercentage);
    // console.log('kwAirSysPercentage', kwAirSysPercentage);

    let diff = this.sankeyResults.kWInSystem - this.sankeyResults.kWMechSystem - this.sankeyResults.kWHeatOfcompressionSystem - this.sankeyResults.kWLeakSystem - this.sankeyResults.kWAirSystem;
    // console.log('diff vs kWin system', diff);
    this.nodes = [
      {
        name: this.getNameLabel("Energy Input", this.sankeyResults.kWInSystem, 100),
        value: 100,
        x: .1,
        y: .6,
        source: 0,
        loss: this.sankeyResults.kWInSystem,
        target: [1,2],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'originalInputConnector'
      },
      {
        name: "",
        value: 0,
        x: .4,
        y: .6,
        source: 1,
        loss: this.sankeyResults.kWInSystem,
        target: [2, 3],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'inputConnector'
      },
      {
        name: "",
        value: originConnectorPercentage,
        x: .475,
        y: .625,
        source: 2,
        loss:  originConnectorValue,
        target: [4, 5],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'originConnector'
      },
      {
        name: this.getNameLabel("Motor and Drive Efficiency", this.sankeyResults.kWMechSystem, kWMechPercentage),
        value: kWMechPercentage,
        x: .5,
        y: .10,
        source: 3,
        loss: this.sankeyResults.kWMechSystem,
        target: [],
        isConnector: false,
        nodeColor: this.gradientEndColorPurple,
        id: 'kW_mech_sys'
      },
      {
        name: this.getNameLabel("Heat of Compression", this.sankeyResults.kWHeatOfcompressionSystem, kwHocSysPercentage),
        value: kwHocSysPercentage,
        x: .6,
        y: .5,
        source: 4,
        loss: this.sankeyResults.kWHeatOfcompressionSystem,
        target: [],
        isConnector: false,
        nodeColor: this.gradientEndColorPurple,
        id: 'kW_hoc_sys'
      },
      {
        name: "",
        value: secondaryConnectorPercentage,
        x: .55,
        y: .9,
        source: 5,
        loss: secondaryConnectorValue,
        target: [6, 7],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'secondaryConnector'
      },
      {
        name: this.getNameLabel("System Leakage", this.sankeyResults.kWLeakSystem, kwLeakSysPercentage),
        value: kwLeakSysPercentage,
        x: .8,
        y: .7,
        source: 6,
        target: [],
        loss: this.sankeyResults.kWLeakSystem,
        isConnector: false,
        nodeColor: this.gradientEndColorPurple,
        id: 'kW_leak_sys'
      },
      {
        name: this.getNameLabel("Productive Use", this.sankeyResults.kWAirSystem, kwAirSysPercentage),
        value: kwAirSysPercentage,
        x: .85,
        y: .9,
        source: 7,
        loss: this.sankeyResults.kWAirSystem,
        target: [],
        isConnector: false,
        nodeColor: this.gradientEndColorPurple,
        id: 'kW_air_sys'
      }
    ];
  }

  checkHasMinimumDisplayableEnergy(name: string, loss: number, lossValue: number) {
    if (lossValue <= this.minPlotlyDisplayValue) {
      this.minLosses.push(this.getNameLabel(name, loss, lossValue, '1.0-4'));
      this.cd.detectChanges();
    }
  }

  getNameLabel(lossName: string, loss: number, lossValue: number, decimalPlaces?: string) {
    let nameLabel: string;
    if (!decimalPlaces) {
      decimalPlaces = '1.0-0';
    }
    if (this.sankeyLabelStyle == 'both') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, decimalPlaces)} ${this.units} (${this.decimalPipe.transform(lossValue, decimalPlaces)}%)`
    } else if (this.sankeyLabelStyle == 'energy') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, decimalPlaces)} ${this.units}`
    } else {
      nameLabel = `${lossName} ${this.decimalPipe.transform(lossValue, decimalPlaces)}%`
    }
    return nameLabel;
  }

  setGradient() {
    let links = this._dom.nativeElement.querySelectorAll('.sankey-link');
    let nodes = this._dom.nativeElement.querySelectorAll('.sankey-node');
    let fillOpacity = 1;
    let fill: string;

    for (let i = 0; i < links.length; i++) {
      if (this.gradientLinkPaths.includes(i + 1)) {
        fill = 'url(#compressedAirGradientPurple) !important';
      }  else {
        fill = `${this.gradientStartColorPurple} !important`;
      }
    
      links[i].setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: ${fillOpacity};`);
      
      if (i == this.nodes.length - 1) {
        this.setNodeLabelSpacing(nodes[i]);
      }
    }
  }


  addGradientElement(): void {
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="compressedAirGradientPurple">
      <stop offset="10%" stop-color="${this.gradientStartColorPurple}" />
      <stop offset="100%" stop-color="${this.gradientEndColorPurple}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);
  }

  buildSvgArrows() {
    this.setGradient();
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect');
    const arrowOpacity = '0.9';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'


    for (let i = 0; i < rects.length; i++) {
      if (!this.connectingNodes.includes(i)) {
        const height = rects[i].getAttribute('height');
        const defaultY = rects[i].getAttribute('y');
        
        let width = height;
        let verticalAlignment: number = 2.75;
        let sizingRatio: number = 1.75;
        if (Number(height) > this.sankeyResults.kWInSystem / 2) {
          width = height * .8;
          sizingRatio = sizingRatio * .7;
          verticalAlignment = verticalAlignment / .3;
        }
        rects[i].setAttribute('y', `${defaultY - (height / verticalAlignment)}`);
        rects[i].setAttribute('style', `width: ${width}px; height: ${height * sizingRatio}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientEndColorPurple}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }

  setNodeLabelSpacing(nodeLabel) {
    let labelText = nodeLabel.querySelector('.node-label-text-path');
    labelText.setAttribute('startOffset', '3%');
  }

}

export interface SankeyOption {
  name: string, 
  compressedAirAssessment: CompressedAirAssessment,
};