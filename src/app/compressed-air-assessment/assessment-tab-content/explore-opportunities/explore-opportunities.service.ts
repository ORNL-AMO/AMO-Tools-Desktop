import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CascadingSetPointData, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ReduceRuntimeData, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';

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
        order: 100,
        implementationCost: 0,
        compressorsMapping: compressedAirAssessment.compressorInventoryItems.map(item => {
          return {
            originalCompressorId: item.itemId,
            replacementCompressorId: undefined
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
    this.updateAddPrimaryReceiverVolumeOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateAdjustCascadingSetPointsOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateImproveEndUseEfficiencyOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateReduceRunTimeOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateReduceAirLeaksOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateReduceSystemAirPressureOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateUseAutomaticSequencerOrdering(modification, changedOpportunity, previousOrder, newOrder);
    this.updateReplaceCompressorOrdering(modification, changedOpportunity, previousOrder, newOrder);
    return modification;
  }

  //add primary receiver volume
  updateAddPrimaryReceiverVolumeOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.addPrimaryReceiverVolume.order != 100 && changedOpportunity != 'addPrimaryReceiverVolume') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.addPrimaryReceiverVolume.order;
        //new order is less than or equal to current order
        if (modification.addPrimaryReceiverVolume.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.addPrimaryReceiverVolume.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.addPrimaryReceiverVolume.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.addPrimaryReceiverVolume.order > previousOrder) {
          modification.addPrimaryReceiverVolume.order--;
        }
      }
    }
  }
  //adjust cascading set points
  updateAdjustCascadingSetPointsOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.adjustCascadingSetPoints.order != 100 && changedOpportunity != 'adjustCascadingSetPoints') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.adjustCascadingSetPoints.order;
        //new order is less than or equal to current order
        if (modification.adjustCascadingSetPoints.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.adjustCascadingSetPoints.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.adjustCascadingSetPoints.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.adjustCascadingSetPoints.order > previousOrder) {
          modification.adjustCascadingSetPoints.order--;
        }
      }
    }
  }
  //improve end use efficiency
  updateImproveEndUseEfficiencyOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.improveEndUseEfficiency.order != 100 && changedOpportunity != 'improveEndUseEfficiency') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.improveEndUseEfficiency.order;
        //new order is less than or equal to current order
        if (modification.improveEndUseEfficiency.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.improveEndUseEfficiency.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.improveEndUseEfficiency.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.improveEndUseEfficiency.order > previousOrder) {
          modification.improveEndUseEfficiency.order--;
        }
      }
    }
  }
  //reduce run time
  updateReduceRunTimeOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.reduceRuntime.order != 100 && changedOpportunity != 'reduceRuntime') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.reduceRuntime.order;
        //new order is less than or equal to current order
        if (modification.reduceRuntime.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.reduceRuntime.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.reduceRuntime.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.reduceRuntime.order > previousOrder) {
          modification.reduceRuntime.order--;
        }
      }
    }
  }
  //reduce air leaks
  updateReduceAirLeaksOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.reduceAirLeaks.order != 100 && changedOpportunity != 'reduceAirLeaks') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.reduceAirLeaks.order;
        //new order is less than or equal to current order
        if (modification.reduceAirLeaks.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.reduceAirLeaks.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.reduceAirLeaks.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.reduceAirLeaks.order > previousOrder) {
          modification.reduceAirLeaks.order--;
        }
      }
    }
  }
  //reduce system air pressure
  updateReduceSystemAirPressureOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.reduceSystemAirPressure.order != 100 && changedOpportunity != 'reduceSystemAirPressure') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.reduceSystemAirPressure.order;
        //new order is less than or equal to current order
        if (modification.reduceSystemAirPressure.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.reduceSystemAirPressure.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.reduceSystemAirPressure.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.reduceSystemAirPressure.order > previousOrder) {
          modification.reduceSystemAirPressure.order--;
        }
      }
    }
  }
  //use automatic sequencer
  updateUseAutomaticSequencerOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.useAutomaticSequencer.order != 100 && changedOpportunity != 'useAutomaticSequencer') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.useAutomaticSequencer.order;
        //new order is less than or equal to current order
        if (modification.useAutomaticSequencer.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.useAutomaticSequencer.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.useAutomaticSequencer.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.useAutomaticSequencer.order > previousOrder) {
          modification.useAutomaticSequencer.order--;
        }
      }
    }
  }
  //replace compressor
  updateReplaceCompressorOrdering(modification: Modification, changedOpportunity: string, previousOrder: number, newOrder: number) {
    //EEM is on and is not the changed EEM
    if (modification.replaceCompressor.order != 100 && changedOpportunity != 'replaceCompressor') {
      if (newOrder != 100) {
        let duplicateOrder: boolean = newOrder == modification.replaceCompressor.order;
        //new order is less than or equal to current order
        if (modification.replaceCompressor.order >= newOrder) {
          //order changed to this EEM that was previously on
          if (duplicateOrder && previousOrder != 100) {
            modification.replaceCompressor.order = previousOrder;
          } else if (previousOrder == 100) {
            //EEM is turned on that was previously off
            modification.replaceCompressor.order++;
          }
        }
      } else {
        //decrement all orders greater than previous order that was turned off
        if (modification.replaceCompressor.order > previousOrder) {
          modification.replaceCompressor.order--;
        }
      }
    }
  }
}
