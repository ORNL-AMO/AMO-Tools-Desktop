import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoints } from '../../shared/models/compressed-air-assessment';
import { GenericCompressor, GenericCompressorDbService } from '../generic-compressor-db.service';
import * as regression from 'regression';

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

    selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow = true;
    selectedCompressor.performancePoints.fullLoad.isDefaultPower = true;
    selectedCompressor.performancePoints.fullLoad.isDefaultPressure = true;

    selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow = true;
    selectedCompressor.performancePoints.maxFullFlow.isDefaultPower = true;
    selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure = true;

    selectedCompressor.performancePoints.noLoad.isDefaultAirFlow = true;
    selectedCompressor.performancePoints.noLoad.isDefaultPower = true;
    selectedCompressor.performancePoints.noLoad.isDefaultPressure = true;

    selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow = true;
    selectedCompressor.performancePoints.unloadPoint.isDefaultPower = true;
    selectedCompressor.performancePoints.unloadPoint.isDefaultPressure = true;


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
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.fullLoad.airflow = selectedCompressor.nameplateData.fullLoadRatedCapacity;
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;
    }

    if (selectedCompressor.compressorControls.controlType == 1) {
      //lube mod without unloading
      selectedCompressor.performancePoints = this.setWithoutUnloadingPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.performancePoints = this.setWithUnloadingPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 3) {
      //variable displacement
      selectedCompressor.performancePoints = this.setVariableDisplacementPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType != 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 5) {
      //start/stop
      selectedCompressor.performancePoints = this.setStartStopPerformancePoints(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 6) {
      //multi-step unloading
      selectedCompressor.performancePoints = this.setMultiStepUnloading(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 8) {
      //inlet butterfly modulation with unloading
      selectedCompressor.performancePoints = this.setInletButterflyModulationWithUnloading(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 7 || selectedCompressor.compressorControls.controlType == 9) {
      //blowoff
      selectedCompressor.performancePoints = this.setInletButterflyModulationWithBlowoff(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 10) {
      //inlet van modulation with unloading
      selectedCompressor.performancePoints = this.setInletVaneModulationWithUnloading(selectedCompressor, genericCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType == 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor, genericCompressor);
    }
    return selectedCompressor.performancePoints;
  }

  //WITH UNLOADING
  setWithUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
    }
    //unloadPoint
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
      selectedCompressor.performancePoints.unloadPoint.dischargePressure = this.calculateUnloadPointDischargePressure(selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.designDetails.modulatingPressureRange, selectedCompressor.compressorControls.unloadPointCapacity);
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow) {
      selectedCompressor.performancePoints.unloadPoint.airflow = this.calculateUnloadPointAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.compressorControls.unloadPointCapacity);
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
      selectedCompressor.performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, selectedCompressor.compressorControls.unloadPointCapacity, 1, selectedCompressor.performancePoints.maxFullFlow.power);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0;
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    }
    return selectedCompressor.performancePoints;
  }

  //VARIABLE DISPLACMENT
  setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
    }
    //unloadPoint
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
      selectedCompressor.performancePoints.unloadPoint.dischargePressure = this.calculateUnloadPointDischargePressure(selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.designDetails.modulatingPressureRange, selectedCompressor.compressorControls.unloadPointCapacity);
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow) {
      selectedCompressor.performancePoints.unloadPoint.airflow = this.calculateUnloadPointAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.compressorControls.unloadPointCapacity);
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
      selectedCompressor.performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, selectedCompressor.compressorControls.unloadPointCapacity, 2, selectedCompressor.performancePoints.maxFullFlow.power);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    }
    return selectedCompressor.performancePoints;
  }

  //LOAD/UNLOAD
  setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    }
    return selectedCompressor.performancePoints;
  }

  //WITHOUT UNLOADING
  setWithoutUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure + selectedCompressor.designDetails.modulatingPressureRange;
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0;
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPowerWithoutUnloading(genericCompressor);
    }
    return selectedCompressor.performancePoints;
  }

  //START STOP
  setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = 0;
    }
    return selectedCompressor.performancePoints;
  }

  //BLOWOFF
  setBlowoffPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    selectedCompressor.performancePoints.blowoff.airflow = genericCompressor.MaxPressSurgeFlow;
    selectedCompressor.performancePoints.blowoff.dischargePressure = genericCompressor.MaxSurgePressure;
    //TODO: Power
    selectedCompressor.performancePoints.blowoff.power

    return selectedCompressor.performancePoints
  }

  //MULTI STEP UNLOADING
  setMultiStepUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadDischargePressure(selectedCompressor, genericCompressor);
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);;
    }
    return selectedCompressor.performancePoints
  }

  //CENTRIFUGAL
  //inlet buterfly modulation with unloading
  setInletButterflyModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
    //y2 = RatedCapacity, x2 = RatedPressure
    //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
    let regressionData: Array<Array<number>> = [
      [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
      [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
      [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
    ];
    let regressionEquation;
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
      regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.fullLoad.dischargePressure);
      selectedCompressor.performancePoints.fullLoad.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;
    }
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      if (!regressionEquation) {
        regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      }
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
      selectedCompressor.performancePoints.maxFullFlow.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = selectedCompressor.performancePoints.fullLoad.power;
    }
    //unloadPoint
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
      selectedCompressor.performancePoints.unloadPoint.dischargePressure = selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow) {
      selectedCompressor.performancePoints.unloadPoint.airflow = this.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.performancePoints.unloadPoint.dischargePressure);
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
      let unloadPointCapacity: number = (selectedCompressor.performancePoints.unloadPoint.airflow / selectedCompressor.performancePoints.maxFullFlow.airflow) * 100;
      selectedCompressor.performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.performancePoints.maxFullFlow.power);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = 0;
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);;
    }

    return selectedCompressor.performancePoints;
  }


  //inlet butterfly modulation with blowoff
  setInletButterflyModulationWithBlowoff(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
    //y2 = RatedCapacity, x2 = RatedPressure
    //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
    let regressionData: Array<Array<number>> = [
      [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
      [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
      [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
    ];
    let regressionEquation;
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
      regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.fullLoad.dischargePressure);
      selectedCompressor.performancePoints.fullLoad.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;
    }
    //blowoff
    if (selectedCompressor.performancePoints.blowoff.isDefaultPressure) {
      selectedCompressor.performancePoints.blowoff.dischargePressure = selectedCompressor.performancePoints.fullLoad.dischargePressure;
    }
    if (selectedCompressor.performancePoints.blowoff.isDefaultAirFlow) {
      selectedCompressor.performancePoints.blowoff.airflow = this.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.performancePoints.blowoff.dischargePressure);
    }
    if (selectedCompressor.performancePoints.blowoff.isDefaultPower) {
      let unloadPointCapacity: number = (selectedCompressor.performancePoints.blowoff.airflow / selectedCompressor.performancePoints.fullLoad.airflow) * 100;
      selectedCompressor.performancePoints.blowoff.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.performancePoints.fullLoad.power);
    }
    return selectedCompressor.performancePoints;
  }

  //inlet vane modulation with unloading
  setInletVaneModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
    //y2 = RatedCapacity, x2 = RatedPressure
    //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
    let regressionData: Array<Array<number>> = [
      [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
      [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
      [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
    ];
    let regressionEquation;
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
      regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.fullLoad.dischargePressure);
      selectedCompressor.performancePoints.fullLoad.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;
    }
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      if (!regressionEquation) {
        regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      }
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
      selectedCompressor.performancePoints.maxFullFlow.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = selectedCompressor.performancePoints.fullLoad.power;
    }
    //unloadPoint
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
      selectedCompressor.performancePoints.unloadPoint.dischargePressure = selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow) {
      selectedCompressor.performancePoints.unloadPoint.airflow = this.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.performancePoints.unloadPoint.dischargePressure);
    }
    if (selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
      let unloadPointCapacity: number = (selectedCompressor.performancePoints.unloadPoint.airflow / selectedCompressor.performancePoints.maxFullFlow.airflow) * 100;
      selectedCompressor.performancePoints.unloadPoint.power = this.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.performancePoints.maxFullFlow.power);
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = 0;
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    }

    return selectedCompressor.performancePoints;
  }

  //load/unload centrifugal
  setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
    //y2 = RatedCapacity, x2 = RatedPressure
    //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
    let regressionData: Array<Array<number>> = [
      [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
      [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
      [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
    ];
    let regressionEquation;
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
      regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.fullLoad.dischargePressure);
      selectedCompressor.performancePoints.fullLoad.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;
    }
    //maxFullFlow
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      if (!regressionEquation) {
        regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
      }
      let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
      selectedCompressor.performancePoints.maxFullFlow.airflow = regressionValue[1];
    }
    if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      selectedCompressor.performancePoints.maxFullFlow.power = selectedCompressor.performancePoints.fullLoad.power;
    }
    //noLoad
    if (selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
      selectedCompressor.performancePoints.noLoad.dischargePressure = 0;
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
      selectedCompressor.performancePoints.noLoad.airflow = 0
    }
    if (selectedCompressor.performancePoints.noLoad.isDefaultPower) {
      selectedCompressor.performancePoints.noLoad.power = this.calculateNoLoadPower(genericCompressor.NoLoadPowerUL, genericCompressor.TotPackageInputPower, selectedCompressor.designDetails.designEfficiency);
    }
    return selectedCompressor.performancePoints;
  }


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

  calculateMaxFullFlowAirFlow(fullLoadRatedCapacity: number, maxFullFlowPressure: number, fullLoadOperatingPressure: number): number {
    let atmosphericPressure: number = 14.7;
    let maxFullFlowAirFlow: number = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * fullLoadRatedCapacity * (1 - 0.00075 * (maxFullFlowPressure - fullLoadOperatingPressure));
    return Number(maxFullFlowAirFlow.toFixed(3));
  }

  calculateMaxFullFlowPower(compressorType: number, inputPressure: number, maxFullFlowPressure: number, fullLoadOperatingPressure: number, TotPackageInputPower: number): number {
    let atmosphericPressure: number = 14.7;
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
      //screw
      p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
      p2 = (maxFullFlowPressure + inputPressure) / inputPressure;
    } else {
      p1 = (atmosphericPressure / inputPressure);
      p2 = (maxFullFlowPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((fullLoadOperatingPressure + inputPressure) / inputPressure), polytropicExponent) - 1;
    let maxFullFlowPower: number = p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
    return Number(maxFullFlowPower.toFixed(3));
  }

  calculateUnloadPointPower(NoLoadPowerFM: number, unloadPointCapacity: number, exponent: number, maxFullFlowPower: number): number {
    let unloadPointPower: number = ((NoLoadPowerFM / 100) * (1 - Math.pow((unloadPointCapacity / 100), exponent)) + Math.pow((unloadPointCapacity / 100), exponent)) * maxFullFlowPower;
    return Number(unloadPointPower.toFixed(3));
  }

  calculateUnloadPointAirFlow(fullLoadRatedCapacity: number, unloadPointCapacity: number): number {
    let unloadPointAirFlow: number = fullLoadRatedCapacity * (unloadPointCapacity / 100);
    return Number(unloadPointAirFlow.toFixed(3));
  }

  calculateUnloadPointDischargePressure(maxFullFlowPressure: number, modulatingPressureRange: number, unloadPointCapacity: number): number {
    let unloadPointDischargePressure: number = maxFullFlowPressure + (modulatingPressureRange * (1 - (unloadPointCapacity / 100)));
    return Number(unloadPointDischargePressure.toFixed(3));
  }

  calculateNoLoadPowerWithoutUnloading(genericCompressor: GenericCompressor): number {
    return genericCompressor.NoLoadPowerFM / 100 * genericCompressor.TotPackageInputPower;
  }

  getNoLoadDischargePressure(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): number {
    //centrifugal or start/stop
    if (selectedCompressor.nameplateData.compressorType == 6 || selectedCompressor.compressorControls.controlType == 5) {
      return 0
    } else {
      return genericCompressor.MinULSumpPressure;
    }
  }


  calculateCentrifugalUnloadPointAirFlow(selectedCompressor: CompressorInventoryItem, pressure: number): number {
    let C37: number = pressure;
    let C24: number = selectedCompressor.centrifugalSpecifics.minFullLoadPressure;
    let C22: number = selectedCompressor.centrifugalSpecifics.maxFullLoadPressure;
    let C23: number = selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity;
    let C26: number = selectedCompressor.centrifugalSpecifics.surgeAirflow;
    return (C37 - (C24 - (((C22 - C24) / (C23 - C26)) * C26))) / ((C22 - C24) / (C23 - C26))
  }
}
