import { Injectable } from '@angular/core';
import { PhastService } from '../phast.service';
import { Losses } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
@Injectable()
export class SankeyService {
  baseSize: number = 300;
  constructor(private phastService: PhastService) { }

  getFuelTotals(losses: Losses, settings: Settings): FuelResults {
    let results: FuelResults = this.initFuelResults();
    if (losses.wallLosses != null) {
      results.totalWallLoss = this.phastService.sumWallLosses(losses.wallLosses, settings) / 1000000;
      results.numValues++;
    }
    if (losses.wallLosses != null) {
      results.totalAtmosphereLoss = this.phastService.sumAtmosphereLosses(losses.atmosphereLosses, settings) / 1000000;
      results.numValues++;
    }
    if (losses.otherLosses != null) {
      results.totalOtherLoss = this.phastService.sumOtherLosses(losses.otherLosses) / 1000000;
      results.numValues++;
    }
    if (losses.coolingLosses != null) {
      results.totalCoolingLoss = this.phastService.sumCoolingLosses(losses.coolingLosses, settings) / 1000000;
      results.numValues++;
    }
    if (losses.openingLosses != null) {
      results.totalOpeningLoss = this.phastService.sumOpeningLosses(losses.openingLosses, settings) / 1000000;
      results.numValues++;
    }
    if (losses.fixtureLosses != null) {
      results.totalFixtureLoss = this.phastService.sumFixtureLosses(losses.fixtureLosses, settings) / 1000000;
      results.numValues++;
    }
    if (losses.leakageLosses != null) {
      results.totalLeakageLoss = this.phastService.sumLeakageLosses(losses.leakageLosses, settings) / 1000000;
      results.numValues++;
    }
    if (losses.extendedSurfaces != null) {
      results.totalExtSurfaceLoss = this.phastService.sumExtendedSurface(losses.extendedSurfaces, settings) / 1000000;
      results.numValues++;
    }
    if (losses.chargeMaterials != null) {
      results.totalChargeMaterialLoss = this.phastService.sumChargeMaterials(losses.chargeMaterials, settings) / 1000000;
      results.numValues++;
    }

    if (losses.flueGasLosses != null) {
      if (losses.flueGasLosses[0].flueGasType == 'By Volume') {
        let tmpResult = this.phastService.flueGasByVolume(losses.flueGasLosses[0].flueGasByVolume, settings);
        let grossHeat = this.phastService.sumHeatInput(losses, settings) / tmpResult;
        results.totalFlueGas = grossHeat * (1 - tmpResult) / 1000000;;

      } else if (losses.flueGasLosses[0].flueGasType == 'By Mass') {
        let tmpResult = this.phastService.flueGasByMass(losses.flueGasLosses[0].flueGasByMass, settings);
        let grossHeat = this.phastService.sumHeatInput(losses, settings) / tmpResult;
        results.totalFlueGas = grossHeat * (1 - tmpResult) / 1000000;;
      }
      results.numValues++;
    }
    results.totalInput = results.totalWallLoss + results.totalAtmosphereLoss + results.totalOtherLoss + results.totalCoolingLoss + results.totalOpeningLoss + results.totalFixtureLoss + results.totalLeakageLoss + results.totalExtSurfaceLoss + results.totalChargeMaterialLoss;
    results.nodes = this.getNodes(results);
    return results;

  }

  getNodes(results: FuelResults) {
    let tmpNode = this.createNode("Input", results.totalInput, this.baseSize, 300, 200, 0, true, false, false, false, "MMBtu/hr")
    results.nodes.push(tmpNode);
    tmpNode = this.createNode("inter1", 0, 0, 0, 350, 0, false, false, true, true, "MMBtu/hr")
    results.nodes.push(tmpNode);
    let interIndex = 2;
    //Flue Gas
    if (results.totalFlueGas) {
      tmpNode = this.createNode("Flue Gas Losses", results.totalFlueGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, "MMBtu/hr")
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Atmoshpere
    if (results.totalAtmosphereLoss) {
      tmpNode = this.createNode("Atmosphere Losses", results.totalAtmosphereLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, false, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, true, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Other
    if (results.totalOtherLoss) {
      tmpNode = this.createNode("Other Losses", results.totalOtherLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Cooling
    if (results.totalCoolingLoss) {
      tmpNode = this.createNode("Water Cooling Losses", results.totalCoolingLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, false, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, true, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Wall
    if (results.totalWallLoss) {
      tmpNode = this.createNode("Wall Losses", results.totalWallLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Opening
    if (results.totalOpeningLoss) {
      tmpNode = this.createNode("Opening Losses", results.totalOpeningLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, false, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, true, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Fixture
    if (results.totalFixtureLoss) {
      tmpNode = this.createNode("Fixture/Conveyor Losses", results.totalFixtureLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Leakage
    if (results.totalLeakageLoss) {
      tmpNode = this.createNode("Leakage Losses", results.totalLeakageLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, false, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, true, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //External Surface
    if (results.totalExtSurfaceLoss) {
      tmpNode = this.createNode("External Surface Losses", results.totalExtSurfaceLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, "MMBtu/hr")
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, true, "MMBtu/hr");
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Output
    tmpNode = this.createNode("Useful Output", results.totalChargeMaterialLoss, 0, 0, 2800, 0, false, true, false, false, "MMBtu/hr")
    results.nodes.push(tmpNode);
    interIndex++;
    return results.nodes;
  }


  createNode(name: string, value: number, displaySize: number, width: number, x: number, y: number, input: boolean, usefulOutput: boolean, inter: boolean, top: boolean, units: string): SankeyNode {
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
      units: units
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
      nodes: new Array<SankeyNode>(),
      numValues: 0
    }
    return results;
  }
}

export interface FuelResults {
  totalInput: number,
  totalChargeMaterialLoss: number,
  totalWallLoss: number,
  totalOtherLoss: number,
  totalOpeningLoss: number,
  totalLeakageLoss: number,
  totalFixtureLoss: number,
  totalExtSurfaceLoss: number,
  totalCoolingLoss: number,
  totalAtmosphereLoss: number,
  totalFlueGas: number,
  nodes: Array<SankeyNode>,
  numValues: 0
}

export interface SankeyNode {
  name: string,
  value: number,
  displaySize: number,
  width: number,
  x: number,
  y: number,
  input: boolean,
  usefulOutput: boolean,
  inter: boolean,
  top: boolean,
  units: string
}