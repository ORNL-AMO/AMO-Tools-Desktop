import { Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { PhastValidService } from '../../phast/phast-valid.service';
import { FuelResults, SankeyService } from '../../phast/sankey/sankey.service';
import { Assessment } from '../models/assessment';
import { PHAST } from '../models/phast/phast';
import { Settings } from '../models/settings';
import { PHASTSankeyNode } from "../models/phast/sankey.model";
import { DecimalPipe } from "@angular/common";

import * as Plotly from "plotly.js";

@Component({
  selector: 'app-phast-sankey',
  templateUrl: './phast-sankey.component.html',
  styleUrls: ['./phast-sankey.component.css']
})
export class PhastSankeyComponent implements OnInit, OnChanges {

  @Input()
  settings: Settings;
  @Input()
  location: string;
  @Input()
  phast: PHAST;
  @Input() 
  assessment: Assessment;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @Input()
  appBackground: boolean;

  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  isBaseline: boolean;
  firstChange: boolean = true;
  // availableHeatPercent: { val: number, name: string, x: number, y: number };
  // exothermicHeat: { val: number, name: string, x: number, y: number, units: string };

  links: Array<{ source: number, target: number }> = [];
  nodes: Array<PHASTSankeyNode> = [];

  gradientStartColor: string = '#a71600';
  gradientEndColor: string = '#ffa400';
  
  connectingNodes: Array<number>;
  orangeLinkPaths: Array<number>;
  minLosses: Array<{name: string, text: string}> = [];
  units: string = 'MMBtu';

  // node/link not rendered or too small to see
  minPlotlyDisplayValue = .1;
  
  currentSourceIndex = 0;
  initialLossConnectorTargets: Array<number> = [];
  energyInput: number = 0;
  totalLosses: number = 0;
  connectorNodeXPosition: number = .3;
  lossNodeXPosition: number = .3;
  initialLossConnectorIndex: number = 3;
  hasLossConnectors: boolean;

  constructor(private sankeyService: SankeyService, 
    private phastValidService: PhastValidService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe) { }

  ngOnInit() {
    this.phast.valid = this.phastValidService.checkValid(this.phast);
    if (this.location !== "sankey-diagram") {
      // this.location = this.location + this.modIndex.toString();
      if (this.location === 'baseline') {
        this.location = this.assessmentName + '-baseline';
        this.isBaseline = true;
      }
      else {
        this.location = this.assessmentName + '-modification';
        this.isBaseline = false;
      }

      if (this.printView) {
        this.location = this.location + '-' + this.modIndex;
      }
      this.location = this.location.replace(/ /g, "");
      this.location = this.location.replace(/[\])}[{(]/g, '');
      this.location = this.location.replace(/#/g, "");
    }
  }

  ngAfterViewInit() {
    if (this.phast.losses) {
      if (this.phast.valid.isValid) {
        this.makeSankey();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.phast) {
      this.phast.valid = this.phastValidService.checkValid(this.phast);
      if (!changes.phast.firstChange) {
        if (this.location !== "sankey-diagram") {
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
        if (this.phast.valid.isValid) {
          this.makeSankey();
        }
      }
    }
  }

  // calcAvailableHeatPercent(results: FuelResults) {
  //   let availableHeatX = 450;
  //   let availableHeatY = 740;
  //   this.availableHeatPercent = {
  //     val: results.availableHeatPercent,
  //     x: availableHeatX,
  //     y: availableHeatY,
  //     name: "Available Heat"
  //   };
  // }

  makeSankey() {
    let results = this.sankeyService.getFuelTotals(this.phast, this.settings);
    console.log(results);
    if (results.totalInput > 0) {
      // this.calcAvailableHeatPercent(results);
      // this.sankey(results);
      this.initSankeySetup(results);
      this.renderSankey();
    }
  }

  initSankeySetup(results) {
    this.units = this.settings.steamEnergyMeasurement;
    this.orangeLinkPaths = [];
    this.connectingNodes = [];
    this.minLosses = [];

    this.currentSourceIndex = 2;
    this.connectorNodeXPosition = .3;
    this.lossNodeXPosition = .3;

    this.totalLosses = 0;
    this.initialLossConnectorTargets = [];
    this.initialLossConnectorTargets.push(this.currentSourceIndex);

    this.buildNodes(results);
    this.buildLinks();
  }

  renderSankey() {
    if (this.ngChart) {
      Plotly.purge(this.ngChart.nativeElement); 
    }

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
        showticklabels:false,
        showline:false,
      },
      yaxis: {
        showgrid: false,
        showticklabels:false,
        showline:false,
      },
    };

    if (this.appBackground) {
      layout.paper_bgcolor = 'ececec';
      layout.plot_bgcolor = 'ececec';
    }

    let config = {
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
      responsive: true,
    };

    Plotly.newPlot(this.ngChart.nativeElement, [sankeyData], layout, config)
    .then(chart => {
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

    this.addGradientElement();
    this.buildSvgArrows();
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

  addLossNode(loss: number, lossValue: number, lossName: string, lossNodeYIndex: number) {
    let lossNodeYPositions = [.1, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8];

    if (this.currentSourceIndex < this.initialLossConnectorIndex) {
      this.totalLosses += loss;
    }

    if (lossValue > this.minPlotlyDisplayValue) {
      if (this.currentSourceIndex > this.initialLossConnectorIndex) {
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
        if (this.currentSourceIndex == 4) {
          this.initialLossConnectorTargets.push(4);
        } else {
          // Connect to the last loss connector added
          this.nodes[this.currentSourceIndex - 2].target.push(this.currentSourceIndex);
        }
        this.currentSourceIndex++;
      }

      this.lossNodeXPosition += .05
      this.nodes.push(
        {
          name: `${lossName} ${this.decimalPipe.transform(loss, '1.0-2')} ${this.units}/hr`,
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
      if (this.currentSourceIndex <= this.initialLossConnectorIndex) {
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

    if (this.currentSourceIndex > this.initialLossConnectorIndex) {
      this.totalLosses += loss;
    }
  }

  addInitialNodes() {
    this.nodes.push(
      {
        name: "Gross Heat " + this.decimalPipe.transform(this.energyInput, '1.0-2') + `  ${this.units}/hr`,
        value: 100,
        x: .02,
        y: .5,
        source: 0,
        target: [1],
        isConnector: true,
        nodeColor: this.gradientStartColor,
        id: 'originConnector'
      },
      {
        name: "",
        value: 0,
        x: .2,
        y: .5,
        source: 1,
        target: this.initialLossConnectorTargets,
        isConnector: true,
        nodeColor: this.gradientStartColor,
        id: 'initialLossConnector'
      },
    );
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
           name: "Charge Material " + this.decimalPipe.transform(chargeMaterialLoss, '1.0-2') + `  ${this.units}/hr`,
           value: chargeMaterialLossValue,
           x: .95,
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

  buildNodes(results: FuelResults) {
    this.energyInput = results.totalInput;
    let flueGasLoss = results.totalFlueGas;
    let waterCoolingLoss = results.totalCoolingLoss;
    let wallLoss = results.totalWallLoss;
    let openingLoss = results.totalOpeningLoss;
    let leakageLoss = results.totalLeakageLoss;
    let atmosphereLoss = results.totalAtmosphereLoss;
    let fixtureLoss = results.totalFixtureLoss;
    let externalLoss = results.totalExtSurfaceLoss;
    let systemLoss = results.totalSystemLosses;
    let otherLoss = results.totalOtherLoss;
    let slagLoss = results.totalSlag;
    let exhaustLoss = results.totalExhaustGas;
    let chargeMaterialLoss = results.totalChargeMaterialLoss;
    
    let losses = {
      'Flue Gas': flueGasLoss,
      'Water Cooling': waterCoolingLoss,
      'Wall': wallLoss,
      'Opening': openingLoss,
      'Leakage': leakageLoss,
      'Atmosphere': atmosphereLoss,
      'Fixture': fixtureLoss,
      'External': externalLoss,
      'System': systemLoss,
      'Other': otherLoss,
      'Slag': slagLoss,
      'Exhaust': exhaustLoss,
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

    console.log(this.nodes);
    console.log(this.totalLosses);
    console.log(this.orangeLinkPaths);
  }

  // buildNodes(results: FuelResults) {
  //   this.nodes = [];
  //   if (this.settings.energyResultUnit !== 'kWh') {
  //     this.units = this.settings.energyResultUnit;
  //   } else {
  //     this.units = 'kW';
  //   }
    
  //   let energyInput = results.totalInput;
  //   let flueGasLoss = results.totalFlueGas;
  //   let waterCoolingLoss = results.totalCoolingLoss;
  //   let wallLoss = results.totalWallLoss;
  //   let openingLoss = results.totalOpeningLoss;
  //   let leakageLoss = results.totalLeakageLoss;
  //   let atmosphereLoss = results.totalAtmosphereLoss;
  //   let fixtureLoss = results.totalFixtureLoss;
  //   let externalLoss = results.totalExtSurfaceLoss;
  //   let systemLoss = results.totalSystemLosses;
  //   let otherLoss = results.totalOtherLoss;
  //   let slagLoss = results.totalSlag;
  //   let exhaustLoss = results.totalExhaustGas;
  //   let chargeMaterialLoss = results.totalChargeMaterialLoss;
  //   let totalLosses = 0;
    
  //   let flueGasLossValue = (flueGasLoss / energyInput) * 100;
  //   let waterCoolingLossValue = (waterCoolingLoss / energyInput) * 100;
  //   let wallLossValue = (wallLoss / energyInput) * 100;
  //   let openingLossValue = (openingLoss / energyInput) * 100;
  //   let leakageLossValue = (leakageLoss / energyInput) * 100;
  //   let atmosphereLossValue = (atmosphereLoss / energyInput) * 100;
  //   let fixtureLossValue = (fixtureLoss / energyInput) * 100;
  //   let externalLossValue = (externalLoss / energyInput) * 100;
  //   let systemLossValue = (systemLoss / energyInput) * 100;
  //   let otherLossValue = (otherLoss / energyInput) * 100;
  //   let slagLossValue = (slagLoss / energyInput) * 100;
  //   let exhaustLossValue = (exhaustLoss / energyInput) * 100;
  //   let chargeMaterialLossValue = (chargeMaterialLoss / energyInput) * 100;


  //   console.log('flueGasLossValue', flueGasLossValue);
  //   console.log('waterCoolingLossValue', waterCoolingLossValue);
  //   console.log('wallLossValue', wallLossValue);
  //   console.log('openingLossValue', openingLossValue);
  //   console.log('leakageLossValue', leakageLossValue);
  //   console.log('atmosphereLossValue', atmosphereLossValue);
  //   console.log('fixtureLossValue', fixtureLossValue);
  //   console.log('externalLossValue', externalLossValue);
  //   console.log('systemLossValue', systemLossValue);
  //   console.log('otherLossValue', otherLossValue);
  //   console.log('slagLossValue', slagLossValue);
  //   console.log('exhaustLossValue', exhaustLossValue);
  //   console.log('chargeMaterialLossValue', chargeMaterialLossValue);

  //   // Will always target Flue / Electro-chem loss
  //   let initialLossConnectorTargets = [2];
  //   let currentConnectorTargets: Array<number> = initialLossConnectorTargets;

  //   let currentSourceIndex = 2;
  //   this.nodes.push(
  //     {
  //       name: "Gross Heat " + this.decimalPipe.transform(energyInput, '1.0-2') + `  ${this.units}/hr`,
  //       value: 100,
  //       x: .02,
  //       y: .5,
  //       source: 0,
  //       target: [1],
  //       isConnector: true,
  //       nodeColor: this.gradientStartColor,
  //       id: 'originConnector'
  //     },
  //     {
  //       name: "",
  //       value: 0,
  //       x: .2,
  //       y: .5,
  //       source: 1,
  //       target: initialLossConnectorTargets,
  //       isConnector: true,
  //       nodeColor: this.gradientStartColor,
  //       id: 'initialLossConnector'
  //     },
  //   );

  //   if (flueGasLossValue > 0) {
  //     totalLosses += flueGasLoss;
  //     if (flueGasLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "Flue Gas Losses " + this.decimalPipe.transform(flueGasLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: flueGasLossValue,
  //             x: .35,
  //             y: .1,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'flueGasLoss'
  //           },
  //         );
  //         initialLossConnectorTargets.push(currentSourceIndex);
  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Flue Gas Loss',
  //             text: `${this.decimalPipe.transform(flueGasLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(flueGasLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //   }

  //   if (waterCoolingLossValue > 0) {
  //     totalLosses += waterCoolingLoss;
  //     if (waterCoolingLossValue > this.minPlotlyDisplayValue) {
  //         this.nodes.push(
  //           {
  //             name: "Water Cooling Loss " + this.decimalPipe.transform(waterCoolingLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: waterCoolingLossValue,
  //             x: .35,
  //             y: .9,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'waterCoolingLoss'
  //           },
  //         );
  //         initialLossConnectorTargets.push(currentSourceIndex);
  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Water Cooling Loss',
  //             text: `${this.decimalPipe.transform(waterCoolingLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(waterCoolingLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //   }


  //   if (wallLossValue > 0) {
  //     let wallConnectorTargets = [currentSourceIndex + 1];
  //     if (wallLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .3,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: wallConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'wallLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = wallConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Wall Loss " + this.decimalPipe.transform(wallLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: wallLossValue,
  //             x: .4,
  //             y: .25,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'wallLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Wall Loss',
  //             text: `${this.decimalPipe.transform(wallLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(wallLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += wallLoss;

  //   }

  //   if (openingLossValue > 0) {
  //     let openingConnectorTargets = [currentSourceIndex + 1];
  //     if (openingLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .35,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: openingConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'openingLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = openingConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Opening Loss " + this.decimalPipe.transform(openingLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: openingLossValue,
  //             x: .4,
  //             y: .8,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'openingLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Opening Loss',
  //             text: `${this.decimalPipe.transform(openingLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(openingLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += openingLoss;

  //   }

  //   if (leakageLossValue > 0) {
  //     let leakageConnectorTargets = [currentSourceIndex + 1];
  //     if (leakageLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .4,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: leakageConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'leakageLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = leakageConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Leakage Loss " + this.decimalPipe.transform(leakageLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: leakageLossValue,
  //             x: .45,
  //             y: .4,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'leakageLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Leakage Loss',
  //             text: `${this.decimalPipe.transform(leakageLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(leakageLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += leakageLoss;
  //   }


  //   if (atmosphereLossValue > 0) {
  //     let atmpshereConnectorTargets = [currentSourceIndex + 1];
  //     if (atmosphereLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .45,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: atmpshereConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'atmosphereLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = atmpshereConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Atmosphere Loss " + this.decimalPipe.transform(atmosphereLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: atmosphereLossValue,
  //             x: .5,
  //             y: .15,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'atmosphereLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Atmosphere Loss',
  //             text: `${this.decimalPipe.transform(atmosphereLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(atmosphereLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }

  //     totalLosses += atmosphereLoss;
  //   }

  //   if (fixtureLossValue > 0) {
  //     let fixtureConnectorTargets = [currentSourceIndex + 1];
  //     if (fixtureLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .55,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: fixtureConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'fixtureLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = fixtureConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Fixture Loss " + this.decimalPipe.transform(fixtureLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: fixtureLossValue,
  //             x: .6,
  //             y: .8,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'fixtureLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Fixture Loss',
  //             text: `${this.decimalPipe.transform(fixtureLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(fixtureLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //       totalLosses += fixtureLoss;
  //   }


  //   if (externalLossValue > 0) {
  //     let externalConnectorTargets = [currentSourceIndex + 1];
  //     if (externalLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .65,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: externalConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'externalLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = externalConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "External Loss " + this.decimalPipe.transform(externalLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: externalLossValue,
  //             x: .7,
  //             y: .2,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'externalLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'External Loss',
  //             text: `${this.decimalPipe.transform(externalLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(externalLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += externalLoss;
  //   }

  //   if (systemLossValue > 0) {
  //     let systemConnectorTargets = [currentSourceIndex + 1];
  //     if (systemLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .7,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: systemConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'systemLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = systemConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "System Loss " + this.decimalPipe.transform(systemLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: systemLossValue,
  //             x: .75,
  //             y: .7,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'systemLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'System Loss',
  //             text: `${this.decimalPipe.transform(systemLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(systemLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += systemLoss;
  //   }


  //   if (otherLossValue > 0) {
  //     let otherConnectorTargets = [currentSourceIndex + 1];
  //     if (otherLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .75,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: otherConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'otherLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = otherConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Other Loss " + this.decimalPipe.transform(otherLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: otherLossValue,
  //             x: .8,
  //             y: .3,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'otherLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Other Loss',
  //             text: `${this.decimalPipe.transform(otherLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(otherLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += otherLoss;
  //   }

  //   if (slagLossValue > 0) {
  //     let slagConnectorTargets = [currentSourceIndex + 1];
  //     if (slagLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .8,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: slagConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'slagLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = slagConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Slag Loss " + this.decimalPipe.transform(slagLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: slagLossValue,
  //             x: .85,
  //             y: .15,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'slagLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Slag Loss',
  //             text: `${this.decimalPipe.transform(slagLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(slagLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += slagLoss;
  //   }


  //   if (exhaustLossValue > 0) {
  //     let exhaustConnectorTargets = [currentSourceIndex + 1];
  //     if (exhaustLossValue > this.minPlotlyDisplayValue) {
  //       this.nodes.push(
  //           {
  //             name: "",
  //             value: ((energyInput - totalLosses) / energyInput) * 100,
  //             x: .85,
  //             y: .6,
  //             source: currentSourceIndex,
  //             target: exhaustConnectorTargets,
  //             isConnector: true,
  //             nodeColor: this.gradientStartColor,
  //             id: 'exhaustLossConnector'
  //           },
  //         );
  //         currentConnectorTargets.push(currentSourceIndex);
  //         currentConnectorTargets = exhaustConnectorTargets;
  //         currentSourceIndex++;

  //         this.nodes.push(
  //           {
  //             name: "Exhaust Loss " + this.decimalPipe.transform(exhaustLoss, '1.0-2') + `  ${this.units}/hr`,
  //             value: exhaustLossValue,
  //             x: .9,
  //             y: .8,
  //             source: currentSourceIndex,
  //             target: [],
  //             isConnector: false,
  //             nodeColor: this.gradientEndColor,
  //             id: 'exhaustLoss'
  //           },
  //         );

  //         this.orangeLinkPaths.push(currentSourceIndex);
  //         currentSourceIndex++;
  //       } else {
  //         this.minLosses.push(
  //           {
  //             name: 'Exhaust Loss',
  //             text: `${this.decimalPipe.transform(exhaustLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(exhaustLossValue, '1.1-2')}%)`,
  //           }
  //         );
  //       }
  //     totalLosses += exhaustLoss;
  //   }


  //   // ENDING NODE
  //   //  Will always have some charge material loss
  //    if (chargeMaterialLossValue > 0) {
  //      chargeMaterialLossValue = (chargeMaterialLoss / energyInput) * 100;
  //     if (chargeMaterialLossValue > this.minPlotlyDisplayValue) {
  //       // Add to targets of whatever the last loss connector node 
  //       this.nodes[this.nodes.length - 2].target.push(currentSourceIndex);
  //       this.nodes.push(
  //         {
  //           name: "Charge Material " + this.decimalPipe.transform(chargeMaterialLoss, '1.0-2') + `  ${this.units}/hr`,
  //           value: chargeMaterialLossValue,
  //           x: .95,
  //           y: .6,
  //           source: currentSourceIndex,
  //           target: [],
  //           isConnector: false,
  //           nodeColor: this.gradientEndColor,
  //           id: 'chargeMaterial'
  //         }
  //       );
  //       this.orangeLinkPaths.push(currentSourceIndex);
  //     } else {
  //       this.minLosses.push(
  //         {
  //           name: 'Charge Material',
  //           text: `${this.decimalPipe.transform(chargeMaterialLoss, '1.0-2')} ${this.units}/hr (${this.decimalPipe.transform(chargeMaterialLossValue, '1.1-2')}%)`,
  //         }
  //       );
  //     }
  //   }

  // }

  addGradientElement(): void {
    let mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    let svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="ssmtOrangeRedGradient">
      <stop offset="10%" stop-color="${this.gradientStartColor}" />
      <stop offset="100%" stop-color="${this.gradientEndColor}" />
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
        fill = 'url(#ssmtOrangeRedGradient) !important';
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
