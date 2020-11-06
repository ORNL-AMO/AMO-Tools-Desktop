import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlueGas, FlueGasByMass, FlueGasByVolume, FlueGasOutput, FlueGasResult } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
declare var phastAddon: any;

@Injectable()
export class FlueGasService {
  flueGasInput: FlueGas = {
    flueGasType: undefined,
    flueGasByVolume: undefined,
    flueGasByMass: undefined,
    name: undefined
  };
  baselineData: BehaviorSubject<FlueGas>;
  modificationData: BehaviorSubject<FlueGas>;
  output: BehaviorSubject<FlueGasOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<FlueGas>(undefined);
    this.modificationData = new BehaviorSubject<FlueGas>(undefined);
    this.output = new BehaviorSubject<any>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  initEmptyVolumeForm(): FormGroup {
    return this.formBuilder.group({
      'heatInput': ['', Validators.required],
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['Excess Air', Validators.required],
      'excessAirPercentage': ['', [Validators.required, Validators.min(0)]],
      'o2InFlueGas': ['', [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [''],
      'CH4': ['', Validators.required],
      'C2H6': ['', Validators.required],
      'N2': ['', Validators.required],
      'H2': ['', Validators.required],
      'C3H8': ['', Validators.required],
      'C4H10_CnH2n': ['', Validators.required],
      'H2O': ['', Validators.required],
      'CO': ['', Validators.required],
      'CO2': ['', Validators.required],
      'SO2': ['', Validators.required],
      'O2': ['', Validators.required],
      'name': ['Loss #' + 1]
    });
  }

  initEmptyMassForm(): FormGroup {
    return this.formBuilder.group({
      'heatInput': ['', Validators.required],
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['Excess Air', Validators.required],
      'excessAirPercentage': ['', [Validators.required, Validators.min(0)]],
      'o2InFlueGas': ['', [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [''],
      'moistureInAirComposition': [.0077, [Validators.required, Validators.min(0), Validators.max(100)]],
      'ashDischargeTemperature': ['', Validators.required],
      'unburnedCarbonInAsh': ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      'carbon': ['', Validators.required],
      'hydrogen': ['', Validators.required],
      'sulphur': ['', Validators.required],
      'inertAsh': ['', Validators.required],
      'o2': ['', Validators.required],
      'moisture': ['', Validators.required],
      'nitrogen': ['', Validators.required],
      'name': ['Loss #' + 1]
    });
  }

  initByVolumeFormFromLoss(loss: FlueGas): FormGroup {
    return this.formBuilder.group({
      'heatInput': [loss.flueGasByVolume.heatInput, Validators.required],
      'gasTypeId': [loss.flueGasByVolume.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByVolume.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByVolume.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByVolume.excessAirPercentage, [Validators.required, Validators.min(0)]],
      'o2InFlueGas': [loss.flueGasByVolume.o2InFlueGas, [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': [loss.flueGasByVolume.combustionAirTemperature, [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [loss.flueGasByVolume.fuelTemperature],
      'CH4': [loss.flueGasByVolume.CH4, Validators.required],
      'C2H6': [loss.flueGasByVolume.C2H6, Validators.required],
      'N2': [loss.flueGasByVolume.N2, Validators.required],
      'H2': [loss.flueGasByVolume.H2, Validators.required],
      'C3H8': [loss.flueGasByVolume.C3H8, Validators.required],
      'C4H10_CnH2n': [loss.flueGasByVolume.C4H10_CnH2n, Validators.required],
      'H2O': [loss.flueGasByVolume.H2O, Validators.required],
      'CO': [loss.flueGasByVolume.CO, Validators.required],
      'CO2': [loss.flueGasByVolume.CO2, Validators.required],
      'SO2': [loss.flueGasByVolume.SO2, Validators.required],
      'O2': [loss.flueGasByVolume.O2, Validators.required],
      'name': [loss.name]
    });
  }

  initByMassFormFromLoss(loss: FlueGas): FormGroup {
    return this.formBuilder.group({
      'heatInput': [loss.flueGasByMass.heatInput, Validators.required],
      'gasTypeId': [loss.flueGasByMass.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByMass.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByMass.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByMass.excessAirPercentage, [Validators.required, Validators.min(0)]],
      'o2InFlueGas': [loss.flueGasByMass.o2InFlueGas, [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': [loss.flueGasByMass.combustionAirTemperature, [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [loss.flueGasByMass.fuelTemperature],
      'moistureInAirComposition': [loss.flueGasByMass.moistureInAirComposition, [Validators.required, Validators.min(0), Validators.max(100)]],
      'ashDischargeTemperature': [loss.flueGasByMass.ashDischargeTemperature, Validators.required],
      'unburnedCarbonInAsh': [loss.flueGasByMass.unburnedCarbonInAsh, [Validators.required, Validators.min(0), Validators.max(100)]],
      'carbon': [loss.flueGasByMass.carbon, Validators.required],
      'hydrogen': [loss.flueGasByMass.hydrogen, Validators.required],
      'sulphur': [loss.flueGasByMass.sulphur, Validators.required],
      'inertAsh': [loss.flueGasByMass.inertAsh, Validators.required],
      'o2': [loss.flueGasByMass.o2, Validators.required],
      'moisture': [loss.flueGasByMass.moisture, Validators.required],
      'nitrogen': [loss.flueGasByMass.nitrogen, Validators.required],
      'name': [loss.name]
    });
  }

  buildByMassLossFromForm(form: FormGroup): FlueGasByMass {
    let flueGasByMass: FlueGasByMass = {
      heatInput: form.controls.heatInput.value,
      gasTypeId: form.controls.gasTypeId.value,
      flueGasTemperature: form.controls.flueGasTemperature.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      excessAirPercentage: form.controls.excessAirPercentage.value,
      o2InFlueGas: form.controls.o2InFlueGas.value,
      combustionAirTemperature: form.controls.combustionAirTemperature.value,
      fuelTemperature: form.controls.fuelTemperature.value,
      ashDischargeTemperature: form.controls.ashDischargeTemperature.value,
      moistureInAirComposition: form.controls.moistureInAirComposition.value,
      unburnedCarbonInAsh: form.controls.unburnedCarbonInAsh.value,
      carbon: form.controls.carbon.value,
      hydrogen: form.controls.hydrogen.value,
      sulphur: form.controls.sulphur.value,
      inertAsh: form.controls.inertAsh.value,
      o2: form.controls.o2.value,
      moisture: form.controls.moisture.value,
      nitrogen: form.controls.nitrogen.value
    };
    return flueGasByMass;
  }

  buildByVolumeLossFromForm(form: FormGroup): FlueGasByVolume {
    let flueGasByVolume: FlueGasByVolume = {
      heatInput: form.controls.heatInput.value,
      gasTypeId: form.controls.gasTypeId.value,
      flueGasTemperature: form.controls.flueGasTemperature.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      excessAirPercentage: form.controls.excessAirPercentage.value,
      o2InFlueGas: form.controls.o2InFlueGas.value,
      combustionAirTemperature: form.controls.combustionAirTemperature.value,
      fuelTemperature: form.controls.fuelTemperature.value,
      CH4: form.controls.CH4.value,
      C2H6: form.controls.C2H6.value,
      N2: form.controls.N2.value,
      H2: form.controls.H2.value,
      C3H8: form.controls.C3H8.value,
      C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
      H2O: form.controls.H2O.value,
      CO: form.controls.CO.value,
      CO2: form.controls.CO2.value,
      SO2: form.controls.SO2.value,
      O2: form.controls.O2.value
    };
    return flueGasByVolume;
  }

  flueGasByVolume(input: FlueGasByVolume, settings: Settings) {
    let inputs: FlueGasByVolume = JSON.parse(JSON.stringify(input));
    inputs.combustionAirTemperature = this.convertUnitsService.value(inputs.combustionAirTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.flueGasTemperature = this.convertUnitsService.value(inputs.flueGasTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.fuelTemperature = this.convertUnitsService.value(inputs.fuelTemperature).from(settings.temperatureMeasurement).to('F');
    let results = phastAddon.flueGasLossesByVolume(inputs);
    return results;
  }

  flueGasByMass(input: FlueGasByMass, settings: Settings) {
    let inputs: FlueGasByMass = JSON.parse(JSON.stringify(input));
    inputs.combustionAirTemperature = this.convertUnitsService.value(inputs.combustionAirTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.flueGasTemperature = this.convertUnitsService.value(inputs.flueGasTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.ashDischargeTemperature = this.convertUnitsService.value(inputs.ashDischargeTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.fuelTemperature = this.convertUnitsService.value(inputs.fuelTemperature).from(settings.temperatureMeasurement).to('F');
    let results = phastAddon.flueGasLossesByMass(inputs);
    return results;
  }

  calculate(settings: Settings, inModal = false) {
    let baselineFlueGas = this.baselineData.getValue();
    let modificationFlueGas = this.modificationData.getValue();
    // let output: FlueGasOutput = {
    //   baseline: {
    //     availableHeat: 0,
    //     flueGasLosses: 0
    //   },
    //   modification: {
    //     availableHeat: 0,
    //     flueGasLosses: 0
    //   }
    // };
    // this.initDefaultEmptyOutput();
    let output = this.output.getValue();

    // let availableHeat: number;
    // let flueGasLosses: number;

    let baselineResults = this.getFlueGasResult(baselineFlueGas, settings);
    if (baselineResults) {
      output.baseline = baselineResults;
    }
    if (modificationFlueGas) {
      let modificationResults = this.getFlueGasResult(modificationFlueGas, settings);
      if (modificationResults) {
        output.modification = modificationResults;
      }
    }

    this.output.next(output);
    if (inModal == true) {
      // TODO send call to emit results up when calculating as flue gas modal
    }
  }

  getFlueGasResult(flueGasData: FlueGas, settings: Settings) {
    let result: FlueGasResult = {
      availableHeat: 0,
      flueGasLosses: 0
    }

    if (flueGasData.flueGasType == 'By Volume' && flueGasData.flueGasByVolume) {
      let availableHeat = this.flueGasByVolume(flueGasData.flueGasByVolume, settings);
      result.availableHeat = availableHeat * 100;
      let flueGasLosses = (1 - availableHeat) * flueGasData.flueGasByVolume.heatInput;
      result.flueGasLosses = flueGasLosses;
    } else if (flueGasData.flueGasType === 'By Mass' && flueGasData.flueGasByMass) {
      let availableHeat = this.flueGasByMass(flueGasData.flueGasByMass, settings);
      result.availableHeat = availableHeat * 100;
      let flueGasLosses = (1 - availableHeat) * flueGasData.flueGasByMass.heatInput;
      result.flueGasLosses = flueGasLosses;
    } 
    return result;
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyBaselineData: FlueGas = {
      flueGasType: 'By Mass',
      flueGasByVolume: undefined,
      flueGasByMass: undefined,
      name: undefined
    };
    this.baselineData.next(emptyBaselineData);
  }

  initDefaultEmptyOutput() {
     let output: FlueGasOutput = {
      baseline: {
        availableHeat: 0,
        flueGasLosses: 0
      },
      modification: {
        availableHeat: 0,
        flueGasLosses: 0
      }
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
    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
    let exampleCombAirTemp: number = 80;
    let exampleFlueGasTemp: number = 320;
    let exampleFuelTemp: number = 80;
    if(settings.unitsOfMeasure != 'Imperial'){
      exampleCombAirTemp = this.convertUnitsService.value(exampleCombAirTemp).from('F').to('C');
      exampleCombAirTemp = Number(exampleCombAirTemp.toFixed(2));

      exampleFlueGasTemp = this.convertUnitsService.value(exampleFlueGasTemp).from('F').to('C');
      exampleFlueGasTemp = Number(exampleFlueGasTemp.toFixed(2));

      exampleFuelTemp = this.convertUnitsService.value(exampleFuelTemp).from('F').to('C');
      exampleFuelTemp = Number(exampleFuelTemp.toFixed(2));
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
        excessAirPercentage: 15,
        flueGasTemperature: exampleFlueGasTemp,
        fuelTemperature: exampleFuelTemp,
        gasTypeId: 1,
        o2InFlueGas: 2.857,
        oxygenCalculationMethod: "Excess Air",
        heatInput: 15,
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
        excessAirPercentage: 17,
        flueGasTemperature: exampleFlueGasTemp,
        fuelTemperature: exampleFuelTemp,
        gasTypeId: 1,
        o2InFlueGas: 3.124,
        oxygenCalculationMethod: "Excess Air",
        heatInput: 27,
      },
      flueGasType: 'By Volume',
      name: 'Modification Flue Gas'
    }
    this.baselineData.next(exampleBaseline);
    this.modificationData.next(exampleMod);
    // this.flueGasService.generateExample.next(true);

  }
}
