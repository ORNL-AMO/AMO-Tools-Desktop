import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from "@angular/core";
import { SSMTOutput, SSMTLosses } from "../models/steam/steam-outputs";
import { ConvertUnitsService } from "../convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";
import { PsatService } from "../../psat/psat.service";
import { CompareService } from "../../psat/compare.service";

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
export class SsmtSankeyComponent implements OnInit, AfterViewInit {
  @Input()
  ssmt: SSMT; //baseline
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input() 
  assessment: Assessment;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  baselineOutput: SSMTOutput;
  baselineInputData: SSMTInputs;
  
  losses: SSMTLosses;

  gradientStartColor: string = '#c77f0a';
  gradientEndColor: string = '#f6b141';
  nodeStartColor: string = 'rgba(199,127,10, .9)';
  nodeArrowColor: string = 'rgba(246,177,65, .9)';
  connectingNodes: Array<number> = [];
  connectingLinkPaths: Array<number> = [];

  constructor(private calculateLossesService: CalculateLossesService, private ssmtService: SsmtService,
    // private convertUnitsService: ConvertUnitsService,
    // private compareService: CompareService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe
    ) { }

  ngOnInit(): void {
    // Check if _ssmt.setupDone done?
    console.log(this.ssmt.setupDone);
  }
  
  ngAfterViewInit() {
    if (this.ssmt.setupDone) {
  
      let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(this.assessment.ssmt, this.settings);
      this.assessment.ssmt.name = 'Baseline';
      resultData.outputData = this.calculateResultsWithMarginalCosts(this.assessment.ssmt, resultData.outputData);
      this.assessment.ssmt.outputData = resultData.outputData;
      this.baselineOutput = resultData.outputData;
      this.baselineInputData = resultData.inputData;
      this.losses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputData, this.settings, this.assessment.ssmt);
      
      console.log('losses', this.losses);
      console.log('baselineOutput', this.baselineOutput);
      this.buildSankey();
    }

  }

  // TODO From ssmt-report. Necessary?
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

  closeSankey() {
    if (this.ngChart.nativeElement) {
      Plotly.purge(this.ngChart.nativeElement);
    }
  }

  buildSankey() {
    const links: Array<{ source: number, target: number }> = [];
    let nodes: Array<SSMTSankeyNode> = [];

    this.closeSankey();
    this.buildNodes(nodes);
    this.buildLinks(nodes, links);

    const sankeyLink = {
      value: nodes.map(node => node.value),
      source: links.map(link => link.source),
      target: links.map(link => link.target),
      hoverinfo: 'none',
      line: {
        color: this.nodeStartColor,
        width: 0
      },
    };

    const sankeyData = {
      type: "sankey",
      orientation: "h",
      valuesuffix: "%",
      ids: nodes.map(node => node.id),
      textfont: {
        color: 'rgba(0, 0, 0)',
        size: 16
      },
      arrangement: 'freeform',
      node: {
        pad: 25,
        line: {
          color: this.nodeStartColor,
          width: 0
        },
        label: nodes.map(node => node.name),
        x: nodes.map(node => node.x),
        y: nodes.map(node => node.y),
        color: nodes.map(node => node.nodeColor),
        hoverinfo: 'all',
        hovertemplate: '%{value}<extra></extra>',
        hoverlabel: {
          font: {
            size: 16,
            color: 'rgba(255, 255, 255)'
          },
          align: 'auto',
        }
      },
      link: sankeyLink
    };

    const layout = {
      title: "",
      autosize: true,
      yaxis: {
        automargin: true,
      },
      xaxis: {
        automargin: true,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        l: 50,
        t: 100,
        pad: 50,
      }
    };

    const config = {
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
      responsive: true
    };

    console.log(links);

    console.log('sankeyData', sankeyData);

    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);
    this.addGradientElement();
    this.buildSvgArrows();
  }

  buildNodes(nodes): Array<SSMTSankeyNode> {
    // if (this.drive > 0) {
    //     driveConnectorValue = motorConnectorValue - this.drive;
    //     this.connectingLinkPaths = [0, 1, 4];
    //     this.connectingNodes = [0, 1, 2, 5];
    //     usefulOutput = driveConnectorValue - this.pump;
    //   } else {
    //       this.connectingLinkPaths = [0, 1, 5];
    //       this.connectingNodes = [0, 1, 2,];
    //       usefulOutput = motorConnectorValue - this.pump;
    //     }

    const energyInput = this.losses.fuelEnergy + this.losses.makeupWaterEnergy;
    const stackLosses = this.losses.stack + this.losses.blowdown;
    const otherLosses = this.losses.highPressureHeader + this.losses.mediumPressureHeader + this.losses.lowPressureHeader 
                        + this.losses.condensateLosses + this.losses.deaeratorVentLoss + this.losses.condensateFlashTankLoss + this.losses.lowPressureVentLoss;
    const turbineLosses = this.losses.condensingTurbineEfficiencyLoss + this.losses.highToMediumTurbineEfficiencyLoss
                        + this.losses.highToLowTurbineEfficiencyLoss + this.losses.mediumToLowTurbineEfficiencyLoss + this.losses.condensingLosses
    const turbineGeneration = this.losses.condensingTurbineUsefulEnergy + this.losses.highToLowTurbineUsefulEnergy 
                        + this.losses.highToMediumTurbineUsefulEnergy + this.losses.mediumToLowTurbineUsefulEnergy;
    const processUsage = this.losses.highPressureProcessUsage + this.losses.mediumPressureProcessUsage + this.losses.lowPressureProcessUsage;
    const unreturnedCondensate = this.losses.lowPressureProcessLoss + this.losses.highPressureProcessLoss + this.losses.mediumPressureProcessLoss;
    

    const initialLossPercent = ((energyInput - (stackLosses + otherLosses + turbineLosses)) / energyInput) * 100;
    const turbineLossValue = (turbineLosses / energyInput) * 100;
    const stackLossValue = (stackLosses / energyInput) * 100;
    const otherLossValue = (otherLosses / energyInput) * 100;
    const turbineGenerationValue = (turbineGeneration / energyInput) * 100;
    const unreturnedCondensateValue = (unreturnedCondensate / energyInput) * 100;
    const processUsageValue = (processUsage / energyInput) * 100;
    const returnedCondensateValue = (this.baselineOutput.returnCondensate.energyFlow / energyInput) / 100;

    console.log('initialLossPercent', initialLossPercent)
    console.log('turbineLossValue', turbineLossValue);
    console.log('stackLossValue', stackLossValue);
    console.log('otherLossValue', otherLossValue);
    console.log('turbineGenerationValue', turbineGenerationValue);
    console.log('unreturnedCondensateValue', unreturnedCondensateValue);
    console.log('processUsageValue', processUsageValue);
    console.log('returnedCondensateValue', returnedCondensateValue);


    nodes.push(
      {
        name: "Energy Input " + this.decimalPipe.transform(energyInput, '1.0-0') + " MJ/hr",
        value: 100,
        x: .05,
        y: .6,
        source: 0,
        target: [1],
        isConnector: true,
        isConnectingPath: false,
        nodeColor: this.nodeStartColor,
        id: 'originConnector'
      },
      {
        name: "i == 1",
        value: 0,
        x: .125,
        y: .6,
        source: 1,
        target: [2,2],
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.nodeStartColor,
        id: 'inputConnector'
      },
      {
        name: "i == 2",
        value: 0,
        x: .175,
        y: .6,
        source: 2,
        target: [3,4,5,6],
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.nodeStartColor,
        id: 'inputConnector'
      },
      {
        name: "Stack Loss " + this.decimalPipe.transform(stackLosses, '1.0-0') + " MJ/hr",
        value: stackLossValue,
        x: .25,
        y: .1,
        source: 3,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.nodeArrowColor,
        id: 'stackLoss'
      },
      {
        name: "Other Losses " + this.decimalPipe.transform(otherLosses, '1.0-0') + " MJ/hr",
        value: otherLossValue,
        x: .3,
        y: .3,
        source: 4,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "Turbine Losses " + this.decimalPipe.transform(turbineLosses, '1.0-0') + " MJ/hr",
        value: turbineLossValue,
        x: .4,
        y: .2,
        source: 5,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.nodeArrowColor,
        id: 'turbineLosses'
      },
      {
        name: "",
        value: initialLossPercent,
        x: .5,
        y: .65,
        source: 6,
        target: [7,8,9, 10],
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.nodeStartColor,
        id: 'turbineConnector'
      },
      {
        name: "Turbine Generation " + this.decimalPipe.transform(turbineGeneration, '1.0-0') + " MJ/hr",
        value: turbineGenerationValue,
        x: .95,
        y: .1,
        source: 7,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "Unreturned Condensate " + this.decimalPipe.transform(unreturnedCondensate, '1.0-0') + " MJ/hr",
        value: unreturnedCondensateValue,
        x: .7,
        y: .85,
        source: 8,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "Process Usage  " + this.decimalPipe.transform(processUsage, '1.0-0') + " MJ/hr",
        value: processUsageValue,
        x: .8,
        y: .6,
        source: 9,
        target: [],
        isConnector: false,
        isConnectingPath: false,
        nodeColor: this.nodeArrowColor,
        id: 'usefulConnector1'
      },
      {
        name: "Returned Condensate " + this.decimalPipe.transform(this.baselineOutput.returnCondensate.energyFlow, '1.0-0') + " MJ/hr",
        value: returnedCondensateValue,
        x: .9,
        y: .8,
        source: 10,
        target: [0],
        isCircularFlow: true,
        isConnector: true,
        isConnectingPath: true,
        nodeColor: this.nodeArrowColor,
        id: 'returnedCondensate'
      },
    );

    // nodes.push(
    //   {
    //     name: "Energy Input " + this.decimalPipe.transform(energyInput, '1.0-0') + " MJ/hr",
    //     value: 100,
    //     x: .05,
    //     y: .6,
    //     source: 0,
    //     target: [1, 1],
    //     isConnector: true,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeStartColor,
    //     id: 'originConnector'
    //   },
    //   {
    //     name: "",
    //     value: 0,
    //     x: .175,
    //     y: .6,
    //     source: 1,
    //     target: [2,3,4,5],
    //     isConnector: true,
    //     isConnectingPath: true,
    //     nodeColor: this.nodeStartColor,
    //     id: 'inputConnector'
    //   },
    //   {
    //     name: "Stack Loss " + this.decimalPipe.transform(stackLosses, '1.0-0') + " MJ/hr",
    //     value: stackLossValue,
    //     x: .25,
    //     y: .1,
    //     source: 2,
    //     target: [],
    //     isConnector: false,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'stackLoss'
    //   },
    //   {
    //     name: "Other Losses " + this.decimalPipe.transform(otherLosses, '1.0-0') + " MJ/hr",
    //     value: otherLossValue,
    //     x: .3,
    //     y: .3,
    //     source: 3,
    //     target: [],
    //     isConnector: false,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'otherLosses'
    //   },
    //   {
    //     name: "Turbine Losses " + this.decimalPipe.transform(turbineLosses, '1.0-0') + " MJ/hr",
    //     value: turbineLossValue,
    //     x: .4,
    //     y: .2,
    //     source: 4,
    //     target: [],
    //     isConnector: false,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'turbineLosses'
    //   },
    //   {
    //     name: "",
    //     value: initialLossPercent,
    //     x: .5,
    //     y: .65,
    //     source: 5,
    //     target: [6,7,8,9],
    //     isConnector: true,
    //     isConnectingPath: true,
    //     nodeColor: this.nodeStartColor,
    //     id: 'turbineConnector'
    //   },
    //   {
    //     name: "Turbine Generation " + this.decimalPipe.transform(turbineGeneration, '1.0-0') + " MJ/hr",
    //     value: turbineGenerationValue,
    //     x: .95,
    //     y: .1,
    //     source: 6,
    //     target: [],
    //     isConnector: false,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'otherLosses'
    //   },
    //   {
    //     name: "Unreturned Condensate " + this.decimalPipe.transform(unreturnedCondensate, '1.0-0') + " MJ/hr",
    //     value: unreturnedCondensateValue,
    //     x: .7,
    //     y: .85,
    //     source: 7,
    //     target: [],
    //     isConnector: false,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'otherLosses'
    //   },
    //   {
    //     name: "Process Usage  " + this.decimalPipe.transform(processUsage, '1.0-0') + " MJ/hr",
    //     value: processUsageValue,
    //     x: .8,
    //     y: .6,
    //     source: 8,
    //     target: [],
    //     isConnector: false,
    //     isConnectingPath: false,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'usefulConnector1'
    //   },
    //   {
    //     name: "Returned Condensate " + this.decimalPipe.transform(this.baselineOutput.returnCondensate.energyFlow, '1.0-0') + " MJ/hr",
    //     value: returnedCondensateValue,
    //     x: .9,
    //     y: .8,
    //     source: 9,
    //     target: [0],
    //     isCircularFlow: true,
    //     isConnector: true,
    //     isConnectingPath: true,
    //     nodeColor: this.nodeArrowColor,
    //     id: 'returnedCondensate'
    //   },
    // );
    return nodes;
  }

  buildLinks(nodes, links) {
    this.connectingLinkPaths.push(0);
    
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isConnector) {
          this.connectingNodes.push(i); 
      }
      if (nodes[i].isConnectingPath) {
        this.connectingLinkPaths.push(i); 
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

  addGradientElement(): void {
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="ssmtLinkGradient">
      <stop offset="10%" stop-color="${this.gradientStartColor}" />
      <stop offset="100%" stop-color="${this.gradientEndColor}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);
  }

  buildSvgArrows() {
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect');
    const arrowOpacity = '1';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

    for (let i = 0; i < rects.length; i++) {
      if (!this.connectingNodes.includes(i)) {
        const height = rects[i].getAttribute('height');
        const defaultY = rects[i].getAttribute('y');

        rects[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        rects[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientEndColor}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }

}
