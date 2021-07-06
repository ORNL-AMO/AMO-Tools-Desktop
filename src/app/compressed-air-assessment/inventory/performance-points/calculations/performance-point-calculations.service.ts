import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoints } from '../../../../shared/models/compressed-air-assessment';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import * as regression from 'regression';
import { FullLoadCalculationsService } from './full-load-calculations.service';
import { NoLoadCalculationsService } from './no-load-calculations.service';
import { MaxFullFlowCalculationsService } from './max-full-flow-calculations.service';
import { BlowoffCalculationsService } from './blowoff-calculations.service';
import { UnloadPointCalculationsService } from './unload-point-calculations.service';

@Injectable()
export class PerformancePointCalculationsService {

  constructor(private genericCompressorDbService: GenericCompressorDbService, private fullLoadCalculationsService: FullLoadCalculationsService,
    private noLoadCalculationsService: NoLoadCalculationsService, private maxFullFlowCalculationsService: MaxFullFlowCalculationsService,
    private blowoffCalculationsService: BlowoffCalculationsService, private unloadPointCalculationsService: UnloadPointCalculationsService) { }

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
    //all combinations use full load
    selectedCompressor.performancePoints.fullLoad = this.fullLoadCalculationsService.setFullLoad(selectedCompressor, genericCompressor);

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
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //VARIABLE DISPLACMENT
  setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //LOAD/UNLOAD
  setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //WITHOUT UNLOADING
  setWithoutUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //START STOP
  setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //MULTI STEP UNLOADING
  setMultiStepUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints
  }

  //CENTRIFUGAL
  //inlet buterfly modulation with unloading
  setInletButterflyModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }


  //inlet butterfly modulation with blowoff
  setInletButterflyModulationWithBlowoff(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //blowoff
    selectedCompressor.performancePoints.blowoff = this.blowoffCalculationsService.setBlowoff(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //inlet vane modulation with unloading
  setInletVaneModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }

  //load/unload centrifugal
  setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, genericCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, genericCompressor);
    return selectedCompressor.performancePoints;
  }
}
