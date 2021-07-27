import { Injectable } from '@angular/core';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressorInventoryItem, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Injectable()
export class ExploreOpportunitiesService {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

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
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      reductionData.push({
        dayTypeId: dayType.dayTypeId,
        dayTypeName: dayType.name,
        data: this.getDefaultReductionData()
      })
    });

    let adjustedCompressors: Array<AdjustedUnloadingCompressor> = new Array();
    compressedAirAssessment.compressorInventoryItems.forEach(item => {
      let compressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(item));
      adjustedCompressors.push({
        selected: false,
        compressorId: compressorCopy.itemId,
        unloadPointCapacity: compressorCopy.compressorControls.unloadPointCapacity,
        controlType: compressorCopy.compressorControls.controlType,
        performancePoints: compressorCopy.performancePoints
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
        leakReduction: undefined
      },
      improveEndUseEfficiency: {
        selected: false,
        reductionType: "Fixed",
        airflowReduction: undefined,
        reductionData: reductionData
      },
      reduceSystemAirPressure: {
        selected: false,
        averageSystemPressureReduction: undefined
      },
      useUnloadingControls: {
        selected: false,
        adjustedCompressors: adjustedCompressors
      },
      adjustCascadingSetPoints: {
        selected: false
      },
      useAutomaticSequencer: {
        selected: false,
        targetPressure: undefined,
        variance: undefined
      },
      reduceRuntime: {
        selected: false
      },
      addPrimaryReceiverVolume: {
        selected: false,
        increasedVolume: 0
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
