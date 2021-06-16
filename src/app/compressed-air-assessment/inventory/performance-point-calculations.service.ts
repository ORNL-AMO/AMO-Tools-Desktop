import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoints } from '../../shared/models/compressed-air-assessment';
import { GenericCompressor, GenericCompressorDbService } from '../generic-compressor-db.service';

@Injectable()
export class PerformancePointCalculationsService {

  constructor(private genericCompressorDbService: GenericCompressorDbService) { }

  setCompressorData(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): CompressorInventoryItem {
    selectedCompressor.compressorLibId = genericCompressor.IDCompLib;

    selectedCompressor.nameplateData.compressorType = genericCompressor.IDCompType;
    selectedCompressor.compressorControls.controlType = genericCompressor.IDControlType;

    selectedCompressor.nameplateData.motorPower = genericCompressor.HP;
    selectedCompressor.compressorControls.unloadPointCapacity = genericCompressor.UnloadPoint;
    selectedCompressor.compressorControls.numberOfUnloadSteps = genericCompressor.UnloadSteps;
    selectedCompressor.designDetails.blowdownTime = genericCompressor.BlowdownTime;
    selectedCompressor.designDetails.modulatingPressureRange = genericCompressor.ModulatingPressRange;
    selectedCompressor.inletConditions.temperature = genericCompressor.DesignInTemp;
    selectedCompressor.designDetails.inputPressure = genericCompressor.DesignInPressure;
    selectedCompressor.designDetails.unloadSlumpPressure = genericCompressor.MinULSumpPressure;
    selectedCompressor.nameplateData.fullLoadOperatingPressure = genericCompressor.RatedPressure;
    selectedCompressor.nameplateData.fullLoadRatedCapacity = genericCompressor.RatedCapacity;

    selectedCompressor.centrifugalSpecifics.minFullLoadPressure = genericCompressor.MinStonewallPressure;
    selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = genericCompressor.MinPressStonewallFlow;
    selectedCompressor.centrifugalSpecifics.surgeAirflow = genericCompressor.DesignSurgeFlow;
    selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = genericCompressor.MaxSurgePressure;
    selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = genericCompressor.MaxPressSurgeFlow;
    //TODO: Alex Question.. EffFL and AmpsFL not listed in xcel (round 3)
    //I believe these were added later on and should be accurate
    selectedCompressor.designDetails.designEfficiency = genericCompressor.EffFL;
    selectedCompressor.nameplateData.fullLoadAmps = genericCompressor.AmpsFL;

    selectedCompressor.performancePoints = this.setPerformancePoints(selectedCompressor, genericCompressor);
    return selectedCompressor;
  }

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
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

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
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

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
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

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
    selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, genericCompressor.MaxFullFlowPressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);

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
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / designEfficiency) / designEfficiency) / 10000;
      return Number(noLoadPower.toFixed(3));
    } else {
      let noLoadPower: number =  NoLoadPowerUL * TotPackageInputPower / 1 / 10000;
      return Number(noLoadPower.toFixed(3));
    }
  }


  calculateMaxFullFlowAirFlow(fullLoadRatedCapacity: number, MaxFullFlowPressure: number, fullLoadOperatingPressure: number): number {
    let atmosphericPressure: number = 14.7;
    let maxFullFlowAirFlow: number = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * fullLoadRatedCapacity * (1 - 0.00075 * (MaxFullFlowPressure - fullLoadOperatingPressure));
    return Number(maxFullFlowAirFlow.toFixed(3));
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
    let maxFullFlowPower: number = p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
    return Number(maxFullFlowPower.toFixed(3));
  }


  calculateUnloadPointPower(NoLoadPowerFM: number, unloadPointCapacity: number, exponent: number, maxFullFlowPower: number): number {
    let unloadPointPower:number = ((NoLoadPowerFM / 100) * (1 - Math.pow((unloadPointCapacity / 100), exponent)) + Math.pow((unloadPointCapacity / 100), exponent)) * maxFullFlowPower;
    return Number(unloadPointPower.toFixed(3));
  }

  calculateUnloadPointAirFlow(fullLoadRatedCapacity: number, unloadPointCapacity: number): number {
    let unloadPointAirFlow: number = fullLoadRatedCapacity * (unloadPointCapacity / 100);
    return Number(unloadPointAirFlow.toFixed(3));
  }

  calculateUnloadPointDischargePressure(MaxFullFlowPressure: number, modulatingPressureRange: number, unloadPointCapacity: number): number {
    let unloadPointDischargePressure: number = MaxFullFlowPressure + (modulatingPressureRange * (1 - (unloadPointCapacity / 100)));
    return Number(unloadPointDischargePressure.toFixed(3));
  }


}
