import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoints } from '../../shared/models/compressed-air-assessment';
import { GenericCompressor, GenericCompressorDbService } from '../generic-compressor-db.service';

@Injectable()
export class PerformancePointCalculationsService {

  constructor(private genericCompressorDbService: GenericCompressorDbService) { }

  updatePerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    let genericCompressor: GenericCompressor = this.genericCompressorDbService.genericCompressors.find(compressor => { return selectedCompressor.compressorLibId == compressor.IDCompLib });
    if (genericCompressor) {
      selectedCompressor.performancePoints = this.setPerformancePoints(selectedCompressor, genericCompressor);
    }
    return selectedCompressor.performancePoints;
  }

  setPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
    selectedCompressor.performancePoints.fullLoad.airflow = selectedCompressor.nameplateData.fullLoadRatedCapacity;
    selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;

    if (selectedCompressor.compressorControls.controlType == 1) {
      //lube mod without unloading
      selectedCompressor.performancePoints = this.setWithoutUnloadingPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.performancePoints = this.setWithUnloadingPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 3) {
      //variable displacement
      selectedCompressor.performancePoints = this.setVariableDisplacementPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4) {
      //load/unload
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 6) {
      //start/stop
      selectedCompressor.performancePoints = this.setStartStopPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 8 || selectedCompressor.compressorControls.controlType == 10) {
      //blowoff
      selectedCompressor.performancePoints = this.setBlowoffPerformancePoints(selectedCompressor, genericCompressor);
    }
    return selectedCompressor.performancePoints;
  }

  setWithUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

    // performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure + (genericCompressor.ModulatingPressRange * (1 - genericCompressor.UnloadPoint / 100));
    selectedCompressor.performancePoints.unloadPoint.dischargePressure = this.calculateUnloadPointDischargePressure(genericCompressor.MaxFullFlowPressure, selectedCompressor.designDetails.modulatingPressureRange, selectedCompressor.compressorControls.unloadPointCapacity);
    // performancePoints.unloadPoint.airflow = (genericCompressor.UnloadPoint / 100) * genericCompressor.RatedCapacity;
    selectedCompressor.performancePoints.unloadPoint.airflow = this.calculateUnloadPointAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.compressorControls.unloadPointCapacity);
    // performancePoints.unloadPoint.power = ((genericCompressor.NoLoadPowerFM / 100) * (1 - (genericCompressor.UnloadPoint / 100)) + (genericCompressor.UnloadPoint / 100)) * performancePoints.maxFullFlow.power;
    selectedCompressor.performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, selectedCompressor.compressorControls.unloadPointCapacity, 1, selectedCompressor.performancePoints.maxFullFlow.power);

    selectedCompressor.performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    selectedCompressor.performancePoints.noLoad.airflow = 0;
    selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    return selectedCompressor.performancePoints;
  }

  setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

    // performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure + (genericCompressor.ModulatingPressRange * (1 - (genericCompressor.UnloadPoint / 100)));
    selectedCompressor.performancePoints.unloadPoint.dischargePressure = this.calculateUnloadPointDischargePressure(genericCompressor.MaxFullFlowPressure, selectedCompressor.designDetails.modulatingPressureRange, selectedCompressor.compressorControls.unloadPointCapacity);
    // performancePoints.unloadPoint.airflow = genericCompressor.RatedCapacity * (genericCompressor.UnloadPoint / 100);
    selectedCompressor.performancePoints.unloadPoint.airflow = this.calculateUnloadPointAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.compressorControls.unloadPointCapacity);
    // performancePoints.unloadPoint.power = ((genericCompressor.NoLoadPowerFM / 100) * (1 - Math.pow((genericCompressor.UnloadPoint / 100), 2)) + Math.pow((genericCompressor.UnloadPoint / 100), 2)) * performancePoints.maxFullFlow.power;
    selectedCompressor.performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, selectedCompressor.compressorControls.unloadPointCapacity, 2, selectedCompressor.performancePoints.maxFullFlow.power);

    selectedCompressor.performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    selectedCompressor.performancePoints.noLoad.airflow = 0
    selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    return selectedCompressor.performancePoints;
  }

  setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    //TODO: calculate airflow and power?
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

    selectedCompressor.performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    selectedCompressor.performancePoints.noLoad.airflow = 0
    selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    return selectedCompressor.performancePoints;
  }

  setWithoutUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.noLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure + selectedCompressor.designDetails.modulatingPressureRange;
    selectedCompressor.performancePoints.noLoad.airflow = 0;
    selectedCompressor.performancePoints.noLoad.power = genericCompressor.NoLoadPowerFM / 100 * genericCompressor.TotPackageInputPower;
    return selectedCompressor.performancePoints;
  }

  setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

    selectedCompressor.performancePoints.noLoad.dischargePressure = 0;
    selectedCompressor.performancePoints.noLoad.airflow = 0
    selectedCompressor.performancePoints.noLoad.power = 0;

    return selectedCompressor.performancePoints;
  }

  setBlowoffPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.blowoff.airflow = genericCompressor.MaxPressSurgeFlow;
    selectedCompressor.performancePoints.blowoff.dischargePressure = genericCompressor.MaxSurgePressure;
    //TODO: Power
    selectedCompressor.performancePoints.blowoff.power

    return selectedCompressor.performancePoints
  }

  //Variables tarting w/ capital are from generic compressor db
  //other variables linked to input fields for compressors
  calculateNoLoadPower(NoLoadPowerUL: number, TotPackageInputPower: number, designEfficiency: number): number {
    if (NoLoadPowerUL < 25) {
      return NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / designEfficiency) / designEfficiency) / 10000;
    } else {
      return NoLoadPowerUL * TotPackageInputPower / 1 / 10000;
    }
  }


  calculateMaxFullFlowAirFlow(fullLoadRatedCapacity: number, MaxFullFlowPressure: number, fullLoadOperatingPressure: number): number {
    let atmosphericPressure: number = 14.7;
    return (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * fullLoadRatedCapacity * (1 - 0.00075 * (MaxFullFlowPressure - fullLoadOperatingPressure));
  }

  calculateMaxFullFlowPower(compressorType: number, inputPressure: number, MaxFullFlowPressure: number, fullLoadOperatingPressure: number, TotPackageInputPower: number): number {
    let atmosphericPressure: number = 14.7;
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
      //screw
      p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
      p2 = (MaxFullFlowPressure + inputPressure) / inputPressure;
    } else {
      p1 = (atmosphericPressure / inputPressure);
      p2 = (MaxFullFlowPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((fullLoadOperatingPressure + inputPressure) / inputPressure), polytropicExponent) - 1;
    return p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
  }


  calculateUnloadPointPower(NoLoadPowerFM: number, unloadPointCapacity: number, exponent: number, maxFullFlowPower: number): number {
    return ((NoLoadPowerFM / 100) * (1 - Math.pow((unloadPointCapacity / 100), exponent)) + Math.pow((unloadPointCapacity / 100), exponent)) * maxFullFlowPower;
  }

  calculateUnloadPointAirFlow(fullLoadRatedCapacity: number, unloadPointCapacity: number): number {
    return fullLoadRatedCapacity * (unloadPointCapacity / 100);
  }

  calculateUnloadPointDischargePressure(MaxFullFlowPressure: number, modulatingPressureRange: number, unloadPointCapacity: number): number {
    return MaxFullFlowPressure + (modulatingPressureRange * (1 - (unloadPointCapacity / 100)));
  }
}
