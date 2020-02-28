import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { PSAT, PsatOutputs, PsatInputs } from "../../models/psat";
import { ConvertUnitsService } from "../../convert-units/convert-units.service";
import { Settings } from "../../../shared/models/settings";
import { PsatService } from "../../../psat/psat.service";
import * as Plotly from "plotly.js";
import { CompareService } from "../../../psat/compare.service";
import { DecimalPipe } from "@angular/common";
import { PsatSankeyNode } from '../../../shared/models/psat/sankey.model';

@Component({
  selector: 'app-psat-sankey',
  templateUrl: './psat-sankey.component.html',
  styleUrls: ['./psat-sankey.component.css']
})
export class PsatSankeyComponent implements OnInit {
  @Input()
  psat: PSAT; //baseline
  @Input()
  location: string;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  @Input()
  isBaseline: boolean;
  @Input()
  baseline: PSAT;
  @Input()
  baselineResults: PsatInputs;
  @Input()
  modResults: PsatInputs;

  annualSavings: number;
  percentSavings: number;
  title: string;
  unit: string;
  titlePlacement: string;
  tmpNewPumpType: string;
  tmpInitialPumpType: string;
  tmpNewEfficiencyClass: string;
  tmpInitialEfficiencyClass: string;

  selectedResults: PsatOutputs;
  selectedInputs: PsatInputs;

  exploreModIndex: number = 0;
  currentField: string;

  width: number;
  height: number;

  firstChange: boolean = true;
  baseSize: number = 300;
  minSize: number = 3;

  motor: number;
  drive: number;
  pump: number;

  gradientStartColor: string = '#1C20DB'; 
  gradientEndColor: string = '#40B8DB';
  nodeStartColor: string = 'rgba(28, 32, 219, .6)';
  nodeArrowColor: string = 'rgba(64, 184, 219, .6)';
  connectingNodes: Array<number> = [];
  connectingLinkPaths: Array<number> = [];

  constructor(
    private psatService: PsatService,
    private convertUnitsService: ConvertUnitsService,
    private compareService: CompareService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    if (!this.baseline && !this.isBaseline) {
      this.baseline = this.compareService.baselinePSAT;
    }

    if (this.printView) {
    } else if (this.location != "sankey-diagram") {
      if (this.location == "baseline") {
        this.location = this.assessmentName + "-baseline";
      } else {
        this.location = this.assessmentName + "-modification";
      }
    }
    this.location = this.location.replace(/ /g, "");
    this.location = this.location.replace(/[\])}[{(]/g, "");
    this.location = this.location.replace(/#/g, "");
  }

  ngAfterViewInit() {
    if (!this.baselineResults && !this.modResults) {
      this.getResults();
    } else {
      this.selectedResults = this.baselineResults || this.modResults;
    }
    this.sankey(this.selectedResults);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.psat) {
      if (!changes.psat.firstChange) {
        if (this.location != "sankey-diagram" && !this.printView) {
          if (this.isBaseline) {
            this.location = this.assessmentName + "-baseline";
          } else {
            this.location = this.assessmentName + "-modification";
          }
          this.location = this.location.replace(/ /g, "");
          this.location = this.location.replace(/[\])}[{(]/g, "");
          this.location = this.location.replace(/#/g, "");
        }
        this.getResults();
        this.sankey(this.selectedResults);
      }
    }
  }

  getResults() {
    this.selectedInputs = JSON.parse(JSON.stringify(this.psat.inputs));
    let isPsatValid: boolean = this.psatService.isPsatValid(
      this.selectedInputs,
      this.isBaseline
    );
    if (isPsatValid) {
      if (this.isBaseline) {
        this.selectedResults = this.psatService.resultsExisting(
          this.selectedInputs,
          this.settings
        );
      } else {
        this.selectedResults = this.psatService.resultsModified(
          this.selectedInputs,
          this.settings
        );
      }
    } else {
      this.selectedResults = this.psatService.emptyResults();
    }
  }

  closeSankey() {
    Plotly.purge(this.ngChart.nativeElement);
  }

  sankey(results: PsatOutputs) {
    const links: Array<{source: number, target: number}> = [];
    let nodes: Array<PsatSankeyNode> = [];

    this.closeSankey();
    this.calcLosses(results);
    nodes = this.buildNodes(results);

    links.push(
      { source: 0, target: 1},
      { source: 0, target: 2},
      { source: 1, target: 2 },
      { source: 1, target: 3 },
    );
    if (this.drive > 0) {
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

  buildNodes(results: PsatOutputs): Array<PsatSankeyNode> {
    let nodes: Array<PsatSankeyNode> = [];
    const motorConnectorValue: number = results.motor_power - this.motor;
    let driveConnectorValue: number = 0;
    let usefulOutput: number = 0;

    if (this.drive > 0 ) {
      driveConnectorValue = motorConnectorValue - this.drive;
      this.connectingLinkPaths = [0,1,4];
      this.connectingNodes = [0,1,2,5];
      usefulOutput = driveConnectorValue - this.pump;
    } else {
      this.connectingLinkPaths = [0,1,5];
      this.connectingNodes = [0,1,2,];
      usefulOutput = motorConnectorValue - this.pump;
    }
    
    nodes.push(
      {
        name: `Energy Input ${this.decimalPipe.transform(results.motor_power, '1.0-0')} kW`,
        value: results.motor_power,
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
        name: `Motor Losses ${this.decimalPipe.transform(this.motor, '1.0-0')} kW`,
        value: this.motor,
        lossPercent: (this.motor / results.motor_power) * 100,
        x: .5,
        y: .10, 
        nodeColor: this.nodeArrowColor,
        id: 'motorLosses'
      },
    );
    if (this.drive > 0) {
      nodes.push(
        {
          name: `Drive Losses ${this.decimalPipe.transform(this.drive, '1.0-0')} kW`,
          value: this.drive,
          lossPercent: (this.drive / results.motor_power) * 100,
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
        name: `Pump Losses ${this.decimalPipe.transform(this.pump, '1.0-0')} kW`,
        value: this.pump,
        lossPercent: (this.pump / results.motor_power) * 100,
        x: .8,
        y: .15, 
        nodeColor: this.nodeArrowColor,
        id: 'pumpLosses'
      },
      {
        name: `Useful Output ${this.decimalPipe.transform(usefulOutput, '1.0-0')} kW`,
        value: usefulOutput,
        lossPercent: (usefulOutput / results.motor_power) * 100,
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
         rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: #1C20DB; fill-opacity: 0.6;`);
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

  calcLosses(results) {
    var motorShaftPower;
    var pumpShaftPower;
    if (this.settings.powerMeasurement === "hp") {
      motorShaftPower = this.convertUnitsService
        .value(results.motor_shaft_power)
        .from("hp")
        .to("kW");
      pumpShaftPower = this.convertUnitsService
        .value(results.pump_shaft_power)
        .from("hp")
        .to("kW");
    } else {
      motorShaftPower = results.motor_shaft_power;
      pumpShaftPower = results.pump_shaft_power;
    }
    this.motor = results.motor_power * (1 - results.motor_efficiency / 100);
    this.drive = motorShaftPower - pumpShaftPower;
    this.pump =
      (results.motor_power - this.motor - this.drive) *
      (1 - results.pump_efficiency / 100);
  }
}
