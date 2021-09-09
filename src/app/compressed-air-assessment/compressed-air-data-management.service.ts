import { Injectable } from '@angular/core';
import { CentrifugalSpecifics, CompressedAirAssessment, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, InletConditions, Modification, PerformancePoint } from '../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { GenericCompressor } from './generic-compressor-db.service';
import { InventoryService } from './inventory/inventory.service';
import { PerformancePointCalculationsService } from './inventory/performance-points/calculations/performance-point-calculations.service';
import { SystemProfileService } from './system-profile/system-profile.service';

@Injectable()
export class CompressedAirDataManagementService {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService, private performancePointCalculationsService: PerformancePointCalculationsService,
    private systemProfileService: SystemProfileService) { }


  //update from generic compressor
  setCompressorDataFromGenericCompressorDb(genericCompressor: GenericCompressor) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.compressorLibId = genericCompressor.IDCompLib;

    selectedCompressor.nameplateData.compressorType = genericCompressor.IDCompType;
    selectedCompressor.compressorControls.controlType = genericCompressor.IDControlType;

    selectedCompressor.nameplateData.motorPower = genericCompressor.HP;

    selectedCompressor.nameplateData.totalPackageInputPower = Number(genericCompressor.TotPackageInputPower.toFixed(1));
    selectedCompressor.designDetails.noLoadPowerFM = this.overrideGenericDbValueForDisplay(genericCompressor.NoLoadPowerFM);
    selectedCompressor.compressorControls.unloadSumpPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MinULSumpPressure);
    selectedCompressor.designDetails.noLoadPowerUL = genericCompressor.NoLoadPowerUL;
    selectedCompressor.designDetails.maxFullFlowPressure = genericCompressor.MaxFullFlowPressure;


    selectedCompressor.compressorControls.unloadPointCapacity = genericCompressor.UnloadPoint;
    selectedCompressor.compressorControls.numberOfUnloadSteps = genericCompressor.UnloadSteps;
    selectedCompressor.designDetails.blowdownTime = this.overrideGenericDbValueForDisplay(genericCompressor.BlowdownTime);
    selectedCompressor.designDetails.modulatingPressureRange = this.overrideGenericDbValueForDisplay(genericCompressor.ModulatingPressRange);
    selectedCompressor.inletConditions.temperature = genericCompressor.DesignInTemp;
    selectedCompressor.designDetails.inputPressure = genericCompressor.DesignInPressure;
    selectedCompressor.nameplateData.fullLoadOperatingPressure = genericCompressor.RatedPressure;
    selectedCompressor.nameplateData.fullLoadRatedCapacity = genericCompressor.RatedCapacity;

    selectedCompressor.centrifugalSpecifics.minFullLoadPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MinStonewallPressure);
    selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = this.overrideGenericDbValueForDisplay(genericCompressor.MinPressStonewallFlow);
    selectedCompressor.centrifugalSpecifics.surgeAirflow = this.overrideGenericDbValueForDisplay(genericCompressor.DesignSurgeFlow);
    selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MaxSurgePressure);
    selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = this.overrideGenericDbValueForDisplay(genericCompressor.MaxPressSurgeFlow);
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
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true)
  }

  overrideGenericDbValueForDisplay(databaseVal: number) {
    if (databaseVal === -9999) {
      return null;
    }
    return databaseVal;
  }

  //Updating Compressor Existing Data
  //Centrifugal Specifics
  updateCentrifugalSpecifics(centrifugalSpecifics: CentrifugalSpecifics, performancePointUpdateNeeded: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.centrifugalSpecifics = centrifugalSpecifics;
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, performancePointUpdateNeeded);
  }
  //Control Data
  updateControlData(compressorControls: CompressorControls, performancePointUpdateNeeded: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    //update controls data
    selectedCompressor.compressorControls = compressorControls;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, performancePointUpdateNeeded);
  }
  //Design Details
  updateDesignDetails(designDetails: DesignDetails, performancePointUpdateNeeded: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.designDetails = designDetails;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, performancePointUpdateNeeded);
  }

  //Inlet Conditions
  updateInletConditions(inletConditions: InletConditions, performancePointUpdateNeeded: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.inletConditions = inletConditions;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, performancePointUpdateNeeded);
  }
  //Namplate Data
  updateNameplateData(nameplateData: CompressorNameplateData, performancePointUpdateNeeded: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.nameplateData = nameplateData;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, performancePointUpdateNeeded);
  }
  //blowoff
  updateBlowoff(blowoff: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.blowoff = blowoff;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
  }
  //fullLoad
  updateFullLoad(fullLoad: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.fullLoad = fullLoad;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
  }
  //MaxFullFlow
  updateMaxFullFlow(maxFullFlow: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.maxFullFlow = maxFullFlow;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
  }
  //noLoad
  updateNoLoad(noLoad: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.noLoad = noLoad;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
  }
  //unloadPoint
  updateUnloadPoint(unloadPoint: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.unloadPoint = unloadPoint;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
  }

  //name and description
  updateNameAndDescription(name: string, description: string){
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.name = name;
    selectedCompressor.description = description;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, false, false);
  }

  updateAssessmentFromDependentCompressorItem(selectedCompressor: CompressorInventoryItem, modificationsNeedUpdate: boolean, performancePointUpdateNeeded: boolean) {
    //update performance points
    if (performancePointUpdateNeeded) {
      selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    }
    //update assessment
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    if (modificationsNeedUpdate) {
      compressedAirAssessment.modifications = this.updateModifications(selectedCompressor, compressedAirAssessment.modifications);
    };
    //update system profile ordering
    let recalculateOrdering: boolean = false;
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.compressorId == selectedCompressor.itemId) {
        if (summary.fullLoadPressure != selectedCompressor.performancePoints.fullLoad.dischargePressure) {
          summary.fullLoadPressure = selectedCompressor.performancePoints.fullLoad.dischargePressure;
          recalculateOrdering = true;
        }
      }
    });
    if (recalculateOrdering && !compressedAirAssessment.systemInformation.isSequencerUsed) {
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingNoSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType);
      })
    };
    //update assessment
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    //update selected compressor
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  updateModifications(selectedCompressor: CompressorInventoryItem, modifications: Array<Modification>): Array<Modification> {
    modifications.forEach(modification => {
      modification = this.updateModification(selectedCompressor, modification);
    });
    return modifications;
  }

  updateModification(selectedCompressor: CompressorInventoryItem, modification: Modification): Modification {
    modification = this.updateUnloadingControlsModification(selectedCompressor, modification);
    modification = this.updateReduceRuntimeModification(selectedCompressor, modification);
    return modification;
  }

  updateUnloadingControlsModification(selectedCompressor: CompressorInventoryItem, modification: Modification): Modification {
    //adjusted compressors (unloading controls)
    let adjustedCompressorIndex: number = modification.useUnloadingControls.adjustedCompressors.findIndex(adjustedCompressor => {
      return adjustedCompressor.compressorId == selectedCompressor.itemId;
    });
    let compressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(selectedCompressor));
    modification.useUnloadingControls.adjustedCompressors[adjustedCompressorIndex] = {
      selected: false,
      compressorId: compressorCopy.itemId,
      originalControlType: compressorCopy.compressorControls.controlType,
      compressorType: compressorCopy.nameplateData.compressorType,
      unloadPointCapacity: compressorCopy.compressorControls.unloadPointCapacity,
      controlType: compressorCopy.compressorControls.controlType,
      performancePoints: compressorCopy.performancePoints,
      automaticShutdown: compressorCopy.compressorControls.automaticShutdown
    }
    return modification;
  }

  updateReduceRuntimeModification(selectedCompressor: CompressorInventoryItem, modification: Modification): Modification {
    //reduce run time
    modification.reduceRuntime.runtimeData.forEach(dataItem => {
      if (dataItem.compressorId == selectedCompressor.itemId) {
        dataItem.fullLoadCapacity = selectedCompressor.performancePoints.fullLoad.airflow;
      }
    });
    return modification;
  }
}
