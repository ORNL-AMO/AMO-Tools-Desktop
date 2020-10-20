import {Component, OnInit, Input, ViewChild, ElementRef, Renderer2, AfterViewInit, SimpleChanges, OnChanges} from "@angular/core";
import { SSMTOutput, SSMTLosses } from "../models/steam/steam-outputs";
import { Settings } from "../../shared/models/settings";
import { SSMT, SSMTInputs } from "../models/steam/ssmt";
import { Assessment } from "../models/assessment";
import { CalculateLossesService } from "../../ssmt/calculate-losses.service";
import { SsmtService } from "../../ssmt/ssmt.service";
import { SSMTSankeyNode } from "../models/steam/sankey.model";
import { DecimalPipe } from "@angular/common";

import * as Plotly from "plotly.js";

@Component({
  selector: 'app-ssmt-sankey',
  templateUrl: './ssmt-sankey.component.html',
  styleUrls: ['./ssmt-sankey.component.css']
})
export class SsmtSankeyComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  ssmt: SSMT; 
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input() 
  assessment: Assessment;
  @Input()
  appBackground: boolean;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  losses: SSMTLosses;
  results: { inputData: SSMTInputs, outputData: SSMTOutput };

  gradientStartColorOrange: string = '#c77f0a';
  gradientEndColorOrange: string = '#f6b141';
  gradientRed: string = '#ff0000';
  gradientBlue: string = '#0000ff';
  
  connectingNodes: Array<number> = [];
  redLinkPaths: Array<number> = [];
  blueLinkPaths: Array<number> = [];
  orangeLinkPaths: Array<number> = [];
  units: string = 'MMBtu';

  constructor(private calculateLossesService: CalculateLossesService, private ssmtService: SsmtService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe
    ) { }

  ngOnInit(){}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.ssmt.firstChange) {
      this.initChart();
    }
  }
  
  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    if (this.ssmt.setupDone) {
      if (this.isBaseline) {
        this.setBaselineLosses();
      } else {
        this.setModificationLosses();
      }
      this.buildSankey();
    }
  }

  setBaselineLosses() {
    this.results = this.ssmtService.calculateBaselineModel(this.ssmt, this.settings);
    this.results.outputData = this.calculateResultsWithMarginalCosts(this.ssmt, this.results.outputData);
    this.ssmt.outputData = this.results.outputData;
    this.losses = this.calculateLossesService.calculateLosses(this.results.outputData, this.results.inputData, this.settings, this.ssmt);
  }

  setModificationLosses() {
    let baselineResultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(this.assessment.ssmt, this.settings);
    this.results = this.ssmtService.calculateModificationModel(this.ssmt, this.settings, baselineResultData.outputData);
    this.results.outputData = this.calculateResultsWithMarginalCosts(this.ssmt, this.results.outputData, baselineResultData.outputData);
    this.ssmt.outputData = this.results.outputData;
    this.losses = this.calculateLossesService.calculateLosses(this.results.outputData, this.results.inputData, this.settings, this.ssmt);
  }

  calculateResultsWithMarginalCosts(ssmt: SSMT, outputData: SSMTOutput, baselineResults?: SSMTOutput): SSMTOutput {
    let marginalCosts: { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number };
    if (ssmt.name == 'Baseline') {
      marginalCosts = this.ssmtService.calculateBaselineMarginalCosts(ssmt, outputData, this.settings);
    } else {
      marginalCosts = this.ssmtService.calculateModificationMarginalCosts(ssmt, outputData, baselineResults, this.settings);
    }
    outputData.marginalHPCost = marginalCosts.marginalHPCost;
    outputData.marginalMPCost = marginalCosts.marginalMPCost;
    outputData.marginalLPCost = marginalCosts.marginalLPCost;
    return outputData;
  }

  buildSankey() {
    // ssmt service output already converting from kJ, just set label to current.
    this.units = this.settings.steamEnergyMeasurement;
    if (this.ngChart) {
      Plotly.purge(this.ngChart.nativeElement); 
    }
    let links: Array<{ source: number, target: number }> = [];
    let nodes: Array<SSMTSankeyNode> = [];

    this.buildNodes(nodes);
    this.buildLinks(nodes, links);

    let sankeyLink = {
      value: nodes.map(node => node.value),
      source: links.map(link => link.source),
      target: links.map(link => link.target),
      hoverinfo: 'none',
      line: {
        color: this.gradientStartColorOrange,
        width: 0
      },
    };

    let sankeyData = {
      type: "sankey",
      orientation: "h",
      valuesuffix: "%",
      ids: nodes.map(node => node.id),
      textfont: {
        color: 'rgba(0, 0, 0)',
        size: 14
      },
      arrangement: 'freeform',
      node: {
        pad: 0,
        line: {
          color: this.gradientStartColorOrange,
        },
        label: nodes.map(node => node.name),
        x: nodes.map(node => node.x),
        y: nodes.map(node => node.y),
        color: nodes.map(node => node.nodeColor),
        hoverinfo: 'all',
        hovertemplate: '%{value}<extra></extra>',
        hoverlabel: {
          font: {
            size: 14,
            color: 'rgba(255, 255, 255)'
          },
          align: 'auto',
        }
      },
      link: sankeyLink
    };

    let layout = {
      title: "",
      autosize: true,
      height: 500,
      yaxis: {
        automargin: true,
      },
      xaxis: {
        automargin: true,
      },
      paper_bgcolor: undefined,
      plot_bgcolor: undefined,
      margin: {
        l: 50,
        t: 100,
        pad: 10,
      }
    };

    if (this.appBackground) {
      layout.paper_bgcolor = 'ececec';
      layout.plot_bgcolor = 'ececec';
    }

    let config = {
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
      responsive: true
    };

    // Return false and override Plotly events styling to keep gradient styles
    Plotly.newPlot(this.ngChart.nativeElement, [sankeyData], layout, config)
    .then(chart => {
      chart.on('plotly_restyle', () => {
        this.setGradient();
      });
      chart.on('plotly_hover', (hoverData) => {
        this.setGradient(hoverData);
        return false;
      });
      chart.on('plotly_unhover', () => {
        this.setGradient();
        return false;
      });
      chart.on('plotly_relayout', () => {
        this.setGradient();
        return false;
      });
    });
    this.addGradientElement();
    this.buildSvgArrows();
  }

  buildLinks(nodes, links) {    
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isConnector) {
          this.connectingNodes.push(i); 
      }

      for (let j = 0; j < nodes[i].target.length; j++) {
          links.push(
            {
              source: nodes[i].source,
              target: nodes[i].target[j]
            }
          )
        }

      }
  }

  buildNodes(nodes): Array<SSMTSankeyNode> {
    let energyInput = this.losses.fuelEnergy + this.losses.makeupWaterEnergy;
    let stackLosses = this.losses.stack + this.losses.blowdown;
    let otherLosses = this.losses.highPressureHeader + this.losses.mediumPressureHeader + this.losses.lowPressureHeader + this.losses.condensateLosses + this.losses.deaeratorVentLoss + this.losses.condensateFlashTankLoss + this.losses.lowPressureVentLoss;
    let turbineLosses = this.losses.condensingTurbineEfficiencyLoss + this.losses.highToMediumTurbineEfficiencyLoss + this.losses.highToLowTurbineEfficiencyLoss + this.losses.mediumToLowTurbineEfficiencyLoss + this.losses.condensingLosses
    let turbineGeneration = this.losses.condensingTurbineUsefulEnergy + this.losses.highToLowTurbineUsefulEnergy + this.losses.highToMediumTurbineUsefulEnergy + this.losses.mediumToLowTurbineUsefulEnergy;
    let processUsage = this.losses.highPressureProcessUsage + this.losses.mediumPressureProcessUsage + this.losses.lowPressureProcessUsage;
    let unreturnedCondensate = this.losses.lowPressureProcessLoss + this.losses.highPressureProcessLoss + this.losses.mediumPressureProcessLoss;
    
    let returnedCondensate = 0;
    if (this.results.outputData.returnCondensate.energyFlow) {
      returnedCondensate = this.results.outputData.returnCondensate.energyFlow;
    }
    // Return condensate loops back into energyInput
    energyInput = energyInput + returnedCondensate;

    let stackLossValue = (stackLosses / energyInput) * 100;
    let otherLossValue = (otherLosses / energyInput) * 100;
    let turbineLossValue = (turbineLosses / energyInput) * 100;
    let turbineGenerationValue = (turbineGeneration / energyInput) * 100;
    let unreturnedCondensateValue = (unreturnedCondensate / energyInput) * 100;
    let processUsageValue = (processUsage / energyInput) * 100;
    let returnedCondensateValue = (returnedCondensate / energyInput) * 100;

    let lossConnectorTargets = [2]; 
    let usefulConnectorTargets = [];
    let totalLosses = 0;
    let usefulEnergy = 0;
    
    // We will always have the first three connectors (0,1,2).
    let currentSourceIndex = 3;
    nodes.push(
      {
        name: "Energy " + this.decimalPipe.transform(energyInput, '1.0-0') + `  ${this.units}/hr`,
        value: 100,
        x: .05,
        y: .6,
        source: 0,
        target: [1, 2],
        isConnector: true,
        isConnectingPath: false,
        nodeColor: this.gradientStartColorOrange,
        id: 'originConnector'
      },
      {
        name: "",
        value: 0,
        x: .4,
        y: .6,
        source: 1,
        target: lossConnectorTargets,
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'lossConnector'
      },
      {
        name: "",
        value: 0,
        x: .6,
        y: .6,
        source: 2,
        target: usefulConnectorTargets,
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'usefulConnector'
      },
    );

    // ==== lossConnector nodes ====
    if (stackLossValue > 0) {
      nodes.push(
        {
          name: "Stack Loss " + this.decimalPipe.transform(stackLosses, '1.0-0') + `  ${this.units}/hr`,
          value: stackLossValue,
          x: .5,
          y: .1,
          source: currentSourceIndex,
          target: [],
          isConnector: false,
          isConnectingPath: false,
          nodeColor: this.gradientRed,
          id: 'stackLoss'
        }
      );

      lossConnectorTargets.push(currentSourceIndex);
      this.redLinkPaths.push(currentSourceIndex);
      totalLosses += stackLosses;
      currentSourceIndex++;
    }

    if (otherLossValue > 0) {
      nodes.push(
        {
              name: "Other Losses " + this.decimalPipe.transform(otherLosses, '1.0-0') + `  ${this.units}/hr`,
              value: otherLossValue,
              x: .55,
              y: .3,
              source: currentSourceIndex,
              target: [],
              isConnector: false,
              isConnectingPath: false,
              nodeColor: this.gradientRed,
              id: 'otherLosses'
        }
      );
      lossConnectorTargets.push(currentSourceIndex);
      this.redLinkPaths.push(currentSourceIndex);
      totalLosses += otherLosses;
      currentSourceIndex++;
    }

    if (turbineLossValue > 0) {
      nodes.push(
        {
              name: "Turbine Losses " + this.decimalPipe.transform(turbineLosses, '1.0-0') + `  ${this.units}/hr`,
              value: turbineLossValue,
              x: .6,
              y: .2,
              source: currentSourceIndex,
              target: [],
              isConnector: false,
              isConnectingPath: false,
              nodeColor: this.gradientRed,
              id: 'turbineLosses'
            },
      );
      lossConnectorTargets.push(currentSourceIndex);
      this.redLinkPaths.push(currentSourceIndex);
      totalLosses += turbineLosses;
      currentSourceIndex++;
    }
    // ==== End lossConnector nodes ===

    // ==== usefulConnector nodes ====
    if (turbineGenerationValue > 0) {
      nodes.push(
        {
              name: "Turbine Generation " + this.decimalPipe.transform(turbineGeneration, '1.0-0') + `  ${this.units}/hr`,
              value: turbineGenerationValue,
              x: .8,
              y: .4,
              source: currentSourceIndex,
              target: [],
              isConnector: false,
              isConnectingPath: false,
              nodeColor: this.gradientEndColorOrange,
              id: 'turbineGeneration'
        },
      );
      usefulConnectorTargets.push(currentSourceIndex);
      this.orangeLinkPaths.push(currentSourceIndex);
      usefulEnergy += turbineGeneration;
      currentSourceIndex++;
    }

    if (processUsageValue > 0) {
      nodes.push(
        {
          name: "Process Usage " + this.decimalPipe.transform(processUsage, '1.0-0') + `  ${this.units}/hr`,
          value: processUsageValue,
          x: .85,
          y: .6,
          source: currentSourceIndex,
          target: [],
          isConnector: false,
          isConnectingPath: false,
          nodeColor: this.gradientEndColorOrange,
          id: 'processUsage'
        },
      );
      usefulConnectorTargets.push(currentSourceIndex);
      this.orangeLinkPaths.push(currentSourceIndex);
      usefulEnergy += processUsage;
      currentSourceIndex++;
    }

    if (unreturnedCondensateValue > 0) {
      nodes.push(
        {
          name: "Unreturned Condensate " + this.decimalPipe.transform(unreturnedCondensate, '1.0-0') + `  ${this.units}/hr`,
          value: unreturnedCondensateValue,
          x: .8,
          y: .75,
          source: currentSourceIndex,
          target: [],
          isConnector: false,
          isConnectingPath: false,
          nodeColor: this.gradientRed,
          id: 'unreturnedCondensate'
        },
      );
      usefulConnectorTargets.push(currentSourceIndex);
      this.redLinkPaths.push(currentSourceIndex);
      usefulEnergy += unreturnedCondensate;
      currentSourceIndex++;
    }

    // Set connector values based on conditional loss nodes added
    let lossConnectorValue = ((energyInput - totalLosses) / energyInput) * 100;
    let usefulConnectorValue = lossConnectorValue;
    nodes[2].value = usefulConnectorValue;
    
    if (returnedCondensateValue > 0) { 
      usefulEnergy += returnedCondensate;
    }
    
    // Remaining energy must be added in the array position before returnedCondensate nodes
    let remainingEnergy = energyInput - (totalLosses + usefulEnergy);
    let remainingEnergyValue = (remainingEnergy / energyInput) * 100;
    if (remainingEnergyValue > 0) {
      nodes.push(
        {
          name: "Remaining Energy " + this.decimalPipe.transform(remainingEnergy, '1.0-0') + `  ${this.units}/hr`,
          value: remainingEnergyValue,
          x: .8,
          y: .75,
          source: currentSourceIndex,
          target: [],
          isConnector: false,
          isConnectingPath: false,
          nodeColor: this.gradientEndColorOrange,
          id: 'remainingEnergy'
        }
      );
      usefulConnectorTargets.push(currentSourceIndex);
      this.orangeLinkPaths.push(currentSourceIndex);
      currentSourceIndex++;
    }

    if (returnedCondensateValue > 0) {
      nodes.push(
        {
          name: "Returned Condensate " + this.decimalPipe.transform(returnedCondensate, '1.0-0') + `  ${this.units}/hr`,
          value: returnedCondensateValue,
          x: .8,
          y: .9,
          source: currentSourceIndex,
          target: [0],
          isConnector: true,
          isConnectingPath: false,
          nodeColor: this.gradientBlue,
          id: 'returnedCondensate'
        },
      );
      usefulConnectorTargets.push(currentSourceIndex);
      this.blueLinkPaths.push(currentSourceIndex);
      currentSourceIndex++;

      // No label displays for circular flows - using dummy label node/link
      nodes.push(
        {
          name: '',
          value: returnedCondensateValue,
          x: .6,
          y: .95,
          source: currentSourceIndex,
          target: [0],
          isConnector: true,
          isConnectingPath: false,
          nodeColor: this.gradientBlue,
          id: 'returnedCondensateLabel'
        },
      );
      this.blueLinkPaths.push(currentSourceIndex);
      currentSourceIndex++;
    }

    console.log('energyInput', energyInput);
    console.log('----------');
    console.log('lossConnectorValue', lossConnectorValue);
    console.log('stackLossValue', stackLossValue);
    console.log('turbineLossValue', turbineLossValue);
    console.log('otherLossValue', otherLossValue);
    console.log('----------');
    console.log('usefulConnectorValue', usefulConnectorValue);
    console.log('turbineGenerationValue', turbineGenerationValue);
    console.log('unreturnedCondensateValue', unreturnedCondensateValue);
    console.log('processUsageValue', processUsageValue);
    console.log('returnedCondensateValue', returnedCondensateValue);

    return nodes;
  }

  addGradientElement(): void {
    let mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    let svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="ssmtOrangeGradient">
      <stop offset="10%" stop-color="${this.gradientStartColorOrange}" />
      <stop offset="100%" stop-color="${this.gradientEndColorOrange}" />
    </linearGradient>
    <linearGradient id="ssmtOrangeRedGradient">
      <stop offset="10%" stop-color="${this.gradientStartColorOrange}" />
      <stop offset="100%" stop-color="${this.gradientRed}" />
    </linearGradient>
    <linearGradient id="ssmtOrangeBlueGradient">
      <stop offset="10%" stop-color="${this.gradientStartColorOrange}" />
      <stop offset="100%" stop-color="${this.gradientBlue}" />
    </linearGradient>
    `
    this.renderer.appendChild(mainSVG, svgDefs);
  }

  // Losses/paths aren't known ahead of time - set color after render events or plotly will override fill opacity.
  setGradient(hoverData?) {
    let links = this._dom.nativeElement.querySelectorAll('.sankey-link');
    let fillOpacity = 1;
    let fill: string;

    for (let i = 0; i < links.length; i++) {
      if (this.redLinkPaths.includes(i + 1)) {
        // Replicate Plotly event hover/unhover fill opacity
        // if (hoverData && hoverData.points[0].index == i+1) {
        //   fillOpacity = .4;
        // } 
        fill = 'url(#ssmtOrangeRedGradient) !important';
      } else if (this.blueLinkPaths.includes(i + 1)) {
        fill = 'url(#ssmtOrangeBlueGradient) !important';
      } else if (this.orangeLinkPaths.includes(i + 1)) {
        fill = 'url(#ssmtOrangeGradient) !important';
      } else {
        fill = this.gradientStartColorOrange + ' !important';
      }
      links[i].setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: ${fillOpacity};`);
    }
  }

  buildSvgArrows() {
    this.setGradient();
    let sankeynodes = this._dom.nativeElement.querySelectorAll('.node-rect');
    let arrowOpacity = '1';
    let arrowShape = 'polygon(100% 50%, 0 0, 0 100%)';

    for (let i = 0; i < sankeynodes.length; i++) {
      if (!this.connectingNodes.includes(i)) {
        let height = sankeynodes[i].getAttribute('height');
        let defaultY = sankeynodes[i].getAttribute('y');

        let arrowColor = this.gradientEndColorOrange;
        if (this.redLinkPaths.includes(i)) {
          arrowColor = this.gradientRed;
        } else if (this.blueLinkPaths.includes(i)) {
          arrowColor = this.gradientBlue;
        }
        sankeynodes[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        sankeynodes[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${arrowColor}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }

}
