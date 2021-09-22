import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoints } from '../../../../shared/models/compressed-air-assessment';
import { FullLoadCalculationsService } from './full-load-calculations.service';
import { NoLoadCalculationsService } from './no-load-calculations.service';
import { MaxFullFlowCalculationsService } from './max-full-flow-calculations.service';
import { BlowoffCalculationsService } from './blowoff-calculations.service';
import { UnloadPointCalculationsService } from './unload-point-calculations.service';

@Injectable()
export class PerformancePointCalculationsService {

  constructor(private fullLoadCalculationsService: FullLoadCalculationsService,
    private noLoadCalculationsService: NoLoadCalculationsService, private maxFullFlowCalculationsService: MaxFullFlowCalculationsService,
    private blowoffCalculationsService: BlowoffCalculationsService, private unloadPointCalculationsService: UnloadPointCalculationsService) { }

  updatePerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    selectedCompressor.performancePoints = this.setPerformancePoints(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  setPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //all combinations use full load
    selectedCompressor.performancePoints.fullLoad = this.fullLoadCalculationsService.setFullLoad(selectedCompressor);

    if (selectedCompressor.compressorControls.controlType == 1) {
      //lube mod without unloading
      selectedCompressor.performancePoints = this.setWithoutUnloadingPerformancePoints(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.performancePoints = this.setWithUnloadingPerformancePoints(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 3) {
      //variable displacement
      selectedCompressor.performancePoints = this.setVariableDisplacementPerformancePoints(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType != 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 6) {
      //start/stop
      selectedCompressor.performancePoints = this.setStartStopPerformancePoints(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 5) {
      //multi-step unloading
      selectedCompressor.performancePoints = this.setMultiStepUnloading(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 8) {
      //inlet butterfly modulation with unloading
      selectedCompressor.performancePoints = this.setInletButterflyModulationWithUnloading(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 7 || selectedCompressor.compressorControls.controlType == 9) {
      //blowoff
      selectedCompressor.performancePoints = this.setInletButterflyModulationWithBlowoff(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 10) {
      //inlet van modulation with unloading
      selectedCompressor.performancePoints = this.setInletVaneModulationWithUnloading(selectedCompressor);
    } else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType == 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor);
    }
    return selectedCompressor.performancePoints;
  }

  //WITH UNLOADING
  setWithUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //VARIABLE DISPLACMENT
  setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //LOAD/UNLOAD
  setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //WITHOUT UNLOADING
  setWithoutUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //START STOP
  setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //MULTI STEP UNLOADING
  setMultiStepUnloading(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints
  }

  //CENTRIFUGAL
  //inlet buterfly modulation with unloading
  setInletButterflyModulationWithUnloading(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }


  //inlet butterfly modulation with blowoff
  setInletButterflyModulationWithBlowoff(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //blowoff
    selectedCompressor.performancePoints.blowoff = this.blowoffCalculationsService.setBlowoff(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //inlet vane modulation with unloading
  setInletVaneModulationWithUnloading(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }

  //load/unload centrifugal
  setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor: CompressorInventoryItem): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor);
    return selectedCompressor.performancePoints;
  }
}
