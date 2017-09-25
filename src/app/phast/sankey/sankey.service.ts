import { Injectable } from '@angular/core';
import { PhastService } from '../phast.service';
import { Losses } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';

@Injectable()
export class SankeyService {
  baseSize: number = 300;
  constructor(private phastService: PhastService) { }

  checkLoss(loss: any) {
    if (!loss) {
      return false;
    }
    else if (loss.length == 0) {
      return false;
    } else {
      return true;
    }
  }


  getFuelTotals(phast: PHAST, settings: Settings): FuelResults {
    let showFlueGas, showSlag, showExGas, showEnInput1, showEnInput2, showAuxPower, showSystemEff: boolean = false;

    if (settings.energySourceType == 'Fuel') {
      showFlueGas = true;
    } else if (settings.energySourceType == 'Electricity') {
      if (settings.furnaceType == 'Electric Arc Furnace (EAF)') {
        showSlag = true;
        showExGas = true;
        showEnInput1 = true;
      } else if (settings.furnaceType != 'Custom Electrotechnology') {
        showAuxPower = true;
        showEnInput2 = true;
      } else if (settings.furnaceType == 'Custom Electrotechnology') {
        showSystemEff = true;
      }
    } else if (settings.energySourceType == 'Steam') {
      showSystemEff = true;
    }


    let results: FuelResults = this.initFuelResults();
    if (this.checkLoss(phast.losses.wallLosses)) {
      results.totalWallLoss = this.phastService.sumWallLosses(phast.losses.wallLosses, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.wallLosses)) {
      results.totalAtmosphereLoss = this.phastService.sumAtmosphereLosses(phast.losses.atmosphereLosses, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.otherLosses)) {
      results.totalOtherLoss = this.phastService.sumOtherLosses(phast.losses.otherLosses) / 1000000;
    }
    if (this.checkLoss(phast.losses.coolingLosses)) {
      results.totalCoolingLoss = this.phastService.sumCoolingLosses(phast.losses.coolingLosses, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.openingLosses)) {
      results.totalOpeningLoss = this.phastService.sumOpeningLosses(phast.losses.openingLosses, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.fixtureLosses)) {
      results.totalFixtureLoss = this.phastService.sumFixtureLosses(phast.losses.fixtureLosses, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.leakageLosses)) {
      results.totalLeakageLoss = this.phastService.sumLeakageLosses(phast.losses.leakageLosses, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.extendedSurfaces)) {
      results.totalExtSurfaceLoss = this.phastService.sumExtendedSurface(phast.losses.extendedSurfaces, settings) / 1000000;
    }
    if (this.checkLoss(phast.losses.chargeMaterials)) {
      results.totalChargeMaterialLoss = this.phastService.sumChargeMaterials(phast.losses.chargeMaterials, settings) / 1000000;
    }

    if (showFlueGas && this.checkLoss(phast.losses.flueGasLosses)) {
      if (phast.losses.flueGasLosses[0].flueGasType == 'By Volume') {
        let tmpResult = this.phastService.flueGasByVolume(phast.losses.flueGasLosses[0].flueGasByVolume, settings);
        let grossHeat = this.phastService.sumHeatInput(phast.losses, settings) / tmpResult;
        results.totalFlueGas = grossHeat * (1 - tmpResult) / 1000000;;

      } else if (phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
        let tmpResult = this.phastService.flueGasByMass(phast.losses.flueGasLosses[0].flueGasByMass, settings);
        let grossHeat = this.phastService.sumHeatInput(phast.losses, settings) / tmpResult;
        results.totalFlueGas = grossHeat * (1 - tmpResult) / 1000000;
      }
    }

    if (showAuxPower && this.checkLoss(phast.losses.auxiliaryPowerLosses)) {
      results.totalAuxPower = this.phastService.sumAuxilaryPowerLosses(phast.losses.auxiliaryPowerLosses) / 1000000;
    }

    if (showSlag && this.checkLoss(phast.losses.slagLosses)) {
      results.totalSlag = this.phastService.sumSlagLosses(phast.losses.slagLosses, settings) / 1000000;
    }
    if (showExGas && this.checkLoss(phast.losses.exhaustGasEAF)) {
      results.totalExhaustGas = this.phastService.sumExhaustGasEAF(phast.losses.exhaustGasEAF, settings) / 1000000;
    }
    if (showEnInput2 && this.checkLoss(phast.losses.energyInputExhaustGasLoss)) {
      let tmpResults = this.phastService.energyInputExhaustGasLosses(phast.losses.energyInputExhaustGasLoss[0], settings)
      results.totalExhaustGas = tmpResults.exhaustGasLosses / 1000000;
    }
    if (phast.systemEfficiency && showSystemEff) {
      let grossHeatInput = this.phastService.sumHeatInput(phast.losses, settings) / phast.systemEfficiency;
      results.totalSystemLosses = grossHeatInput * (1 - (phast.systemEfficiency / 100)) / 1000000;
    }

    results.totalInput = results.totalWallLoss + results.totalAtmosphereLoss + results.totalOtherLoss + results.totalCoolingLoss + results.totalOpeningLoss + results.totalFixtureLoss + results.totalLeakageLoss + results.totalExtSurfaceLoss + results.totalChargeMaterialLoss + results.totalFlueGas + results.totalAuxPower + results.totalSlag + results.totalExhaustGas + results.totalSystemLosses;
    results.nodes = this.getNodes(results, settings);
    return results;

  }

  getNodes(results: FuelResults, settings: Settings) {
    let unit: string = 'MMBtu/hr';
    if (settings.unitsOfMeasure == 'Metric') {
      unit = 'GJ/hr'
    }

    let tmpNode = this.createNode("Input", results.totalInput, this.baseSize, 300, 200, 0, true, false, false, false, unit)
    results.nodes.push(tmpNode);
    tmpNode = this.createNode("inter1", 0, 0, 0, 350, 0, false, false, true, true, unit)
    results.nodes.push(tmpNode);
    let interIndex = 2;

    let top: boolean = false;
    //FLUE GAS ARROW
    //one of three
    //Flue Gas
    if (results.totalFlueGas) {
      tmpNode = this.createNode("Flue Gas Losses", results.totalFlueGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, unit)
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //Exhaust Gas EAF
    if (results.totalExhaustGas) {
      tmpNode = this.createNode("Exhaust Gas Losses", results.totalExhaustGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, unit)
      results.nodes.push(tmpNode);
      interIndex++;
    }

    if (results.totalSystemLosses) {
      tmpNode = this.createNode("System Losses", results.totalSystemLosses, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, unit)
      results.nodes.push(tmpNode);
      interIndex++;
    }
    //end flue gas arrow  
    //Atmoshpere
    if (results.totalAtmosphereLoss) {
      tmpNode = this.createNode("Atmosphere Losses", results.totalAtmosphereLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //Other
    if (results.totalOtherLoss) {
      tmpNode = this.createNode("Other Losses", results.totalOtherLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //Cooling
    if (results.totalCoolingLoss) {
      tmpNode = this.createNode("Water Cooling Losses", results.totalCoolingLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //Wall
    if (results.totalWallLoss) {
      tmpNode = this.createNode("Wall Losses", results.totalWallLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //Opening
    if (results.totalOpeningLoss) {
      tmpNode = this.createNode("Opening Losses", results.totalOpeningLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //Fixture
    if (results.totalFixtureLoss) {
      tmpNode = this.createNode("Fixture/Conveyor Losses", results.totalFixtureLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //Leakage
    if (results.totalLeakageLoss) {
      tmpNode = this.createNode("Leakage Losses", results.totalLeakageLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //External Surface
    if (results.totalExtSurfaceLoss) {
      tmpNode = this.createNode("External Surface Losses", results.totalExtSurfaceLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //auxiliary power losses
    if (results.totalAuxPower) {
      tmpNode = this.createNode("Auxiliary Power Losses", results.totalAuxPower, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    //slag
    if (results.totalSlag) {
      tmpNode = this.createNode("Slag Losses", results.totalSlag, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    tmpNode = this.createNode("Useful Output", results.totalChargeMaterialLoss, 0, 0, 2800, 0, false, true, false, false, unit)
    results.nodes.push(tmpNode);
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
      totalSlag: 0,
      totalAuxPower: 0,
      totalEnergyInputEAF: 0,
      totalEnergyInput: 0,
      totalExhaustGas: 0,
      totalSystemLosses: 0,
      nodes: new Array<SankeyNode>()
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
  totalSlag: number,
  totalAuxPower: number,
  totalEnergyInputEAF: number,
  totalEnergyInput: number,
  totalExhaustGas: number,
  totalSystemLosses: number,
  nodes: Array<SankeyNode>
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