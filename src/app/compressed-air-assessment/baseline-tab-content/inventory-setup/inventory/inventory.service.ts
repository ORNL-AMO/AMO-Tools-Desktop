import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ReduceRuntimeData, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { FilterCompressorOptions } from './generic-compressor-modal/filter-compressors.pipe';
import { CompressorInventoryItemClass } from '../../../calculations/CompressorInventoryItemClass';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { ExploreOpportunitiesService } from '../../../assessment-tab-content/explore-opportunities/explore-opportunities.service';
import { getEmptyProfileSummaryData } from '../../../calculations/caCalculationHelpers';
import { getRandomFlatColor } from '../../../../shared/helperFunctions';

@Injectable()
export class InventoryService {

  selectedCompressor: BehaviorSubject<CompressorInventoryItemClass>;
  defaultCompressor: BehaviorSubject<CompressorInventoryItemClass>
  filterCompressorOptions: BehaviorSubject<FilterCompressorOptions>;
  tabSelect: BehaviorSubject<'inventory' | 'replacementInventory' | 'help'>;
  collapseControls: boolean = false;
  collapseDesignDetails: boolean = true;
  collapsePerformancePoints: boolean = true;
  collapseCentrifugal: boolean = true;
  constructor(
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirAssessmentService: CompressedAirAssessmentService) {
    this.selectedCompressor = new BehaviorSubject<CompressorInventoryItemClass>(undefined);
    this.defaultCompressor = new BehaviorSubject<CompressorInventoryItemClass>(undefined);
    this.filterCompressorOptions = new BehaviorSubject<FilterCompressorOptions>(undefined);
    this.tabSelect = new BehaviorSubject<'inventory' | 'replacementInventory' | 'help'>('inventory');
  }

  setSelectedCompressor(compressor: CompressorInventoryItem) {
    if (compressor) {
      let compressorInventoryItemClass: CompressorInventoryItemClass = new CompressorInventoryItemClass(compressor);
      this.selectedCompressor.next(compressorInventoryItemClass);
      let defaultCompressor: CompressorInventoryItemClass = new CompressorInventoryItemClass(_.cloneDeep(compressor));
      let caAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
      defaultCompressor.performancePoints.setDefaultsOn();
      defaultCompressor.updatePerformancePoints(caAssessment.systemInformation.atmosphericPressure, settings);
      this.defaultCompressor.next(defaultCompressor);
    } else {
      this.selectedCompressor.next(undefined);
      this.defaultCompressor.next(undefined);
    }
  }

  getNewInventoryItem(): CompressorInventoryItem {
    return {
      itemId: Math.random().toString(36).substr(2, 9),
      name: 'New Compressor',
      description: undefined,
      modifiedDate: new Date(),
      color: getRandomFlatColor(),
      nameplateData: {
        compressorType: undefined,
        motorPower: undefined,
        fullLoadOperatingPressure: undefined,
        fullLoadRatedCapacity: undefined,
        ratedLoadPower: undefined,
        ploytropicCompressorExponent: 1.4,
        fullLoadAmps: undefined,
        totalPackageInputPower: undefined
      },
      compressorControls: {
        controlType: undefined,
        unloadPointCapacity: 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: false,
        unloadSumpPressure: 15
      },
      designDetails: {
        blowdownTime: 40,
        modulatingPressureRange: undefined,
        inputPressure: undefined,
        designEfficiency: undefined,
        serviceFactor: 1.15,
        noLoadPowerFM: undefined,
        noLoadPowerUL: undefined,
        maxFullFlowPressure: undefined
      },
      centrifugalSpecifics: {
        surgeAirflow: undefined,
        maxFullLoadPressure: undefined,
        maxFullLoadCapacity: undefined,
        minFullLoadPressure: undefined,
        minFullLoadCapacity: undefined
      },
      performancePoints: {
        fullLoad: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        maxFullFlow: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        midTurndown: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        turndown: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        unloadPoint: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        noLoad: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        blowoff: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        }
      }
    }
  }

  addNewCompressor(compressedAirAssessment: CompressedAirAssessment, newInventoryItem?: CompressorInventoryItem): { newInventoryItem: CompressorInventoryItem, compressedAirAssessment: CompressedAirAssessment } {
    console.log('adding new compressor');
    let inventoryTab: 'inventory' | 'replacementInventory' | 'help' = this.tabSelect.getValue();
    if (!newInventoryItem) {
      newInventoryItem = this.getNewInventoryItem();
    }

    newInventoryItem.modifiedDate = new Date();
    if (inventoryTab != 'replacementInventory') {
      compressedAirAssessment.compressorInventoryItems.push(newInventoryItem);
      let intervalData: Array<{ isCompressorOn: boolean, timeInterval: number }> = new Array();
      for (let i = 0; i < 24;) {
        intervalData.push({
          isCompressorOn: false,
          timeInterval: i
        })
        i = i + compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval
      }
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary.push({
          compressorId: newInventoryItem.itemId,
          dayTypeId: dayType.dayTypeId,
          profileSummaryData: getEmptyProfileSummaryData(compressedAirAssessment.systemProfile.systemProfileSetup),
          fullLoadPressure: newInventoryItem.performancePoints.fullLoad.dischargePressure,
          fullLoadCapacity: newInventoryItem.performancePoints.fullLoad.airflow
        });
        compressedAirAssessment.modifications.forEach(modification => {
          modification.reduceRuntime.runtimeData.push({
            compressorId: newInventoryItem.itemId,
            dayTypeId: dayType.dayTypeId,
            fullLoadCapacity: newInventoryItem.performancePoints.fullLoad.airflow,
            intervalData: intervalData,
            automaticShutdownTimer: newInventoryItem.compressorControls.automaticShutdown
          });
          modification.useAutomaticSequencer.order = 100;
          modification.useAutomaticSequencer.profileSummary = new Array();
        })
      });

      compressedAirAssessment.modifications.forEach(modification => {
        modification.adjustCascadingSetPoints.setPointData.push({
          compressorId: newInventoryItem.itemId,
          controlType: newInventoryItem.compressorControls.controlType,
          compressorType: newInventoryItem.nameplateData.compressorType,
          fullLoadDischargePressure: newInventoryItem.performancePoints.fullLoad.dischargePressure,
          maxFullFlowDischargePressure: newInventoryItem.performancePoints.maxFullFlow.dischargePressure
        });
        modification.replaceCompressor.currentCompressorMapping.push({
          originalCompressorId: newInventoryItem.itemId,
          isReplaced: false
        });
      });
      return {
        newInventoryItem: newInventoryItem,
        compressedAirAssessment: compressedAirAssessment
      }
    } else {
      return this.addReplacementCompressor(compressedAirAssessment, newInventoryItem);
    }
  }

  addReplacementCompressor(compressedAirAssessment: CompressedAirAssessment, newInventoryItem?: CompressorInventoryItem): { newInventoryItem: CompressorInventoryItem, compressedAirAssessment: CompressedAirAssessment } {
    console.log('adding replacement compressor');
    if (!newInventoryItem) {
      newInventoryItem = this.getNewInventoryItem();
    }
    newInventoryItem.isReplacementCompressor = true;
    newInventoryItem.name = 'Replacement Compressor';
    newInventoryItem.modifiedDate = new Date();
    compressedAirAssessment.replacementCompressorInventoryItems.push(newInventoryItem);
    compressedAirAssessment.modifications.forEach(modification => {
      modification.replaceCompressor.replacementCompressorMapping.push({
        replacementCompressorId: newInventoryItem.itemId,
        isAdded: false
      });
    });
    return {
      newInventoryItem: newInventoryItem,
      compressedAirAssessment: compressedAirAssessment
    }
  }

  addNewDayType(compressedAirAssessment: CompressedAirAssessment, dayTypeName: string, dayTypeId?: string): CompressedAirAssessment {
    if (!dayTypeId) {
      dayTypeId = Math.random().toString(36).substr(2, 9);
    }
    let newDayType: CompressedAirDayType = {
      dayTypeId: dayTypeId,
      name: dayTypeName,
      numberOfDays: 0,
      profileDataType: "percentCapacity"
    };
    compressedAirAssessment.compressedAirDayTypes.push(newDayType);
    let reduceRuntimeData: ReduceRuntimeData;
    compressedAirAssessment.compressorInventoryItems.forEach(item => {
      let profileSummary: ProfileSummary = {
        compressorId: item.itemId,
        dayTypeId: newDayType.dayTypeId,
        profileSummaryData: getEmptyProfileSummaryData(compressedAirAssessment.systemProfile.systemProfileSetup),
        fullLoadPressure: item.performancePoints.fullLoad.dischargePressure,
        fullLoadCapacity: item.performancePoints.fullLoad.airflow
      }

      compressedAirAssessment.systemProfile.profileSummary.push(profileSummary);

      let intervalData: Array<{
        isCompressorOn: boolean,
        timeInterval: number,
      }> = new Array();
      profileSummary.profileSummaryData.forEach(dataItem => {
        intervalData.push({
          isCompressorOn: dataItem.order != 0,
          timeInterval: dataItem.timeInterval
        })
      });
      reduceRuntimeData = {
        compressorId: item.itemId,
        fullLoadCapacity: item.performancePoints.fullLoad.airflow,
        intervalData: intervalData,
        dayTypeId: newDayType.dayTypeId,
        automaticShutdownTimer: item.compressorControls.automaticShutdown
      };
    });
    compressedAirAssessment.modifications.forEach(modification => {
      modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        item.reductionData.push({
          dayTypeName: dayTypeName,
          dayTypeId: dayTypeId,
          data: this.exploreOpportunitiesService.getDefaultReductionData(compressedAirAssessment.systemProfile.systemProfileSetup)
        });
      });
      modification.reduceRuntime.runtimeData.push(reduceRuntimeData);
      modification.useAutomaticSequencer.order = 100;
      modification.useAutomaticSequencer.profileSummary = new Array();
    });
    compressedAirAssessment.systemInformation.trimSelections.push({
      dayTypeId: dayTypeId,
      compressorId: undefined
    });
    return compressedAirAssessment;
  }
}

export interface CompressorInventoryItemWarnings {
  serviceFactor?: string;
}

