import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { GenericCompressor } from '../../../generic-compressor-db.service';

@Injectable()
export class NoLoadCalculationsService {

  constructor() { }

  setNoLoad(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
    selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadPressure(selectedCompressor, genericCompressor, selectedCompressor.performancePoints.noLoad.isDefaultPressure);
    selectedCompressor.performancePoints.noLoad.airflow = this.getNoLoadAirFlow(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultAirFlow);
    selectedCompressor.performancePoints.noLoad.power = this.getNoLoadPower(selectedCompressor, genericCompressor, selectedCompressor.performancePoints.noLoad.isDefaultPower);
    return selectedCompressor.performancePoints.noLoad;
  }

  getNoLoadPressure(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.nameplateData.compressorType == 6 || selectedCompressor.compressorControls.controlType == 5) {
        //centrifugal or start/stop
        return 0
      } else if (selectedCompressor.compressorControls.controlType == 1) {
        //without unloading
        return selectedCompressor.nameplateData.fullLoadOperatingPressure + selectedCompressor.designDetails.modulatingPressureRange;
      } else {
        //rest of options
        return genericCompressor.MinULSumpPressure;
      }
    } else {
      return selectedCompressor.performancePoints.noLoad.dischargePressure;
    }
  }

  getNoLoadAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      return 0;
    } else {
      return selectedCompressor.performancePoints.noLoad.airflow;
    }
  }

  getNoLoadPower(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.compressorControls.controlType == 1) {
        //without unloading
        return this.calculateNoLoadPowerWithoutUnloading(genericCompressor);
      } else if (selectedCompressor.compressorControls.controlType == 5) {
        //start stop
        return 0
      } else {
        return this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
      }
    } else {
      return selectedCompressor.performancePoints.noLoad.power;
    }
  }

  // //WITH UNLOADING
  // setWithUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0;
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  // //VARIABLE DISPLACMENT
  // setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }


  // //LOAD/UNLOAD
  // setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  // //WITHOUT UNLOADING
  // setWithoutUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure + selectedCompressor.designDetails.modulatingPressureRange;
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0;
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPowerWithoutUnloading(genericCompressor);
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  // //START STOP
  // setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = 0;
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  // //MULTI STEP UNLOADING
  // setMultiStepUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  // //CENTRIFUGAL
  // //inlet buterfly modulation with unloading
  // setInletButterflyModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = 0;
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);;
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  // //inlet vane modulation with unloading
  // setInletVaneModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //noLoad
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.noLoad.dischargePressure = 0;
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.noLoad.airflow = 0
  //   }
  //   if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
  //   }
  //   return selectedCompressor.performancePoints.noLoad;
  // }

  //Variables tarting w/ capital are from generic compressor db
  //other variables linked to input fields for compressors
  calculateNoLoadPower(NoLoadPowerUL: number, TotPackageInputPower: number, designEfficiency: number): number {
    if (NoLoadPowerUL < 25) {
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / designEfficiency) / designEfficiency) / 10000;
      return Number(noLoadPower.toFixed(3));
    } else {
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / 1 / 10000;
      return Number(noLoadPower.toFixed(3));
    }
  }

  calculateNoLoadPowerWithoutUnloading(genericCompressor: GenericCompressor): number {
    return genericCompressor.NoLoadPowerFM / 100 * genericCompressor.TotPackageInputPower;
  }

  // getNoLoadDischargePressure(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): number {
  //   //centrifugal or start/stop
  //   if (selectedCompressor.nameplateData.compressorType == 6 || selectedCompressor.compressorControls.controlType == 5) {
  //     return 0
  //   } else {
  //     return genericCompressor.MinULSumpPressure;
  //   }
  // }


}
