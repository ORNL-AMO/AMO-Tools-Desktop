import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CascadingSetPointData, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ReduceRuntimeData, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirAssessmentBaselineResults } from '../calculations/CompressedAirAssessmentBaselineResults';

@Injectable()
export class ExploreOpportunitiesService {

  selectedDayType: BehaviorSubject<CompressedAirDayType>;
  compressedAirAssessmentModificationResults: BehaviorSubject<CompressedAirAssessmentModificationResults>;
  compressedAirAssessmentBaselineResults: BehaviorSubject<CompressedAirAssessmentBaselineResults>;
  constructor() {
    this.selectedDayType = new BehaviorSubject<CompressedAirDayType>(undefined);
    this.compressedAirAssessmentModificationResults = new BehaviorSubject<CompressedAirAssessmentModificationResults>(undefined);
    this.compressedAirAssessmentBaselineResults = new BehaviorSubject<CompressedAirAssessmentBaselineResults>(undefined);
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
          dayTypeId: dayType.dayTypeId,
          automaticShutdownTimer: item.compressorControls.automaticShutdown
        });
        setPointData.push({
          compressorId: item.itemId,
          controlType: item.compressorControls.controlType,
          compressorType: item.nameplateData.compressorType,
          fullLoadDischargePressure: item.performancePoints.fullLoad.dischargePressure,
          maxFullFlowDischargePressure: item.performancePoints.maxFullFlow.dischargePressure
        })
      });
    });

    let sequencerProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(compressedAirAssessment.systemProfile.profileSummary));
    sequencerProfileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == summary.compressorId });
      summary.automaticShutdownTimer = compressor.compressorControls.automaticShutdown;
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
        order: 100
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
      let selectedOrder: Array<number> = allOrders.filter(order => { return order == newOrder });
      let hasDuplicate: boolean = selectedOrder.length == 2;

      if (modification.addPrimaryReceiverVolume.order != 100 && changedOpportunity != 'addPrimaryReceiverVolume' && modification.addPrimaryReceiverVolume.order >= newOrder) {
        if (hasDuplicate && modification.addPrimaryReceiverVolume.order == newOrder && previousOrder != 100) {
          modification.addPrimaryReceiverVolume.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.addPrimaryReceiverVolume.order++;
        }
      }
      if (modification.adjustCascadingSetPoints.order != 100 && changedOpportunity != 'adjustCascadingSetPoints' && modification.adjustCascadingSetPoints.order >= newOrder) {
        if (hasDuplicate && modification.adjustCascadingSetPoints.order == newOrder && previousOrder != 100) {
          modification.adjustCascadingSetPoints.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.adjustCascadingSetPoints.order++;
        }
      }
      if (modification.improveEndUseEfficiency.order != 100 && changedOpportunity != 'improveEndUseEfficiency' && modification.improveEndUseEfficiency.order >= newOrder) {
        if (hasDuplicate && modification.improveEndUseEfficiency.order == newOrder && previousOrder != 100) {
          modification.improveEndUseEfficiency.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.improveEndUseEfficiency.order++;
        }
      }
      if (modification.reduceRuntime.order != 100 && changedOpportunity != 'reduceRuntime' && modification.reduceRuntime.order >= newOrder) {
        if (hasDuplicate && modification.reduceRuntime.order == newOrder && previousOrder != 100) {
          modification.reduceRuntime.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.reduceRuntime.order++;
        }
      }
      if (modification.reduceAirLeaks.order != 100 && changedOpportunity != 'reduceAirLeaks' && modification.reduceAirLeaks.order >= newOrder) {
        if (hasDuplicate && modification.reduceAirLeaks.order == newOrder && previousOrder != 100) {
          modification.reduceAirLeaks.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.reduceAirLeaks.order++;
        }
      }
      if (modification.reduceSystemAirPressure.order != 100 && changedOpportunity != 'reduceSystemAirPressure' && modification.reduceSystemAirPressure.order >= newOrder) {
        if (hasDuplicate && modification.reduceSystemAirPressure.order == newOrder && previousOrder != 100) {
          modification.reduceSystemAirPressure.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.reduceSystemAirPressure.order++;
        }
      }
      if (modification.useAutomaticSequencer.order != 100 && changedOpportunity != 'useAutomaticSequencer' && modification.useAutomaticSequencer.order >= newOrder) {
        if (hasDuplicate && modification.useAutomaticSequencer.order == newOrder && previousOrder != 100) {
          modification.useAutomaticSequencer.order = previousOrder;
        } else if (!hasDuplicate || previousOrder == 100) {
          modification.useAutomaticSequencer.order++;
        }
      }
    } else {
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
