import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { EndUseEnergyData, EndUsesService } from '../../end-uses/end-uses.service';
import { AirflowSankeyService, CompressedAirSankeyNode, AirFlowSankeyResults } from './airflow-sankey.service';

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
  // dayTypeLeakRate: number;
  hasValidLeakRate: boolean = true;
  unaccountedAirflow: string;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private airflowSankeyService: AirflowSankeyService,
    private endUsesService: EndUsesService,
    private plotlyService: PlotlyService
  ) { }

  ngOnInit() {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.selectedDayTypeId = this.compressedAirAssessment.compressedAirDayTypes[0].dayTypeId;
    this.initSankeyList();
  }

  ngAfterViewInit() {
    this.renderSankey();
  }

  ngOnChanges() {
    this.renderSankey();
  }


  focusField() {}

  setSelectedDayType() {
    this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals = this.endUsesService.getDayTypeAirflowTotals(this.compressedAirAssessment, this.selectedDayTypeId, this.settings);
    this.renderSankey();
  }


  renderSankey() {
    this.nodes = [];
    this.links = [];
    this.connectingNodes = [];
    this.minFlowes = [];

    let canRenderSankey: boolean = this.compressedAirAssessment && this.compressedAirAssessment.setupDone && this.profileDataComplete && this.hasValidLeakRate;
    if (canRenderSankey) {
      this.airFlowSankeyResults = this.airflowSankeyService.getAirFlowSankeyResults(this.compressedAirAssessment, this.selectedDayTypeId, this.settings);
      console.log(this.airFlowSankeyResults)
      this.buildNodes();
      this.buildLinks();
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
        pad: 10,
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
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].isConnector === true) {
        this.connectingNodes.push(i);
      }
    }

    for (let i = 0; i < this.connectingNodes.length; i++) {
      let nodeSource: number = this.connectingNodes[i];
      for (let j = 0; j < this.nodes[nodeSource].target.length; j++) {
        this.links.push(
          {
            source: this.nodes[nodeSource].source,
            target: this.nodes[nodeSource].target[j]
          }
        )
      }
    }
  }

  buildNodes() {
    let originConnectorFlow: number = this.airFlowSankeyResults.totalEndUseAirflow;
    let totalEndUseAirflow: number = originConnectorFlow;
    let originConnectorValue: number = 100;
    
    this.gradientLinkPaths = [];
    this.nodes.unshift(
      {
        name: this.getNameLabel("Total End Use Airflow", originConnectorFlow, originConnectorValue),
        value: originConnectorValue,
        x: .05,
        y: .6,
        source: 0,
        flow: originConnectorFlow,
        target: [1, 2],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'originalInputConnector'
      },
      {
        name: "",
        value: 0,
        x: .125,
        y: .6,
        source: 1,
        flow: originConnectorFlow,
        target: [2, 3],
        isConnector: true,
        nodeColor: this.gradientStartColorPurple,
        id: 'inputConnector'
      },
      );
      

    // let flowNodeYPositions: Array<number> = [.1, .9, .2, .8, .15, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8];
    let flowNodeYPositions: Array<number> = [.9, .2, .8, .15, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8];
    let arrowNodeXPosition: number = .25;
    let nodeXPositionIncrements: SankeyXIncrements = this.getNodeIncrement();
    let offsetYPlacementIndex: number = 0;
    // offset count by the 2 origin connector nodes
    let arrowNodeIndex: number = 2;
    
    this.airFlowSankeyResults.endUseEnergyData.forEach((endUse: EndUseEnergyData, index) => {
      let endUseFlowValue: number = (endUse.dayTypeAverageAirFlow / totalEndUseAirflow) * 100;
      this.checkHasMinimumDisplayableEnergy(endUse.endUseName + 1, endUse.dayTypeAverageAirFlow, endUseFlowValue)

      let connectorId = `connector_${endUse.endUseId}`;
      let previousEndUseNodes = this.nodes.slice(-2);
      let connector: number = (previousEndUseNodes[1].flow - endUse.dayTypeAverageAirFlow);
      let connectorValue: number = (connector / totalEndUseAirflow) * 100;

      let arrowNodeColor: string = this.gradientEndColorPurple;
      let connectorNodeColor: string = this.gradientStartColorPurple;
      if (endUse.endUseId === 'dayTypeLeakRate') {
        arrowNodeColor = 'rgb(255, 0, 0)';
        connectorNodeColor = 'rgb(255, 0, 0)';
      }

      this.nodes.push({
        name: this.getNameLabel(endUse.endUseName, endUse.dayTypeAverageAirFlow, endUseFlowValue),
        // name: this.getNameLabel(`src: ${arrowNodeIndex}`, endUse.dayTypeAverageAirFlow, endUseFlowValue),
        value: endUseFlowValue,
        x: arrowNodeXPosition,
        y: flowNodeYPositions[offsetYPlacementIndex],
        source: arrowNodeIndex,
        flow: endUse.dayTypeAverageAirFlow,
        target: [],
        isConnector: false,
        nodeColor: arrowNodeColor,
        id: endUse.endUseId
      });

      // .6 should be default, but plotly doesn't render all .6 values at same height
      let yAdjustment: number = .6;
      let connectorNodeIndex: number = arrowNodeIndex + 1;
      if (connectorNodeIndex % 2 !== 0) {
        yAdjustment = .65;
      }

      let isConnector: boolean = true;
      let connectorTargets: Array<number> = [connectorNodeIndex + 1, connectorNodeIndex + 2];
      // let connectorName: string = `src: ${connectorNodeIndex} connector`;
      
      if (index === this.airFlowSankeyResults.endUseEnergyData.length - 1) {
        isConnector = false;
        connectorTargets = [];
        // connectorName = 'LAST NODE';
      } 

      this.nodes.push({
        name: undefined,
        value: connectorValue,
        x: arrowNodeXPosition - nodeXPositionIncrements.connector,
        y: yAdjustment,
        source: connectorNodeIndex,
        flow: connector,
        target: connectorTargets,
        isConnector: isConnector,
        nodeColor: connectorNodeColor,
        id: connectorId
      });

      console.log('arrow node value', this.nodes[this.nodes.length - 2].value);
      console.log('arrow node flow', this.nodes[this.nodes.length - 2].flow);
      console.log('connecor node value', this.nodes[this.nodes.length - 1].value);
      console.log('connecor node flow', this.nodes[this.nodes.length - 1].flow);
      if (this.airFlowSankeyResults.otherEndUseData && index === this.airFlowSankeyResults.endUseEnergyData.length - 1) {
        // console.log('2nd last  node value', this.nodes[this.nodes.length - 2].value);
        // console.log('2nd last node flow', this.nodes[this.nodes.length - 2].flow);
        // console.log('last node value', this.nodes[this.nodes.length - 1].value);
        // console.log('last node flow', this.nodes[this.nodes.length - 1].flow);
        // change last endUseEnergyData node to a connector
        // Add other energy node
        let otherEndUseData = this.airFlowSankeyResults.otherEndUseData;
        endUseFlowValue = (otherEndUseData.dayTypeAverageAirFlow / totalEndUseAirflow) * 100;

        let otherEndUseConnector = this.nodes[this.nodes.length - 1]
        // otherEndUseConnector.name = `Other connector`;
          // name: `src: ${connectorNodeIndex} connector`,
        otherEndUseConnector.value = connectorValue,
        otherEndUseConnector.x = arrowNodeXPosition - nodeXPositionIncrements.arrow,
        otherEndUseConnector.y = yAdjustment,
        otherEndUseConnector.source = connectorNodeIndex,
        otherEndUseConnector.flow = otherEndUseData.dayTypeAverageAirFlow,
        otherEndUseConnector.target = [connectorNodeIndex + 1],
        otherEndUseConnector.isConnector = true,
        otherEndUseConnector.nodeColor = this.gradientStartColorPurple,
        otherEndUseConnector.id = `connector_${this.airFlowSankeyResults.otherEndUseData.endUseId}`

        console.log('other connector value', connectorValue);
        console.log('other connector flow', otherEndUseData.dayTypeAverageAirFlow);
        console.log('other end use value', endUseFlowValue);
        console.log('other end use flow', otherEndUseData.dayTypeAverageAirFlow);

        arrowNodeXPosition += nodeXPositionIncrements.arrow;
        offsetYPlacementIndex++;
        let otherArrowNodeIndex = arrowNodeIndex + 2;
        this.gradientLinkPaths.push(otherArrowNodeIndex);

        this.nodes.push({
          name: this.getNameLabel(otherEndUseData.endUseName, otherEndUseData.dayTypeAverageAirFlow, endUseFlowValue),
          // name: this.getNameLabel(`src: ${otherArrowNodeIndex}`, endUse.dayTypeAverageAirFlow, endUseFlowValue),
          value: endUseFlowValue,
          x: arrowNodeXPosition,
          y: flowNodeYPositions[offsetYPlacementIndex],
          source: otherArrowNodeIndex,
          flow: otherEndUseData.dayTypeAverageAirFlow,
          target: [],
          isConnector: false,
          nodeColor: this.gradientEndColorPurple,
          id: otherEndUseData.endUseId
        });


        // this.buildOtherEndUseNodes();
      }

      this.gradientLinkPaths.push(arrowNodeIndex);
      arrowNodeXPosition += nodeXPositionIncrements.arrow;
      offsetYPlacementIndex++;
      arrowNodeIndex += 2;
      originConnectorValue -= endUse.dayTypeAverageAirFlow;
    });
    console.log('nodes', this.nodes)
    console.log('links', this.links)

  }

  buildOtherEndUseNodes() {

  }

  getNodeIncrement(): SankeyXIncrements {
    let sankeyXIncrements = {
      arrow: .075,
      connector: .05,
    }
    if (this.airFlowSankeyResults.endUseEnergyData.length <= 3) {
      sankeyXIncrements.arrow = .25;
      sankeyXIncrements.connector = -.15; 
    } else if (this.airFlowSankeyResults.endUseEnergyData.length <= 6) {
      sankeyXIncrements.arrow = .15;
      sankeyXIncrements.connector = -.05;
    }
    return sankeyXIncrements;
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

      if (i === (links.length - 1) && !this.airFlowSankeyResults.otherEndUseData) {
        fill = 'url(#compressedAirGradientRed) !important';
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
    <linearGradient id="compressedAirGradientRed">
      <stop offset="10%" stop-color="${this.gradientStartColorPurple}" />
      <stop offset="100%" stop-color="rgb(255, 0, 0)" />
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
        const height = JSON.parse(JSON.stringify(rects[i].getAttribute('height')));
        const defaultY = JSON.parse(JSON.stringify(rects[i].getAttribute('y')));
        
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

export interface SankeyXIncrements {
  arrow: number,
  connector: number
}