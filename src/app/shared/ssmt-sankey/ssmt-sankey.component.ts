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
  nodeStartColor: string = 'rgba(223,142,11, .9)';
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
    nodes = this.buildNodes();

    links.push(
      { source: 0, target: 1 },
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 1, target: 4 },
      { source: 1, target: 5 },
      { source: 5, target: 6 },
      { source: 5, target: 7 },
      { source: 5, target: 8 },
      // { source: 0, target: 9 },
      // { source: 5, target: 9 },
      // { source: 9, target: 0 },
    );

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
      responsive: true
    };

    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);
    // this.buildSvgArrows();

    this.ngChart.nativeElement.on('plotly_afterplot', event => {
      this.setGradients();
    });

    this.ngChart.nativeElement.on('plotly_hover', event => {
      this.setGradients();
    });
  }

  buildNodes(): Array<SSMTSankeyNode> {
    let nodes: Array<SSMTSankeyNode> = [];

    this.connectingLinkPaths = [0, 4];
    this.connectingNodes = [0, 5];
    
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
    
    // mass flow * enthalpy (from lowest pressure into deaerator)
    // const returnedCondensate = this.losses
    // initialLossPercent for use without connecting node
    const initialLossPercent = ((energyInput - (stackLosses + otherLosses + turbineLosses)) / energyInput) * 100;
    
    const turbineLossValue = (turbineLosses / energyInput) * 100;
    // const usefulConnectorValue = (energyInput - (otherLosses + stackLosses)) / 100 
    
    const turbineGenerationValue = (turbineGeneration / energyInput) * 100;
    const unreturnedCondensateValue = (unreturnedCondensate / energyInput) * 100;
    const processUsageValue = (processUsage / energyInput) * 100;

    let usefulOutput: number = 0;

    console.log('initial loss perc', initialLossPercent);
    console.log('turbinegenerationvalue', turbineGenerationValue)
    console.log('unreturnedcv', unreturnedCondensateValue);
    console.log('puv', processUsageValue);
        
    nodes.push(
      {
        name: "Energy Input " + this.decimalPipe.transform(energyInput, '1.0-0') + " units",
        value: 100,
        x: .05,
        y: .6,
        nodeColor: this.nodeStartColor,
        id: 'originConnector'
      },
      {
        name: "",
        value: 0,
        x: .175,
        y: .6,
        nodeColor: this.nodeStartColor,
        id: 'inputConnector'
      },
      {
        name: "Stack Loss " + this.decimalPipe.transform(stackLosses, '1.0-0') + " units",
        value: (stackLosses / energyInput) * 100,
        x: .25,
        y: .2,
        nodeColor: this.nodeStartColor,
        id: 'stackLoss'
      },
      {
        name: "Other Losses " + this.decimalPipe.transform(otherLosses, '1.0-0') + " units",
        value: (otherLosses / energyInput) * 100,
        x: .35,
        y: .3,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "Turbine Losses " + this.decimalPipe.transform(turbineLosses, '1.0-0') + " units",
        value: turbineLossValue,
        x: .5,
        y: .3,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "",
        value: initialLossPercent,
        x: .6,
        y: .65,
        nodeColor: this.nodeStartColor,
        id: 'turbineConnector'
      },
      {
        name: "Turbine Generation " + this.decimalPipe.transform(turbineGeneration, '1.0-0') + " units",
        value: turbineGenerationValue,
        x: .8,
        y: .3,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "Unreturned Condensate " + this.decimalPipe.transform(unreturnedCondensate, '1.0-0') + " units",
        value: unreturnedCondensateValue,
        x: .8,
        y: .8,
        nodeColor: this.nodeArrowColor,
        id: 'otherLosses'
      },
      {
        name: "Process Usage  " + this.decimalPipe.transform(processUsage, '1.0-0') + " units",
        value: processUsageValue,
        x: .9,
        y: .6,
        nodeColor: this.nodeStartColor,
        id: 'usefulConnector1'
      },
      //  {
      //   name: "useful connector 1",
      //   // value: (usefulConnectorValue / energyInput) * 100,
      //   value: initialLossPercent,
      //   x: .6,
      //   y: .6,
      //   nodeColor: this.nodeStartColor,
      //   id: 'usefulConnector1'
      // },
      // {
      //   name: "Test val Returned Condensate " + this.decimalPipe.transform(16, '1.0-0') + " units",
      //   value: 16,
      //   x: .9,
      //   y: .8,
      //   nodeColor: this.nodeArrowColor,
      //   id: 'otherLosses'
      // },
      );
    
    return nodes;
  }


  buildSvgArrows() {
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect');
    const arrowOpacity = '1';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

    for (let i = 0; i < rects.length; i++) {
      if (this.connectingNodes.includes(i)) {
        rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientStartColor}; fill-opacity: 1;`);
      }
      else {
        const height = rects[i].getAttribute('height');
        const defaultY = rects[i].getAttribute('y');

        rects[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        rects[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientEndColor}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }

  setGradients() {
    const linkPaths = this._dom.nativeElement.querySelectorAll('.sankey-link');
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="linkGradient">
      <stop offset="10%" stop-color="${this.gradientStartColor}" />
      <stop offset="100%" stop-color="${this.gradientEndColor}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);

    for (let i = 0; i < linkPaths.length; i++) {
      if (this.connectingLinkPaths.includes(i)) {
        linkPaths[i].setAttribute('fill', this.gradientStartColor);
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: ${this.gradientStartColor}; fill-opacity: 1; stroke-width: 0.25; opacity: 1;`);
      } else {
        linkPaths[i].setAttribute('fill', 'url("#linkGradient")');
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: url("#linkGradient") !important; fill-opacity: 1; stroke-width: 0.25; opacity: 1;`);
      }
    }
  }


}
