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
  // connectingNodes: Array<string> = [];
  connectingLinkPaths: Array<number> = [];
  // arrowNodeColorMatch = 'rgb(64, 184, 219)';

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
    //create copies of inputs to use for calcs
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
    // Remove Sankey
    Plotly.purge(this.ngChart.nativeElement);
  }

  sankey(results: PsatOutputs) {
    const links: Array<{source: number, target: number}> = [];
    const nodes: Array<{name: string, value: number, x: number, y: number, nodeColor: string,id: string}> = [];

    this.calcLosses(results);
    
    const connectMotor: number = results.motor_power - this.motor;
    let connectDrive: number = 0;
    let usefulOutput: number = 0;

    // Commennt out connectingNodes number array if sankeyData.ids start working
    // this.drive = -1;
    if (this.drive > 0) {
      connectDrive = connectMotor - this.drive;
      this.connectingLinkPaths = [0,1,4];
      this.connectingNodes = [0,1,2,5];

      usefulOutput = connectDrive - this.pump;
    } else {
      this.connectingLinkPaths = [0,1,5];
      this.connectingNodes = [0,1,2,];

      usefulOutput = connectMotor - this.pump;
    }

    nodes.push(
      {
        name: `Energy Input ${this.decimalPipe.transform(results.motor_power, '1.0-0')} kW`,
        value: results.motor_power,
        x: 0,
        y: .25, 
        nodeColor: this.nodeStartColor,
        id: 'connectOrigin'
      },
      {
        name: "",
        value: 0,
        x: 0,
        y: .25, 
        nodeColor: this.nodeStartColor,
        id: 'connectInput'
      },
      {
        name: "",
        value: connectMotor,
        x: 0,
        y: .25, 
        nodeColor: this.nodeStartColor,
        id: 'connectMotor'
      },
      {
        name: `Motor Losses ${this.decimalPipe.transform(this.motor, '1.0-0')} kW`,
        value: this.motor,
        x: .5,
        y: -.10, 
        nodeColor: this.nodeArrowColor,
        id: 'motorLosses'
      },
    );
    if (this.drive > 0) {
      nodes.push(
        {
          name: `Drive Losses ${this.decimalPipe.transform(this.drive, '1.0-0')} kW`,
          value: this.drive,
          x: .6,
          y: -.05,
          nodeColor: this.nodeArrowColor,
          id: 'driveLosses'
        },
        {
          name: "",
          value: connectDrive,
          x: 0,
          y: .25, 
          nodeColor: this.nodeStartColor,
          id: 'connectDrive'
        },
      );
    }
    nodes.push(
      {
        name: `Pump Losses ${this.decimalPipe.transform(this.pump, '1.0-0')} kW`,
        value: this.pump,
        x: 1,
        // y: -.15, 
        y: -.05, 
        nodeColor: this.nodeArrowColor,
        id: 'pumpLosses'
      },
      {
        name: `Useful Output ${this.decimalPipe.transform(usefulOutput, '1.0-0')} kW`,
        value: usefulOutput,
        x: .9,
        y: .5, 
        nodeColor: this.nodeArrowColor,
        id: 'usefulOutput'
      }
    );

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

    // console.log('nodes', nodes);
    // console.log('links', links);
    // console.log('connectingNodes', this.connectingNodes);
    // console.log('connectingLinkPaths', this.connectingLinkPaths);
      
    const sankeyLink = {
      value: nodes.map(node => node.value),
      source: links.map(link => link.source),
      target: links.map(link => link.target),
      hoverinfo: 'none',
      line: {
        color: "rgba(255,255,255, .5)",
        width: 1
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
        pad: 20,
        line: {
          color: "rgba(255,255,255, .5)",
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
      font: {
        color: '#ffffff',
        size: 14,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
    };

    const config = {
      responsive: true
    };


    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);
    this.buildSvgArrows();

    this.ngChart.nativeElement.on('plotly_afterplot', event => {
      this.setGradients();
    });

    //plotly_webglcontextlost, plotly_afterplot, plotly_autosize, plotly_deselect, plotly_doubleclick, plotly_redraw, and plotly_animated
    this.ngChart.nativeElement.on('plotly_animated', event => {
      this.setGradients();
    });

    this.ngChart.nativeElement.on('plotly_redraw', event => {
      this.setGradients();
    });
  }


  buildSvgArrows() {
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect')
    const arrowOpacity = '0.6';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

    // for (let i = 0; i < rects.length; i++) {  
    //   console.log(rects[i]);
    //   if (rects[i].id.includes('connect')) {
    //     rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: #1C20DB; fill-opacity: 0.6;`);
    //   } else {
    //     const height = rects[i].getAttribute('height');
    //     rects[i].setAttribute('style', `width: ${height / 1.5}px; clip-path:  ${arrowShape}; 
    //     stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientEndColor}; fill-opacity: ${arrowOpacity};`);
    //    }
    // }

    for (let i = 0; i < rects.length; i++) {  
       if (this.connectingNodes.includes(i)) {
         rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: #1C20DB; fill-opacity: 0.6;`);
       } 
       else {
         const height = rects[i].getAttribute('height');

         rects[i].setAttribute('style', `width: ${height / 1.5}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientEndColor}; fill-opacity: ${arrowOpacity};`);
        }
    }
  }

  setGradients() {
    const linkPaths = this._dom.nativeElement.querySelectorAll('.sankey-link');
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="linkGrad">
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
        linkPaths[i].setAttribute('fill', 'url("#linkGrad")');
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: url("#linkGrad") !important; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
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
