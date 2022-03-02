import { Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { PhastValidService } from '../../phast/phast-valid.service';
import { Assessment } from '../models/assessment';
import { PHAST } from '../models/phast/phast';
import { Settings } from '../models/settings';
import { PHASTSankeyNode } from "../models/phast/sankey.model";
import { DecimalPipe } from "@angular/common";
import { PlotlyService } from 'angular-plotly.js';
import { FuelResults, SankeyService } from './sankey.service';


@Component({
  selector: 'app-phast-sankey',
  templateUrl: './phast-sankey.component.html',
  styleUrls: ['./phast-sankey.component.css']
})
export class PhastSankeyComponent implements OnInit, OnChanges {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  printView: boolean;
  @Input()
  appBackground: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  labelStyle: string;

  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  links: Array<{ source: number, target: number }> = [];
  nodes: Array<PHASTSankeyNode> = [];

  gradientStartColor = '#a71600';
  gradientEndColor = '#ffa400';
  exothermicColor = '#a71600';

  connectingNodes: Array<number>;
  orangeLinkPaths: Array<number>;
  minLosses: Array<{ name: string, text: string }> = [];
  units: string = 'MMBtu';

  // node/link not rendered or too small to see
  minPlotlyDisplayValue = .2;

  currentSourceIndex = 0;
  initialLossConnectorTargets: Array<number> = [];
  energyInput: number = 0;
  totalLosses: number = 0;
  connectorNodeXPosition: number;
  lossNodeXPosition: number;
  subLossesConnectorIndex: number;
  hasLossConnectors: boolean;
  initialLossConnectorSource: number;

  fuelEnergy: number;
  exothermicHeat: number;
  exothermicHeatIndex: any;
  electricalEnergy: number;
  secondConnectorLoss: number;
  exothermicHeatValue: number;

  results: FuelResults;

  constructor(private sankeyService: SankeyService,
    private phastValidService: PhastValidService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe,
    private plotlyService: PlotlyService) { }

  ngOnInit() {
    this.phast.valid = this.phastValidService.checkValid(this.phast, this.settings);
    if (this.phast.valid.isValid) {
      this.results = this.sankeyService.getFuelTotals(this.phast, this.settings);
      this.initSankeySetup();
    }
  }

  ngAfterViewInit() {
    if (this.phast.losses) {
      if (this.phast.valid.isValid) {
        this.renderSankey();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.phast) {
      this.phast.valid = this.phastValidService.checkValid(this.phast, this.settings);
      if (!changes.phast.firstChange) {
        if (this.phast.valid.isValid) {
          this.results = this.sankeyService.getFuelTotals(this.phast, this.settings);
          if (this.results.totalInput > 0) {
            this.initSankeySetup();
            this.renderSankey();
          }
        }
      }
    }
    if (changes.labelStyle && !changes.labelStyle.firstChange) {
      if (this.phast.valid.isValid) {
        this.initSankeySetup();
        this.renderSankey();
      }
    }
  }

  initSankeySetup() {
    this.units = this.settings.steamEnergyMeasurement;
    this.orangeLinkPaths = [];
    this.connectingNodes = [];
    this.minLosses = [];

    this.connectorNodeXPosition = .45;
    this.lossNodeXPosition = .45;
    this.totalLosses = 0;
    this.initialLossConnectorTargets = [];
    this.exothermicHeat = 0;
    this.exothermicHeatValue = 0;

    this.buildNodes();
    this.buildLinks();
  }

  renderSankey() {

    let sankeyLink = {
      value: this.nodes.map(node => node.value),
      source: this.links.map(link => link.source),
      target: this.links.map(link => link.target),
      hoverinfo: 'none',
      line: {
        color: this.gradientStartColor,
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
        pad: 50,
        line: {
          color: this.gradientStartColor,
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
        showticklabels: false,
        showline: false,
      },
      yaxis: {
        showgrid: false,
        showticklabels: false,
        showline: false,
      },
    };

    if (this.appBackground) {
      layout.paper_bgcolor = 'ececec';
      layout.plot_bgcolor = 'ececec';
    }
    let config = {
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      responsive: true,
    };

    this.plotlyService.newPlot(this.ngChart.nativeElement, [sankeyData], layout, config)
      .then(chart => {
        this.addGradientElement();
        this.buildSvgArrows();
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


  buildNodes() {
    this.energyInput = this.results.totalInput;

    let flueGasLoss = this.results.totalFlueGas;
    let waterCoolingLoss = this.results.totalCoolingLoss;
    let wallLoss = this.results.totalWallLoss;
    let openingLoss = this.results.totalOpeningLoss;
    let leakageLoss = this.results.totalLeakageLoss;
    let atmosphereLoss = this.results.totalAtmosphereLoss;
    let fixtureLoss = this.results.totalFixtureLoss;
    let externalLoss = this.results.totalExtSurfaceLoss;
    let systemLoss = this.results.totalSystemLosses;
    let otherLoss = this.results.totalOtherLoss;
    let slagLoss = this.results.totalSlag;
    let exhaustLoss = this.results.totalExhaustGas;
    let chargeMaterialLoss = this.results.totalChargeMaterialLoss;

    let losses = {
      'Flue Gas': flueGasLoss,
      'Exhaust': exhaustLoss,
      'System': systemLoss,
      'Water Cooling': waterCoolingLoss,
      'Wall': wallLoss,
      'Opening': openingLoss,
      'Leakage': leakageLoss,
      'Atmosphere': atmosphereLoss,
      'Fixture': fixtureLoss,
      'External': externalLoss,
      'Other': otherLoss,
      'Slag': slagLoss,
    }

    this.nodes = [];
    if (this.settings.energyResultUnit !== 'kWh') {
      this.units = this.settings.energyResultUnit;
    } else {
      this.units = 'kW';
    }

    this.addInitialNodes();
    let currentPosition = 0;
    for (let lossName in losses) {
      if (losses[lossName] > 0) {
        let lossValue = (losses[lossName] / this.energyInput) * 100;
        this.addLossNode(losses[lossName], lossValue, lossName, currentPosition);
        currentPosition++;
      }
    }
    this.addEndNode(chargeMaterialLoss);
  }

  setExothermicHeat() {
    let tmpExothermicHeat = this.sankeyService.getExothermicHeat();
    if (tmpExothermicHeat !== 0 && tmpExothermicHeat !== null) {
      this.exothermicHeat = Math.abs(tmpExothermicHeat);
      this.energyInput = this.energyInput + this.exothermicHeat;
      this.exothermicHeatValue = (this.exothermicHeat / this.energyInput) * 100;
    }
  }

  addInitialNodes() {
    this.setExothermicHeat();
    this.setFuelAndChemical();
    this.electricalEnergy = this.sankeyService.getElectricalEnergy();

    let fuelValue = (this.fuelEnergy / this.energyInput) * 100;
    let electricalValue = (this.electricalEnergy / this.energyInput) * 100;

    if (this.fuelEnergy) {
      this.currentSourceIndex = 4;
      this.secondConnectorLoss = 6;
      // This represents the first connector added after the initialLossconnector
      this.subLossesConnectorIndex = 5;
      let totalInputValue = 100;
      let startingSource = 0;
      let spacerTarget = 3;

      if (this.exothermicHeat) {
        startingSource++;
        spacerTarget++;

        this.nodes.push(
          {
            name: this.getNameLabel("Exothermic Heat", this.exothermicHeat, this.exothermicHeatValue),
            value: this.exothermicHeatValue,
            x: .02,
            y: .9,
            source: 0,
            target: [startingSource + 2],
            isConnector: true,
            nodeColor: this.gradientStartColor,
            id: 'exothermicHeat'
          },
        );
        this.currentSourceIndex++;
        this.secondConnectorLoss++;
        this.subLossesConnectorIndex++;
      }

      this.nodes.push(
        {
          name: this.getNameLabel('Chemical Heat', this.fuelEnergy, fuelValue),
          value: fuelValue,
          x: .02,
          y: .2,
          source: startingSource,
          target: [startingSource + 2],
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'fuelConnector'
        },
        {
          name: this.getNameLabel("Electrical Heat", this.electricalEnergy, electricalValue),
          value: electricalValue,
          x: .02,
          y: .65,
          source: startingSource + 1,
          target: [startingSource + 2],
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'electricalConnector'
        },
        {
          name: `Total Energy`,
          value: totalInputValue,
          x: .2,
          y: .5,
          source: startingSource + 2,
          target: [spacerTarget],
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'spacer'
        },
        {
          name: "",
          value: 0,
          x: .35,
          y: .5,
          source: spacerTarget,
          target: this.initialLossConnectorTargets,
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'initialLossConnector'
        },
      );
    } else {
      this.currentSourceIndex = 3;
      this.secondConnectorLoss = 5;
      // This represents the first connector added after the initialLossconnector
      this.subLossesConnectorIndex = 4;

      let totalInputValue = 100;
      let startingSource = 0;

      if (this.exothermicHeat) {
        totalInputValue -= this.exothermicHeatValue;
        startingSource++;

        this.nodes.push(
          {
            name: this.getNameLabel('Exothermic Heat', this.exothermicHeat, this.exothermicHeatValue),
            value: this.exothermicHeatValue,
            x: .02,
            y: .95,
            source: 0,
            target: [startingSource + 1],
            isConnector: true,
            nodeColor: this.gradientStartColor,
            id: 'exothermicHeat'
          },
        );
        this.currentSourceIndex++;
        this.secondConnectorLoss++;
        this.subLossesConnectorIndex++;
      }

      this.nodes.push(
        {
          name: this.getNameLabel("Heat Input", this.energyInput - this.exothermicHeat, totalInputValue),
          value: totalInputValue,
          x: .02,
          y: .5,
          source: startingSource,
          target: [startingSource + 1],
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'originConnector'
        },
        {
          name: ``,
          value: 100,
          x: .2,
          y: .5,
          source: startingSource + 1,
          target: [startingSource + 2],
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'spacer'
        },
        {
          name: "",
          value: 0,
          x: .35,
          y: .5,
          source: startingSource + 2,
          target: this.initialLossConnectorTargets,
          isConnector: true,
          nodeColor: this.gradientStartColor,
          id: 'initialLossConnector'
        },
      );
    }
    this.initialLossConnectorTargets.push(this.currentSourceIndex);
  }

  addLossNode(loss: number, lossValue: number, lossName: string, lossNodeYIndex: number) {
    let lossNodeYPositions = [.1, .9, .2, .8, .15, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8];

    if (this.currentSourceIndex < this.subLossesConnectorIndex) {
      this.totalLosses += loss;
    }

    if (lossValue > this.minPlotlyDisplayValue) {
      if (this.currentSourceIndex > this.subLossesConnectorIndex) {
        let lossConnectorTargets = [this.currentSourceIndex + 1];
        this.hasLossConnectors = true;
        this.connectorNodeXPosition += .05;
        this.nodes.push(
          {
            name: "",
            value: ((this.energyInput - this.totalLosses) / this.energyInput) * 100,
            x: this.connectorNodeXPosition,
            y: .6,
            source: this.currentSourceIndex,
            target: lossConnectorTargets,
            isConnector: true,
            nodeColor: this.gradientStartColor,
            id: `${lossName.split(' ').join('')}LossConnector`
          },
        );
        if (this.currentSourceIndex == this.secondConnectorLoss) {
          this.initialLossConnectorTargets.push(this.secondConnectorLoss);
        } else {
          // Connect to the last loss connector added
          this.nodes[this.currentSourceIndex - 2].target.push(this.currentSourceIndex);
        }
        this.currentSourceIndex++;
      }

      this.lossNodeXPosition += .05
      this.nodes.push(
        {
          name: this.getNameLabel(lossName, loss, lossValue),
          value: lossValue,
          x: this.lossNodeXPosition,
          y: lossNodeYPositions[lossNodeYIndex],
          source: this.currentSourceIndex,
          target: [],
          isConnector: false,
          nodeColor: this.gradientEndColor,
          id: `${lossName.split(' ').join('')}Loss`
        }
      );
      if (this.currentSourceIndex <= this.subLossesConnectorIndex) {
        this.initialLossConnectorTargets.push(this.currentSourceIndex);
      }
      this.orangeLinkPaths.push(this.currentSourceIndex);
      this.currentSourceIndex++;
    } else {
      this.minLosses.push(
        {
          name: `${lossName} Loss`,
          text: `${this.decimalPipe.transform(loss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(lossValue, '1.1-2')}%)`,
        }
      );
    }

    if (this.currentSourceIndex > this.subLossesConnectorIndex) {
      this.totalLosses += loss;
    }
  }

  addEndNode(chargeMaterialLoss) {
    let chargeMaterialLossValue = (chargeMaterialLoss / this.energyInput) * 100;
    if (chargeMaterialLossValue > 0) {
      if (chargeMaterialLossValue > this.minPlotlyDisplayValue) {
        if (this.hasLossConnectors) {
          // Connect to the last loss connector added
          this.nodes[this.nodes.length - 2].target.push(this.currentSourceIndex);
        } else {
          this.initialLossConnectorTargets.push(this.currentSourceIndex);
        }
        this.nodes.push(
          {
            name: this.getNameLabel("Charge Material", chargeMaterialLoss, chargeMaterialLossValue),
            value: chargeMaterialLossValue,
            x: .9,
            y: .6,
            source: this.currentSourceIndex,
            target: [],
            isConnector: false,
            nodeColor: this.gradientEndColor,
            id: 'chargeMaterial'
          }
        );
        this.orangeLinkPaths.push(this.currentSourceIndex);
      } else {
        this.minLosses.push(
          {
            name: 'Charge Material',
            text: `${this.decimalPipe.transform(chargeMaterialLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(chargeMaterialLossValue, '1.1-2')}%)`,
          }
        );
      }
    }

  }


  setFuelAndChemical() {
    let totalFuelEnergy = 0;
    if ((this.sankeyService.getFuelEnergy() !== null && this.sankeyService.getFuelEnergy() !== undefined)
      || (this.sankeyService.getChemicalEnergy() !== null && this.sankeyService.getChemicalEnergy() !== undefined)) {
      if (this.sankeyService.getFuelEnergy() !== null && this.sankeyService.getFuelEnergy() !== undefined) {
        totalFuelEnergy = this.sankeyService.getFuelEnergy();
      }
      else {
        totalFuelEnergy += this.sankeyService.getChemicalEnergy();
      }

      this.fuelEnergy = totalFuelEnergy;
    }

  }

  getNameLabel(lossName: string, loss: number, lossValue: number) {
    let nameLabel: string;
    if (this.labelStyle == 'both') {
      nameLabel = `${lossName} ${this.decimalPipe.transform(loss, '1.0-0')} ${this.units}/hr (${this.decimalPipe.transform(lossValue, '1.1-1')}%)`
    } else if (this.labelStyle == 'power') {
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
    <linearGradient id="phastOrangeRedGradient">
      <stop offset="10%" stop-color="${this.gradientStartColor}" />
      <stop offset="100%" stop-color="${this.gradientEndColor}" />
    </linearGradient>
    <linearGradient id="phastExothermicGradient">
      <stop offset="10%" stop-color="${this.exothermicColor}" />
      <stop offset="100%" stop-color="${this.gradientStartColor}" />
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

    for (let i = 0; i < links.length; i++) {
      if (this.orangeLinkPaths.includes(i + 1)) {
        // To replicate Plotly event hover/unhover fill opacity
        // if (hoverData && hoverData.points[0].index == i+1) {
        //   fillOpacity = .4;
        // } 
        fill = 'url(#phastOrangeRedGradient) !important';
      } else if (this.exothermicHeat && this.exothermicHeatIndex == i + 1) {
        fill = 'url(#phastExothermicGradient) !important';
      } else {
        fill = `${this.gradientStartColor} !important`;
      }
      links[i].setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: ${fillOpacity};`);

      if (i == this.nodes.length - 1) {
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

        let arrowColor = this.gradientEndColor;

        sankeyNodes[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        sankeyNodes[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${arrowColor}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }


}
