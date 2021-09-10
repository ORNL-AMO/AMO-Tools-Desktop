import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ReduceRuntimeData } from '../../shared/models/compressed-air-assessment';
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

    return {
      name: 'Modification',
      modificationId: Math.random().toString(36).substr(2, 9),
      // flowReallocation: {
      //   selected: false
      // },
      reduceAirLeaks: {
        leakReduction: undefined,
        leakFlow: undefined,
        order: 100
      },
      improveEndUseEfficiency: {
        reductionType: "Fixed",
        airflowReduction: undefined,
        reductionData: reductionData,
        order: 100
      },
      reduceSystemAirPressure: {
        averageSystemPressureReduction: undefined,
        order: 100
      },
      adjustCascadingSetPoints: {
        order: 100
      },
      useAutomaticSequencer: {
        targetPressure: undefined,
        variance: undefined,
        order: 100
      },
      reduceRuntime: {
        runtimeData: reduceRuntimeData,
        order: 100
      },
      addPrimaryReceiverVolume: {
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
        modification.useAutomaticSequencer.order
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
    }
    return modification;
  }
}
