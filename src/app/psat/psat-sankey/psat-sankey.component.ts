import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { PSAT, PsatOutputs, PsatInputs } from "../../shared/models/psat";
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";
import { PsatService } from "../psat.service";
import * as Plotly from "plotly.js";
import { CompareService } from "../compare.service";
import { DecimalPipe } from "@angular/common";

@Component({
  selector: "app-psat-sankey",
  templateUrl: "./psat-sankey.component.html",
  styleUrls: ["./psat-sankey.component.css"]
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

  gradientPurple = '#1C20DB'; 
  gradientBlue = '#40B8DB';
  nodePurple = 'rgba(28, 32, 219, .6)';
  nodeBlue = 'rgba(64, 184, 219, .6)';
  connectingNodes = [];
  connectingLinkPaths = [];
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
    this.getResults();
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
    const links = [];
    const nodes = [];

    this.calcLosses(results);
    
    const connectMotor = results.motor_power - this.motor;
    const connectDrive = connectMotor - this.drive;
    const usefulOutput = connectDrive - this.pump;
    nodes.push(
      {
        name: `Energy Input ${this.decimalPipe.transform(results.motor_power, '1.0-0')} kW`,
        value: results.motor_power,
      },
      {
        name: "",
        value: 0,
      },
      {
        name: "",
        value: connectMotor,
      },
      {
        name: `Motor Losses ${this.decimalPipe.transform(this.motor, '1.0-0')} kW`,
        value: this.motor,
      },
    );
    if (this.drive > 0) {
      nodes.push(
        {
          name: `Drive Losses ${this.decimalPipe.transform(this.drive, '1.0-0')} kW`,
          value: this.drive,
        },
        {
          name: "",
          value: connectDrive,
        },
      );
    }

    nodes.push(
      {
        name: `Pump Losses ${this.decimalPipe.transform(this.pump, '1.0-0')} kW`,
        value: this.pump,
      },
      {
        name: `Useful Output ${this.decimalPipe.transform(usefulOutput, '1.0-0')} kW`,
        value: usefulOutput,
      }
    );

    
    links.push(
      { source: 0, target: 1},
      { source: 0, target: 2},
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 },
      { source: 2, target: 5 },
      { source: 5, target: 6 },
      { source: 5, target: 7 }
      )

    // Set connecting nodes for styling conditions
    this.connectingNodes = [0,1,2,5];
    this.connectingLinkPaths = [0,1,4];
      
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
      textfont: {
        color: '#ffffff'
      },
      arrangement: 'freeform',
      node: {
        pad: 20,
        // chart not reacting to width on line
        line: {
          color: "rgba(255,255,255, .5)",
          width: 0
        },
        label: nodes.map(node => node.name),
        x: [0, 0, 0, .5, .6, 0, 1, .90],
        y: [0, 0, 0, -.15, -.05, 0, -.15, .5],
        color: [
          this.nodePurple,
          this.nodePurple,
          this.nodePurple,
          this.nodeBlue,
          this.nodeBlue,
          this.nodePurple,
          this.nodeBlue,
          this.nodeBlue,
        ],
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

  }


  buildSvgArrows() {
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect')
    const arrowOpacity = '0.6';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

   for (let i = 0; i < rects.length; i++) {  
      if (this.connectingNodes.includes(i)) {
        rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: #1C20DB; fill-opacity: 0.6;`);
      } 
      else {
        const height = rects[i].getAttribute('height');
        
        rects[i].setAttribute('style', `width: ${height / 1.5}px; clip-path:  ${arrowShape}; 
        stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientBlue}; fill-opacity: ${arrowOpacity};`);
       }
    }
  }

  setGradients() {
    const linkPaths = this._dom.nativeElement.querySelectorAll('.sankey-link');

    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="linkGrad">
      <stop offset="20%" stop-color="${this.gradientPurple}" />
      <stop offset="90%" stop-color="${this.gradientBlue}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);

    for(let i = 0; i < linkPaths.length; i++) {
      if (this.connectingLinkPaths.includes(i)) {
        linkPaths[i].setAttribute('fill', this.gradientPurple);
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: ${this.gradientPurple}; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
      } else {
        linkPaths[i].setAttribute('fill', 'url("#linkGrad")');
        linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: url("#linkGrad") !important; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
      }
    }
  }

  // Build arrows based on style - fill color
  // buildArrows() {
  //    //Add SVG manips - Gradients, Arrows
  //   const rects = this._dom.nativeElement.querySelectorAll('.node-rect')
  //   // Build arrows
  //   const arrowOpacity = '0.6';
  //   const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'
  //   const connecterNodes = [0,1,2,5];


  //   for (let i = 0; i < rects.length; i++) { 
  //     const styles = rects[i].getAttribute('style');
  //     var re = /fill:(.*?);/;
  //     const fillColor = styles.split(re)[1].trim();

  //    if (fillColor === this.arrowNodeColorMatch) {
  //      const height = rects[i].getAttribute('height');
  //      console.log('Is arrow node', rects[i]);
  //      rects[i].setAttribute('style', `width: ${height / 1.5}px; clip-path:  ${arrowShape}; 
  //      stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientBlue}; fill-opacity: ${arrowOpacity};`);
  //    } else {
  //      console.log('not arrow node. node:', i); 
  //      rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: #1C20DB; fill-opacity: 0.6;`);
  //     }
  //  }
  // }



//   renderSvgStyles() {
//     //Add SVG manips - Gradients, Arrows
//     const rects = this._dom.nativeElement.querySelectorAll('.node-rect')
//     const linkPaths = this._dom.nativeElement.querySelectorAll('.sankey-link');
//     const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
//     const svgDefs = this._dom.nativeElement.querySelector('defs')

//     svgDefs.innerHTML = `
//     <linearGradient id="linkGrad">
//       <stop offset="20%" stop-color="${this.gradientPurple}" />
//       <stop offset="90%" stop-color="${this.gradientBlue}" />
//     </linearGradient>
//     `
//     // Insert our gradient Def
//     this.renderer.appendChild(mainSVG, svgDefs);

//     // Build arrows
//     const arrowOpacity = '0.6';
//     const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'
    
//     const connecterNodes = [0,1,2,5];

//     // Assign id's
//     for (let i = 0; i < rects.length; i++) {  
//         rects[i].setAttribute('id', 'node-' + i);
//     }

//     for (let i = 0; i < rects.length; i++) {  
//       if (rects[i].id === 'node-0' || rects[i].id === 'node-1'|| rects[i].id === 'node-2'|| rects[i].id === 'node-5') {
//         rects[i].setAttribute('style', `stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: #1C20DB; fill-opacity: 0.6;`);
//       } else {
//         const height = rects[i].getAttribute('height');
        
//         console.log(rects[i]);
//         rects[i].setAttribute('style', `width: ${height / 1.5}px; clip-path:  ${arrowShape}; 
//         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientBlue}; fill-opacity: ${arrowOpacity};`);
//        }
//     }

//     // Set Gradients
//     const connecterLinkPaths = [0,1,4];
//     for(let i = 0; i < linkPaths.length; i++) {
//       if (connecterLinkPaths.includes(i)) {
//         linkPaths[i].setAttribute('fill', this.gradientPurple);
//         linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: ${this.gradientPurple}; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
//       } else {
//         linkPaths[i].setAttribute('fill', 'url("#linkGrad")');
//         linkPaths[i].setAttribute('style', `stroke: rgb(255, 255, 255); stroke-opacity: 1; fill: url("#linkGrad") !important; fill-opacity: 0.6; stroke-width: 0.25; opacity: 1;`);
//       }
//     }
// }

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
