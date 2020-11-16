import { Injectable, Input } from '@angular/core';
import { ShowResultsCategories, PhastResults } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastResultsService } from '../phast-results.service';
import * as d3 from 'd3';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class SankeyService {

  baseSize: number = 300;
  exothermicHeat: number;
  exothermicHeatSpacing: number;
  outputRatio: number;
  fuelEnergy: number;
  electricalEnergy: number;
  chemicalEnergy: number;

  constructor(private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService) { }


  getFuelTotals(phast: PHAST, settings: Settings): FuelResults {
    let resultCats: ShowResultsCategories = this.phastResultsService.getResultCategories(settings);
    let phastResults: PhastResults = this.phastResultsService.getResults(phast, settings);
    let results: FuelResults = this.initFuelResults();

    this.electricalEnergy = null;
    this.fuelEnergy = null;
    this.chemicalEnergy = null;

    if (phast.losses.energyInputExhaustGasLoss && !resultCats.showFlueGas && resultCats.showEnInput2) {
      if (phast.losses.energyInputExhaustGasLoss.length > 0) {
        this.setFuelEnergy(phast.losses.energyInputExhaustGasLoss, settings.unitsOfMeasure);
        this.electricalEnergy = phastResults.electricalHeatDelivered;
      }
    }

    if (phast.losses.energyInputEAF && !resultCats.showFlueGas && !resultCats.showEnInput2) {
      if (phast.losses.energyInputEAF.length > 0) {
        this.setChemicalEnergy(phastResults);
        this.electricalEnergy = phastResults.energyInputHeatDelivered;
      }
    }

    this.exothermicHeat = phastResults.exothermicHeat;
    // let constant = 1;
    // if (settings.energySourceType != 'Electricity') {
    //   constant = 1000000
    // }
    if (phastResults.totalWallLoss) {
      results.totalWallLoss = phastResults.totalWallLoss;
    }
    if (phastResults.totalAtmosphereLoss) {
      results.totalAtmosphereLoss = phastResults.totalAtmosphereLoss;
    }
    if (phastResults.totalOtherLoss) {
      results.totalOtherLoss = phastResults.totalOtherLoss;
    }
    if (phastResults.totalCoolingLoss) {
      results.totalCoolingLoss = phastResults.totalCoolingLoss;
    }
    if (phastResults.totalOpeningLoss) {
      results.totalOpeningLoss = phastResults.totalOpeningLoss;
    }
    if (phastResults.totalFixtureLoss) {
      results.totalFixtureLoss = phastResults.totalFixtureLoss;
    }
    if (phastResults.totalLeakageLoss) {
      results.totalLeakageLoss = phastResults.totalLeakageLoss;
    }
    if (phastResults.totalExtSurfaceLoss) {
      results.totalExtSurfaceLoss = phastResults.totalExtSurfaceLoss;
    }
    if (phastResults.totalChargeMaterialLoss) {
      results.totalChargeMaterialLoss = phastResults.totalChargeMaterialLoss;
    }
    if (resultCats.showFlueGas && phastResults.totalFlueGas) {
      results.totalFlueGas = phastResults.totalFlueGas;
    }
    if (resultCats.showAuxPower && phastResults.totalAuxPower) {
      results.totalAuxPower = phastResults.totalAuxPower;
    }
    if (resultCats.showSlag && phastResults.totalSlag) {
      results.totalSlag = phastResults.totalSlag;
    }
    if (resultCats.showExGas && phastResults.totalExhaustGasEAF) {
      results.totalExhaustGas = phastResults.totalExhaustGasEAF;
    }
    if (resultCats.showEnInput2 && phastResults.totalExhaustGas) {
      results.totalExhaustGas = phastResults.totalExhaustGas;
    }
    if (phastResults.totalSystemLosses && resultCats.showSystemEff) {
      results.totalSystemLosses = phastResults.totalSystemLosses;
    }
    results.totalInput = phastResults.grossHeatInput;

    results.availableHeatPercent = (1 - ((results.totalSystemLosses + results.totalFlueGas + results.totalExhaustGas) / results.totalInput)) * 100;

    results.nodes = this.getNodes(results, settings);

    return results;
  }

  setOutputRatio(input: number, output: number) {

  }


  getNodes(results: FuelResults, settings: Settings) {

    var chargeMaterialX = 2400;   // x position of useful output arrow
    var arrowCount = 0;           // store the number of loss sources
    var ventOffsetX = 0;          // store x position offset by vent arrow
    var spacing = 0;              // space between each arrow, calc based on number of arrows

    if (results.totalAtmosphereLoss) {
      arrowCount++;
    }
    if (results.totalAuxPower) {
      arrowCount++;
    }
    if (results.totalCoolingLoss) {
      arrowCount++;
    }
    if (results.totalExtSurfaceLoss) {
      arrowCount++;
    }
    if (results.totalFixtureLoss) {
      arrowCount++;
    }
    if (results.totalLeakageLoss) {
      arrowCount++;
    }
    if (results.totalOpeningLoss) {
      arrowCount++;
    }
    if (results.totalOtherLoss) {
      arrowCount++;
    }
    if (results.totalSlag) {
      arrowCount++;
    }
    if (results.totalWallLoss) {
      arrowCount++;
    }

    let unit: string;
    if (settings.energyResultUnit !== 'kWh') {
      unit = settings.energyResultUnit + '/hr';
    } else {
      unit = 'kW';
    }

    let tmpNode;
    tmpNode = this.createNode("Gross Heat", results.totalInput, this.baseSize, 300, 285, 0, true, false, false, false, unit, false);
    results.nodes.push(tmpNode);
    tmpNode = this.createNode("inter1", 0, 0, 0, 350, 0, false, false, true, true, unit, false);
    results.nodes.push(tmpNode);
    let interIndex = 2;

    ventOffsetX = (275 * interIndex);
    spacing = (chargeMaterialX - ventOffsetX) / (arrowCount + 1);
    let exoSpacing = spacing * arrowCount + ventOffsetX;

    var scale = d3.scaleLinear()
      .domain([2, interIndex + arrowCount + 1])
      .range([ventOffsetX, chargeMaterialX]);

    let top: boolean = false;


    // FLUE GAS ARROW
    // one of three
    // Flue Gas
    if (results.totalFlueGas) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Flue Gas Loss", results.totalFlueGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, false, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
    }
    // Exhaust Gas EAF
    if (results.totalExhaustGas) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Exhaust Gas Loss", results.totalExhaustGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, false, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
    }

    if (results.totalSystemLosses) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("System Loss", results.totalSystemLosses, 0, 0, spacing, 0, false, false, false, true, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, false, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
    }
    // end flue gas arrow


    // Atmosphere
    if (results.totalAtmosphereLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Atmosphere Loss", results.totalAtmosphereLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Other
    if (results.totalOtherLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Other Loss", results.totalOtherLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Cooling
    if (results.totalCoolingLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Water Cooling Loss", results.totalCoolingLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Wall
    if (results.totalWallLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Wall Loss", results.totalWallLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Opening
    if (results.totalOpeningLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Opening Loss", results.totalOpeningLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Fixture
    if (results.totalFixtureLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Fixture/Trays Loss", results.totalFixtureLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Leakage
    if (results.totalLeakageLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Hot Gas Leakage Loss", results.totalLeakageLoss, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // External Surface
    if (results.totalExtSurfaceLoss) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("External Surface \n  Loss", results.totalExtSurfaceLoss, 0, 0, spacing, 0, false, false, false, top, unit, true);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // auxiliary power losses
    if (results.totalAuxPower) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Auxiliary Power Loss", results.totalAuxPower, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // slag
    if (results.totalSlag) {
      spacing = scale(interIndex);
      tmpNode = this.createNode("Slag Loss", results.totalSlag, 0, 0, spacing, 0, false, false, false, top, unit, false);
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, spacing, 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }


    spacing = scale(interIndex);
    this.exothermicHeatSpacing = exoSpacing;
    tmpNode = this.createNode("Charge Material", results.totalChargeMaterialLoss, 0, 0, spacing, 0, false, true, false, false, unit, false);
    results.nodes.push(tmpNode);
    return results.nodes;
  }


  createNode(name: string, value: number, displaySize: number, width: number, x: number, y: number, input: boolean, usefulOutput: boolean, inter: boolean, top: boolean, units: string, extSurfaceLoss: boolean, availableHeatPercent?: boolean): SankeyNode {
    let newNode: SankeyNode = {
      name: name,
      value: value,
      displaySize: displaySize,
      width: width,
      x: x,
      y: y,
      input: input,
      usefulOutput: usefulOutput,
      inter: inter,
      top: top,
      units: units,
      extSurfaceLoss: extSurfaceLoss,
      availableHeatPercent: false
    };
    if (availableHeatPercent) {
      newNode.availableHeatPercent = true;
    }
    return newNode;
  }


  initFuelResults(): FuelResults {
    let results: FuelResults = {
      totalInput: 0,
      totalChargeMaterialLoss: 0,
      totalWallLoss: 0,
      totalOtherLoss: 0,
      totalOpeningLoss: 0,
      totalLeakageLoss: 0,
      totalFixtureLoss: 0,
      totalExtSurfaceLoss: 0,
      totalCoolingLoss: 0,
      totalAtmosphereLoss: 0,
      totalFlueGas: 0,
      totalSlag: 0,
      totalAuxPower: 0,
      totalEnergyInputEAF: 0,
      totalEnergyInput: 0,
      totalExhaustGas: 0,
      totalSystemLosses: 0,
      availableHeatPercent: 0,
      nodes: new Array<SankeyNode>()
    };
    return results;
  }

  getExothermicHeat(): number {
    return this.exothermicHeat;
  }

  getExothermicHeatSpacing(): number {
    return this.exothermicHeatSpacing;
  }
  
  setChemicalEnergy(phastResults: PhastResults) {
    this.chemicalEnergy = phastResults.energyInputTotalChemEnergy;
  }


  getChemicalEnergy(): number {
    return this.chemicalEnergy;
  }

  setFuelEnergy(fuelEnergy: Array<any>, unitsOfMeasure: string) {
    this.fuelEnergy = 0;

    for (let i = 0; i < fuelEnergy.length; i++) {
      this.fuelEnergy += fuelEnergy[i].totalHeatInput;
    }

    if (unitsOfMeasure === 'Metric') {
      this.fuelEnergy = this.convertUnitsService.value(this.fuelEnergy).from('GJ').to('kWh');
    }
    else {
      this.fuelEnergy = this.convertUnitsService.value(this.fuelEnergy).from('MMBtu').to('kWh');
    }
  }

  getFuelEnergy(): number {
    return this.fuelEnergy;
  }

  getElectricalEnergy(): number {
    return this.electricalEnergy;
  }
}

export interface FuelResults {
  totalInput: number;
  totalChargeMaterialLoss: number;
  totalWallLoss: number;
  totalOtherLoss: number;
  totalOpeningLoss: number;
  totalLeakageLoss: number;
  totalFixtureLoss: number;
  totalExtSurfaceLoss: number;
  totalCoolingLoss: number;
  totalAtmosphereLoss: number;
  totalFlueGas: number;
  totalSlag: number;
  totalAuxPower: number;
  totalEnergyInputEAF: number;
  totalEnergyInput: number;
  totalExhaustGas: number;
  totalSystemLosses: number;
  availableHeatPercent: number;
  nodes?: Array<SankeyNode>;
}

export interface SankeyNode {
  name: string;
  value: number;
  displaySize: number;
  width: number;
  x: number;
  y: number;
  input: boolean;
  usefulOutput: boolean;
  inter: boolean;
  top: boolean;
  units: string;
  extSurfaceLoss: boolean;
  availableHeatPercent: boolean;
}
