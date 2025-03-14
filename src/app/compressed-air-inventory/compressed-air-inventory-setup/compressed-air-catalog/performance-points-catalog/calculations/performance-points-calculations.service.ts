import { Injectable } from '@angular/core';
import { CompressedAirItem, CompressedAirPerformancePointsProperties } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';
import { FullLoadCatalogService } from '../full-load-catalog/full-load-catalog.service';
import { NoLoadCatalogService } from '../no-load-catalog/no-load-catalog.service';
import { MaxFullFlowCatalogService } from '../max-full-flow-catalog/max-full-flow-catalog.service';
import { MidTurndownCatalogService } from '../mid-turndown-catalog/mid-turndown-catalog.service';
import { TurndownCatalogService } from '../turndown-catalog/turndown-catalog.service';
import { BlowoffCatalogService } from '../blowoff-catalog/blowoff-catalog.service';
import { UnloadPointCatalogService } from '../unload-point-catalog/unload-point-catalog.service';

@Injectable()
export class PerformancePointsCalculationsService {

  constructor(private fullLoadCatalogService: FullLoadCatalogService,
    private noLoadCatalogService: NoLoadCatalogService, private maxFullFlowCatalogService: MaxFullFlowCatalogService,
    private midTurndownCatalogService: MidTurndownCatalogService, private turndownCatalogService: TurndownCatalogService,
    private blowoffCatalogService: BlowoffCatalogService, private unloadPointCatalogService: UnloadPointCatalogService) { }

  updatePerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    selectedCompressor.compressedAirPerformancePointsProperties = this.setPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  setPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //all combinations use full load
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad = this.fullLoadCatalogService.setFullLoad(selectedCompressor, atmosphericPressure, settings);

    if (selectedCompressor.compressedAirControlsProperties.controlType == 1) {
      //lube mod without unloading
      selectedCompressor.compressedAirPerformancePointsProperties = this.setWithoutUnloadingPerformancePoints(selectedCompressor, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 2) {
      //lube mod with unloading
      selectedCompressor.compressedAirPerformancePointsProperties = this.setWithUnloadingPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 3) {
      //variable displacement
      selectedCompressor.compressedAirPerformancePointsProperties = this.setVariableDisplacementPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 4 && selectedCompressor.nameplateData.compressorType != 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.compressedAirPerformancePointsProperties = this.setLubricatedLoadUnloadPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 6) {
      //start/stop
      selectedCompressor.compressedAirPerformancePointsProperties = this.setStartStopPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 5) {
      //multi-step unloading
      selectedCompressor.compressedAirPerformancePointsProperties = this.setMultiStepUnloading(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 8) {
      //inlet butterfly modulation with unloading
      selectedCompressor.compressedAirPerformancePointsProperties = this.setInletButterflyModulationWithUnloading(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 7 || selectedCompressor.compressedAirControlsProperties.controlType == 9) {
      //blowoff
      selectedCompressor.compressedAirPerformancePointsProperties = this.setInletButterflyModulationWithBlowoff(selectedCompressor, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 10) {
      //inlet van modulation with unloading
      selectedCompressor.compressedAirPerformancePointsProperties = this.setInletVaneModulationWithUnloading(selectedCompressor, atmosphericPressure, settings);
    } else if (selectedCompressor.compressedAirControlsProperties.controlType == 11) {
      //VFD
      selectedCompressor.compressedAirPerformancePointsProperties = this.setVFDPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    }

    else if (selectedCompressor.compressedAirControlsProperties.controlType == 4 && selectedCompressor.nameplateData.compressorType == 6) {
      //load/unload (non-centrifugal)
      selectedCompressor.compressedAirPerformancePointsProperties = this.setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor, atmosphericPressure, settings);
    }
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //WITH UNLOADING
  setWithUnloadingPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint = this.unloadPointCatalogService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  setVFDPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    selectedCompressor.compressedAirPerformancePointsProperties.midTurndown = this.midTurndownCatalogService.setMidTurndown(selectedCompressor, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.turndown = this.turndownCatalogService.setTurndown(selectedCompressor, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //VARIABLE DISPLACMENT
  setVariableDisplacementPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint = this.unloadPointCatalogService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //LOAD/UNLOAD
  setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //WITHOUT UNLOADING
  setWithoutUnloadingPerformancePoints(selectedCompressor: CompressedAirItem, settings: Settings): CompressedAirPerformancePointsProperties {
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //START STOP
  setStartStopPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //MULTI STEP UNLOADING
  setMultiStepUnloading(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties
  }

  //CENTRIFUGAL
  //inlet buterfly modulation with unloading
  setInletButterflyModulationWithUnloading(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint = this.unloadPointCatalogService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }


  //inlet butterfly modulation with blowoff
  setInletButterflyModulationWithBlowoff(selectedCompressor: CompressedAirItem, settings: Settings): CompressedAirPerformancePointsProperties {
    //blowoff
    selectedCompressor.compressedAirPerformancePointsProperties.blowoff = this.blowoffCatalogService.setBlowoff(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //inlet vane modulation with unloading
  setInletVaneModulationWithUnloading(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //unloadPoint
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint = this.unloadPointCatalogService.setUnload(selectedCompressor, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }

  //load/unload centrifugal
  setLubricatedLoadUnloadCentrifugalPerformancePoints(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): CompressedAirPerformancePointsProperties {
    //maxFullFlow
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow = this.maxFullFlowCatalogService.setMaxFullFlow(selectedCompressor, atmosphericPressure, settings);
    //noLoad
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad = this.noLoadCatalogService.setNoLoad(selectedCompressor, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties;
  }
}
