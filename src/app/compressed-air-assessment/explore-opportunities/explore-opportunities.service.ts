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


  setOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number): Modification {
    if (newOrder != 100) {
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceRuntime.order,
        modification.reduceAirLeaks.order,
        modification.reduceSystemAirPressure.order,
        modification.useAutomaticSequencer.order,
        modification.useUnloadingControls.order,
      ]
      let selectedOrder: Array<number> = allOrders.filter(order => {return order == newOrder});
      let hasDuplicate: boolean = selectedOrder.length == 2;

      if (modification.addPrimaryReceiverVolume.order != 100 && changedOpportunity != 'addPrimaryReceiverVolume' && modification.addPrimaryReceiverVolume.order >= newOrder) {
        if(hasDuplicate && modification.addPrimaryReceiverVolume.order == newOrder && previousOrder != 100){
          modification.addPrimaryReceiverVolume.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.addPrimaryReceiverVolume.order++;
        }
      }
      if (modification.adjustCascadingSetPoints.order != 100 && changedOpportunity != 'adjustCascadingSetPoints' && modification.adjustCascadingSetPoints.order >= newOrder) {
        if(hasDuplicate && modification.adjustCascadingSetPoints.order == newOrder && previousOrder != 100){
          modification.adjustCascadingSetPoints.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.adjustCascadingSetPoints.order++;
        }
      }
      if (modification.improveEndUseEfficiency.order != 100 && changedOpportunity != 'improveEndUseEfficiency' && modification.improveEndUseEfficiency.order >= newOrder) {
        if(hasDuplicate && modification.improveEndUseEfficiency.order == newOrder && previousOrder != 100){
          modification.improveEndUseEfficiency.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.improveEndUseEfficiency.order++;
        }
      }
      if (modification.reduceRuntime.order != 100 && changedOpportunity != 'reduceRuntime' && modification.reduceRuntime.order >= newOrder) {
        if(hasDuplicate && modification.reduceRuntime.order == newOrder && previousOrder != 100){
          modification.reduceRuntime.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.reduceRuntime.order++;
        }
      }
      if (modification.reduceAirLeaks.order != 100 && changedOpportunity != 'reduceAirLeaks' && modification.reduceAirLeaks.order >= newOrder) {
        if(hasDuplicate && modification.reduceAirLeaks.order == newOrder && previousOrder != 100){
          modification.reduceAirLeaks.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.reduceAirLeaks.order++;
        }
      }
      if (modification.reduceSystemAirPressure.order != 100 && changedOpportunity != 'reduceSystemAirPressure' && modification.reduceSystemAirPressure.order >= newOrder) {
        if(hasDuplicate && modification.reduceSystemAirPressure.order == newOrder && previousOrder != 100){
          modification.reduceSystemAirPressure.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.reduceSystemAirPressure.order++;
        }
      }
      if (modification.useAutomaticSequencer.order != 100 && changedOpportunity != 'useAutomaticSequencer' && modification.useAutomaticSequencer.order >= newOrder) {
        if(hasDuplicate && modification.useAutomaticSequencer.order == newOrder && previousOrder != 100){
          modification.useAutomaticSequencer.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.useAutomaticSequencer.order++;
        }
      }
      if (modification.useUnloadingControls.order != 100 && changedOpportunity != 'useUnloadingControls' && modification.useUnloadingControls.order >= newOrder) {
        if(hasDuplicate && modification.useUnloadingControls.order == newOrder && previousOrder != 100){
          modification.useUnloadingControls.order = previousOrder;
        }else if(!hasDuplicate || previousOrder == 100){
          modification.useUnloadingControls.order++;
        }
      }
    }else{
      if (modification.addPrimaryReceiverVolume.order != 100 && changedOpportunity != 'addPrimaryReceiverVolume' && modification.addPrimaryReceiverVolume.order > previousOrder) {
        modification.addPrimaryReceiverVolume.order--;
      }
      if (modification.adjustCascadingSetPoints.order != 100 && changedOpportunity != 'adjustCascadingSetPoints' && modification.adjustCascadingSetPoints.order > previousOrder) {
        modification.adjustCascadingSetPoints.order--;
      }
      if (modification.improveEndUseEfficiency.order != 100 && changedOpportunity != 'improveEndUseEfficiency' && modification.improveEndUseEfficiency.order > previousOrder) {
        modification.improveEndUseEfficiency.order--;
      }
      if (modification.reduceRuntime.order != 100 && changedOpportunity != 'reduceRuntime' && modification.reduceRuntime.order > previousOrder) {
        modification.reduceRuntime.order--;
      }
      if (modification.reduceAirLeaks.order != 100 && changedOpportunity != 'reduceAirLeaks' && modification.reduceAirLeaks.order > previousOrder) {
        modification.reduceAirLeaks.order--;
      }
      if (modification.reduceSystemAirPressure.order != 100 && changedOpportunity != 'reduceSystemAirPressure' && modification.reduceSystemAirPressure.order > previousOrder) {
        modification.reduceSystemAirPressure.order--;
      }
      if (modification.useAutomaticSequencer.order != 100 && changedOpportunity != 'useAutomaticSequencer' && modification.useAutomaticSequencer.order > previousOrder) {
        modification.useAutomaticSequencer.order--;
      }
      if (modification.useUnloadingControls.order != 100 && changedOpportunity != 'useUnloadingControls' && modification.useUnloadingControls.order > previousOrder) {
        modification.useUnloadingControls.order--;
      }
    }
    return modification;
  }
}
