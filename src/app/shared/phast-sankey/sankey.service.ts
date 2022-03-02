import { Injectable, Input } from '@angular/core';
import { ShowResultsCategories, PhastResults } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastResultsService } from '../../phast/phast-results.service';

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


    return results;
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
