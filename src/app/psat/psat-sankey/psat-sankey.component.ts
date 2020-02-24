import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Renderer2
} from "@angular/core";
import { PSAT, PsatOutputs, PsatInputs } from "../../shared/models/psat";
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";
import { PsatService } from "../psat.service";
import * as Plotly from "plotly.js";
import { CompareService } from "../compare.service";
import { ReceiverTankService } from "../../calculator/compressed-air/receiver-tank/receiver-tank.service";

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
  constructor(
    private psatService: PsatService,
    private convertUnitsService: ConvertUnitsService,
    private compareService: CompareService,
    private _dom: ElementRef,
    private renderer: Renderer2
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
    console.log(this._dom.nativeElement.querySelector('.sankey'));
    console.log(this._dom.nativeElement.querySelector('.sankey-node-set'));
    console.log(this._dom.nativeElement.querySelectorAll('.node-rect'));
    console.log(this._dom.nativeElement.querySelectorAll('.node-capture'));

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
  }

  sankey(results: PsatOutputs) {
    const links = [];
    const nodes = [];

    this.calcLosses(results);
    
    nodes.push(
      {
        name: "Energy Input",
        value: results.motor_power,
      },
      {
        name: "",
        value: 0,
      },
      {
        name: "Motor Losses",
        value: this.motor,
      }
    );
    
    if (this.drive > 0) {
      nodes.push(
        {
          name: "Drive Losses",
          value: this.drive,
        }
      );
    }

    nodes.push(
      {
        name: "Pump Losses",
        value: this.pump,
      },
      {
        name: "Useful Output",
        value: 0,
      }
    );

    // Useful Output = initial output - sum previous losses
    const last = nodes.length - 1;
    nodes[last].value = nodes[0].value - (nodes[last-1].value + nodes[last-2].value + nodes[last-3].value);

    links.push(
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 1, target: 4 },
      { source: 1, target: 5 }
    )

    const sankeyLink = {
      value: nodes.map(node => node.value),
      source: links.map(link => link.source),
      target: links.map(link => link.target),
      hoverinfo: 'none',
      // color: [
        // Statically set trace color
      //   "rgba(36, 51, 197, .8)",
      //   "rgba(36, 51, 197, .3)",
      //   "rgba(36, 51, 197, .2)",
      //   "rgba(58,74,219,.5)",
      //   "rgba(78,92,223,.5)",
      //   "rgba(97,110,226,.5)",
      //   "rgba(117,128,230,.5)",
      //   "rgba(137,146,233,.5)"
      // ],
      line: {
        color: "#fff",
        width: 0.25
      },
      // Colorscale / gradient with dummy color vals
      colorscales: [
        {
          label: "Energy Input",
          colorscale: [
            [0.0, "rgb(165,0,38)"],
            [0.1111111111111111, "rgb(215,48,39)"],
            [0.2222222222222222, "rgb(244,109,67)"],
            [0.3333333333333333, "rgb(253,174,97)"],
            [0.4444444444444444, "rgb(254,224,144)"],
            [0.5555555555555556, "rgb(224,243,248)"],
            [0.6666666666666666, "rgb(171,217,233)"],
            [0.7777777777777778, "rgb(116,173,209)"],
            [0.8888888888888888, "rgb(69,117,180)"],
            [1.0, "rgb(49,54,149)"]
          ]
        },
        {
          label: "Motor Losses",
          colorscale: [
            [0.0, "rgb(165,0,38)"],
            [0.1111111111111111, "rgb(215,48,39)"],
            [0.2222222222222222, "rgb(244,109,67)"],
            [0.3333333333333333, "rgb(253,174,97)"],
            [0.4444444444444444, "rgb(254,224,144)"],
            [0.5555555555555556, "rgb(224,243,248)"],
            [0.6666666666666666, "rgb(171,217,233)"],
            [0.7777777777777778, "rgb(116,173,209)"],
            [0.8888888888888888, "rgb(69,117,180)"],
            [1.0, "rgb(49,54,149)"]
          ]
        }
      ]
    };

    const sankeyData = {
      type: "sankey",
      orientation: "h",
      valuesuffix: "kW",
      colorscale: 'Electric',
      node: {
        pad: 20,
        line: {
          color: "rgba(255,255,255,.5)",
          width: .5
        },
        label: nodes.map(node => node.name),
        // color: [
          // statically set node marker
        //   "#2433C5",
        //   "#2433C5",
        //   "#4E5CDF",
        //   "#616EE2",
        //   "#7580E6",
        //   "#8992E9"
        // ],
        // hoverlabel: {
        //   bgcolor: '',
        //   bordercolor: '',
        //   font: {
        //     size: 14,
        //     color: '#DDDDFF'
        //   },
        // }
        customdata: []
      },
      link: sankeyLink
    };

    const layout = {
      title: "",
      // Responsiveness is broken if initial width/height are set
      // width: 1200,
      // height: 600,
      font: {
        size: 14,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
    };

    const config = {
      responsive: true
    };

    console.log('link', sankeyLink);
    console.log('layout', layout);
    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);

    // =================================
    //Add svg arrows
    // this.renderer.createElement("path", 'svg')
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect')
    const linkPaths = this._dom.nativeElement.querySelectorAll('.sankey-link');
    // const captures = this._dom.nativeElement.querySelectorAll('.node-capture')
    console.log(linkPaths);
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    mainSVG.setAttribute('height', '1000px');

    for (let i = 0; i < rects.length; i++) {
      if (i > 1) {
        // rects[i].setAttribute('height', '100px');
        // rects[i].setAttribute('style', `width: ${nodes[i] / 10}px; height: ${nodes[i] / 10 }px; clip-path:  polygon(100% 50%, 0 0, 0 100%); 
        // stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: rgb(140, 86, 75); fill-opacity: 0.8;`);
        // const height = rects[i].getAttribute('height');
        // console.log(height);
        // const width = height / 2;
        // console.log(height + '' + width)
        rects[i].setAttribute('style', `clip-path:  polygon(100% 50%, 0 0, 0 100%); 
        stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: rgb(140, 86, 75); fill-opacity: 0.8;`);
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
