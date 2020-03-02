import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, Renderer2 } from '@angular/core';
import { Settings } from '../../models/settings';
import { FSAT } from '../../models/fans';
import { ConvertUnitsService } from '../../convert-units/convert-units.service';
import { FsatService } from '../../../fsat/fsat.service';
import * as Plotly from "plotly.js";
import { FsatSankeyNode } from '../../fsat/sankey.model';
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
  location: string;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @Input()
  isBaseline: boolean;

  @ViewChild('ngChart', { static: false }) ngChart: ElementRef;
  width: number;
  height: number;

  firstChange: boolean = true;
  baseSize: number = 300;
  minSize: number = 3;

  title: string;
  unit: string;
  titlePlacement: string;

  energyInput: number;
  motorLosses: number;
  driveLosses: number;
  fanLosses: number;
  usefulOutput: number;

  gradientEndColor: string = '#FFED5C'; 
  gradientStartColor: string = '#D1BB00';
  nodeArrowColor: string = 'rgba(255, 237, 92, .6)';
  nodeStartColor: string = 'rgba(209, 187, 0 .6)';
  connectingNodes: Array<number> = [];
  connectingLinkPaths: Array<number> = [];

  constructor(private convertUnitsService: ConvertUnitsService, 
              private fsatService: FsatService,
              private _dom: ElementRef,
              private decimalPipe: DecimalPipe,
              private renderer: Renderer2) { }

  ngOnInit() {

    if (!this.printView) {
      if (this.location !== "sankey-diagram" && this.location !== "explore-opportunities-sankey") {
        if (this.location === 'baseline') {
          this.location = this.assessmentName + '-baseline';
        }
        else {
          this.location = this.assessmentName + '-modification';
        }
      }
    }
    this.location = this.location.replace(/ /g, "");
    this.location = this.location.replace(/[\])}[{(]/g, '');
    this.location = this.location.replace(/#/g, "");

  }

  ngAfterViewInit() {
    this.getResults();
    this.sankey();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fsat) {
      if (!changes.fsat.firstChange) {
        if (this.location !== "sankey-diagram" && !this.printView) {
          if (this.isBaseline) {
            this.location = this.assessmentName + '-baseline';
          }
          else {
            this.location = this.assessmentName + '-modification';
          }

          this.location = this.location.replace(/ /g, "");
          this.location = this.location.replace(/[\])}[{(]/g, '');
          this.location = this.location.replace(/#/g, "");
        }

        this.getResults();
        this.sankey();
      }
    }
  }

  getResults() {
    let energyInput: number, motorLoss: number, driveLoss: number, fanLoss: number, usefulOutput: number;
  //  let motorShaftPower: number, fanShaftPower: number;
    let isBaseline: boolean;

    if (this.fsat.name === undefined || this.fsat.name === null || this.fsat.name === 'Baseline') {
      isBaseline = true;
    }
    else {
      isBaseline = true;
    }

    let tmpOutput = this.fsatService.getResults(this.fsat, isBaseline, this.settings);

    if (this.settings.fanPowerMeasurement === 'hp') {
      // motorShaftPower = this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
      // fanShaftPower = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW');
      energyInput = tmpOutput.motorPower;
      motorLoss = energyInput - this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
      driveLoss = this.convertUnitsService.value(tmpOutput.motorShaftPower - tmpOutput.fanShaftPower).from('hp').to('kW');
      fanLoss = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (1 - (tmpOutput.fanEfficiency / 100));
      usefulOutput = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (tmpOutput.fanEfficiency / 100);
    }
    else {
      // motorShaftPower = tmpOutput.motorShaftPower;
      // fanShaftPower = tmpOutput.fanShaftPower;
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
  }


  closeSankey() {
    Plotly.purge(this.ngChart.nativeElement);
  }

  sankey() {
    if (this.energyInput === undefined || this.energyInput === null) {
      return;
    }
    if (this.usefulOutput === undefined || this.energyInput === null) {
      return;
    }
    this.closeSankey();

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
      valuesuffix: "kW",
      ids: nodes.map(node => node.id),
      textfont: {
        color: '#ffffff'
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
        hoverlabel: {
          bgcolor: '#ffffff',
          bordercolor: '',
          font: {
            size: 14,
            color: '#000'
          },
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
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        l: 50,
        t: 100,
        pad: 300,
      }
    };

    const config = {
      responsive: true
    };

    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);
    this.buildSvgArrows();
    
    this.ngChart.nativeElement.on('plotly_afterplot', event => {
      this.setGradients();
    });
  }

  buildNodes(): Array<FsatSankeyNode> {
    let nodes: Array<FsatSankeyNode> = [];
    const motorConnectorValue: number = this.energyInput - this.driveLosses;
    let driveConnectorValue: number = 0;
    let usefulOutput: number = 0;

    if (this.driveLosses > 0 ) {
      driveConnectorValue = motorConnectorValue - this.driveLosses;
      this.connectingLinkPaths = [0,1,4];
      this.connectingNodes = [0,1,2,5];
      usefulOutput = driveConnectorValue - this.fanLosses;
    } else {
      this.connectingLinkPaths = [0,1,5];
      this.connectingNodes = [0,1,2,];
      usefulOutput = motorConnectorValue - this.fanLosses;
    }
    
    nodes.push(
      {
        name: `Energy Input ${this.decimalPipe.transform(this.energyInput, '1.0-0')} kW`,
        value: this.energyInput,
        lossPercent: 0,
        x: .1,
        y: .6, 
        nodeColor: this.nodeStartColor,
        id: 'OriginConnector'
      },
      {
        name: "",
        value: 0,
        lossPercent: 0,
        x: .25,
        y: .6, 
        nodeColor: this.nodeStartColor,
        id: 'InputConnector'
      },
      {
        name: "",
        value: motorConnectorValue,
        lossPercent: 0,
        x: .5,
        y: .6, 
        nodeColor: this.nodeStartColor,
        id: 'motorConnector'
      },
      {
        name: `Motor Losses ${this.decimalPipe.transform(this.motorLosses, '1.0-0')} kW`,
        value: this.motorLosses,
        lossPercent: (this.motorLosses / this.energyInput) * 100,
        x: .5,
        y: .10, 
        nodeColor: this.nodeArrowColor,
        id: 'motorLosses'
      },
    );
    if (this.driveLosses > 0) {
      nodes.push(
        {
          name: `Drive Losses ${this.decimalPipe.transform(this.driveLosses, '1.0-0')} kW`,
          value: this.driveLosses,
          lossPercent: (this.driveLosses / this.energyInput) * 100,
          x: .6,
          y: .25,
          nodeColor: this.nodeArrowColor,
          id: 'driveLosses'
        },
        {
          name: "",
          value: driveConnectorValue,
          lossPercent: 0,
          x: .7,
          y: .6, 
          nodeColor: this.nodeStartColor,
          id: 'driveConnector'
        },
      );
    }
    nodes.push(
      {
        name: `Fan Losses ${this.decimalPipe.transform(this.fanLosses, '1.0-0')} kW`,
        value: this.fanLosses,
        lossPercent: (this.fanLosses / this.energyInput) * 100,
        x: .8,
        y: .15, 
        nodeColor: this.nodeArrowColor,
        id: 'fanLosses'
      },
      {
        name: `Useful Output ${this.decimalPipe.transform(usefulOutput, '1.0-0')} kW`,
        value: usefulOutput,
        lossPercent: (usefulOutput / this.energyInput) * 100,
        x: .85,
        y: .65, 
        nodeColor: this.nodeArrowColor,
        id: 'usefulOutput'
      }
    );

    return nodes;
  }


  buildSvgArrows() {
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect');
    const arrowOpacity = '0.6';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

    for (let i = 0; i < rects.length; i++) {  
       if (this.connectingNodes.includes(i)) {
         rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientStartColor}; fill-opacity: 0.6;`);
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
      <stop offset="20%" stop-color="${this.gradientStartColor}" />
      <stop offset="90%" stop-color="${this.gradientEndColor}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);

    for(let i = 0; i < linkPaths.length; i++) {
      if (this.connectingLinkPaths.includes(i)) {
        linkPaths[i].setAttribute('fill', this.gradientStartColor);
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: ${this.gradientStartColor}; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
      } else {
        linkPaths[i].setAttribute('fill', 'url("#linkGradient")');
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: url("#linkGradient") !important; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
      }
    }
  }

}
