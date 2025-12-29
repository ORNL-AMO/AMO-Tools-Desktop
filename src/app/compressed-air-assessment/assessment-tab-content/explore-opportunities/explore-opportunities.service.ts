import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CascadingSetPointData, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ReduceRuntimeData, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { CompressorInventoryItemClass } from '../../calculations/CompressorInventoryItemClass';

@Injectable()
export class ExploreOpportunitiesService {

  selectedDayType: BehaviorSubject<CompressedAirDayType>;
  constructor() {
    this.selectedDayType = new BehaviorSubject<CompressedAirDayType>(undefined);
  }

  getNewModification(compressedAirAssessment: CompressedAirAssessment): Modification {
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
    let setPointData: Array<CascadingSetPointData> = new Array();
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      setPointData = new Array();
      reductionData.push({
        dayTypeId: dayType.dayTypeId,
        dayTypeName: dayType.name,
        data: this.getDefaultReductionData(compressedAirAssessment.systemProfile.systemProfileSetup)
      });

      compressedAirAssessment.compressorInventoryItems.forEach(item => {
        let compressorItem: CompressorInventoryItem = new CompressorInventoryItemClass(item).toModel()
        let itemProfile: ProfileSummary = compressedAirAssessment.systemProfile.profileSummary.find(summary => {
          return summary.dayTypeId == dayType.dayTypeId && compressorItem.itemId == summary.compressorId;
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
          compressorId: compressorItem.itemId,
          fullLoadCapacity: compressorItem.performancePoints.fullLoad.airflow,
          intervalData: intervalData,
          dayTypeId: dayType.dayTypeId,
          automaticShutdownTimer: compressorItem.compressorControls.automaticShutdown
        });
        setPointData.push({
          compressorId: compressorItem.itemId,
          controlType: compressorItem.compressorControls.controlType,
          compressorType: compressorItem.nameplateData.compressorType,
          fullLoadDischargePressure: compressorItem.performancePoints.fullLoad.dischargePressure,
          maxFullFlowDischargePressure: compressorItem.performancePoints.maxFullFlow.dischargePressure
        })
      });
    });

    let sequencerProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(compressedAirAssessment.systemProfile.profileSummary));
    sequencerProfileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == summary.compressorId });
      if(compressor.compressorControls.automaticShutdown){
        summary.automaticShutdownTimer = true;
      } else {
        summary.automaticShutdownTimer = false;
      }
    });


    return {
      name: 'Modification',
      modificationId: Math.random().toString(36).substr(2, 9),
      notes: undefined,
      flowReallocation: {
        implementationCost: 0,
      },
      reduceAirLeaks: {
        leakReduction: undefined,
        leakFlow: undefined,
        implementationCost: 0,
        order: 100
      },
      improveEndUseEfficiency: {
        endUseEfficiencyItems: [{
          reductionType: "Fixed",
          airflowReduction: undefined,
          reductionData: reductionData,
          name: 'Improve End Use Efficiency #1',
          substituteAuxiliaryEquipment: false,
          equipmentDemand: 0,
          collapsed: false,
          implementationCost: 0,
        }],
        order: 100
      },
      reduceSystemAirPressure: {
        averageSystemPressureReduction: undefined,
        implementationCost: 0,
        order: 100
      },
      adjustCascadingSetPoints: {
        order: 100,
        setPointData: setPointData,
        implementationCost: 0,
      },
      useAutomaticSequencer: {
        targetPressure: undefined,
        variance: undefined,
        order: 100,
        implementationCost: 0,
        profileSummary: sequencerProfileSummary
      },
      reduceRuntime: {
        runtimeData: reduceRuntimeData,
        implementationCost: 0,
        order: 100
      },
      addPrimaryReceiverVolume: {
        increasedVolume: 0,
        implementationCost: 0,
        order: 100
      },
      replaceCompressor: {
        order: 100,
        implementationCost: 0,
        salvageValue: 0,
        currentCompressorMapping: compressedAirAssessment.compressorInventoryItems.map(item => {
          return {
            originalCompressorId: item.itemId,
            isReplaced: false
          }
        }),
        replacementCompressorMapping: compressedAirAssessment.replacementCompressorInventoryItems.map(item => {
          return {
            replacementCompressorId: item.itemId,
            isAdded: false
          }
        })
      }
    }
  }

  getDefaultReductionData(systemProfileSetup: SystemProfileSetup): Array<{ hourInterval: number, applyReduction: boolean, reductionAmount: number }> {
    let reductionData: Array<{ hourInterval: number, applyReduction: boolean, reductionAmount: number }> = new Array();
    for (let i = 0; i < 24;) {
      reductionData.push({
        hourInterval: i,
        applyReduction: false,
        reductionAmount: undefined
      });
      i = i + systemProfileSetup.dataInterval;
    }
    return reductionData;
  }

  setOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number): Modification {
    this.updateOrdering(modification, 'addPrimaryReceiverVolume', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'adjustCascadingSetPoints', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'improveEndUseEfficiency', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'reduceRuntime', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'reduceAirLeaks', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'reduceSystemAirPressure', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'useAutomaticSequencer', changedOpportunity, previousOrder, newOrder);
    this.updateOrdering(modification, 'replaceCompressor', changedOpportunity, previousOrder, newOrder);
    if(modification.replaceCompressor?.order != 100 && modification.useAutomaticSequencer.order != 100){
      //force autmatic sequencer to be directly after compressor replacement
      if(modification.replaceCompressor.order + 1 != modification.useAutomaticSequencer.order){
        this.updateOrdering(modification, 'useAutomaticSequencer', 'replaceCompressor', modification.useAutomaticSequencer.order, modification.replaceCompressor.order + 1);
        modification.useAutomaticSequencer.order = modification.replaceCompressor.order + 1;
      }
    }
    return modification;
  }

  private updateOrdering(
    modification: Modification,
    opportunityKey: keyof Modification,
    changedOpportunity: string,
    previousOrder: number,
    newOrder: number
  ) {
    const opportunity = modification[opportunityKey] as { order: number };
    //EEM is on and is not the changed EEM
    if (opportunity.order != 100 && changedOpportunity != opportunityKey) {
      if (newOrder != 100) {
        const duplicateOrder = newOrder == opportunity.order;
        //new order is less than or equal to current order
        if (opportunity.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            opportunity.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            opportunity.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (opportunity.order > previousOrder) {
          opportunity.order--;
        }
      }
    }
  }
}
