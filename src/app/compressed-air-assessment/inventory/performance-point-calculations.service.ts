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
    selectedCompressor.performancePoints.fullLoad.dischargePressure = genericCompressor.RatedPressure;
    selectedCompressor.performancePoints.fullLoad.airflow = genericCompressor.RatedCapacity;
    selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;

    if (selectedCompressor.compressorControls.controlType == 1) {
      //lube mod without unloading
      selectedCompressor.performancePoints = this.setWithoutUnloadingPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.performancePoints = this.setWithUnloadingPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 3) {
      //variable displacement
      selectedCompressor.performancePoints = this.setVariableDisplacementPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4) {
      //load/unload
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 6) {
      //start/stop
      selectedCompressor.performancePoints = this.setStartStopPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 8 || selectedCompressor.compressorControls.controlType == 10) {
      //blowoff
      selectedCompressor.performancePoints = this.setBlowoffPerformancePoints(selectedCompressor.performancePoints, genericCompressor);
    }
    return selectedCompressor.performancePoints;
  }

  setWithUnloadingPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(genericCompressor.RatedCapacity, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure);
    performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, genericCompressor.DesignInPressure, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure, genericCompressor.TotPackageInputPower);

    // performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure + (genericCompressor.ModulatingPressRange * (1 - genericCompressor.UnloadPoint / 100));
    performancePoints.unloadPoint.dischargePressure = this.calculateUnloadPointDischargePressure(genericCompressor.MaxFullFlowPressure, genericCompressor.ModulatingPressRange, genericCompressor.UnloadPoint);
    // performancePoints.unloadPoint.airflow = (genericCompressor.UnloadPoint / 100) * genericCompressor.RatedCapacity;
    performancePoints.unloadPoint.airflow = this.calculateUnloadPointAirFlow(genericCompressor.RatedCapacity, genericCompressor.UnloadPoint);
    // performancePoints.unloadPoint.power = ((genericCompressor.NoLoadPowerFM / 100) * (1 - (genericCompressor.UnloadPoint / 100)) + (genericCompressor.UnloadPoint / 100)) * performancePoints.maxFullFlow.power;
    performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, genericCompressor.UnloadPoint, 1, performancePoints.maxFullFlow.power);

    performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    performancePoints.noLoad.airflow = 0;
    performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, genericCompressor.EffFL);
    return performancePoints;
  }

  setVariableDisplacementPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(genericCompressor.RatedCapacity, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure);
    performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, genericCompressor.DesignInPressure, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure, genericCompressor.TotPackageInputPower);

    // performancePoints.unloadPoint.dischargePressure = genericCompressor.MaxFullFlowPressure + (genericCompressor.ModulatingPressRange * (1 - (genericCompressor.UnloadPoint / 100)));
    performancePoints.unloadPoint.dischargePressure = this.calculateUnloadPointDischargePressure(genericCompressor.MaxFullFlowPressure, genericCompressor.ModulatingPressRange, genericCompressor.UnloadPoint);
    // performancePoints.unloadPoint.airflow = genericCompressor.RatedCapacity * (genericCompressor.UnloadPoint / 100);
    performancePoints.unloadPoint.airflow = this.calculateUnloadPointAirFlow(genericCompressor.RatedCapacity, genericCompressor.UnloadPoint);
    // performancePoints.unloadPoint.power = ((genericCompressor.NoLoadPowerFM / 100) * (1 - Math.pow((genericCompressor.UnloadPoint / 100), 2)) + Math.pow((genericCompressor.UnloadPoint / 100), 2)) * performancePoints.maxFullFlow.power;
    performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, genericCompressor.UnloadPoint, 2, performancePoints.maxFullFlow.power);

    performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    performancePoints.noLoad.airflow = 0
    performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, genericCompressor.EffFL);
    return performancePoints;
  }

  setLubricatedLoadUnloadPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    //TODO: calculate airflow and power?
    performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(genericCompressor.RatedCapacity, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure);
    performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, genericCompressor.DesignInPressure, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure, genericCompressor.TotPackageInputPower);

    performancePoints.noLoad.dischargePressure = genericCompressor.MinULSumpPressure;
    performancePoints.noLoad.airflow = 0
    performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, genericCompressor.EffFL);
    return performancePoints;
  }

  setWithoutUnloadingPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.noLoad.dischargePressure = genericCompressor.RatedPressure + genericCompressor.ModulatingPressRange;
    performancePoints.noLoad.airflow = 0;
    performancePoints.noLoad.power = genericCompressor.NoLoadPowerFM / 100 * genericCompressor.TotPackageInputPower;
    return performancePoints;
  }

  setStartStopPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(genericCompressor.RatedCapacity, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure);
    performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(genericCompressor.IDCompType, genericCompressor.DesignInPressure, genericCompressor.MaxFullFlowPressure, genericCompressor.RatedPressure, genericCompressor.TotPackageInputPower);

    performancePoints.noLoad.dischargePressure = 0;
    performancePoints.noLoad.airflow = 0
    performancePoints.noLoad.power = 0;

    return performancePoints;
  }

  setBlowoffPerformancePoints(performancePoints: PerformancePoints, genericCompressor: GenericCompressor): PerformancePoints {
    performancePoints.blowoff.airflow = genericCompressor.MaxPressSurgeFlow;
    performancePoints.blowoff.dischargePressure = genericCompressor.MaxSurgePressure;
    //TODO: Power
    performancePoints.blowoff.power

    return performancePoints
  }


  calculateNoLoadPower(NoLoadPowerUL: number, TotPackageInputPower: number, EffFL: number): number {
    if (NoLoadPowerUL < 25) {
      return NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / EffFL) / EffFL) / 10000;
    } else {
      return NoLoadPowerUL * TotPackageInputPower / 1 / 10000;
    }
  }


  calculateMaxFullFlowAirFlow(RatedCapacity: number, MaxFullFlowPressure: number, RatedPressure: number): number {
    let atmosphericPressure: number = 14.7;
    return (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * RatedCapacity * (1 - 0.00075 * (MaxFullFlowPressure - RatedPressure));
  }

  calculateMaxFullFlowPower(compressorType: number, DesignInPressure: number, MaxFullFlowPressure: number, RatedPressure: number, TotPackageInputPower: number): number {
    let atmosphericPressure: number = 14.7;
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
      //screw
      p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
      p2 = (MaxFullFlowPressure + DesignInPressure) / DesignInPressure;
    } else {
      p1 = (atmosphericPressure / DesignInPressure);
      p2 = (MaxFullFlowPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((RatedPressure + DesignInPressure) / DesignInPressure), polytropicExponent) - 1;
    return p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
  }


  calculateUnloadPointPower(NoLoadPowerFM: number, UnloadPoint: number, exponent: number, maxFullFlowPower: number): number {
    return ((NoLoadPowerFM / 100) * (1 - Math.pow((UnloadPoint / 100), exponent)) + Math.pow((UnloadPoint / 100), exponent)) * maxFullFlowPower;
  }

  calculateUnloadPointAirFlow(RatedCapacity: number, UnloadPoint: number): number {
    return RatedCapacity * (UnloadPoint / 100);
  }

  calculateUnloadPointDischargePressure(MaxFullFlowPressure: number, ModulatingPressRange: number, UnloadPoint: number): number {
    return MaxFullFlowPressure + (ModulatingPressRange * (1 - (UnloadPoint / 100)));
  }
}
