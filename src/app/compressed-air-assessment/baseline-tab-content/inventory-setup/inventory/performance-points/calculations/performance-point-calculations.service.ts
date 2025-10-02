import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoints } from '../../../../../../shared/models/compressed-air-assessment';
import { FullLoadCalculationsService } from './full-load-calculations.service';
import { NoLoadCalculationsService } from './no-load-calculations.service';
import { MaxFullFlowCalculationsService } from './max-full-flow-calculations.service';
import { BlowoffCalculationsService } from './blowoff-calculations.service';
import { UnloadPointCalculationsService } from './unload-point-calculations.service';
import { Settings } from '../../../../../../shared/models/settings';
import { MidTurndownCalculationService } from './mid-turndown-calculation.service';
import { TurndownCalculationService } from './turndown-calculation.service';

@Injectable()
export class PerformancePointCalculationsService {

  constructor(private fullLoadCalculationsService: FullLoadCalculationsService,
    private noLoadCalculationsService: NoLoadCalculationsService, private maxFullFlowCalculationsService: MaxFullFlowCalculationsService,
    private midTurndownCalculationService: MidTurndownCalculationService, private turndownCalculationService: TurndownCalculationService,
    private blowoffCalculationsService: BlowoffCalculationsService, private unloadPointCalculationsService: UnloadPointCalculationsService) { }

  updatePerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    selectedCompressor.performancePoints = this.setPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    return selectedCompressor.performancePoints;
  }

  setPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //all combinations use full load
    selectedCompressor.performancePoints.fullLoad = this.fullLoadCalculationsService.setFullLoad(selectedCompressor, atmosphericPressure, settings);

    if (selectedCompressor.compressorControls.controlType == 1) {
      //lube mod without unloading
      selectedCompressor.performancePoints = this.setWithoutUnloadingPerformancePoints(selectedCompressor, settings);
    } else if (selectedCompressor.compressorControls.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.performancePoints = this.setWithUnloadingPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 3) {
      //variable displacement
      selectedCompressor.performancePoints = this.setVariableDisplacementPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType != 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 6) {
      //start/stop
      selectedCompressor.performancePoints = this.setStartStopPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 5) {
      //multi-step unloading
      selectedCompressor.performancePoints = this.setMultiStepUnloading(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 8) {
      //inlet butterfly modulation with unloading
      selectedCompressor.performancePoints = this.setInletButterflyModulationWithUnloading(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 7 || selectedCompressor.compressorControls.controlType == 9) {
      //blowoff
      selectedCompressor.performancePoints = this.setInletButterflyModulationWithBlowoff(selectedCompressor, settings);
    } else if (selectedCompressor.compressorControls.controlType == 10) {
      //inlet van modulation with unloading
      selectedCompressor.performancePoints = this.setInletVaneModulationWithUnloading(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressorControls.controlType == 11) {
      //VFD
      selectedCompressor.performancePoints = this.setVFDPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    }
    
    else if (selectedCompressor.compressorControls.controlType == 4 && selectedCompressor.nameplateData.compressorType == 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.performancePoints = this.setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    }
    return selectedCompressor.performancePoints;
  }

  //WITH UNLOADING
  setWithUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  setVFDPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    selectedCompressor.performancePoints.midTurndown = this.midTurndownCalculationService.setMidTurndown(selectedCompressor, settings);
    selectedCompressor.performancePoints.turndown = this.turndownCalculationService.setTurndown(selectedCompressor, settings);
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //VARIABLE DISPLACMENT
  setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //LOAD/UNLOAD
  setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //WITHOUT UNLOADING
  setWithoutUnloadingPerformancePoints(selectedCompressor: CompressorInventoryItem, settings: Settings): PerformancePoints {
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //START STOP
  setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //MULTI STEP UNLOADING
  setMultiStepUnloading(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints
  }

  //CENTRIFUGAL
  //inlet buterfly modulation with unloading
  setInletButterflyModulationWithUnloading(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }


  //inlet butterfly modulation with blowoff
  setInletButterflyModulationWithBlowoff(selectedCompressor: CompressorInventoryItem, settings: Settings): PerformancePoints {
    //blowoff
    selectedCompressor.performancePoints.blowoff = this.blowoffCalculationsService.setBlowoff(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //inlet vane modulation with unloading
  setInletVaneModulationWithUnloading(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.performancePoints.unloadPoint = this.unloadPointCalculationsService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }

  //load/unload centrifugal
  setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): PerformancePoints {
    //maxFullFlow
    selectedCompressor.performancePoints.maxFullFlow = this.maxFullFlowCalculationsService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.performancePoints.noLoad = this.noLoadCalculationsService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.performancePoints;
  }
}
