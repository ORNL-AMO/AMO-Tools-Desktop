import { Injectable } from '@angular/core';
import { CentrifugalSpecifics, CompressedAirAssessment, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, Modification, PerformancePoint, ProfileSummaryData } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { GenericCompressor } from './generic-compressor-db.service';
import { InventoryService } from './baseline-tab-content/inventory-setup/inventory/inventory.service';
import { SystemProfileService } from './baseline-tab-content/baseline-system-profile-setup/system-profile.service';
import { CompressorInventoryItemClass } from './calculations/CompressorInventoryItemClass';
import { roundVal } from '../shared/helperFunctions';
import { getEmptyProfileSummaryData } from './calculations/caCalculationHelpers';

@Injectable()
export class CompressedAirDataManagementService {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService,
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
    selectedCompressor.designDetails.inputPressure = genericCompressor.DesignInPressure;
    selectedCompressor.nameplateData.fullLoadOperatingPressure = genericCompressor.RatedPressure;
    selectedCompressor.nameplateData.fullLoadRatedCapacity = genericCompressor.RatedCapacity;

    selectedCompressor.centrifugalSpecifics.minFullLoadPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MinStonewallPressure);
    selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = this.overrideGenericDbValueForDisplay(genericCompressor.MinPressStonewallFlow);
    selectedCompressor.centrifugalSpecifics.surgeAirflow = this.overrideGenericDbValueForDisplay(genericCompressor.DesignSurgeFlow);
    selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = this.overrideGenericDbValueForDisplay(genericCompressor.MaxSurgePressure);
    selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = this.overrideGenericDbValueForDisplay(genericCompressor.MaxPressSurgeFlow);
    selectedCompressor.designDetails.designEfficiency = roundVal(genericCompressor.EffFL, 1);
    selectedCompressor.nameplateData.fullLoadAmps = genericCompressor.AmpsFL;

    selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow = true;
    selectedCompressor.performancePoints.fullLoad.isDefaultPower = true;
    selectedCompressor.performancePoints.fullLoad.isDefaultPressure = true;

    selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow = true;
    selectedCompressor.performancePoints.maxFullFlow.isDefaultPower = true;
    selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure = true;


    selectedCompressor.performancePoints.midTurndown = {
      isDefaultAirFlow: true,
      airflow: undefined,
      isDefaultPower: true,
      power: undefined,
      isDefaultPressure: true,
      dischargePressure: undefined,
    }

    selectedCompressor.performancePoints.turndown = {
      isDefaultAirFlow: true,
      airflow: undefined,
      isDefaultPower: true,
      power: undefined,
      isDefaultPressure: true,
      dischargePressure: undefined,
    }

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
  updateControlData(compressorControls: CompressorControls, performancePointUpdateNeeded: boolean, isControlTypeChange?: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.compressorControls = compressorControls;
    if (isControlTypeChange && selectedCompressor.compressorControls.controlType == 11) {
      selectedCompressor.designDetails.noLoadPowerUL = 5;
    }
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
  updateMidturndown(midTurndown: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.midTurndown = midTurndown;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
  }
  updateTurndown(turndown: PerformancePoint) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.turndown = turndown;
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
  updateNameAndDescription(name: string, description: string) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.name = name;
    selectedCompressor.description = description;
    //save updated compressor
    this.updateAssessmentFromDependentCompressorItem(selectedCompressor, false, false);
  }

  updateAssessmentFromDependentCompressorItem(selectedCompressor: CompressorInventoryItem, modificationsNeedUpdate: boolean, performancePointUpdateNeeded: boolean) {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorInventoryItemClass: CompressorInventoryItemClass = new CompressorInventoryItemClass(selectedCompressor);
    //update performance points
    if (performancePointUpdateNeeded) {
      let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
      compressorInventoryItemClass.updatePerformancePoints(compressedAirAssessment.systemInformation.atmosphericPressure, settings);

    }
    //update assessment
    if (compressorInventoryItemClass.isReplacementCompressor) {
      let compressorIndex: number = compressedAirAssessment.replacementCompressorInventoryItems.findIndex(item => { return item.itemId == compressorInventoryItemClass.itemId });
      compressedAirAssessment.replacementCompressorInventoryItems[compressorIndex] = compressorInventoryItemClass.toModel();
    } else {
      let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == compressorInventoryItemClass.itemId });
      compressedAirAssessment.compressorInventoryItems[compressorIndex] = compressorInventoryItemClass.toModel();
    }
    if (modificationsNeedUpdate) {
      compressedAirAssessment.modifications = this.updateModifications(compressorInventoryItemClass, compressedAirAssessment.modifications);
    };
    //update system profile ordering
    let recalculateOrdering: boolean = false;
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.compressorId == compressorInventoryItemClass.itemId) {
        if (summary.fullLoadPressure != compressorInventoryItemClass.performancePoints.fullLoad.dischargePressure) {
          summary.fullLoadPressure = compressorInventoryItemClass.performancePoints.fullLoad.dischargePressure;
          recalculateOrdering = true;
        }
      }
    });
    //TODO: Recalculate other control types??
    //issue 6969 updated to include baseTrim
    if (recalculateOrdering && (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'cascading' || compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'baseTrim')) {
      let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingCascading(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
      })
    } else if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'isentropicEfficiency') {
      let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
      let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingIsentropicEfficiency(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals, compressedAirAssessment.compressorInventoryItems, settings, compressedAirAssessment.systemInformation);
      })
    }

    //update assessment
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
    //update selected compressor
    this.inventoryService.setSelectedCompressor(compressorInventoryItemClass);
  }

  updateModifications(selectedCompressor: CompressorInventoryItem, modifications: Array<Modification>): Array<Modification> {
    modifications.forEach(modification => {
      modification = this.updateModification(selectedCompressor, modification);
    });
    return modifications;
  }

  updateModification(selectedCompressor: CompressorInventoryItem, modification: Modification): Modification {
    //reduce runtime
    modification = this.updateReduceRuntimeModification(selectedCompressor, modification);
    //cascading set points
    modification = this.updateCascadingSetPointsModification(selectedCompressor, modification);
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

  updateCascadingSetPointsModification(selectedCompressor: CompressorInventoryItem, modification: Modification): Modification {
    //cascading set points
    modification.adjustCascadingSetPoints.setPointData.forEach(dataItem => {
      if (dataItem.compressorId == selectedCompressor.itemId) {
        dataItem.maxFullFlowDischargePressure = selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
        dataItem.controlType = selectedCompressor.compressorControls.controlType;
        dataItem.compressorType = selectedCompressor.nameplateData.compressorType;
      }
    });
    return modification;
  }

  updateReplacementCompressors(modification: Modification, compressedAirAssessment: CompressedAirAssessment): Modification {
    if (modification.replaceCompressor.order != 100) {
      let replacementCompressorIds: Array<string> = new Array();
      let nonAddedReplacementCompressorIds: Array<string> = new Array();
      let salvagedCompressorIds: Array<string> = new Array();
      let nonSalvagedCompressorIds: Array<string> = new Array();
      //get salvaged compressors
      modification.replaceCompressor.currentCompressorMapping.forEach(replacementData => {
        if (replacementData.isReplaced) {
          salvagedCompressorIds.push(replacementData.originalCompressorId);
        } else {
          nonSalvagedCompressorIds.push(replacementData.originalCompressorId);
        }
      });
      //get added replacement compressors
      modification.replaceCompressor.replacementCompressorMapping.forEach(replacementData => {
        if (replacementData.isAdded) {
          replacementCompressorIds.push(replacementData.replacementCompressorId);
        } else {
          nonAddedReplacementCompressorIds.push(replacementData.replacementCompressorId);
        }
      });
      //Reduce runtime is after replace compressor
      if (modification.reduceRuntime.order != 100 && (modification.replaceCompressor.order < modification.reduceRuntime.order)) {
        modification = this.updateReduceRuntimeWithReplacementCompressors(modification, compressedAirAssessment.replacementCompressorInventoryItems, compressedAirAssessment.compressorInventoryItems, salvagedCompressorIds, nonSalvagedCompressorIds, replacementCompressorIds, nonAddedReplacementCompressorIds, compressedAirAssessment);
      } else {
        //resetu reduce runtime with baseline
        modification = this.resetReduceRuntimeToBaseline(modification, compressedAirAssessment.compressorInventoryItems);
      }

      //Adjust cascading is after replace compressor
      if (modification.adjustCascadingSetPoints.order != 100 && (modification.replaceCompressor.order < modification.adjustCascadingSetPoints.order)) {
        modification = this.updateSetPointDataWithReplacementCompressors(modification, compressedAirAssessment.replacementCompressorInventoryItems, compressedAirAssessment.compressorInventoryItems, salvagedCompressorIds, nonSalvagedCompressorIds, replacementCompressorIds, nonAddedReplacementCompressorIds);
      } else {
        //reset set point data with baseline
        modification = this.resetCascadingSetPointsToBaseline(modification, compressedAirAssessment.compressorInventoryItems);
      }
    }
    if (modification.replaceCompressor.order == 100) {
      //reset both reduce runtime and cascading set points with baseline
      modification = this.resetReduceRuntimeToBaseline(modification, compressedAirAssessment.compressorInventoryItems);
      modification = this.resetCascadingSetPointsToBaseline(modification, compressedAirAssessment.compressorInventoryItems);
    }
    return modification;
  }

  updateReduceRuntimeWithReplacementCompressors(modification: Modification,
    replacementCompressorInventoryItems: Array<CompressorInventoryItem>,
    currentCompressorInventoryItems: Array<CompressorInventoryItem>,
    salvagedCompressorIds: Array<string>, nonSalvagedCompressorIds: Array<string>,
    replacementCompressorIds: Array<string>,
    nonAddedReplacementCompressorIds: Array<string>,
    compressedAirAssessment: CompressedAirAssessment): Modification {
    //remove salvaged compressors from replacement list
    modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(dataItem => {
      if (salvagedCompressorIds.includes(dataItem.compressorId)) {
        return false;
      } else {
        return true;
      }
    });
    //add non-salvaged compressors back to reduce runtime if removed earlier
    nonSalvagedCompressorIds.forEach(nonSalvagedCompressorId => {
      //check missing in data
      if (!modification.reduceRuntime.runtimeData.find(dataItem => { return dataItem.compressorId == nonSalvagedCompressorId })) {
        let nonSalvagedCompressor: CompressorInventoryItem = currentCompressorInventoryItems.find(item => { return item.itemId == nonSalvagedCompressorId });
        if (nonSalvagedCompressor) {
          //TODO: day type and inverval data need to be handled properly
          let intervalData: Array<ProfileSummaryData> = getEmptyProfileSummaryData(compressedAirAssessment.systemProfile.systemProfileSetup);
          compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
            modification.reduceRuntime.runtimeData.push({
              compressorId: nonSalvagedCompressor.itemId,
              fullLoadCapacity: nonSalvagedCompressor.performancePoints.fullLoad.airflow,
              intervalData: intervalData.map(data => { return { timeInterval: data.timeInterval, isCompressorOn: true } }),
              dayTypeId: dayType.dayTypeId,
              automaticShutdownTimer: nonSalvagedCompressor.compressorControls.automaticShutdown
            });
          });
        }
      }
    });
    //add new replacement compressors to replacement list
    replacementCompressorIds.forEach(replacementCompressorId => {
      //check missing in data
      if (!modification.reduceRuntime.runtimeData.find(dataItem => { return dataItem.compressorId == replacementCompressorId })) {
        let replacementCompressor: CompressorInventoryItem = replacementCompressorInventoryItems.find(item => { return item.itemId == replacementCompressorId });
        if (replacementCompressor) {
          let intervalData: Array<ProfileSummaryData> = getEmptyProfileSummaryData(compressedAirAssessment.systemProfile.systemProfileSetup);
          compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
            modification.reduceRuntime.runtimeData.push({
              compressorId: replacementCompressor.itemId,
              fullLoadCapacity: replacementCompressor.performancePoints.fullLoad.airflow,
              intervalData: intervalData.map(data => { return { timeInterval: data.timeInterval, isCompressorOn: true } }),
              dayTypeId: dayType.dayTypeId,
              automaticShutdownTimer: replacementCompressor.compressorControls.automaticShutdown
            });
          });
        }
      }
    });
    //remove replacement compressors that are no longer added
    nonAddedReplacementCompressorIds.forEach(nonAddedReplacementCompressorId => {
      modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(dataItem => {
        if (dataItem.compressorId == nonAddedReplacementCompressorId) {
          return false;
        } else {
          return true;
        }
      });
    });
    return modification;
  }

  updateSetPointDataWithReplacementCompressors(modification: Modification,
    replacementCompressorInventoryItems: Array<CompressorInventoryItem>,
    currentCompressorInventoryItems: Array<CompressorInventoryItem>,
    salvagedCompressorIds: Array<string>, nonSalvagedCompressorIds: Array<string>,
    replacementCompressorIds: Array<string>,
    nonAddedReplacementCompressorIds: Array<string>): Modification {
    //remove salvaged compressors from replacement list and replacement compressors no longer in list
    modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(dataItem => {
      if (salvagedCompressorIds.includes(dataItem.compressorId)) {
        return false;
      } else {
        return true;
      }
    });
    //add non-salvaged compressors back to reduce runtime if removed earlier
    nonSalvagedCompressorIds.forEach(nonSalvagedCompressorId => {
      //check missing in data
      if (!modification.adjustCascadingSetPoints.setPointData.find(dataItem => { return dataItem.compressorId == nonSalvagedCompressorId })) {
        let nonSalvagedCompressor: CompressorInventoryItem = currentCompressorInventoryItems.find(item => { return item.itemId == nonSalvagedCompressorId });
        if (nonSalvagedCompressor) {
          modification.adjustCascadingSetPoints.setPointData.push({
            compressorId: nonSalvagedCompressor.itemId,
            controlType: nonSalvagedCompressor.compressorControls.controlType,
            compressorType: nonSalvagedCompressor.nameplateData.compressorType,
            fullLoadDischargePressure: nonSalvagedCompressor.performancePoints.fullLoad.dischargePressure,
            maxFullFlowDischargePressure: nonSalvagedCompressor.performancePoints.maxFullFlow.dischargePressure
          });
        }
      }
    });
    //add new replacement compressors to replacement list
    replacementCompressorIds.forEach(replacementCompressorId => {
      //check missing in data
      if (!modification.adjustCascadingSetPoints.setPointData.find(dataItem => { return dataItem.compressorId == replacementCompressorId })) {
        let replacementCompressor: CompressorInventoryItem = replacementCompressorInventoryItems.find(item => { return item.itemId == replacementCompressorId });
        if (replacementCompressor) {
          modification.adjustCascadingSetPoints.setPointData.push({
            compressorId: replacementCompressor.itemId,
            controlType: replacementCompressor.compressorControls.controlType,
            compressorType: replacementCompressor.nameplateData.compressorType,
            fullLoadDischargePressure: replacementCompressor.performancePoints.fullLoad.dischargePressure,
            maxFullFlowDischargePressure: replacementCompressor.performancePoints.maxFullFlow.dischargePressure
          });
        }
      }
    });
    //remove replacement compressors that are no longer added
    nonAddedReplacementCompressorIds.forEach(nonAddedReplacementCompressorId => {
      modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(dataItem => {
        if (dataItem.compressorId == nonAddedReplacementCompressorId) {
          return false;
        } else {
          return true;
        }
      });
    });
    return modification;
  }

  resetReduceRuntimeToBaseline(modification: Modification, currentCompressorInventoryItems: Array<CompressorInventoryItem>): Modification {
    //baseline compressors
    let baselineCompressorIds: Array<string> = currentCompressorInventoryItems.map(item => { return item.itemId });
    //remove replaced compressors
    modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(dataItem => {
      if (baselineCompressorIds.includes(dataItem.compressorId)) {
        return true;
      } else {
        return false;
      }
    });
    //add back missing compressors
    baselineCompressorIds.forEach(baselineCompressorId => {
      if (!modification.reduceRuntime.runtimeData.find(dataItem => { return dataItem.compressorId == baselineCompressorId })) {
        let baselineCompressor: CompressorInventoryItem = currentCompressorInventoryItems.find(item => { return item.itemId == baselineCompressorId });
        if (baselineCompressor) {
          //TODO: day type and inverval data need to be handled properly
          modification.reduceRuntime.runtimeData.push({
            compressorId: baselineCompressor.itemId,
            fullLoadCapacity: baselineCompressor.performancePoints.fullLoad.airflow,
            intervalData: new Array(),
            dayTypeId: '',
            automaticShutdownTimer: baselineCompressor.compressorControls.automaticShutdown
          });
        }
      }
    });
    return modification;
  }

  resetCascadingSetPointsToBaseline(modification: Modification, currentCompressorInventoryItems: Array<CompressorInventoryItem>): Modification {
    //baseline compressors
    let baselineCompressorIds: Array<string> = currentCompressorInventoryItems.map(item => { return item.itemId });
    //remove replaced compressors
    modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(dataItem => {
      if (baselineCompressorIds.includes(dataItem.compressorId)) {
        return true;
      } else {
        return false;
      }
    });
    //add back missing compressors
    baselineCompressorIds.forEach(baselineCompressorId => {
      if (!modification.adjustCascadingSetPoints.setPointData.find(dataItem => { return dataItem.compressorId == baselineCompressorId })) {
        let baselineCompressor: CompressorInventoryItem = currentCompressorInventoryItems.find(item => { return item.itemId == baselineCompressorId });
        if (baselineCompressor) {
          modification.adjustCascadingSetPoints.setPointData.push({
            compressorId: baselineCompressor.itemId,
            controlType: baselineCompressor.compressorControls.controlType,
            compressorType: baselineCompressor.nameplateData.compressorType,
            fullLoadDischargePressure: baselineCompressor.performancePoints.fullLoad.dischargePressure,
            maxFullFlowDischargePressure: baselineCompressor.performancePoints.maxFullFlow.dischargePressure
          });
        }
      }
    });
    return modification;
  }
}
