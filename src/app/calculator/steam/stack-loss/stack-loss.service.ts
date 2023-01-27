import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { FlueGas, FlueGasByMass, FlueGasByVolume, FlueGasByVolumeSuiteResults } from '../../../shared/models/phast/losses/flueGas';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { StackLossInput } from '../../../shared/models/steam/steam-inputs';
import { BehaviorSubject } from 'rxjs';
import { ProcessHeatingApiService } from '../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class StackLossService {
  stackLossInput: StackLossInput = {
    flueGasType: undefined,
    flueGasByVolume: undefined,
    flueGasByMass: undefined,
    name: undefined
  };

  modalOpen: BehaviorSubject<boolean>;
  constructor(
    private processHeatingApiService: ProcessHeatingApiService,  
    private formBuilder: UntypedFormBuilder, 
    private convertUnitsService: ConvertUnitsService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initFormVolume(settings: Settings): UntypedFormGroup {
    let ambientAirTemp: number = 60;
    if (settings.unitsOfMeasure != 'Imperial') {
      ambientAirTemp = this.convertUnitsService.value(ambientAirTemp).from('F').to('C')
    }
    return this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['Excess Air', Validators.required],
      'excessAirPercentage': ['', [Validators.required, Validators.min(0)]],
      'o2InFlueGas': ['', [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': ['', [Validators.required]],
      'moistureInAirCombustion': [.0077, [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [''],
      'ambientAirTemp': [ambientAirTemp, Validators.required],
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

  initFormMass(settings: Settings): UntypedFormGroup {
    let ambientAirTemp: number = 60;
    if (settings.unitsOfMeasure != 'Imperial') {
      ambientAirTemp = this.convertUnitsService.value(ambientAirTemp).from('F').to('C')
    }
    return this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['Excess Air', Validators.required],
      'excessAirPercentage': ['', [Validators.required, Validators.min(0)]],
      'o2InFlueGas': ['', [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': ['', [Validators.required]],
      'fuelTemperature': [''],
      'ambientAirTemp': [ambientAirTemp, Validators.required],
      'moistureInAirCombustion': [.0077, [Validators.required, Validators.min(0), Validators.max(100)]],
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

  initByVolumeFormFromLoss(loss: StackLossInput): UntypedFormGroup {
    return this.formBuilder.group({
      'gasTypeId': [loss.flueGasByVolume.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByVolume.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByVolume.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByVolume.excessAirPercentage, [Validators.required, Validators.min(0)]],
      'o2InFlueGas': [loss.flueGasByVolume.o2InFlueGas, [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': [loss.flueGasByVolume.combustionAirTemperature, [Validators.required]],
      'moistureInAirCombustion': [loss.flueGasByVolume.moistureInAirCombustion, [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [loss.flueGasByVolume.fuelTemperature],
      'ambientAirTemp': [loss.flueGasByVolume.ambientAirTemp, Validators.required],
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

  initByMassFormFromLoss(loss: StackLossInput): UntypedFormGroup {
    return this.formBuilder.group({
      'gasTypeId': [loss.flueGasByMass.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByMass.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByMass.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByMass.excessAirPercentage, [Validators.required, Validators.min(0)]],
      'o2InFlueGas': [loss.flueGasByMass.o2InFlueGas, [Validators.required, Validators.min(0), Validators.max(21)]],
      'combustionAirTemperature': [loss.flueGasByMass.combustionAirTemperature, [Validators.required]],
      'fuelTemperature': [loss.flueGasByMass.fuelTemperature],
      'ambientAirTemp': [loss.flueGasByMass.ambientAirTemp, Validators.required],
      'moistureInAirCombustion': [loss.flueGasByMass.moistureInAirCombustion, [Validators.required, Validators.min(0), Validators.max(100)]],
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

  buildByMassLossFromForm(form: UntypedFormGroup): FlueGasByMass {
    let flueGasByMass: FlueGasByMass = {
      gasTypeId: form.controls.gasTypeId.value,
      flueGasTemperature: form.controls.flueGasTemperature.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      excessAirPercentage: form.controls.excessAirPercentage.value,
      o2InFlueGas: form.controls.o2InFlueGas.value,
      combustionAirTemperature: form.controls.combustionAirTemperature.value,
      fuelTemperature: form.controls.fuelTemperature.value,
      ambientAirTemp: form.controls.ambientAirTemp.value,
      ashDischargeTemperature: form.controls.ashDischargeTemperature.value,
      moistureInAirCombustion: form.controls.moistureInAirCombustion.value,
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

  buildByVolumeLossFromForm(form: UntypedFormGroup): FlueGasByVolume {
    let flueGasByVolume: FlueGasByVolume = {
      gasTypeId: form.controls.gasTypeId.value,
      flueGasTemperature: form.controls.flueGasTemperature.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      excessAirPercentage: form.controls.excessAirPercentage.value,
      o2InFlueGas: form.controls.o2InFlueGas.value,
      combustionAirTemperature: form.controls.combustionAirTemperature.value,
      moistureInAirCombustion: form.controls.moistureInAirCombustion.value,
      fuelTemperature: form.controls.fuelTemperature.value,
      ambientAirTemp: form.controls.ambientAirTemp.value,
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

  flueGasByVolume(input: FlueGasByVolume, settings: Settings): FlueGasByVolumeSuiteResults {
    let inputs: FlueGasByVolume = JSON.parse(JSON.stringify(input));
    inputs.ambientAirTempF = inputs.ambientAirTemp;
    inputs.combAirMoisturePerc = inputs.moistureInAirCombustion / 100;
    inputs.flueGasO2Percentage = inputs.o2InFlueGas;
    inputs.combustionAirTemperature = this.convertUnitsService.value(inputs.combustionAirTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.flueGasTemperature = this.convertUnitsService.value(inputs.flueGasTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.ambientAirTempF = this.convertUnitsService.value(inputs.ambientAirTempF).from(settings.temperatureMeasurement).to('F');
    inputs.fuelTemperature = this.convertUnitsService.value(inputs.fuelTemperature).from(settings.temperatureMeasurement).to('F');
    let results: FlueGasByVolumeSuiteResults = this.processHeatingApiService.flueGasLossesByVolume(inputs);
    return results;
  }

  flueGasByMass(input: FlueGasByMass, settings: Settings) {
    let inputs: FlueGasByMass = JSON.parse(JSON.stringify(input));
    inputs.ambientAirTempF = inputs.ambientAirTemp;
    inputs.combAirMoisturePerc = inputs.moistureInAirCombustion;
    inputs.combustionAirTemperature = this.convertUnitsService.value(inputs.combustionAirTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.flueGasTemperature = this.convertUnitsService.value(inputs.flueGasTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.ashDischargeTemperature = this.convertUnitsService.value(inputs.ashDischargeTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.fuelTemperature = this.convertUnitsService.value(inputs.fuelTemperature).from(settings.temperatureMeasurement).to('F');
    inputs.ambientAirTempF = this.convertUnitsService.value(inputs.ambientAirTempF).from(settings.temperatureMeasurement).to('F');
    let results = this.processHeatingApiService.flueGasLossesByMass(inputs);
    return results;
  }


  getExampleData(settings: Settings): StackLossInput {
    let exampleFlueGasTemp: number = 320;
    let ambientAirTemp: number = 60;
    if (settings.unitsOfMeasure != 'Imperial') {
    }
    if(settings.unitsOfMeasure != 'Imperial'){
      ambientAirTemp = this.convertUnitsService.value(ambientAirTemp).from('F').to('C');
      ambientAirTemp = Number(ambientAirTemp.toFixed(2));

      exampleFlueGasTemp = this.convertUnitsService.value(exampleFlueGasTemp).from('F').to('C');
      exampleFlueGasTemp = Number(exampleFlueGasTemp.toFixed(2));
      
    }
    let exampleInput: StackLossInput = {
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
        combustionAirTemperature: ambientAirTemp,
        excessAirPercentage: 15,
        moistureInAirCombustion: 0,
        ambientAirTemp: ambientAirTemp,
        flueGasTemperature: exampleFlueGasTemp,
        fuelTemperature: ambientAirTemp,
        gasTypeId: 1,
        o2InFlueGas: 2.857,
        oxygenCalculationMethod: "Excess Air"
      },
      flueGasType: 1,
      name: 'Example Stack Loss'
    }
    return exampleInput;
  }
}
