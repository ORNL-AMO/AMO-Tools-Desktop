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
  @Input()
  labelStyle: string;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  losses: SSMTLosses;
  results: { inputData: SSMTInputs, outputData: SSMTOutput };
  links: Array<{ source: number, target: number }> = [];
  nodes: Array<SSMTSankeyNode> = [];

  gradientStartColorOrange: string = '#c77f0a';
  gradientEndColorOrange: string = '#f6b141';
  gradientRed: string = '#ff0000';
  gradientBlue: string = '#0000ff';
  
  connectingNodes: Array<number>;
  redLinkPaths: Array<number>;
  blueLinkPaths: Array<number>;
  orangeLinkPaths: Array<number>;
  minLosses: Array<{name: string, text: string}> = [];
  units: string = 'MMBtu';

  // node/link not rendered or too small to see
  minPlotlyDisplayValue = .2;
  hasLowPressureVentLoss: boolean;

  constructor(private calculateLossesService: CalculateLossesService, private ssmtService: SsmtService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe
    ) { }

  ngOnInit(){
    if (this.ssmt.setupDone) {
      this.getLosses();
      this.initSankeySetup();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ssmt && !changes.ssmt.firstChange) {
      if (this.ssmt.setupDone) {
        this.getLosses();
        this.initSankeySetup();
        this.renderSankey();
      }
    }
    if (changes.labelStyle && !changes.labelStyle.firstChange) {
      if (this.ssmt.setupDone) {
        this.initSankeySetup();
        this.renderSankey();
      }
    }
  }
  
  ngAfterViewInit() {
    this.renderSankey();
  }

  getLosses() {
    if (this.isBaseline) {
      this.setBaselineLosses();
    } else {
      this.setModificationLosses();
    }
  }

  setBaselineLosses() {
    this.results = this.ssmtService.calculateBaselineModel(this.ssmt, this.settings);
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

  initSankeySetup() {
    // ssmt service output already converting from kJ, just set label to current.
    this.units = this.settings.steamEnergyMeasurement;
    this.redLinkPaths = [];
    this.blueLinkPaths = [];
    this.orangeLinkPaths = [];
    this.connectingNodes = [];
    this.minLosses = [];
    this.buildNodes();
    this.buildLinks();
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

  renderSankey() {
    if (this.ngChart) {
      Plotly.purge(this.ngChart.nativeElement); 
    }

    let sankeyLink = {
      value: this.nodes.map(node => node.value),
      source: this.links.map(link => link.source),
      target: this.links.map(link => link.target),
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
      ids: this.nodes.map(node => node.id),
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
    };

    Plotly.newPlot(this.ngChart.nativeElement, [sankeyData], layout, config)
    .then(chart => {
      chart.on('plotly_restyle', () => {
        this.setGradient();
      });
      chart.on('plotly_afterplot', () => {
        this.setGradient();
      });
      chart.on('plotly_hover', (hoverData) => {
        this.setGradient(hoverData);
      });
      chart.on('plotly_unhover', () => {
        this.setGradient();
      });
      chart.on('plotly_relayout', () => {
        this.setGradient();
      });
    });
    this.addGradientElement();
    this.buildSvgArrows();
  }

  buildLinks() {  
    this.links = [];  
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].isConnector) {
          this.connectingNodes.push(i); 
      }

      for (let j = 0; j < this.nodes[i].target.length; j++) {
          this.links.push(
            {
              source: this.nodes[i].source,
              target: this.nodes[i].target[j]
            }
          )
        }

      }
  }

  buildNodes(): Array<SSMTSankeyNode> {
    this.nodes = [];
    let energyInput = this.losses.fuelEnergy + this.losses.makeupWaterEnergy;
    let stackLosses = this.losses.stack;
    let blowdownLosses = this.losses.blowdown;
    let turbineLosses = this.losses.condensingTurbineEfficiencyLoss + this.losses.highToMediumTurbineEfficiencyLoss + this.losses.highToLowTurbineEfficiencyLoss + this.losses.mediumToLowTurbineEfficiencyLoss + this.losses.condensingLosses
    let turbineGeneration = this.losses.condensingTurbineUsefulEnergy + this.losses.highToLowTurbineUsefulEnergy + this.losses.highToMediumTurbineUsefulEnergy + this.losses.mediumToLowTurbineUsefulEnergy;
    let processUsage = this.losses.highPressureProcessUsage + this.losses.mediumPressureProcessUsage + this.losses.lowPressureProcessUsage;
    let unreturnedCondensate = this.losses.lowPressureProcessLoss + this.losses.highPressureProcessLoss + this.losses.mediumPressureProcessLoss;
    

    let otherLosses = this.losses.highPressureHeader + this.losses.mediumPressureHeader + this.losses.lowPressureHeader + this.losses.condensateLosses + this.losses.deaeratorVentLoss + this.losses.condensateFlashTankLoss;
    this.hasLowPressureVentLoss = !isNaN(this.losses.lowPressureVentLoss);
    if (this.hasLowPressureVentLoss) {
      otherLosses + this.losses.lowPressureVentLoss;
    }
    // Returned condensate and steam
    let returnedCondensate = 0;
    let returnedCondensateValue = 0;
    let originalEnergyInput = energyInput;
    let energyInputValue = (energyInput / originalEnergyInput) * 100;
    
    if (this.results.outputData.deaeratorOutput.feedwaterEnergyFlow) {
      returnedCondensate = this.results.outputData.deaeratorOutput.feedwaterEnergyFlow;
      returnedCondensateValue = (returnedCondensate / energyInput) * 100;
    }
    // Return condensate loops back into energyInput
    let adjustedEnergyInput = energyInput + returnedCondensate;
    energyInputValue += returnedCondensateValue;
    
    let stackLossValue = (stackLosses / energyInput) * 100;
    let blowdownLossValue = (blowdownLosses / energyInput) * 100;
    let otherLossValue = (otherLosses / energyInput) * 100;
    let turbineLossValue = (turbineLosses / energyInput) * 100;
    let turbineGenerationValue = (turbineGeneration / energyInput) * 100;
    let unreturnedCondensateValue = (unreturnedCondensate / energyInput) * 100;
    let processUsageValue = (processUsage / energyInput) * 100;
    

    let lossConnectorTargets = [3]; 
    let usefulConnectorTargets = [];
    let totalLosses = 0;
    let usefulEnergy = 0;

    // We will always have the first four connectors (0,1,2, 3).
    let currentSourceIndex = 4;
    this.nodes.push(
      {
        name: this.getNameLabel("Energy", originalEnergyInput, 100),
        value: 100,
        x: .05,
        y: .6,
        source: 0,
        target: [1],
        isConnector: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'originConnector'
      },
      {
        name: "",
        value: energyInputValue,
        x: .2,
        y: .6,
        source: 1,
        target: [2, 3],
        isConnector: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'ReturnAndOrigin'
      },
      {
        name: "",
        value: 0,
        x: .4,
        y: .6,
        source: 2,
        target: lossConnectorTargets,
        isConnector: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'lossConnector'
      },
      {
        name: "",
        value: 0,
        x: .6,
        y: .6,
        source: 3,
        target: usefulConnectorTargets,
        isConnector: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'usefulConnector'
      },
    );

    // ==== lossConnector this.nodes ====
    if (stackLossValue > 0) {
      if (stackLossValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Stack Loss", stackLosses, stackLossValue),
            value: stackLossValue,
            x: .5,
            y: .1,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientRed,
            id: 'stackLoss'
          }
          );
          lossConnectorTargets.push(currentSourceIndex);
          this.redLinkPaths.push(currentSourceIndex);
          totalLosses += stackLosses;
          currentSourceIndex++;
        } else {
          this.minLosses.push(
            {
              name: 'Stack Loss',
              text: `${this.decimalPipe.transform(stackLosses, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(stackLossValue, '1.1-2')}%)`,
            }
          );
        }
    }

    if (blowdownLossValue > 0) {
      if (blowdownLossValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Blowdown Loss", blowdownLosses, blowdownLossValue),
            value: blowdownLossValue,
            x: .6,
            y: .15,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientRed,
            id: 'blowdownLoss'
          }
          );
          lossConnectorTargets.push(currentSourceIndex);
          this.redLinkPaths.push(currentSourceIndex);
          totalLosses += blowdownLosses;
          currentSourceIndex++;
        } else {
          this.minLosses.push(
            {
              name: 'Blowdown Loss',
              text: `${this.decimalPipe.transform(blowdownLosses, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(blowdownLossValue, '1.1-2')}%)`,
            }
          );
        }
    }

    if (otherLossValue > 0) {
      if (otherLossValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Other Losses", otherLosses, otherLossValue),
            value: otherLossValue,
            x: .55,
            y: .3,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientRed,
            id: 'otherLosses'
          }
        );
        lossConnectorTargets.push(currentSourceIndex);
        this.redLinkPaths.push(currentSourceIndex);
        totalLosses += otherLosses;
        currentSourceIndex++;
      } else {
        this.minLosses.push(
          {
            name: 'Other Losses',
            text: `${this.decimalPipe.transform(otherLosses, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(otherLossValue, '1.1-2')}%)`,
          }
        );
      }
    }

    if (turbineLossValue > 0) {
      if (turbineLossValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
              name: this.getNameLabel("Turbine Losses", turbineLosses, turbineLossValue),
              value: turbineLossValue,
              x: .6,
              y: .2,
              source: currentSourceIndex,
              target: [],
              isConnector: false,
              nodeColor: this.gradientRed,
              id: 'turbineLosses'
          },
        );
          lossConnectorTargets.push(currentSourceIndex);
          this.redLinkPaths.push(currentSourceIndex);
          totalLosses += turbineLosses;
          currentSourceIndex++;
        } else {
          this.minLosses.push(
            {
              name: 'Turbine Losses',
              text: `${this.decimalPipe.transform(turbineLosses, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(turbineLossValue, '1.1-2')}%)`,
            }
          );
        }
    }
    // ==== End lossConnector this.nodes ===

    // ==== usefulConnector this.nodes ====
    if (turbineGenerationValue > 0) {
      if (turbineGenerationValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Turbine Generation", turbineGeneration, turbineGenerationValue),
            value: turbineGenerationValue,
            x: .8,
            y: .4,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientEndColorOrange,
            id: 'turbineGeneration'
          },
        );
        usefulConnectorTargets.push(currentSourceIndex);
        this.orangeLinkPaths.push(currentSourceIndex);
        usefulEnergy += turbineGeneration;
        currentSourceIndex++;
      } else {
        this.minLosses.push(
          {
            name: 'Turbine Generation',
            text: `${this.decimalPipe.transform(turbineGeneration, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(turbineGenerationValue, '1.1-2')}%)`,
          }
        );
      }
    }

    if (processUsageValue > 0) {
      if (processUsageValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Process Usage", processUsage, processUsageValue),
            value: processUsageValue,
            x: .85,
            y: .6,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientEndColorOrange,
            id: 'processUsage'
          },
        );
        usefulConnectorTargets.push(currentSourceIndex);
        this.orangeLinkPaths.push(currentSourceIndex);
        usefulEnergy += processUsage;
        currentSourceIndex++;
      } else {
        this.minLosses.push(
          {
            name: 'Process Usage',
            text: `${this.decimalPipe.transform(processUsage, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(processUsageValue, '1.1-2')}%)`,
          }
        );
      }
    }

    if (unreturnedCondensateValue > 0) {
      if (unreturnedCondensateValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Unreturned Condensate", unreturnedCondensate, unreturnedCondensateValue),
            value: unreturnedCondensateValue,
            x: .8,
            y: .75,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientRed,
            id: 'unreturnedCondensate'
          },
        );
        usefulConnectorTargets.push(currentSourceIndex);
        this.redLinkPaths.push(currentSourceIndex);
        usefulEnergy += unreturnedCondensate;
        currentSourceIndex++;
      } else {
        this.minLosses.push(
        {
          name: 'Unreturned Condensate ',
          text: `${this.decimalPipe.transform(unreturnedCondensate, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(unreturnedCondensateValue, '1.1-2')}%)`,
        }
      );
    }
  }

    // Set connector values based on conditional loss nodes added
    let usefulConnectorValue = ((adjustedEnergyInput - totalLosses) / energyInput) * 100;
    this.nodes[3].value = usefulConnectorValue;
    
    // Remaining energy must be added in the array position before returnedCondensate this.nodes
    usefulEnergy += returnedCondensate;
    let remainingEnergy = energyInput - (totalLosses + usefulEnergy);
    let remainingEnergyValue = (remainingEnergy / energyInput) * 100;

    if (remainingEnergyValue > 0) {
      if (remainingEnergyValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Remaining Energy", remainingEnergy, remainingEnergyValue),
            value: remainingEnergyValue,
            x: .8,
            y: .8,
            source: currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientEndColorOrange,
            id: 'remainingEnergy'
          }
        );
        usefulConnectorTargets.push(currentSourceIndex);
        this.orangeLinkPaths.push(currentSourceIndex);
        currentSourceIndex++;
      } else {
        this.minLosses.push(
          {
            name: 'Remaining Energy',
            text: `${this.decimalPipe.transform(remainingEnergy, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(remainingEnergyValue, '1.1-2')}%)`,
          }
        );
      }
    }

    if (returnedCondensateValue > 0) {
      if (returnedCondensateValue > this.minPlotlyDisplayValue) {
        this.nodes.push(
          {
            name: this.getNameLabel("Returned Condensate", returnedCondensate, returnedCondensateValue),
            value: returnedCondensateValue,
            x: .8,
            y: .95,
            source: currentSourceIndex,
            target: [1],
            isConnector: true,
            nodeColor: this.gradientBlue,
            id: 'returnedCondensate'
          },
        );
        usefulConnectorTargets.push(currentSourceIndex);
        this.blueLinkPaths.push(currentSourceIndex);
        currentSourceIndex++;

        // No label displays for circular flows - using dummy label node/link
        this.nodes.push(
          {
            name: '',
            value: returnedCondensateValue,
            x: .4,
            y: .9,
            source: currentSourceIndex,
            target: [1],
            isConnector: true,
            nodeColor: this.gradientBlue,
            id: 'returnedCondensateLabel'
          },
        );
        this.blueLinkPaths.push(currentSourceIndex);
        currentSourceIndex++;
      } else {
        this.minLosses.push(
          {
            name: 'Returned Condensate',
            text: `${this.decimalPipe.transform(returnedCondensate, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(returnedCondensateValue, '1.1-2')}%)`,
          }
        );
      }
    }
    return this.nodes;
  }

  getNameLabel(lossName: string, loss: number, lossValue: number) {
    let nameLabel: string;
    if (this.labelStyle == 'both') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(lossValue, '1.1-1')}%)`
    } else if (this.labelStyle == 'energy') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, '1.0-0')} ${this.units}/hr`
    } else {
      nameLabel = `${lossName} ${this.decimalPipe.transform(lossValue, '1.1-1')}%`
    }
    return nameLabel;
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
    let nodes = this._dom.nativeElement.querySelectorAll('.sankey-node');
    let fillOpacity = 1;
    let fill: string;
    let returnedCondensateNode = this.nodes.length - 2;

    for (let i = 0; i < links.length; i++) {
      if (this.redLinkPaths.includes(i + 1)) {
        // To replicate Plotly event hover/unhover fill opacity
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
      
      if (i == returnedCondensateNode) {
        this.setNodeLabelSpacing(nodes[i]);
      }
    }
  }

  setNodeLabelSpacing(nodeLabel) {
    let labelText = nodeLabel.querySelector('.node-label-text-path');
    labelText.setAttribute('startOffset', '3%');
  }

  buildSvgArrows() {
    this.setGradient();
    let sankeyNodes = this._dom.nativeElement.querySelectorAll('.node-rect');
    let arrowOpacity = '1';
    let arrowShape = 'polygon(100% 50%, 0 0, 0 100%)';

    for (let i = 0; i < sankeyNodes.length; i++) {
      if (!this.connectingNodes.includes(i)) {
        let height = sankeyNodes[i].getAttribute('height');
        let defaultY = sankeyNodes[i].getAttribute('y');

        let arrowColor = this.gradientEndColorOrange;
        if (this.redLinkPaths.includes(i)) {
          arrowColor = this.gradientRed;
        } else if (this.blueLinkPaths.includes(i)) {
          arrowColor = this.gradientBlue;
        }

        sankeyNodes[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        sankeyNodes[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${arrowColor}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }

}
