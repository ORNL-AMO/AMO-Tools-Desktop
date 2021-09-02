import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ReduceRuntimeData } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Injectable()
export class ExploreOpportunitiesService {

  selectedDayType: BehaviorSubject<CompressedAirDayType>;
  modificationResults: BehaviorSubject<CompressedAirAssessmentResult>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { 
    this.selectedDayType = new BehaviorSubject<CompressedAirDayType>(undefined);
    this.modificationResults = new BehaviorSubject<CompressedAirAssessmentResult>(undefined);
  }

  getNewModification(): Modification {
    let reductionData: Array<{
      dayTypeId: string,
      dayTypeName: string,
      data: Array<{
        hourInterval: number,
        applyReduction: boolean
        reductionAmount: number
      }>
    }> = new Array();

    let reduceRuntimeData: Array<ReduceRuntimeData> = new Array();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      reductionData.push({
        dayTypeId: dayType.dayTypeId,
        dayTypeName: dayType.name,
        data: this.getDefaultReductionData()
      });
      compressedAirAssessment.compressorInventoryItems.forEach(item => {
        let itemProfile: ProfileSummary = compressedAirAssessment.systemProfile.profileSummary.find(summary => {
          return summary.dayTypeId == dayType.dayTypeId && item.itemId == summary.compressorId;
        })
        let intervalData: Array<{
          isCompressorOn: boolean,
          timeInterval: number,
        }> = new Array();
        itemProfile.profileSummaryData.forEach(dataItem => {
          intervalData.push({
            isCompressorOn: dataItem.order != 0,
            timeInterval: dataItem.timeInterval
          })
        });
        reduceRuntimeData.push({
          compressorId: item.itemId,
          fullLoadCapacity: item.performancePoints.fullLoad.airflow,
          intervalData: intervalData,
          dayTypeId: dayType.dayTypeId
        })
      });

    });

    let adjustedCompressors: Array<AdjustedUnloadingCompressor> = new Array();
    compressedAirAssessment.compressorInventoryItems.forEach(item => {
      let compressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(item));
      adjustedCompressors.push({
        selected: false,
        compressorId: compressorCopy.itemId,
        unloadPointCapacity: compressorCopy.compressorControls.unloadPointCapacity,
        controlType: compressorCopy.compressorControls.controlType,
        performancePoints: compressorCopy.performancePoints,
        originalControlType: compressorCopy.compressorControls.controlType,
        compressorType: compressorCopy.nameplateData.compressorType,
        automaticShutdown: compressorCopy.compressorControls.automaticShutdown
      })
    })

    return {
      name: 'Modification',
      modificationId: Math.random().toString(36).substr(2, 9),
      flowReallocation: {
        selected: false
      },
      reduceAirLeaks: {
        selected: false,
        leakReduction: undefined,
        leakFlow: undefined,
        order: 100
      },
      improveEndUseEfficiency: {
        selected: false,
        reductionType: "Fixed",
        airflowReduction: undefined,
        reductionData: reductionData,
        order: 100
      },
      reduceSystemAirPressure: {
        selected: false,
        averageSystemPressureReduction: undefined,
        order: 100
      },
      useUnloadingControls: {
        selected: false,
        adjustedCompressors: adjustedCompressors,
        order: 100
      },
      adjustCascadingSetPoints: {
        selected: false,
        order: 100
      },
      useAutomaticSequencer: {
        selected: false,
        targetPressure: undefined,
        variance: undefined,
        order: 100
      },
      reduceRuntime: {
        selected: false,
        runtimeData: reduceRuntimeData,
        order: 100
      },
      addPrimaryReceiverVolume: {
        selected: false,
        increasedVolume: 0,
        order: 100
      }
    }
  }

  saveModification(modification: Modification) {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let modIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId = modification.modificationId });
    compressedAirAssessment.modifications[modIndex] = modification;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }


  getDefaultReductionData(): Array<{ hourInterval: number, applyReduction: boolean, reductionAmount: number }> {
    let reductionData: Array<{ hourInterval: number, applyReduction: boolean, reductionAmount: number }> = new Array();
    for (let i = 0; i < 24; i++) {
      reductionData.push({
        hourInterval: i,
        applyReduction: false,
        reductionAmount: undefined
      });
    }
    return reductionData;
  }
}
