import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { FlueGas, FlueGasOutput, FlueGasResult } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
import { FlueGasEnergyData } from './energy-form.service';
import { FlueGasFormService } from './flue-gas-form.service';

@Injectable()
export class FlueGasService {
  baselineData: BehaviorSubject<FlueGas>;
  modificationData: BehaviorSubject<FlueGas>;
  baselineEnergyData: BehaviorSubject<FlueGasEnergyData>;
  modificationEnergyData: BehaviorSubject<FlueGasEnergyData>;
  output: BehaviorSubject<FlueGasOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, 
              private phastService: PhastService,
              private flueGasFormService: FlueGasFormService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<FlueGas>(undefined);
    this.modificationData = new BehaviorSubject<FlueGas>(undefined);
    this.baselineEnergyData = new BehaviorSubject<FlueGasEnergyData>(undefined);
    this.modificationEnergyData = new BehaviorSubject<FlueGasEnergyData>(undefined);

    this.output = new BehaviorSubject<FlueGasOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings, inModal = false) {
    this.initDefaultEmptyOutput();
    let output: FlueGasOutput = this.output.getValue();
    
    let baselineFlueGas: FlueGas = this.baselineData.getValue();
    let modificationFlueGas: FlueGas = this.modificationData.getValue();
    let baselineEnergyData: FlueGasEnergyData = this.baselineEnergyData.getValue();
    let modificationEnergyData: FlueGasEnergyData = this.modificationEnergyData.getValue();

    let baselineResults: FlueGasResult = this.getFlueGasResult(baselineFlueGas, baselineEnergyData, settings, inModal);
    output.baseline = baselineResults;
    if (modificationFlueGas && modificationEnergyData) {
      let modificationResults: FlueGasResult = this.getFlueGasResult(modificationFlueGas, modificationEnergyData, settings, inModal);
      output.modification = modificationResults;
      
      output.fuelSavings = baselineResults.fuelUse - modificationResults.fuelUse;
      output.costSavings = baselineResults.fuelCost - modificationResults.fuelCost;
    }
    this.output.next(output);
  }

  getFlueGasResult(flueGasData: FlueGas, energyData: FlueGasEnergyData, settings: Settings, inModal: boolean): FlueGasResult {
    let result: FlueGasResult = {
      availableHeat: 0,
      availableHeatError: undefined,
      flueGasLosses: 0,
      fuelCost: 0,
      fuelUse: 0,
      energyUnit: settings.energyResultUnit
    }

    if (flueGasData.flueGasType == 'By Volume' && flueGasData.flueGasByVolume) {
      let formGroup = this.flueGasFormService.initByVolumeFormFromLoss(flueGasData, false);
      let validData: boolean = formGroup.valid;
      if (inModal) {
        validData = this.flueGasFormService.setValidators(formGroup, inModal).valid;
      } 
      if (validData) {
        let availableHeat: number = this.phastService.flueGasByVolume(flueGasData.flueGasByVolume, settings);
        result.availableHeat = availableHeat * 100;
        let flueGasLosses = (1 - availableHeat) * flueGasData.flueGasByVolume.heatInput;
        result.flueGasLosses = flueGasLosses;
        result.fuelCost = result.flueGasLosses * energyData.hoursPerYear * energyData.fuelCost;
        result.fuelUse = flueGasLosses * energyData.hoursPerYear;
      }
    } else if (flueGasData.flueGasType === 'By Mass' && flueGasData.flueGasByMass) {
      let formGroup = this.flueGasFormService.initByMassFormFromLoss(flueGasData, false);
      let validData: boolean = formGroup.valid;
      if (inModal) {
        validData = this.flueGasFormService.setValidators(formGroup, inModal).valid;
      } 
      if (validData) {
        let availableHeat: number = this.phastService.flueGasByMass(flueGasData.flueGasByMass, settings);
        result.availableHeat = availableHeat * 100;
        let flueGasLosses = (1 - availableHeat) * flueGasData.flueGasByMass.heatInput;
        result.flueGasLosses = flueGasLosses;
        result.fuelCost = result.flueGasLosses * energyData.hoursPerYear * energyData.fuelCost;
        result.fuelUse = flueGasLosses * energyData.hoursPerYear;
      }
    } 
    result = this.checkAvailableHeatResult(result);
    return result;
  }

  checkAvailableHeatResult(result: FlueGasResult) {
    if (result.availableHeat < 0 || result.availableHeat > 100) {
      result.availableHeatError = 'Available heat is' + ' ' + result.availableHeat.toFixed(2) + '%' + '.' + ' ' + 'Check your input fields.';
    } else {
      result.availableHeatError = null;
    }
    return result;
  }

  initDefaultEmptyInputs(treasureHuntHours?: number) {
    let emptyBaselineData: FlueGas = {
      flueGasType: 'By Mass',
      flueGasByVolume: undefined,
      flueGasByMass: undefined,
      name: undefined
    };

    let energyData: FlueGasEnergyData = {
      fuelCost: 0,
      hoursPerYear: treasureHuntHours? treasureHuntHours : 8760,
      utilityType: 'Natural Gas',
    }
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
    
    this.baselineEnergyData.next(energyData);
    this.modificationEnergyData.next(undefined);
  }

  initDefaultEmptyOutput() {
     let output: FlueGasOutput = {
      baseline: {
        availableHeat: 0,
        availableHeatError: undefined,
        flueGasLosses: 0
      },
      modification: {
        availableHeat: 0,
        availableHeatError: undefined,
        flueGasLosses: 0
      },
      fuelSavings: 0,
      costSavings: 0,
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: FlueGas = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: FlueGas;
    if (currentBaselineCopy.flueGasType == 'By Mass') {
      modification = {
        flueGasByVolume: undefined,
        flueGasByMass: currentBaselineCopy.flueGasByMass,
        flueGasType: currentBaselineCopy.flueGasType,
        name: undefined
      };
    } else {
      modification = {
        flueGasByVolume: currentBaselineCopy.flueGasByVolume,
        flueGasByMass: undefined,
        flueGasType: currentBaselineCopy.flueGasType,
        name: undefined
      };
    }

    let currentBaselineEnergy: FlueGasEnergyData = this.baselineEnergyData.getValue();
    let baselineEnergyCopy: FlueGasEnergyData = JSON.parse(JSON.stringify(currentBaselineEnergy));
    let modificationEnergy: FlueGasEnergyData = {
      fuelCost: baselineEnergyCopy.fuelCost,
      hoursPerYear: baselineEnergyCopy.hoursPerYear
    }

    this.modificationEnergyData.next(modificationEnergy);

    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
    let exampleCombAirTemp: number = 80;
    let exampleFlueGasTemp: number = 900;
    let exampleModFlueGasTemp: number = 250;
    let exampleFuelTemp: number = 80;
    let exampleHeatInput: number = 15;
    let exampleMoistureInAirCombustion: number = .0077;
    let exampleAmbientAirTemp: number = 60;
    if (settings.unitsOfMeasure != 'Imperial') {
    }
    
    if(settings.unitsOfMeasure != 'Imperial'){
      exampleCombAirTemp = this.convertUnitsService.value(exampleCombAirTemp).from('F').to('C');
      exampleCombAirTemp = Number(exampleCombAirTemp.toFixed(2));
      
      exampleAmbientAirTemp = this.convertUnitsService.value(exampleAmbientAirTemp).from('F').to('C')
      exampleAmbientAirTemp = Number(exampleAmbientAirTemp.toFixed(2));

      exampleFlueGasTemp = this.convertUnitsService.value(exampleFlueGasTemp).from('F').to('C');
      exampleFlueGasTemp = Number(exampleFlueGasTemp.toFixed(2));

      exampleModFlueGasTemp = this.convertUnitsService.value(exampleModFlueGasTemp).from('F').to('C');
      exampleModFlueGasTemp = Number(exampleModFlueGasTemp.toFixed(2));

      exampleFuelTemp = this.convertUnitsService.value(exampleFuelTemp).from('F').to('C');
      exampleFuelTemp = Number(exampleFuelTemp.toFixed(2));

      exampleHeatInput = this.convertUnitsService.value(exampleHeatInput).from('MMBtu').to('GJ');
      exampleHeatInput = Number(exampleHeatInput.toFixed(2));
    }
    
    let exampleBaseline: FlueGas = {
      flueGasByMass: undefined,
      flueGasByVolume: {
        C2H6: 8.5,
        C3H8: 0,
        C4H10_CnH2n: 0,
        CH4: 87,
        CO: 0,
        CO2: 0.4,
        H2: 0.4,
        H2O: 0,
        N2: 3.6,
        O2: 0.1,
        SO2: 0,
        combustionAirTemperature: exampleCombAirTemp,
        moistureInAirCombustion: exampleMoistureInAirCombustion,
        ambientAirTemp: exampleAmbientAirTemp,
        excessAirPercentage: 15,
        flueGasTemperature: exampleFlueGasTemp,
        fuelTemperature: exampleFuelTemp,
        gasTypeId: 1,
        o2InFlueGas: 2.857,
        oxygenCalculationMethod: "Excess Air",
        heatInput: exampleHeatInput,
      },
      flueGasType: 'By Volume',
      name: 'Baseline Flue Gas'
    }
    
    let exampleMod: FlueGas = {
      flueGasByMass: undefined,
      flueGasByVolume: {
        C2H6: 10.5,
        C3H8: 0,
        C4H10_CnH2n: 0,
        CH4: 63,
        CO: 0,
        CO2: 0.4,
        H2: 0.4,
        H2O: 0,
        N2: 3.6,
        O2: 0.1,
        SO2: 0,
        combustionAirTemperature: exampleCombAirTemp,
        moistureInAirCombustion: exampleMoistureInAirCombustion,
        ambientAirTemp: exampleAmbientAirTemp,
        excessAirPercentage: 10,
        flueGasTemperature: exampleModFlueGasTemp,
        fuelTemperature: exampleFuelTemp,
        gasTypeId: 1,
        o2InFlueGas: 3.124,
        oxygenCalculationMethod: "Excess Air",
        heatInput: exampleHeatInput,
      },
      flueGasType: 'By Volume',
      name: 'Modification Flue Gas'
    }
    
    let energyExample: FlueGasEnergyData = {
      hoursPerYear: 8760,
      fuelCost: 3.99,
      utilityType: 'Natural Gas',
    };
    
    this.baselineEnergyData.next(energyExample);
    this.modificationEnergyData.next(energyExample);
    
    this.baselineData.next(exampleBaseline);
    this.modificationData.next(exampleMod);
    this.generateExample.next(true);
  }


}
