import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, EndUse, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { EndUseEnergyData } from '../../end-uses/end-uses.service';
import { AirflowSankeyService, CompressedAirSankeyNode, AirFlowSankeyResults, AirFlowSankeyInputs } from './airflow-sankey.service';

@Component({
  selector: 'app-airflow-sankey',
  templateUrl: './airflow-sankey.component.html',
  styleUrls: ['./airflow-sankey.component.css']
})
export class AirflowSankeyComponent implements OnInit {

  @Input()
  appBackground: boolean = true;
  @Input()
  printView: boolean;

  @ViewChild("airflowChart", { static: false }) 
  ngChart: ElementRef;
  
  labelStyle: string;
  settings: Settings;
  nodes: Array<CompressedAirSankeyNode> = [];
  links: Array<{source: number, target: number}>;
  // = [
  //   { source: 0, target: 1 },
  //   { source: 0, target: 2 },
  //   { source: 1, target: 2 },
  //   { source: 1, target: 3 },
  //   { source: 2, target: 4 },
  //   { source: 2, target: 5 },
  //   { source: 5, target: 6 },
  //   { source: 5, target: 7 }
  // ];
  airFlowSankeyInputs: AirFlowSankeyInputs = {
    selectedDayTypeId: undefined,
    dayTypeLeakRates: []
  };
  // airFlowSankeyForm: FormGroup;

  gradientStartColorPurple: string = 'rgba(112, 48, 160, .85)';
  gradientEndColorPurple: string = 'rgb(187, 142, 221)';
  connectingNodes: Array<number>;
  gradientLinkPaths: Array<number>;
  minFlowes: Array<string> = [];
  units: string = 'acfm';

  // node/link not rendered or too small to see
  minPlotlyDisplayValue = .2;
  hasLowPressureVentFlow: boolean;
  
  compressedAirAssessment: CompressedAirAssessment;
  compressedAirAssessmentSub: Subscription;
  airFlowSankeyResults: AirFlowSankeyResults;

  compressedAirAssessmentOptions: Array<SankeyOption>;
  selectedSankeyOption: SankeyOption;
  showSankeyLabelOptions: boolean;
  sankeyLabelStyle: string = 'both';
  profileDataComplete: boolean = true;
  baselineResults: BaselineResults;

  dayTypeBaselineProfileSummaries: Array<{dayTypeId: string, profileSummary: Array<ProfileSummary>}>;
  selectedDayTypeId: string;
  dayTypeLeakRate: number;
  hasValidLeakRate: boolean = true;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private airflowSankeyService: AirflowSankeyService,
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

  saveDayTypeLeakRate() {
    this.hasValidLeakRate = this.dayTypeLeakRate === undefined;
    // this.dayTypeBaselineProfileSummaries = this.getDayTypeProfileSummaries();
    // this.baselineResults = this.resultsService.calculateBaselineResults(this.compressedAirAssessment, this.settings, this.dayTypeBaselineProfileSummaries);
    this.compressedAirAssessment.airFlowSankeyInputs.selectedDayTypeId = this.selectedDayTypeId;
      this.compressedAirAssessment.airFlowSankeyInputs.dayTypeLeakRates.map(dayTypeLeakRate => {
      if (dayTypeLeakRate.dayTypeId === this.selectedDayTypeId) {
        dayTypeLeakRate.dayTypeLeakRate = this.dayTypeLeakRate
      }
    })
    debugger;
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
    this.renderSankey();
  }

  initForm() {
    // this.dayTypeBaselineProfileSummaries = this.getDayTypeProfileSummaries();
    // this.baselineResults = this.resultsService.calculateBaselineResults(this.compressedAirAssessment, this.settings, this.dayTypeBaselineProfileSummaries);
    if (this.compressedAirAssessment.airFlowSankeyInputs.dayTypeLeakRates.length > 0) {
      this.selectedDayTypeId = this.compressedAirAssessment.airFlowSankeyInputs.selectedDayTypeId;
      this.dayTypeLeakRate =  this.compressedAirAssessment.airFlowSankeyInputs.dayTypeLeakRates.find(input => input.dayTypeId === this.selectedDayTypeId).dayTypeLeakRate;
      this.hasValidLeakRate = this.dayTypeLeakRate !== undefined;
    } else {
      this.selectedDayTypeId = this.compressedAirAssessment.compressedAirDayTypes[0].dayTypeId;
      this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        this.compressedAirAssessment.airFlowSankeyInputs.dayTypeLeakRates.push(
          {dayTypeId: dayType.dayTypeId, dayTypeLeakRate: undefined}
        )
      });
      console.log(this.compressedAirAssessment.airFlowSankeyInputs);
      this.hasValidLeakRate = false;
      // move to assessment init
      this.compressedAirAssessment.airFlowSankeyInputs = this.airFlowSankeyInputs;
    }
    console.log(this.hasValidLeakRate)
  }


  renderSankey() {
    this.nodes = [];
    this.connectingNodes = [];
    this.minFlowes = [];
    
    let canRenderSankey: boolean = this.compressedAirAssessment && this.compressedAirAssessment.setupDone && this.profileDataComplete && this.hasValidLeakRate;
    if (canRenderSankey) {
      this.airFlowSankeyResults = this.airflowSankeyService.getAirFlowSankeyResults(this.compressedAirAssessment, this.selectedDayTypeId, this.settings);
      if (!this.airFlowSankeyResults.warnings.CFMWarning) {
        this.buildNodes();
        this.buildLinks();
      }
    }
    console.log('nodes', this.nodes)
    console.log('links', this.links)
    this.cd.detectChanges();

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

  buildLinks() {
    // this.links = [
    //     { source: 0, target: 1 },
    //     { source: 0, target: 2 },
    //     { source: 1, target: 2 },
    //     { source: 1, target: 3 },
    //     { source: 1, target: 4 },
    //   ];
    this.connectingNodes = [];
    this.links = [];
    // for (let i = 0; i < this.nodes.length; i++) {
    //   if (this.nodes[i].isConnector) {
    //     this.connectingNodes.push(i);
    //   }

    //   for (let j = 0; j < this.nodes[i].target.length; j++) {
    //     // if (this.nodes[i].isConnector) {
    //       if (this.nodes[i].source) {
    //         debugger;
    //       }
    //       this.links.push(
    //         {
    //           source: this.nodes[i].source,
    //           target: this.nodes[i].target[j]
    //         }
    //       )
    //     // }
    //   }
    // }

    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].isConnector) {
        this.connectingNodes.push(i);
      }
    }
    
    debugger;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.nodes[i].target.length; j++) {
          if (this.nodes[i].source) {
            debugger;
          }
          this.links.push(
            {
              source: this.nodes[i].source,
              target: this.nodes[i].target[j]
            }
          )
      }
    }
  }

  buildNodes() {
    // let originConnectorValue: number = this.airFlowSankeyResults.totalEndUseAirflow - this.airFlowSankeyResults.kWMechSystem;
    // let originConnectorPercentage: number = (originConnectorValue / this.airFlowSankeyResults.kWInSystem) * 100;
    // let secondaryConnectorValue: number = originConnectorValue - this.airFlowSankeyResults.kWHeatOfcompressionSystem;
    // let secondaryConnectorPercentage: number = (secondaryConnectorValue / this.airFlowSankeyResults.kWInSystem) * 100;
    // this.connectingNodes = [0,1,2,5];

    
    // this.connectingNodes = [0,1];
    let originConnectorFlow: number = this.airFlowSankeyResults.totalEndUseAirflow;
    let totalEndUseAirflow: number = originConnectorFlow;
    let originConnectorValue: number = 100;

    let flowNodeYPositions: Array<number> = [.1, .9, .2, .8, .15, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8];
    let flowNodeXPosition: number = .5;
    let offsetYPlacementIndex: number = 0;

    this.gradientLinkPaths = [];
    // let endUseTargets: Array<number> = []; 
    this.nodes.unshift(
      {
        name: this.getNameLabel("0", originConnectorValue, 100),
        value: originConnectorValue,
        x: .1,
        y: .6,
        source: 0,
        flow: originConnectorFlow,
        target: [1, 2],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'originalInputConnector'
      },
      {
        name: `1`,
        value: 0,
        x: .3,
        y: .6,
        source: 1,
        flow: originConnectorFlow,
        target: [2, 3],
        // target: _.range(2, this.airFlowSankeyResults.endUseEnergyData.length + 2),
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'inputConnector'
      },
    );

    this.airFlowSankeyResults.endUseEnergyData.forEach((endUse, index) => {
      let endUseFlowValue: number = (endUse.dayTypeAverageAirFlow / totalEndUseAirflow) * 100;
      this.checkHasMinimumDisplayableEnergy(endUse.endUseName + 1, endUse.dayTypeAverageAirFlow, endUseFlowValue)
      
      // offset count by the 2 origin connector nodes
      let offsetIndex = index + 2;
      let connectorId = `connector_${endUse.endUseId}`;
      let previousEndUseNodes = this.nodes.slice(-2);
      let connector: number = (previousEndUseNodes[1].flow - endUse.dayTypeAverageAirFlow);
      let connectorValue: number = (connector / totalEndUseAirflow) * 100;

      // if (offsetIndex === 2) {
      //   let nextEndUse: EndUseEnergyData = this.airFlowSankeyResults.endUseEnergyData[index + 1];
      //   // connectorValue = previousEndUseNodes[1].flow - endUse.dayTypeAverageAirFlow - nextEndUse.dayTypeAverageAirFlow;
      // }

      console.log('endUseFlow: ', endUse.dayTypeAverageAirFlow);
      console.log('endUseFlowValue: ', endUseFlowValue);
      console.log('connector: ', connector);
      console.log('connectorValue: ', connectorValue);
      this.nodes.push({
        name: this.getNameLabel(`src: ${offsetIndex}`, endUse.dayTypeAverageAirFlow, endUseFlowValue),
        // name: this.getNameLabel(`src: ${offsetIndex}  ${endUse.endUseName}`, endUse.dayTypeAverageAirFlow, endUseFlowValue),
        value: endUseFlowValue,
        x: flowNodeXPosition,
        y: flowNodeYPositions[offsetYPlacementIndex],
        source: offsetIndex,
        flow: endUse.dayTypeAverageAirFlow,
        target: [],
        isConnector: false,
        nodeColor: this.gradientEndColorPurple,
        id: endUse.endUseId
      });

      this.nodes.push({
          name: `src: ${offsetIndex} connector`,
          value: connectorValue,
          x: flowNodeXPosition - .05,
          y: .6,
          source: offsetIndex + 1,
          flow: connector,
          target: [offsetIndex + 3],
          isConnector: true,
          nodeColor: this.gradientStartColorPurple,
          id: connectorId
        });

      flowNodeXPosition += .05;
      offsetYPlacementIndex++;
      this.gradientLinkPaths.push(offsetIndex);
      // endUseTargets.push(indexOffset);
      originConnectorValue -= endUse.dayTypeAverageAirFlow;
    });


    this.nodes[0].source = 0;
    this.nodes[0].target = [1,2];

    this.nodes[1].source = 1;
    this.nodes[1].target = [2,3];

    this.nodes[2].source = 2;
    this.nodes[2].target = [];
    this.nodes[3].source = 3;
    this.nodes[3].target = [4,5];
    
    this.nodes[4].source = 4;
    this.nodes[4].target = [];
    this.nodes[5].source = 5;
    this.nodes[5].target = [6,7];

    this.nodes[6].source = 6;
    this.nodes[6].target = [];
    this.nodes[7].source = 7;
    this.nodes[7].isConnector = false;
    this.nodes[7].target = [];

    this.gradientLinkPaths = [2, 4, 6, 7];


    // this.connectingNodes = [0,1,3,5]

    // this.links = [
    //   { source: 0, target: 1 },
    //   { source: 0, target: 2 },
    //   { source: 1, target: 2 },
    //   { source: 1, target: 3 },
    //   { source: 3, target: 4 },
    //   { source: 3, target: 5 },
    //   { source: 5, target: 6 },
    //   { source: 5, target: 7 }
    // ];

    // generated
//     0: {source: 0, target: 1}
    // 1: {source: 0, target: 2}
    // 2: {source: 1, target: 2}
    // 3: {source: 1, target: 3}
    // 4: {source: 3, target: 4}
    // 5: {source: 4, target: 5}
    // 6: {source: 4, target: 6}
    // 7: {source: 6, target: 7}
    // 8: {source: 6, target: 8}

    console.log('nodes', this.nodes)
    console.log('links', this.links)

  }

  checkHasMinimumDisplayableEnergy(name: string, flow: number, flowValue: number) {
    if (flowValue <= this.minPlotlyDisplayValue) {
      this.minFlowes.push(this.getNameLabel(name, flow, flowValue, '1.0-4'));
      this.cd.detectChanges();
    }
  }

  getNameLabel(flowName: string, flow: number, flowValue: number, decimalPlaces?: string) {
    let nameLabel: string;
    if (!decimalPlaces) {
      decimalPlaces = '1.0-0';
    }
    if (this.sankeyLabelStyle == 'both') {
      nameLabel = `${flowName} ${this.decimalPipe.transform(flow, decimalPlaces)} ${this.units} (${this.decimalPipe.transform(flowValue, decimalPlaces)}%)`
    } else if (this.sankeyLabelStyle == 'energy') {
      nameLabel = `${flowName} ${this.decimalPipe.transform(flow, decimalPlaces)} ${this.units}`
    } else {
      nameLabel = `${flowName} ${this.decimalPipe.transform(flowValue, decimalPlaces)}%`
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
        let sizingRatio: number = 1.6;
        // let sizingRatio: number = 1.75;
        // if (Number(height) > this.airFlowSankeyResults.kWInSystem / 2) {
        //   width = height * .8;
        //   sizingRatio = sizingRatio * .7;
        //   verticalAlignment = verticalAlignment / .3;
        // }
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

    // getDayTypeProfileSummaries() {
  //   let baselineDayTypeProfileSummarries = new Array<{dayTypeId: string, profileSummary: Array<ProfileSummary>}>();
  //     this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
  //       let baselineProfileSummary: Array<ProfileSummary> = this.resultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, dayType, this.settings);
  //       baselineDayTypeProfileSummarries.push({
  //         dayTypeId: dayType.dayTypeId,
  //         profileSummary: baselineProfileSummary
  //       });
  //     });
  //   return baselineDayTypeProfileSummarries;
  // }

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


}

export interface SankeyOption {
  name: string, 
  compressedAirAssessment: CompressedAirAssessment,
};