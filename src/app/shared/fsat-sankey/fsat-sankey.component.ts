import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../models/settings';
import { FSAT } from '../models/fans';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { FsatService } from '../../fsat/fsat.service';
import * as Plotly from "plotly.js";
import { FsatSankeyNode } from '../fsat/sankey.model';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-fsat-sankey',
  templateUrl: './fsat-sankey.component.html',
  styleUrls: ['./fsat-sankey.component.css']
})
export class FsatSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  isBaseline: boolean;
  @Input()
  appBackground: boolean;
  @Input()
  printView: boolean;
  @Input()
  labelStyle: string;

  @ViewChild('ngChart', { static: false }) ngChart: ElementRef;
  energyInput: number;
  motorLosses: number;
  driveLosses: number;
  fanLosses: number;
  usefulOutput: number;

  gradientStartColor: string = 'rgba(214, 185, 0, 1)'; 
  gradientEndColor: string = 'rgba(232, 217, 82, 1)';
  nodeStartColor: string = 'rgba(214, 185, 0, .9)';
  nodeArrowColor: string = 'rgba(232, 217, 82, .9)';
  connectingNodes: Array<number> = [];
  validLosses: boolean;
  connectingLinkPaths: Array<number> = [];

  constructor(private convertUnitsService: ConvertUnitsService, 
              private fsatService: FsatService,
              private _dom: ElementRef,
              private decimalPipe: DecimalPipe,
              private renderer: Renderer2) { }

  ngOnInit() {
    this.getResults();
  }

  ngAfterViewInit() {
    if (this.fsat.valid.isValid) {
      this.sankey();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fsat) {
      if (!changes.fsat.firstChange) {
        this.getResults();
        if (this.fsat.valid.isValid) {
          this.sankey();
        }
      }
    }
    if (changes.labelStyle && !changes.labelStyle.firstChange) {
      if (this.fsat.valid.isValid) {
        this.sankey();
      }
    }
  }

  getResults() {
    this.fsat.valid = this.fsatService.checkValid(this.fsat, this.isBaseline, this.settings);
    let energyInput: number, motorLoss: number, driveLoss: number, fanLoss: number, usefulOutput: number;
    let motorShaftPower: number, fanShaftPower: number;
    let tmpOutput = this.fsatService.getResults(this.fsat, this.isBaseline, this.settings);

    if (this.settings.fanPowerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
      fanShaftPower = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW');
      energyInput = tmpOutput.motorPower;
      motorLoss = energyInput - motorShaftPower;
      driveLoss = this.convertUnitsService.value(tmpOutput.motorShaftPower - tmpOutput.fanShaftPower).from('hp').to('kW');
      fanLoss = fanShaftPower * (1 - (tmpOutput.fanEfficiency / 100));
      usefulOutput = fanShaftPower * (tmpOutput.fanEfficiency / 100);
    }
    else {
      motorShaftPower = tmpOutput.motorShaftPower;
      fanShaftPower = tmpOutput.fanShaftPower;
      energyInput = tmpOutput.motorPower;
      motorLoss = tmpOutput.motorPower - tmpOutput.motorShaftPower;
      driveLoss = tmpOutput.motorShaftPower - tmpOutput.fanShaftPower;
      fanLoss = tmpOutput.fanShaftPower * (1 - (tmpOutput.fanEfficiency / 100));
      usefulOutput = tmpOutput.fanShaftPower * (tmpOutput.fanEfficiency / 100);
    }

    this.energyInput = energyInput;
    this.fanLosses = fanLoss;
    this.driveLosses = driveLoss;
    this.motorLosses = motorLoss;
    this.usefulOutput = usefulOutput;

    let invalidLosses = [this.energyInput, this.fanLosses, this.motorLosses].filter(loss => loss <= 0);
    this.validLosses = invalidLosses.length > 0? false : true;
  }
  
  sankey() {
    Plotly.purge(this.ngChart.nativeElement);

    const links: Array<{source: number, target: number}> = [];
    let nodes: Array<FsatSankeyNode> = [];

    nodes = this.buildNodes();

    links.push(
      { source: 0, target: 1},
      { source: 0, target: 2},
      { source: 1, target: 2 },
      { source: 1, target: 3 },
    );
    if (this.driveLosses > 0) {
      links.push(
        { source: 2, target: 4 },
        { source: 2, target: 5 },
        { source: 5, target: 6 },
        { source: 5, target: 7 }
      ); 
    } else {
      links.push(
        { source: 2, target: 4 },
        { source: 2, target: 5 }
      )   
    }

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
        color: 'rgb(0, 0, 0)',
        size: 14
      },
      arrangement: 'freeform',
      node: {
        pad: 50,
        line: {
          color: this.nodeStartColor,
          width: 0
        },
        label: nodes.map(node => node.name),
        x: nodes.map(node => node.x),
        y: nodes.map(node => node.y),
        color: nodes.map(node => node.nodeColor),
        customdata: nodes.map(node => `${this.decimalPipe.transform(node.loss, '1.0-0')} kW`),
        hovertemplate: '%{customdata}',
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

    const layout = {
      title: "",
      autosize: true,
      font: {
        color: '#ffffff',
        size: 14,
      },
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
        pad: 300,
      }
    };

    if (this.appBackground) {
      layout.paper_bgcolor = 'ececec';
      layout.plot_bgcolor = 'ececec';
    }

    let config;
    if (this.printView) {
      config = {
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
        displaylogo: false,
        displayModeBar: false,
        responsive: false
      };
    } else {
      config = {
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
        responsive: true
      };
    }

    Plotly.newPlot(this.ngChart.nativeElement, [sankeyData], layout, config);
    this.addGradientElement();
    this.buildSvgArrows();

  }

  buildNodes(): Array<FsatSankeyNode> {
    let nodes: Array<FsatSankeyNode> = [];
    let motorConnectorValue = this.energyInput - this.motorLosses;
    let driveConnectorValue: number = 0;
    let usefulOutput: number = 0;

    if (this.driveLosses > 0 ) {
      driveConnectorValue = motorConnectorValue - this.driveLosses;
      this.connectingNodes = [0,1,2,5];
      usefulOutput = driveConnectorValue - this.fanLosses;
    } else {
      this.connectingNodes = [0,1,2];
      usefulOutput = motorConnectorValue - this.fanLosses;
    }

    let motorLossesValue = (this.motorLosses / this.energyInput) * 100;
    let driveLossesValue = (this.driveLosses / this.energyInput) * 100;
    let fanLossesValue = (this.fanLosses / this.energyInput) * 100;
    let usefulOutputValue = (usefulOutput / this.energyInput) * 100;
    
    nodes.push(
      {
        name: this.getNameLabel("Energy Input", this.energyInput, 100),
        value: 100,
        loss: this.energyInput,
        x: .1,
        y: .6,
        source: 0,
        target: [1, 2], 
        nodeColor: this.nodeStartColor,
        id: 'OriginConnector',
        isConnector: true,
      },
      {
        name: ``,
        value: 0,
        loss: this.energyInput,
        x: .4,
        y: .6, 
        source: 1,
        target: [2, 3], 
        isConnector: true,
        nodeColor: this.nodeStartColor,
        id: 'InputConnector'
      },
      {
        name: ``,
        value: (motorConnectorValue / this.energyInput) * 100,
        loss: motorConnectorValue,
        x: .5,
        y: .6, 
        source: 2,
        target: [4, 5], 
        isConnector: true,
        nodeColor: this.nodeStartColor,
        id: 'motorConnector'
      },
      {
        name: this.getNameLabel("Motor Losses", this.motorLosses, motorLossesValue),
        value: motorLossesValue,
        loss: this.motorLosses,
        x: .5,
        y: .10, 
        source: 3,
        target: [], 
        isConnector: false,
        nodeColor: this.nodeArrowColor,
        id: 'motorLosses'
      },
    );
    if (this.driveLosses > 0) {
      nodes.push(
        {
          name: this.getNameLabel("Drive Losses", this.driveLosses, driveLossesValue),
          value: driveLossesValue,
          loss: this.driveLosses,
          x: .6,
          y: .25,
          source: 4,
          target: [], 
          isConnector: false,
          nodeColor: this.nodeArrowColor,
          id: 'driveLosses'
        },
        {
          name: "",
          value: (driveConnectorValue / this.energyInput) * 100,
          loss: driveConnectorValue,
          x: .7,
          y: .6, 
          source: 5,
          target: [6, 7], 
          isConnector: true,
          nodeColor: this.nodeStartColor,
          id: 'driveConnector'
        },
      );
    }
    nodes.push(
      {
        name: this.getNameLabel("Fan Losses", this.fanLosses, fanLossesValue),
        value: fanLossesValue,
        loss: this.fanLosses,
        x: .8,
        y: .15, 
        nodeColor: this.nodeArrowColor,
        isConnector: false,
        source: this.driveLosses > 0 ? 6 : 4,
        target: [],
        id: 'fanLosses'
      },
      {
        name: this.getNameLabel("Useful Output", usefulOutput, usefulOutputValue),
        value: usefulOutputValue,
        loss: usefulOutput,
        x: .85,
        y: .65, 
        source: this.driveLosses > 0 ? 7 : 5,
        target: [],
        isConnector: false,
        nodeColor: this.nodeArrowColor,
        id: 'usefulOutput'
      }
    );
    return nodes;
  }

  getNameLabel(lossName: string, loss: number, lossValue: number) {
    let nameLabel: string;
    if (this.labelStyle == 'both') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, '1.0-0')} kW/hr (${this.decimalPipe.transform(lossValue, '1.1-1')}%)`
    } else if (this.labelStyle == 'power') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, '1.0-0')} kW/hr`
    } else {
      nameLabel = `${lossName} ${this.decimalPipe.transform(lossValue, '1.1-1')}%`
    }
    return nameLabel;
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

  addGradientElement() {
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="fsatLinkGradient">
      <stop offset="10%" stop-color="${this.gradientStartColor}" />
      <stop offset="100%" stop-color="${this.gradientEndColor}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);
  }

}
