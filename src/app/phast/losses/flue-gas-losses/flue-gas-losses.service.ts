import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../../shared/models/phast/losses/flueGas';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FlueGasLossesService {

  deleteLossIndex: BehaviorSubject<number>;
  // addLossBaselineMonitor: BehaviorSubject<any>;
  // addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    // this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    //   this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  // addLoss(bool: boolean) {
  //   if (bool) {
  //     this.addLossModificationMonitor.next(true);
  //   } else {
  //     this.addLossBaselineMonitor.next(true);
  //   }
  // }


  initFormVolume(lossNum: number) {
    return this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['', Validators.required],
      'excessAirPercentage': ['', Validators.required],
      'o2InFlueGas': ['', Validators.required],
      'combustionAirTemperature': ['', Validators.required],
      'fuelTemperature': ['', Validators.required],
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
      'name': ['Loss #' + lossNum]
    })
  }

  initFormMass(lossNum: number) {
    return this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['', Validators.required],
      'excessAirPercentage': ['', Validators.required],
      'o2InFlueGas': ['', Validators.required],
      'combustionAirTemperature': ['', Validators.required],
      'fuelTemperature': ['', Validators.required],
      'moistureInAirComposition': ['', Validators.required],
      'ashDischargeTemperature': ['', Validators.required],
      'unburnedCarbonInAsh': ['', Validators.required],
      'carbon': ['', Validators.required],
      'hydrogen': ['', Validators.required],
      'sulphur': ['', Validators.required],
      'inertAsh': ['', Validators.required],
      'o2': ['', Validators.required],
      'moisture': ['', Validators.required],
      'nitrogen': ['', Validators.required],
      'name': ['Loss #' + lossNum]
    })
  }

  initByVolumeFormFromLoss(loss: FlueGas) {
    return this.formBuilder.group({
      'gasTypeId': [loss.flueGasByVolume.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByVolume.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByVolume.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByVolume.excessAirPercentage, Validators.required],
      'o2InFlueGas': [loss.flueGasByVolume.o2InFlueGas, Validators.required],
      'combustionAirTemperature': [loss.flueGasByVolume.combustionAirTemperature, Validators.required],
      'fuelTemperature': [loss.flueGasByVolume.fuelTemperature, Validators.required],
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
    })
  }

  initByMassFormFromLoss(loss: FlueGas) {
    return this.formBuilder.group({
      'gasTypeId': [loss.flueGasByMass.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByMass.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByMass.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByMass.excessAirPercentage, Validators.required],
      'o2InFlueGas': [loss.flueGasByMass.o2InFlueGas, Validators.required],
      'combustionAirTemperature': [loss.flueGasByMass.combustionAirTemperature, Validators.required],
      'fuelTemperature': [loss.flueGasByMass.fuelTemperature, Validators.required],
      'moistureInAirComposition': [loss.flueGasByMass.moistureInAirComposition, Validators.required],
      'ashDischargeTemperature': [loss.flueGasByMass.ashDischargeTemperature, Validators.required],
      'unburnedCarbonInAsh': [loss.flueGasByMass.unburnedCarbonInAsh, Validators.required],
      'carbon': [loss.flueGasByMass.carbon, Validators.required],
      'hydrogen': [loss.flueGasByMass.hydrogen, Validators.required],
      'sulphur': [loss.flueGasByMass.sulphur, Validators.required],
      'inertAsh': [loss.flueGasByMass.inertAsh, Validators.required],
      'o2': [loss.flueGasByMass.o2, Validators.required],
      'moisture': [loss.flueGasByMass.moisture, Validators.required],
      'nitrogen': [loss.flueGasByMass.nitrogen, Validators.required],
      'name': [loss.name]
    })
  }

  buildByMassLossFromForm(form: any): FlueGas {
    let tmpFlueGas: FlueGas = {
      name: form.controls.name.value,
      flueGasByMass: {
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
      }
    }
    return tmpFlueGas;
  }

  buildByVolumeLossFromForm(form: any): FlueGas {
    let tmpFlueGas: FlueGas = {
      name: form.controls.name.value,
      flueGasByVolume: {
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
      }
    }
    return tmpFlueGas;
  }
}
