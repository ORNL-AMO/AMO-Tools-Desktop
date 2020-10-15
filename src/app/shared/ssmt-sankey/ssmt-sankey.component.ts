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
import { ConvertUnitsService } from "../convert-units/convert-units.service";

@Component({
  selector: 'app-ssmt-sankey',
  templateUrl: './ssmt-sankey.component.html',
  styleUrls: ['./ssmt-sankey.component.css']
})
export class SsmtSankeyComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  ssmt: SSMT; //baseline
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
  gradientEndColorRed: string = '#ff0000';
  gradientEndColorBlue: string = '#0000ff';
  
  connectingNodes: Array<number> = [];
  connectingLinkPaths: Array<number> = [];
  units: string = 'MMBtu';

  constructor(private calculateLossesService: CalculateLossesService, private ssmtService: SsmtService,
    private converUnitService: ConvertUnitsService,
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

    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);
    this.addGradientElement();
    this.buildSvgArrows();
  }

  buildNodes(nodes): Array<SSMTSankeyNode> {
    this.connectingNodes = [0, 1, 2, 9];
    let returnedCondensate = 0;
    let energyInput = this.losses.fuelEnergy + this.losses.makeupWaterEnergy;
    let stackLosses = this.losses.stack + this.losses.blowdown;
    let otherLosses = this.losses.highPressureHeader + this.losses.mediumPressureHeader + this.losses.lowPressureHeader 
                        + this.losses.condensateLosses + this.losses.deaeratorVentLoss + this.losses.condensateFlashTankLoss + this.losses.lowPressureVentLoss;
    let turbineLosses = this.losses.condensingTurbineEfficiencyLoss + this.losses.highToMediumTurbineEfficiencyLoss
                        + this.losses.highToLowTurbineEfficiencyLoss + this.losses.mediumToLowTurbineEfficiencyLoss + this.losses.condensingLosses
    let turbineGeneration = this.losses.condensingTurbineUsefulEnergy + this.losses.highToLowTurbineUsefulEnergy 
                        + this.losses.highToMediumTurbineUsefulEnergy + this.losses.mediumToLowTurbineUsefulEnergy;
    let processUsage = this.losses.highPressureProcessUsage + this.losses.mediumPressureProcessUsage + this.losses.lowPressureProcessUsage;
    let unreturnedCondensate = this.losses.lowPressureProcessLoss + this.losses.highPressureProcessLoss + this.losses.mediumPressureProcessLoss;

    if (this.results.outputData.returnCondensate.energyFlow) {
      returnedCondensate = this.results.outputData.returnCondensate.energyFlow;
    }
    energyInput = energyInput + returnedCondensate;

    // let invalidLosses = [this.motor, this.drive, this.pump].filter(loss => {
    //   return loss < 0 || !isFinite(loss) || isNaN(loss) ;
    // });
    // this.validLosses = invalidLosses.length > 0? false : true;

    let stackLossValue = (stackLosses / energyInput) * 100;
    let otherLossValue = (otherLosses / energyInput) * 100;
    let turbineGenerationValue = (turbineGeneration / energyInput) * 100;
    let turbineLossValue = (turbineLosses / energyInput) * 100;
    let unreturnedCondensateValue = (unreturnedCondensate / energyInput) * 100;
    let processUsageValue = (processUsage / energyInput) * 100;
    let returnedCondensateValue = (returnedCondensate / energyInput) * 100;
    let initialConnectorLosses = ((energyInput - (stackLosses + otherLosses + turbineLosses)) / energyInput) * 100;
    let endConectorLosses = initialConnectorLosses - (turbineGenerationValue + processUsageValue + unreturnedCondensateValue + returnedCondensateValue);

    console.log('initialLossPercent', initialConnectorLosses)
    console.log('end loss value', endConectorLosses)
    console.log('turbineLossValue', turbineLossValue);
    console.log('stackLossValue', stackLossValue);
    console.log('otherLossValue', otherLossValue);
    console.log('turbineGenerationValue', turbineGenerationValue);
    console.log('unreturnedCondensateValue', unreturnedCondensateValue);
    console.log('processUsageValue', processUsageValue);
    console.log('returnedCondensateValue', returnedCondensateValue);

    nodes.push(
      {
        name: "Energy " + this.decimalPipe.transform(energyInput, '1.0-0') + `  ${this.units}/hr`,
        value: 100,
        x: .05,
        y: .6,
        source: 0,
        target: [1],
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
        target: [2,2],
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'inputConnector'
      },
      {
        name: "",
        value: initialConnectorLosses - endConectorLosses,
        x: .6,
        y: .6,
        source: 2,
        target: [3,4,5,6],
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.gradientStartColorOrange,
        id: 'inputConnector2'
      },
      {
        name: "Stack Loss " + this.decimalPipe.transform(stackLosses, '1.0-0') + `  ${this.units}/hr`,
        value: stackLossValue,
        x: .5,
        y: .1,
        source: 3,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.gradientEndColorRed,
        id: 'stackLoss'
      },
      {
        name: "Other Losses " + this.decimalPipe.transform(otherLosses, '1.0-0') + `  ${this.units}/hr`,
        value: otherLossValue,
        x: .55,
        y: .3,
        source: 4,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.gradientEndColorRed,
        id: 'otherLosses'
      },
      {
        name: "Turbine Losses " + this.decimalPipe.transform(turbineLosses, '1.0-0') + `  ${this.units}/hr`,
        // value: turbineLossValue,
        value: .01,
        x: .6,
        y: .2,
        source: 5,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.gradientEndColorRed,
        id: 'turbineLosses'
      },
      {
        name: "Turbine Generation " + this.decimalPipe.transform(turbineGeneration, '1.0-0') + `  ${this.units}/hr`,
        value: turbineGenerationValue,
        x: .8,
        y: .4,
        source: 7,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.gradientEndColorOrange,
        id: 'otherLosses'
      },
      {
        name: "Process Usage " + this.decimalPipe.transform(processUsage, '1.0-0') + `  ${this.units}/hr`,
        value: processUsageValue,
        x: .85,
        y: .6,
        source: 9,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.gradientEndColorOrange,
        id: 'usefulConnector1'
      },
      {
        name: "Unreturned Condensate " + this.decimalPipe.transform(unreturnedCondensate, '1.0-0') + `  ${this.units}/hr`,
        value: unreturnedCondensateValue,
        x: .8,
        y: .75,
        source: 8,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.gradientEndColorRed,
        id: 'otherLosses'
      },
      {
        name: "Returned Condensate " + this.decimalPipe.transform(returnedCondensate, '1.0-0') + `  ${this.units}/hr`,
        value: returnedCondensateValue,
        x: .8,
        y: .9,
        source: 10,
        target: [0],
        isCircularFlow: true,
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.gradientEndColorBlue,
        id: 'returnedCondensateLabel'
      },
      {
        name: "",
        value: returnedCondensateValue,
        x: .4,
        y: .95,
        source: 10,
        target: [0],
        isCircularFlow: true,
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.gradientEndColorBlue,
        id: 'returnedCondensate'
      },
    );

    return nodes;
  }
  
  buildLinks(nodes, links) {
    links.push(
      { source: 0, target: 1},
      { source: 0, target: 2},
      { source: 1, target: 2},
      { source: 1, target: 3 },
      { source: 1, target: 4 },
      { source: 1, target: 5 },
      { source: 2, target: 6 },
      { source: 2, target: 7 },
      { source: 2, target: 8 },
      { source: 2, target: 9 },
      { source: 9, target: 0 },
    );
    // this.connectingLinkPaths.push(0);
    
    // for (let i = 0; i < nodes.length; i++) {
    //   if (nodes[i].isConnector) {
    //       this.connectingNodes.push(i); 
    //   }
    //   if (nodes[i].isConnectingPath) {
    //     this.connectingLinkPaths.push(i); 
    //   }

    //   for (let j = 0; j < nodes[i].target.length; j++) {
    //       links.push(
    //         {
    //           source: nodes[i].source,
    //           target: nodes[i].target[j]
    //         }
    //       )
    //     }

    //   }
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
      <stop offset="100%" stop-color="${this.gradientEndColorRed}" />
    </linearGradient>
    <linearGradient id="ssmtOrangeBlueGradient">
      <stop offset="10%" stop-color="${this.gradientStartColorOrange}" />
      <stop offset="100%" stop-color="${this.gradientEndColorBlue}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);
  }

  buildSvgArrows() {
    let rects = this._dom.nativeElement.querySelectorAll('.node-rect');
    let arrowOpacity = '1';
    let arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

    for (let i = 0; i < rects.length; i++) {
      if (!this.connectingNodes.includes(i)) {
        let height = rects[i].getAttribute('height');
        let defaultY = rects[i].getAttribute('y');

        let arrowColor = this.gradientEndColorOrange;
        if ([3, 4, 5, 8].includes(i)) {
          arrowColor = this.gradientEndColorRed
        } else if (i == 9) {
          arrowColor = this.gradientEndColorBlue;
        }

        rects[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        rects[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${arrowColor}; fill-opacity: ${arrowOpacity};`);
        
        //  let styles = rects[i].getAttribute('style').split(';');
        // let color;
        // styles.forEach(style => {
        //   if (style.includes('fill:')) {
        //     color = style.split(':')[1];
        //   }
        // });
        
        // rects[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        // rects[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
        //  stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${color}; fill-opacity: ${arrowOpacity};`);  
      }
    }
  }

}
