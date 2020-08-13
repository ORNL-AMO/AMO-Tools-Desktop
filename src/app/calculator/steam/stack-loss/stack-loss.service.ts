import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../../shared/models/phast/losses/flueGas';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { StackLossInput } from '../../../shared/models/steam/steam-inputs';
import { BehaviorSubject } from 'rxjs';
declare var phastAddon: any;

@Injectable()
export class StackLossService {
  stackLossInput: StackLossInput = {
    flueGasType: undefined,
    flueGasByVolume: undefined,
    flueGasByMass: undefined,
    name: undefined
  };

  modalOpen: BehaviorSubject<boolean>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initFormVolume(): FormGroup {
    return this.formBuilder.group({
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

  initFormMass(): FormGroup {
    return this.formBuilder.group({
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

  initByVolumeFormFromLoss(loss: StackLossInput): FormGroup {
    return this.formBuilder.group({
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

  initByMassFormFromLoss(loss: StackLossInput): FormGroup {
    return this.formBuilder.group({
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


  getExampleData(settings: Settings): StackLossInput {
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
        combustionAirTemperature: exampleCombAirTemp,
        excessAirPercentage: 15,
        flueGasTemperature: exampleFlueGasTemp,
        fuelTemperature: exampleFuelTemp,
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
